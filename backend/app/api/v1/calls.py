import urllib.parse
from datetime import datetime
import json
from fastapi import APIRouter, HTTPException, Response
from app.schemas import MakeCallRequest
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository
from app.services.twilio_service import (
    place_twilio_call,
    build_twilio_voice_entry_twiml
)
from app.core.config import settings
from app.services.voice_service import get_active_agent_info
from twilio.rest import Client

router = APIRouter(tags=["Calls"])

@router.post("/make-call")
def make_call(request: MakeCallRequest):
    name = request.name.strip()
    phone = format_phone_number(request.phone)

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    DataRepository.ensure_contact_exists(name, phone)

    # ── 1. Find or create a feedback record so we have a customer_id ──────────
    customer_id = str(request.customer_id) if getattr(request, "customer_id", None) else None
    if not customer_id:
        all_fb = DataRepository.get_feedback_and_tickets()
        existing = next(
            (f for f in all_fb["feedback_entries"] if format_phone_number(f.get("phone", "")) == phone),
            None
        )
        if existing:
            customer_id = existing["id"]
        else:
            fb_id, _ = DataRepository.save_feedback(
                customer_name=name,
                phone=phone,
                rating=5,
                feedback_text="Calling customer for feedback...",
                sentiment="neutral",
                category="general",
                followup_needed=False
            )
            customer_id = fb_id

    # ── 2. Prepare initial transcript with the AI greeting ───────────────────
    agent_info = get_active_agent_info()
    greeting = (
        f"Hello {name}! I am {agent_info['agent_name']} from BFibernet, "
        "calling for quick feedback on your internet service. How is your experience?"
    )
    initial_transcript = [{
        "speaker": "agent",
        "name": f"AI Voice Collector ({agent_info['agent_name']})",
        "time": datetime.now().strftime("%I:%M %p"),
        "text": greeting
    }]
    DataRepository.update_feedback_transcript_and_data(
        feedback_id=customer_id,
        feedback_text="Calling customer...",
        transcript_json=json.dumps(initial_transcript),
        status="calling"
    )

    # ── 3. Simulated mode (no Twilio credentials) ────────────────────────────
    if not settings.is_twilio_configured():
        return {
            "success": True,
            "simulated": True,
            "call_sid": "SIMULATED_SID",
            "status": "queued",
            "message": f"Twilio not configured. Simulated call queued for {name} ({phone}).",
            "contact": {"name": name, "phone": phone, "customer_id": customer_id}
        }

    # ── 4. Determine whether to use a public webhook or inline TwiML ─────────
    #
    # WEBHOOK MODE (preferred):
    #   Requires BASE_URL in .env to be a publicly reachable URL (e.g. ngrok).
    #   Twilio will call back /api/v1/twilio/voice which serves a full
    #   interactive Gather loop, speech-to-text feedback collection, and
    #   live transcript updates via build_twilio_voice_entry_twiml().
    #
    # INLINE TwiML FALLBACK (localhost / no public URL):
    #   Builds a complete TwiML greeting using build_twilio_voice_entry_twiml()
    #   which uses the selected Google Wavenet voice persona from voice_service.py.
    #   The Gather's action URL points to localhost — Twilio cannot reach it,
    #   so the call plays the AI greeting and hangs up after timeout.
    #   To enable full interactive speech collection, set BASE_URL in backend/.env.
    #
    public_base_url = settings.base_url
    use_webhook = bool(
        public_base_url
        and not public_base_url.startswith("http://localhost")
        and not public_base_url.startswith("http://127.")
    )

    if use_webhook:
        cid_param = f"?customer_id={customer_id}"
        voice_url  = f"{public_base_url}/api/v1/twilio/voice{cid_param}"
        status_url = f"{public_base_url}/api/v1/twilio/status{cid_param}"
        result = place_twilio_call(
            to_phone=phone,
            custom_message=greeting,   # unused when voice_url is set
            voice_url=voice_url,
            status_url=status_url
        )
    else:
        # Build inline TwiML using the voice service — correct voice persona,
        # correct language, correct greeting text. The Gather action won't
        # fire (Twilio can't reach localhost) but the greeting plays in full.
        inline_twiml = build_twilio_voice_entry_twiml(name, "")

        try:
            client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            call = client.calls.create(
                to=phone,
                from_=settings.twilio_phone_number,
                twiml=inline_twiml
            )
            result = {
                "success": True,
                "status": call.status or "initiated",
                "call_sid": call.sid,
                "message": f"Call initiated to {name} ({phone})! Voice: {agent_info['agent_name']}. "
                           f"Set BASE_URL in backend/.env for live speech collection."
            }
        except Exception as e:
            err = str(e)
            if "unverified" in err or "Trial accounts" in err:
                result = {
                    "success": True,
                    "simulated": True,
                    "status": "queued",
                    "call_sid": "SIMULATED_TRIAL_SID",
                    "message": f"Trial Mode: {phone} is unverified in Twilio Console. Simulated."
                }
            else:
                result = {"success": False, "status": "failed", "message": f"Twilio Error: {err}"}

    status  = result.get("status", "unknown")
    call_sid = result.get("call_sid", "N/A")
    details  = result.get("message", "")

    DataRepository.add_call_log(name, phone, call_sid, status, details)
    result["contact"] = {"name": name, "phone": phone, "customer_id": customer_id}
    return result


@router.post("/twiml/voice")
def twiml_voice_webhook():
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! This is BCT Fibernet AI Support Assistant calling. How can we help you today?</Say>
</Response>"""
    return Response(content=xml_content, media_type="application/xml")


from pydantic import BaseModel as _BM

class CancelCallRequest(_BM):
    call_sid: str

@router.post("/cancel-call")
def cancel_call(request: CancelCallRequest):
    """Terminates an active Twilio call by its call SID."""
    call_sid = request.call_sid.strip()

    if not call_sid or call_sid in ("SIMULATED_SID", "SIMULATED_TRIAL_SID", "N/A"):
        return {
            "success": True,
            "simulated": True,
            "message": "Simulated call cancelled successfully."
        }

    if not settings.is_twilio_configured():
        return {
            "success": True,
            "simulated": True,
            "message": "Twilio not configured — simulated call cancelled."
        }

    try:
        from twilio.rest import Client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        call = client.calls(call_sid).update(status="completed")
        return {
            "success": True,
            "call_sid": call_sid,
            "status": call.status,
            "message": f"Call {call_sid} terminated successfully."
        }
    except Exception as e:
        err = str(e)
        # If call already ended, treat it as success
        if "Call is not in-progress" in err or "21220" in err or "completed" in err.lower():
            return {"success": True, "message": "Call already ended."}
        raise HTTPException(status_code=500, detail=f"Failed to cancel call: {err}")
