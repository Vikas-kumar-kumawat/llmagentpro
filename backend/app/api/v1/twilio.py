import urllib.parse
from typing import Optional
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel
from app.core.config import settings
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository
from app.services.twilio_service import (
    place_twilio_call, 
    build_twilio_voice_entry_twiml, 
    build_twilio_feedback_response_twiml
)

router = APIRouter(tags=["Twilio Voice Workflows"])

class TriggerCallRequest(BaseModel):
    customer_id: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    message: Optional[str] = None

@router.post("/call")
def make_ai_outbound_call(request: TriggerCallRequest, req: Request):
    """Triggers real Twilio outbound AI voice call or simulation."""
    target_phone = format_phone_number(request.phone or "")
    if not target_phone and request.customer_id:
        c = DataRepository.get_feedback_by_id(request.customer_id)
        if c:
            target_phone = format_phone_number(c.get("phone", ""))
            request.name = request.name or c.get("customer_name")

    if not target_phone:
        raise HTTPException(status_code=400, detail="Valid phone number or customer_id is required.")

    host_url = str(req.base_url).rstrip("/")
    cid_param = f"?customer_id={request.customer_id}" if request.customer_id else f"?phone={urllib.parse.quote(target_phone)}"
    voice_url = f"{host_url}/api/v1/twilio/voice{cid_param}"
    status_url = f"{host_url}/api/v1/twilio/status{cid_param}"

    if not settings.is_twilio_configured():
        return {
            "success": True,
            "simulated": True,
            "message": f"Twilio API keys not configured. Simulated call for {request.name or target_phone} ({target_phone})."
        }

    res = place_twilio_call(
        to_phone=target_phone,
        custom_message=request.message or "Hello! This is BFibernet AI Customer Support calling.",
        voice_url=voice_url,
        status_url=status_url
    )

    if request.name:
        DataRepository.add_call_log(request.name, target_phone, res.get("call_sid", "N/A"), res.get("status", "initiated"), "Outbound Call")

    return res

import json
import re
from datetime import datetime
from app.services.voice_service import get_active_agent_info, generate_ai_response

@router.api_route("/twilio/voice", methods=["GET", "POST"])
def twilio_voice_webhook(request: Request, customer_id: Optional[str] = None):
    """Initial TwiML entry point when Twilio call connects."""
    public_url = settings.base_url
    host_url = public_url if public_url and not public_url.startswith("http://localhost") else str(request.base_url).rstrip("/")
    cid_param = f"?customer_id={customer_id}" if customer_id else ""
    feedback_url = f"{host_url}/api/v1/twilio/feedback{cid_param}"

    customer_name = ""
    if customer_id:
        c = DataRepository.get_feedback_by_id(customer_id)
        if c:
            customer_name = c.get("customer_name", "")
            agent_info = get_active_agent_info()
            greeting = f"Hello {customer_name}! I am {agent_info['agent_name']} from BFibernet, calling for quick feedback on your internet service. How is your experience?"
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
                feedback_text=c.get("feedback_text", "Calling customer..."),
                transcript_json=json.dumps(initial_transcript),
                status="calling"
            )

    xml_twiml = build_twilio_voice_entry_twiml(customer_name, feedback_url)
    return Response(content=xml_twiml, media_type="application/xml")

@router.api_route("/twilio/feedback", methods=["GET", "POST"])
async def twilio_feedback_webhook(request: Request, customer_id: Optional[str] = None):
    """Processes customer speech result / keypress digits and renders conversational response TwiML."""
    form_data = await request.form()
    speech_result = form_data.get("SpeechResult", "").strip()
    digits = form_data.get("Digits", "").strip()

    host_url = str(request.base_url).rstrip("/")
    cid_param = f"?customer_id={customer_id}" if customer_id else ""
    feedback_url = f"{host_url}/api/v1/twilio/feedback{cid_param}"

    customer_data = None
    customer_name = "Customer"
    existing_transcript = []

    if customer_id:
        customer_data = DataRepository.get_feedback_by_id(customer_id)
        if customer_data:
            customer_name = customer_data.get("customer_name", "Customer")
            if customer_data.get("transcript"):
                try:
                    existing_transcript = json.loads(customer_data["transcript"])
                except Exception:
                    pass

    user_input = speech_result or (f"Pressed key {digits} for feedback" if digits else "")

    if user_input and customer_id:
        rating = None
        if digits and digits.isdigit() and 1 <= int(digits) <= 5:
            rating = int(digits)

        if not rating and user_input:
            nums = re.findall(r"\b([1-5])\b", user_input)
            if nums:
                rating = int(nums[0])

        pos_words = ["good", "great", "excellent", "amazing", "wonderful", "awesome", "fast", "love", "nice", "5", "4", "बढ़िया", "सही", "चोखो", "बढिया", "ठीक"]
        neg_words = ["bad", "poor", "terrible", "horrible", "slow", "delay", "worst", "hate", "1", "2", "खराब", "धीमी", "बेकार", "परेशानी", "बंद"]
        lower = user_input.lower()
        if any(w in lower for w in pos_words):
            sentiment = "positive"
        elif any(w in lower for w in neg_words):
            sentiment = "negative"
        else:
            sentiment = "neutral"

        ai_response_text = generate_ai_response(user_input, customer_data)

        new_entries = [
            {
                "speaker": "customer",
                "name": customer_name,
                "time": datetime.now().strftime("%I:%M %p"),
                "text": user_input
            },
            {
                "speaker": "agent",
                "name": "AI Voice Collector",
                "time": datetime.now().strftime("%I:%M %p"),
                "text": ai_response_text
            }
        ]

        full_transcript = existing_transcript + new_entries

        DataRepository.update_feedback_transcript_and_data(
            feedback_id=customer_id,
            feedback_text=user_input,
            rating=rating or (customer_data.get("rating") if customer_data else 5),
            sentiment=sentiment,
            transcript_json=json.dumps(full_transcript),
            status="completed"
        )

    xml_twiml = build_twilio_feedback_response_twiml(user_input, customer_data, feedback_url)
    return Response(content=xml_twiml, media_type="application/xml")

@router.post("/twilio/status")
async def twilio_status_webhook(request: Request, customer_id: Optional[str] = None):
    """Webhook for Twilio call state updates."""
    form_data = await request.form()
    call_status = form_data.get("CallStatus", "")
    call_sid = form_data.get("CallSid", "")
    print(f"[Twilio Status Callback] Call {call_sid} (Customer: {customer_id}) Status: {call_status}")
    if customer_id:
        c = DataRepository.get_feedback_by_id(customer_id)
        if c:
            new_status = "completed" if call_status == "completed" else ("failed" if call_status in ("failed", "busy", "no-answer") else "calling")
            DataRepository.update_feedback_transcript_and_data(
                feedback_id=customer_id,
                feedback_text=c.get("feedback_text", ""),
                status=new_status
            )
    return Response(content="OK", media_type="text/plain")
