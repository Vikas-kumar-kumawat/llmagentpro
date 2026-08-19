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

import threading
import time

def simulate_call_feedback_thread(customer_id: str, customer_name: str):
    """Simulates live call attendance, user speech feedback, and agent response."""
    time.sleep(1.5)
    c_data = DataRepository.get_feedback_by_id(customer_id)
    if not c_data or c_data.get("status") == "cancelled":
        return

    sample_feedbacks = [
        {
            "text": "Namaste! My BFibernet fiber internet speed is excellent, around 300 Mbps. I am super happy with the service and rate it 5 stars!",
            "rating": 5,
            "sentiment": "positive"
        },
        {
            "text": "Hello! The internet connection is working very good. Download speeds are fast and stable. 5 star rating from me!",
            "rating": 5,
            "sentiment": "positive"
        },
        {
            "text": "Hi! Internet speed is good, but I noticed slight ping delay yesterday evening. Overall service is satisfactory, rating 4 stars.",
            "rating": 4,
            "sentiment": "positive"
        }
    ]
    selected_fb = sample_feedbacks[abs(hash(customer_name)) % len(sample_feedbacks)]
    
    cur_transcript = []
    if c_data.get("transcript"):
        try:
            cur_transcript = json.loads(c_data["transcript"])
        except Exception:
            pass

    customer_entry = {
        "speaker": "customer",
        "name": customer_name,
        "time": datetime.now().strftime("%I:%M %p"),
        "text": ""
    }
    cur_transcript.append(customer_entry)

    words = selected_fb["text"].split()
    current_text = ""
    for i, word in enumerate(words):
        current_text += word + " "
        cur_transcript[-1]["text"] = current_text.strip()
        is_last = (i == len(words) - 1)
        DataRepository.update_feedback_transcript_and_data(
            feedback_id=customer_id,
            feedback_text=current_text.strip() if is_last else "Listening...",
            rating=selected_fb["rating"] if is_last else None,
            sentiment=selected_fb["sentiment"] if is_last else "neutral",
            transcript_json=json.dumps(cur_transcript),
            status="in-progress"
        )
        time.sleep(0.25)

    time.sleep(1.0)
    c_data = DataRepository.get_feedback_by_id(customer_id)
    if not c_data or c_data.get("status") == "cancelled":
        return

    ai_agent_text = f"Ram Ram sa! Thank you so much for giving us {selected_fb['rating']} stars! Your feedback has been recorded."

    agent_entry = {
        "speaker": "agent",
        "name": "AI Voice Collector",
        "time": datetime.now().strftime("%I:%M %p"),
        "text": ""
    }
    cur_transcript.append(agent_entry)

    agent_words = ai_agent_text.split()
    agent_current_text = ""
    for i, word in enumerate(agent_words):
        agent_current_text += word + " "
        cur_transcript[-1]["text"] = agent_current_text.strip()
        is_last = (i == len(agent_words) - 1)
        DataRepository.update_feedback_transcript_and_data(
            feedback_id=customer_id,
            feedback_text=selected_fb["text"],
            rating=selected_fb["rating"],
            sentiment=selected_fb["sentiment"],
            transcript_json=json.dumps(cur_transcript),
            status="completed" if is_last else "in-progress"
        )
        time.sleep(0.25)

@router.post("/make-call")
def make_call(request: MakeCallRequest):
    name = request.name.strip()
    phone = format_phone_number(request.phone)

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    DataRepository.ensure_contact_exists(name, phone)

    # ── 1. Find or create a feedback record so we have a customer_id ──────────
    customer_id = str(request.customer_id) if getattr(request, "customer_id", None) else None
    
    if customer_id and (customer_id.startswith("c_") or customer_id.startswith("b_") or not DataRepository.get_feedback_by_id(customer_id)):
        customer_id = None

    if not customer_id:
        all_fb = DataRepository.get_feedback_and_tickets()
        existing = next(
            (f for f in all_fb["feedback_entries"] if format_phone_number(f.get("phone", "")) == phone),
            None
        )
        if existing:
            customer_id = str(existing["id"])
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
            customer_id = str(fb_id)

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
        feedback_text="Calling customer for live feedback...",
        transcript_json=json.dumps(initial_transcript),
        status="calling"
    )

    # ── 3. Simulated mode (no Twilio credentials) ────────────────────────────
    if not settings.is_twilio_configured():
        threading.Thread(target=simulate_call_feedback_thread, args=(str(customer_id), name), daemon=True).start()
        return {
            "success": True,
            "simulated": True,
            "call_sid": "SIMULATED_SID",
            "status": "queued",
            "message": f"Twilio not configured. Simulated call queued for {name} ({phone}).",
            "contact": {"name": name, "phone": phone, "customer_id": customer_id}
        }

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
            custom_message=greeting,
            voice_url=voice_url,
            status_url=status_url
        )
    else:
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
                "message": f"Call initiated to {name} ({phone})! Voice: {agent_info['agent_name']}."
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

    if result.get("simulated"):
        threading.Thread(target=simulate_call_feedback_thread, args=(str(customer_id), name), daemon=True).start()

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
