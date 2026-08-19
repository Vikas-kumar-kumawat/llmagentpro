import urllib.parse
import urllib.request
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.voice_service import (
    VOICE_CATALOG, 
    get_active_voice, 
    set_active_voice
)

router = APIRouter(tags=["Voices"])

class VoiceSelectRequest(BaseModel):
    voice_id: str

@router.get("/voices")
def list_voices():
    """Fetches catalog of AI voices."""
    return {"success": True, "active_voice": get_active_voice(), "voices": VOICE_CATALOG}

@router.post("/voices")
def update_voice(data: VoiceSelectRequest):
    """Updates active AI voice."""
    updated = set_active_voice(data.voice_id)
    if not updated:
        return JSONResponse(status_code=400, content={"success": False, "error": f"Voice ID '{data.voice_id}' not found in catalog"})
    return {"success": True, "active_voice": get_active_voice(), "voice_info": updated}

@router.get("/demo-audio")
def stream_voice_demo(voice_id: Optional[str] = None):
    """Streams sample audio voice preview."""
    target_voice = voice_id or get_active_voice()
    v_info = next((v for v in VOICE_CATALOG if v["id"] == target_voice), VOICE_CATALOG[0])
    text = v_info.get("sample_text", "Hello! I am your AI Voice Assistant.")
    
    is_hindi_rajasthani = (
        ("hi-IN" in target_voice) or 
        ("Sarvam" in target_voice) or 
        ("Hindi" in v_info.get("accent", "")) or 
        ("Rajasthani" in v_info.get("accent", "")) or 
        ("Marwari" in v_info.get("accent", ""))
    )
    lang = "hi" if is_hindi_rajasthani else ("en-uk" if "GB" in target_voice else "en")

    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={urllib.parse.quote(text)}"
    try:
        req = urllib.request.Request(
            tts_url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return Response(content=resp.read(), media_type="audio/mpeg")
    except Exception as e:
        print(f"[Demo Audio Stream Error] {e}")
        return JSONResponse(status_code=500, content={"error": "Failed to stream audio"})
