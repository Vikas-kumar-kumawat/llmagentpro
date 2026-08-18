import urllib.parse
from datetime import datetime
import json
from fastapi import APIRouter, HTTPException, Response
from app.schemas import MakeCallRequest
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository
from app.services.twilio_service import place_twilio_call
from app.core.config import settings
from app.services.voice_service import get_active_agent_info

router = APIRouter(tags=["Calls"])

@router.post("/make-call")
def make_call(request: MakeCallRequest):
    name = request.name.strip()
    phone = format_phone_number(request.phone)
    custom_msg = request.message or f"Hello {name}, this is BCT Fibernet AI Customer Support calling. Thank you for connecting with us."

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    DataRepository.ensure_contact_exists(name, phone)

    customer_id = None
    all_fb = DataRepository.get_feedback_and_tickets()
    existing = next((f for f in all_fb["feedback_entries"] if format_phone_number(f["phone"]) == phone), None)
    
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

    # Determine webhook base URL:
    # BASE_URL in .env must be a publicly accessible URL (e.g. ngrok) for
    # Twilio to call back. If it's not set, we skip the webhook and use
    # inline TwiML so the call still goes through from localhost.
    public_base_url = settings.base_url  # e.g. https://abc123.ngrok.io
    use_webhook = bool(public_base_url and not public_base_url.startswith("http://localhost"))

    voice_url = None
    status_url = None
    if use_webhook and customer_id:
        cid_param = f"?customer_id={customer_id}" if customer_id else f"?phone={urllib.parse.quote(phone)}"
        voice_url = f"{public_base_url}/api/v1/twilio/voice{cid_param}"
        status_url = f"{public_base_url}/api/v1/twilio/status{cid_param}"

    if customer_id:
        agent_info = get_active_agent_info()
        greeting = f"Hello {name}! I am {agent_info['agent_name']} from BFibernet, calling for quick feedback on your internet service. How is your experience?"
        initial_transcript = [
            {
                "speaker": "agent",
                "name": f"AI Voice Collector ({agent_info['agent_name']})",
                "time": datetime.now().strftime("%I:%M %p"),
                "text": greeting
            }
        ]
        DataRepository.update_feedback_transcript_and_data(
            feedback_id=customer_id,
            feedback_text="Calling customer...",
            transcript_json=json.dumps(initial_transcript),
            status="calling"
        )

    if not settings.is_twilio_configured():
        result = {
            "success": True,
            "simulated": True,
            "call_sid": "SIMULATED_SID",
            "status": "queued",
            "message": f"Twilio API keys not configured. Simulated call queued for {name} ({phone})."
        }
    else:
        # Build inline greeting for fallback (no public webhook)
        agent_info = get_active_agent_info()
        inline_msg = custom_msg or f"Hello {name}! This is {agent_info['agent_name']} from BFibernet. Thank you for being our valued customer. We hope your internet experience has been great. Have a wonderful day!"
        result = place_twilio_call(
            to_phone=phone,
            custom_message=inline_msg,
            voice_url=voice_url,      # None if no public BASE_URL → uses inline TwiML
            status_url=status_url
        )
    
    status = result.get("status", "unknown")
    call_sid = result.get("call_sid", "N/A")
    details = result.get("message", "")

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
