import os
import sys
import re
import subprocess
import threading
import time
from app.core.config import settings

_tunnel_process = None
_tunnel_url = None

def update_env_base_url(url: str):
    """Updates BASE_URL in backend/.env file."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    env_path = os.path.join(backend_dir, ".env")
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        new_lines = []
        updated = False
        for line in lines:
            if line.startswith("BASE_URL="):
                new_lines.append(f"BASE_URL={url}\n")
                updated = True
            else:
                new_lines.append(line)
        if not updated:
            new_lines.append(f"\nBASE_URL={url}\n")
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        print(f"[Cloudflare Tunnel] Could not write to .env: {e}")

def start_cloudflare_tunnel(port: int = 8000) -> str:
    """
    Starts Cloudflare Tunnel using cloudflared executable.
    Sets settings.base_url and updates backend/.env with public HTTPS URL.
    """
    global _tunnel_process, _tunnel_url

    if _tunnel_url:
        return _tunnel_url

    # Check if BASE_URL is already set to a valid public URL
    existing_url = settings.base_url
    if existing_url and not existing_url.startswith("http://localhost") and not existing_url.startswith("http://127."):
        print(f"[Cloudflare Tunnel] Using existing BASE_URL from config: {existing_url}")
        _tunnel_url = existing_url
        return existing_url

    # Locate cloudflared executable in project root or system PATH
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    cloudflared_bin = os.path.join(project_root, "cloudflared.exe")
    if not os.path.exists(cloudflared_bin):
        cloudflared_bin = "cloudflared"

    print(f"[Cloudflare Tunnel] Starting Cloudflare Quick Tunnel for port {port}...")

    try:
        cmd = [cloudflared_bin, "tunnel", "--url", f"http://127.0.0.1:{port}"]
        _tunnel_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )

        def read_stderr():
            global _tunnel_url
            for line in iter(_tunnel_process.stderr.readline, ""):
                if "trycloudflare.com" in line:
                    match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
                    if match:
                        url = match.group(0)
                        _tunnel_url = url
                        settings._base_url_override = url
                        update_env_base_url(url)
                        print("\n" + "=" * 70)
                        print("🚀 [Cloudflare Tunnel Started Successfully!]")
                        print(f"   Public HTTPS Webhook URL: {url}")
                        print(f"   Twilio Voice Webhook:     {url}/api/v1/twilio/voice")
                        print("=" * 70 + "\n")
                        break

        t = threading.Thread(target=read_stderr, daemon=True)
        t.start()

        # Wait up to 8 seconds for URL generation
        for _ in range(40):
            if _tunnel_url:
                break
            time.sleep(0.2)

        return _tunnel_url or ""
    except Exception as e:
        print(f"[Cloudflare Tunnel Error] Could not start cloudflared: {e}")
        return ""
