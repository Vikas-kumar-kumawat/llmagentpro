import urllib.parse
from typing import Optional, Dict, Any
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from app.core.config import settings
from app.utils.formatters import format_phone_number
from app.services.voice_service import (
    get_active_voice, 
    get_twilio_voice, 
    is_marwari_accent_active, 
    get_active_agent_info,
    generate_ai_response
)

class TwilioService:
    @staticmethod
    def make_call(to_phone: str, custom_message: str) -> dict:
        return place_twilio_call(to_phone, custom_message)

def place_twilio_call(to_phone: str, custom_message: str, voice_url: Optional[str] = None, status_url: Optional[str] = None) -> dict:
    """
    Infrastructure service for placing outbound voice calls using Twilio SDK.
    """
    target_phone = format_phone_number(to_phone)
    if not settings.is_twilio_configured():
        return {
            "success": False,
            "status": "configuration_error",
            "message": f"Contact saved ({target_phone})! To place real outbound phone calls, please update TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend/.env file."
        }

    try:
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        
        if voice_url:
            call = client.calls.create(
                to=target_phone,
                from_=settings.twilio_phone_number,
                url=voice_url,
                method="POST",
                record=True,
                status_callback=status_url,
                status_callback_method="POST",
                status_callback_event=["initiated", "ringing", "answered", "completed"] if status_url else None
            )
        else:
            twiml_payload = f'<Response><Say voice="alice">{custom_message}</Say></Response>'
            call = client.calls.create(
                to=target_phone,
                from_=settings.twilio_phone_number,
                twiml=twiml_payload
            )
        
        return {
            "success": True,
            "status": call.status or "initiated",
            "call_sid": call.sid,
            "message": f"Twilio call initiated successfully to {target_phone}!"
        }
    except Exception as e:
        err_msg = str(e)
        if "is unverified" in err_msg or "Trial accounts may only make calls to verified numbers" in err_msg:
            return {
                "success": True,
                "simulated": True,
                "status": "queued",
                "call_sid": "SIMULATED_TRIAL_SID",
                "message": f"Twilio Trial Mode: {target_phone} is not verified in Twilio Console. Simulated call queued successfully!"
            }
        return {
            "success": False,
            "status": "failed",
            "message": f"Twilio Error: {err_msg}"
        }

def build_twilio_voice_entry_twiml(customer_name: str, feedback_url: str) -> str:
    """Generates TwiML for initial call greeting & speech Gather."""
    response = VoiceResponse()
    agent_info = get_active_agent_info()
    agent_name = agent_info["agent_name"]
    v = get_twilio_voice(get_active_voice())
    is_marwari = is_marwari_accent_active()
    stt_lang = "hi-IN" if is_marwari else "en-IN"

    if is_marwari:
        greeting_text = "राम राम सा! मैं बीसीटी फ़ाइबरनेट से बोल रहा हूँ। आपकी इंटरनेट सेवा कैसी चल रही है? थोड़ा फीडबैक दीजिए।"
        closing_text = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।"
    else:
        greeting_text = (
            f"Hello {customer_name or ''}! I am {agent_name} from BFibernet, calling for quick feedback on your internet service. "
            "How is your experience?"
        )
        closing_text = "Thank you for your feedback! Goodbye."

    gather = response.gather(
        input="speech dtmf",
        action=feedback_url,
        method="POST",
        speech_timeout="auto",
        language=stt_lang,
        num_digits=1,
    )
    gather.say(greeting_text, voice=v)

    response.say(closing_text, voice=v)
    response.hangup()

    return str(response)

def build_twilio_feedback_response_twiml(customer_text: str, customer_data: Optional[Dict[str, Any]], feedback_url: str) -> str:
    """Generates TwiML conversational reply & auto-hangup after SpeechResult."""
    response = VoiceResponse()
    v = get_twilio_voice(get_active_voice())
    is_marwari = is_marwari_accent_active()
    stt_lang = "hi-IN" if is_marwari else "en-IN"

    if not customer_text:
        no_speech_text = "जी, आपकी आवाज़ थोड़ी साफ़ नहीं आ रही है। एक बार फिर से बताइए।" if is_marwari else "I didn't quite catch that. Could you please tell me about your experience?"
        gather = response.gather(
            input="speech",
            action=feedback_url,
            method="POST",
            speech_timeout="auto",
            language=stt_lang,
        )
        gather.say(no_speech_text, voice=v)
        return str(response)

    ai_text = generate_ai_response(customer_text, customer_data)
    bye_msg = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।" if is_marwari else "Have a fantastic day! Goodbye."

    response.say(ai_text, voice=v)
    response.say(bye_msg, voice=v)
    response.hangup()

    return str(response)
