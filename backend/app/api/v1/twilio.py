import json
import re
import urllib.parse
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.config import settings
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository
from app.services.twilio_service import (
    place_twilio_call, 
    build_twilio_voice_entry_twiml, 
    build_twilio_feedback_response_twiml
)
from app.services.voice_service import (
    get_active_agent_info, 
    generate_ai_response, 
    analyze_customer_feedback_with_gemini,
    is_marwari_accent_active,
    get_twilio_voice,
    get_active_voice,
    get_active_agent_name
)

router = APIRouter(tags=["Twilio Voice Workflows"])

class TriggerCallRequest(BaseModel):
    customer_id: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    message: Optional[str] = None

@router.post("/call")
def make_ai_outbound_call(request: TriggerCallRequest, req: Request):
    """Triggers real Twilio outbound AI voice call or simulation from democode.py."""
    target_phone = format_phone_number(request.phone or "")
    if not target_phone and request.customer_id:
        c = DataRepository.get_feedback_by_id(request.customer_id)
        if c:
            target_phone = format_phone_number(c.get("phone", ""))
            request.name = request.name or c.get("customer_name")

    if not target_phone:
        return JSONResponse(status_code=400, content={"success": False, "error": "Phone number or valid customer_id is required"})

    customer_id = str(request.customer_id) if request.customer_id else DataRepository.find_or_create_feedback(request.name or "Customer", target_phone)

    host_url = settings.base_url or str(req.base_url).rstrip("/")
    if host_url.startswith("http://localhost") or host_url.startswith("http://127."):
        host_url = str(req.base_url).rstrip("/")

    cid_param = f"?customer_id={customer_id}"
    voice_url = f"{host_url}/api/v1/twilio/voice{cid_param}"
    status_url = f"{host_url}/api/v1/twilio/status{cid_param}"

    if not settings.is_twilio_configured():
        return {
            "success": True,
            "simulated": True,
            "message": f"Twilio API keys not configured. Simulated call for {request.name or target_phone} ({target_phone}).",
            "contact": {"name": request.name or "Customer", "phone": target_phone, "customer_id": customer_id}
        }

    res = place_twilio_call(
        to_phone=target_phone,
        custom_message=request.message or "Hello! This is BFibernet AI Customer Support calling.",
        voice_url=voice_url,
        status_url=status_url
    )

    DataRepository.add_call_log(
        name=request.name or "Customer",
        phone=target_phone,
        call_sid=res.get("call_sid", "N/A"),
        status=res.get("status", "initiated"),
        details="Outbound Call"
    )

    res["contact"] = {"name": request.name or "Customer", "phone": target_phone, "customer_id": customer_id}
    return res

@router.api_route("/twilio/voice", methods=["GET", "POST"])
async def twilio_voice_webhook(request: Request, customer_id: Optional[str] = None, phone: Optional[str] = None):
    """Initial TwiML entry point when call connects (converted from democode.py)."""
    try:
        form_data = await request.form()
        request_phone = phone or form_data.get("To") or form_data.get("From")

        public_url = settings.base_url
        host_url = public_url if public_url and not public_url.startswith("http://localhost") and not public_url.startswith("http://127.") else str(request.base_url).rstrip("/")
        
        cid_param = f"?customer_id={customer_id}" if customer_id else ""
        feedback_url = f"{host_url}/api/v1/twilio/feedback{cid_param}"

        customer_name = "Customer"
        if customer_id:
            c = DataRepository.get_feedback_by_id(customer_id)
            if c:
                customer_name = c.get("customer_name", "Customer")
        elif request_phone:
            customer_id = DataRepository.find_or_create_feedback("Customer", format_phone_number(request_phone))
            c = DataRepository.get_feedback_by_id(customer_id)
            if c:
                customer_name = c.get("customer_name", "Customer")

        agent_info = get_active_agent_info()
        is_marwari = is_marwari_accent_active()
        greeting_text = "राम राम सा! मैं बीसीटी फ़ाइबरनेट से बोल रहा हूँ। आपकी इंटरनेट सेवा कैसी चल रही है? थोड़ा फीडबैक दीजिए।" if is_marwari else f"Hello {customer_name}! I am {agent_info['agent_name']} from BFibernet, calling for quick feedback on your internet service. How is your experience?"

        if customer_id:
            initial_transcript = [
                {
                    "speaker": "agent",
                    "name": f"AI Voice Collector ({agent_info['agent_name']})",
                    "time": datetime.now().strftime("%I:%M %p"),
                    "text": greeting_text
                }
            ]
            DataRepository.update_feedback_transcript_and_data(
                feedback_id=customer_id,
                feedback_text="Calling customer...",
                transcript_json=json.dumps(initial_transcript),
                status="calling"
            )

        xml_twiml = build_twilio_voice_entry_twiml(customer_name, feedback_url)
        return Response(content=xml_twiml, media_type="application/xml")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(content=str(e), status_code=500)

@router.api_route("/twilio/feedback", methods=["GET", "POST"])
async def twilio_feedback_webhook(request: Request, customer_id: Optional[str] = None):
    """Processes customer speech result and renders conversational response TwiML (converted from democode.py)."""
    try:
        form_data = await request.form()
        speech_result = form_data.get("SpeechResult", "").strip()
        digits = form_data.get("Digits", "").strip()
        called_phone = form_data.get("To") or form_data.get("From")

        if not customer_id and called_phone:
            customer_id = DataRepository.find_or_create_feedback("Customer", format_phone_number(called_phone))

        public_url = settings.base_url
        host_url = public_url if public_url and not public_url.startswith("http://localhost") and not public_url.startswith("http://127.") else str(request.base_url).rstrip("/")
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
            # Use Gemini LLM to analyze the customer speech feedback for sentiment and rating
            analysis = analyze_customer_feedback_with_gemini(user_input)
            
            # Keypad digits (DTMF) override explicit rating if pressed by customer
            if digits and digits.isdigit() and 1 <= int(digits) <= 5:
                rating = int(digits)
            else:
                rating = analysis.get("rating")

            sentiment = analysis.get("sentiment", "neutral")

            ai_response_text = generate_ai_response(user_input, rating, sentiment)

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
                rating=rating or 3,
                sentiment=sentiment,
                transcript_json=json.dumps(full_transcript),
                status="in-progress"
            )
        elif customer_id:
            ai_response_text = "जी, आपकी आवाज़ थोड़ी साफ़ नहीं आ रही है। एक बार फिर से बताइए।" if is_marwari_accent_active() else "I didn't quite catch that. Could you please tell me about your experience?"
            
            new_entries = [
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
                feedback_text=customer_data.get("feedback_text", "Listening...") if customer_data else "Listening...",
                transcript_json=json.dumps(full_transcript),
                status="in-progress"
            )
        else:
            ai_response_text = None

        xml_twiml = build_twilio_feedback_response_twiml(user_input, customer_data, feedback_url, ai_response_text)
        return Response(content=xml_twiml, media_type="application/xml")
    except Exception as e:
        print(f"[Twilio Feedback Webhook Error] {e}")
        from twilio.twiml.voice_response import VoiceResponse
        res = VoiceResponse()
        v = get_twilio_voice(get_active_voice())
        res.say("Thank you for your feedback! Have a wonderful day. Goodbye.", voice=v)
        res.hangup()
        return Response(content=str(res), media_type="application/xml")

@router.post("/twilio/status")
async def twilio_status_webhook(request: Request, customer_id: Optional[str] = None):
    """Webhook for Twilio call state transitions (converted from democode.py)."""
    form_data = await request.form()
    call_status = form_data.get("CallStatus", "")
    call_sid = form_data.get("CallSid", "")
    recording_url = form_data.get("RecordingUrl", None)
    phone = form_data.get("To", "") or form_data.get("From", "")
    
    if not customer_id and phone:
        customer_id = DataRepository.find_or_create_feedback("Customer", format_phone_number(phone))

    print(f"[Twilio Status Callback] Call {call_sid} (Customer: {customer_id}) Status: {call_status}, Recording: {recording_url}")
    if customer_id:
        c = DataRepository.get_feedback_by_id(customer_id)
        if c:
            new_status = "completed" if call_status == "completed" else ("failed" if call_status in ("failed", "busy", "no-answer", "canceled") else "calling")
            DataRepository.update_feedback_transcript_and_data(
                feedback_id=customer_id,
                feedback_text=c.get("feedback_text", ""),
                status=new_status,
                recording_url=recording_url
            )
    return Response(content="OK", media_type="text/plain")

@router.get("/twilio/proxy-recording")
async def proxy_recording(url: str):
    import requests
    from fastapi.responses import StreamingResponse
    from fastapi import HTTPException
    
    if not url.startswith("https://api.twilio.com/"):
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    # Ensure the URL requests the .mp3 format
    if not url.endswith(".mp3"):
        url = f"{url}.mp3"
        
    auth = (settings.twilio_account_sid, settings.twilio_auth_token)
    
    def iterfile():
        with requests.get(url, auth=auth, stream=True) as r:
            if r.status_code != 200:
                print(f"[Twilio Proxy] Failed to fetch recording: {r.status_code} {r.text}")
                return
            for chunk in r.iter_content(chunk_size=8192):
                yield chunk
                
    return StreamingResponse(iterfile(), media_type="audio/mpeg")
