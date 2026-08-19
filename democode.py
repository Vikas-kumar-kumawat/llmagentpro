import os
import time
import re
import urllib.parse
import urllib.request
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, Request, Response, Form, HTTPException, status
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# ASSUMPTION: You will need to import your existing functions and globals here:
# from your_module import (
#     gemini, GEMINI_MODEL, twilio, TWILIO_PHONE_NUMBER,
#     VOICE_CATALOG, ACTIVE_VOICE, customers,
#     get_active_voice, get_active_agent_info, get_base_url,
#     get_active_agent_name, get_twilio_voice, is_public_host,
#     normalize_phone_number, find_customer, save_customers_to_disk, load_customers_from_disk
# )
# from twilio.twiml.voice_response import VoiceResponse

# Environment checks
IS_RENDER = os.getenv("RENDER") is not None
IS_VERCEL = os.getenv("VERCEL") is not None

app = FastAPI(title="BCT Fibernet AI Caller")
templates = Jinja2Templates(directory="templates")

# =========================
# PYDANTIC MODELS
# =========================

class VoiceRequest(BaseModel):
    voice_id: Optional[str] = None

class CustomerRequest(BaseModel):
    name: str
    phone: str

class CallRequest(BaseModel):
    customer_id: Optional[str] = None
    phone: Optional[str] = None


# =========================
# HELPER FUNCTIONS
# =========================

def generate_ai_response(customer_text: str, customer: Optional[Dict[str, Any]] = None) -> str:
    """Generates conversational AI response via Gemini API with smart fallback."""
    ai_text = ""
    lower = customer_text.lower()
    active_v = get_active_voice()
    agent_info = get_active_agent_info()
    agent_name = agent_info["agent_name"]
    is_rajasthani_hindi = any(k in active_v for k in ["hi-IN", "Neural2", "Sarvam", "Bulbul"]) or "Hindi" in agent_info.get("info", {}).get("accent", "")

    if gemini:
        try:
            if is_rajasthani_hindi:
                prompt = (
                    f"You are {agent_name} calling from BCT Fibernet for customer feedback.\n"
                    f'The customer said: "{customer_text}"\n\n'
                    "EXACT DIALOGUE SCRIPT & STYLE RULES:\n"
                    "1. Respond in respectful Hindi/Rajasthani tone starting with 'राम राम सा!' when appropriate.\n"
                    "2. If customer says service is good/fine: say 'अच्छा, ये सुनकर अच्छा लगा। इंटरनेट की स्पीड भी ठीक मिल रही है?' or ask for 1 to 5 star rating.\n"
                    "3. If customer has issues/problems: say 'अच्छा, समझ गया। आपको किस तरह की परेशानी आ रही है? थोड़ा बताइए।' or 'ठीक है, आपकी बात नोट कर लेते हैं।'\n"
                    "4. Useful follow-up questions to use when appropriate:\n"
                    "   - 'इंटरनेट की स्पीड ठीक चल रही है?'\n"
                    "   - 'कनेक्शन में कोई परेशानी तो नहीं आ रही?'\n"
                    "   - 'इंटरनेट बार-बार बंद तो नहीं हो रहा?'\n"
                    "5. Keep replies super concise (maximum 15 words).\n"
                    "6. Output ONLY plain text without markdown, quotes, or internal labels."
                )
            else:
                prompt = (
                    f"You are {agent_name} calling from BCT Fibernet regarding internet service feedback.\n"
                    f'The customer said: "{customer_text}"\n\n'
                    "Rules:\n"
                    "1. Acknowledge their feedback about BCT Fibernet internet service naturally.\n"
                    "2. If they haven't given a 1 to 5 star rating yet, ask for a star rating out of 5.\n"
                    "3. Keep your reply super concise (maximum 15 words).\n"
                    "4. Speak naturally without markdown or internal labels."
                )
            res = gemini.models.generate_content(model=GEMINI_MODEL, contents=prompt)
            if res and res.text:
                ai_text = res.text.strip()
        except Exception as ex:
            print(f"[Gemini API Exception] {ex}")

    if not ai_text:
        nums = re.findall(r"\b([1-5])\b", customer_text)
        rating_num = int(nums[0]) if nums else (customer.get("rating") if customer else None)
        bye_words = ["bye", "goodbye", "thank you", "thanks", "that's all", "done", "no", "that is all", "राम राम", "धन्यवाद", "कोनी"]

        if any(w in lower for w in bye_words):
            ai_text = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।" if is_rajasthani_hindi else "Thank you so much for your valuable feedback! Have a wonderful day. Goodbye!"
        elif rating_num:
            if rating_num >= 4:
                ai_text = f"अच्छा, ये सुनकर अच्छा लगा। {rating_num} स्टार देने के लिए धन्यवाद।" if is_rajasthani_hindi else f"Thank you so much for giving us {rating_num} stars! We are delighted to hear your feedback."
            else:
                ai_text = f"ठीक है, आपकी बात नोट कर लेते हैं। {rating_num} स्टार रेटिंग के लिए धन्यवाद।" if is_rajasthani_hindi else f"Thank you for your {rating_num} star rating. We sincerely apologize for any inconvenience and will work to improve."
        elif any(w in lower for w in ["good", "great", "excellent", "awesome", "amazing", "wonderful", "nice", "happy", "बढ़िया", "सही", "चोखो", "ठीक", "अच्छा", "अच्छी"]):
            ai_text = "बहुत बढ़िया! आपकी प्रतिक्रिया के लिए धन्यवाद।" if is_rajasthani_hindi else "That is so wonderful to hear! Thank you for your feedback."
        elif any(w in lower for w in ["bad", "poor", "slow", "worst", "terrible", "issue", "delay", "not good", "खराब", "धीमी", "बंद"]):
            ai_text = "आपकी परेशानी हमने नोट कर ली है। हमारी टीम जल्द सुधार करेगी।" if is_rajasthani_hindi else "We have noted your concern and will work to improve our service immediately."
        else:
            ai_text = "आपकी प्रतिक्रिया के लिए बीसीटी फ़ाइबरनेट की ओर से बहुत-बहुत धन्यवाद!" if is_rajasthani_hindi else "Thank you for sharing your valuable feedback with BCT Fibernet!"

    return ai_text


def is_marwari_accent_active() -> bool:
    """Checks if the currently active voice is a Marwari / Rajasthani / Hindi accent voice."""
    v = get_active_voice()
    info = get_active_agent_info()
    accent = info.get("info", {}).get("accent", "")
    return any(k in v for k in ["hi-IN", "Neural2", "Sarvam", "Bulbul", "Aditi", "Kajal"]) or "Rajasthani" in accent or "Marwari" in accent or "Hindi" in accent


# =========================
# WEB ROUTES & ENDPOINTS
# =========================

@app.get("/", response_class=HTMLResponse)
@app.get("/api/index", response_class=HTMLResponse)
@app.get("/api/index.py", response_class=HTMLResponse)
async def index(request: Request):
    """Serves main dashboard SPA."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/health")
def health():
    """Returns application health and environment info."""
    env_name = "Render Production" if IS_RENDER else ("Vercel Production" if IS_VERCEL else "Local Development")
    return {
        "status": "ok",
        "engine": "Gemini 2.5 Flash + Twilio Voice",
        "active_voice": get_active_voice(),
        "environment": env_name,
        "base_url": get_base_url(),
    }


@app.get("/api/voices")
def get_voices():
    """Fetches catalog of AI voices."""
    return {"success": True, "active_voice": ACTIVE_VOICE, "voices": VOICE_CATALOG}


@app.post("/api/voices")
def update_voice(data: VoiceRequest):
    """Updates active AI voice."""
    global ACTIVE_VOICE
    voice_id = data.voice_id
    found = next((v for v in VOICE_CATALOG if v["id"] == voice_id), None)
    if not found:
        return JSONResponse(status_code=400, content={"success": False, "error": f"Voice ID '{voice_id}' not found in catalog"})
    
    ACTIVE_VOICE = voice_id
    return {"success": True, "active_voice": ACTIVE_VOICE, "voice_info": found}


@app.get("/api/demo-audio")
def stream_voice_demo(voice_id: Optional[str] = None):
    """Streams sample audio voice preview."""
    voice_id = voice_id or get_active_voice()
    v_info = next((v for v in VOICE_CATALOG if v["id"] == voice_id), VOICE_CATALOG[0])
    text = v_info.get("sample_text", "Hello! I am your AI Voice Assistant.")
    
    is_hindi_rajasthani = ("hi-IN" in voice_id) or ("Sarvam" in voice_id) or ("Hindi" in v_info.get("accent", "")) or ("Rajasthani" in v_info.get("accent", "")) or ("Marwari" in v_info.get("accent", ""))
    lang = "hi" if is_hindi_rajasthani else ("en-uk" if "GB" in voice_id else "en")

    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={urllib.parse.quote(text)}"
    try:
        req = urllib.request.Request(tts_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return Response(content=resp.read(), media_type="audio/mpeg")
    except Exception as e:
        print(f"[Demo Audio Stream Error] {e}")
        return JSONResponse(status_code=500, content={"error": "Failed to stream audio"})


@app.get("/api/customers")
def get_customers():
    """Lists all customers."""
    customers_data = load_customers_from_disk()
    return customers_data


@app.post("/api/customers")
def create_customer(data: CustomerRequest):
    """Creates a new customer task."""
    name = data.name.strip()
    raw_phone = data.phone.strip()

    if not name or not raw_phone:
        return JSONResponse(status_code=400, content={"success": False, "error": "Name and phone number are required"})

    phone = normalize_phone_number(raw_phone)
    existing = find_customer(phone=phone)
    if existing:
        return JSONResponse(status_code=400, content={"success": False, "error": f"Customer with phone {phone} already exists ({existing['name']})"})

    customer = {
        "id": f"c{int(time.time() % 100000)}",
        "name": name,
        "phone": phone,
        "status": "pending",
        "feedback": [],
        "rating": None,
        "sentiment": "Neutral",
        "transcript": [],
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
        "last_call": None,
    }
    customers.append(customer)
    save_customers_to_disk()
    return JSONResponse(status_code=201, content={"success": True, "customer": customer})


@app.get("/api/customers/{customer_id}")
def get_customer_by_id(customer_id: str):
    """Retrieves a single customer record."""
    c = find_customer(customer_id=customer_id)
    if not c:
        return JSONResponse(status_code=404, content={"success": False, "error": "Customer not found"})
    return {"success": True, "customer": c}


@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: str):
    """Deletes a single customer record."""
    global customers
    c = find_customer(customer_id=customer_id)
    if not c:
        return JSONResponse(status_code=404, content={"success": False, "error": "Customer not found"})
        
    customers = [item for item in customers if item["id"] != customer_id]
    save_customers_to_disk()
    return {"success": True, "message": "Customer deleted successfully"}


@app.delete("/api/customers/{customer_id}/feedback")
def delete_customer_feedback(customer_id: str):
    """Clears feedback history for a specific customer."""
    c = find_customer(customer_id=customer_id)
    if not c:
        return JSONResponse(status_code=404, content={"success": False, "error": "Customer not found"})
    
    c.update({"feedback": [], "rating": None, "sentiment": "Neutral", "transcript": []})
    if c.get("status") == "completed":
        c["status"] = "pending"
    save_customers_to_disk()
    return {"success": True, "message": "Customer feedback cleared successfully", "customer": c}


@app.post("/api/seed")
def reset_seed_data():
    """Resets customer store back to initial sample dataset."""
    global customers
    customers.clear()
    customers.extend([
        {
            "id": "c101",
            "name": "Sarah Jenkins",
            "phone": "+919057262630",
            "status": "completed",
            "feedback": ["The service was wonderful! Quick delivery and friendly staff.", "I would rate it 5 stars."],
            "rating": 5,
            "sentiment": "Positive",
            "transcript": [
                {"speaker": "ai", "text": "Hello! This is Sarah calling from Feedback Ops. How was your experience with our service?"},
                {"speaker": "customer", "text": "The service was wonderful! Quick delivery and friendly staff."},
                {"speaker": "ai", "text": "That is so great to hear! How many stars out of 5 would you give us?"},
                {"speaker": "customer", "text": "I would rate it 5 stars."},
                {"speaker": "ai", "text": "Thank you so much for your feedback! Have a lovely day. Goodbye."},
            ],
            "created_at": time.strftime("%Y-%m-%d %H:%M"),
            "last_call": "Recent",
        },
        {
            "id": "c102",
            "name": "David Miller",
            "phone": "+19164356173",
            "status": "pending",
            "feedback": [],
            "rating": None,
            "sentiment": "Neutral",
            "transcript": [],
            "created_at": time.strftime("%Y-%m-%d %H:%M"),
            "last_call": None,
        },
        {
            "id": "c103",
            "name": "Priya Sharma",
            "phone": "+919876543210",
            "status": "pending",
            "feedback": [],
            "rating": None,
            "sentiment": "Neutral",
            "transcript": [],
            "created_at": time.strftime("%Y-%m-%d %H:%M"),
            "last_call": None,
        },
    ])
    save_customers_to_disk()
    return {"success": True, "message": "Sample data reset successfully", "customers": customers}


# =========================
# CALL CONTROL & TWILIO API
# =========================

@app.post("/api/call")
def make_call(data: CallRequest):
    """Triggers outbound AI voice feedback call."""
    customer_id = data.customer_id
    phone = data.phone

    customer = find_customer(customer_id=customer_id, phone=phone)
    if customer_id and not customer:
        return JSONResponse(status_code=404, content={"success": False, "error": "Customer ID not found"})

    raw_target = customer["phone"] if customer else phone
    target_phone = normalize_phone_number(raw_target)
    if not target_phone:
        return JSONResponse(status_code=400, content={"success": False, "error": "Phone number or valid customer_id is required"})

    if customer:
        customer["phone"] = target_phone

    base = get_base_url()
    if not is_public_host(base):
        return JSONResponse(
            status_code=400, 
            content={
                "success": False,
                "error": "No active public HTTPS tunnel connected. Cloudflare quick tunnel is currently rate-limited (429). Please set a valid public BASE_URL in .env (e.g. ngrok http 5000) or wait for Cloudflare cooldown."
            }
        )

    cid_param = f"?customer_id={customer['id']}" if customer else f"?phone={urllib.parse.quote(target_phone)}"
    voice_url = f"{base}/api/twilio/voice{cid_param}"
    status_url = f"{base}/api/twilio/status{cid_param}"

    print(f"[Initiate Call] Dialing {target_phone} via Voice URL: {voice_url}")

    if not twilio:
        if customer:
            customer["status"] = "calling"
        return {
            "success": True,
            "simulated": True,
            "message": f"Twilio client not initialized with real SID/Token, simulated call status for {target_phone}.",
        }

    try:
        call = twilio.calls.create(
            to=target_phone,
            from_=TWILIO_PHONE_NUMBER,
            url=voice_url,
            method="POST",
            status_callback=status_url,
            status_callback_method="POST",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )

        if customer:
            customer["status"] = "calling"
            customer["call_sid"] = call.sid
            customer["last_call"] = time.strftime("%H:%M:%S")

        return {
            "success": True,
            "call_id": call.sid,
            "status": call.status,
            "message": f"AI call initiated to {customer['name'] if customer else target_phone}",
        }
    except Exception as e:
        print(f"[Call Exception] {e}")
        if customer:
            customer["status"] = "failed"
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.api_route("/api/twilio/voice", methods=["GET", "POST"])
async def twilio_voice(request: Request, customer_id: Optional[str] = None, phone: Optional[str] = None):
    """Initial TwiML entry point when call connects."""
    form_data = await request.form()
    # Twilio sends `To` and `From` as form data in POST webhooks
    request_phone = phone or form_data.get("To") or form_data.get("From")
    
    customer = find_customer(customer_id=customer_id, phone=request_phone)

    if customer:
        customer["status"] = "calling"
        save_customers_to_disk()

    base = get_base_url()
    cid_param = f"?customer_id={customer['id']}" if customer else ""
    feedback_url = f"{base}/api/twilio/feedback{cid_param}"

    response = VoiceResponse()
    agent_name = get_active_agent_name()
    c_name = customer["name"] if customer else ""
    v = get_twilio_voice(get_active_voice())
    is_marwari = is_marwari_accent_active()
    stt_lang = "hi-IN" if is_marwari else "en-IN"

    if is_marwari:
        greeting_text = "राम राम सा! मैं बीसीटी फ़ाइबरनेट से बोल रहा हूँ। आपकी इंटरनेट सेवा कैसी चल रही है? थोड़ा फीडबैक दीजिए।"
        closing_text = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।"
    else:
        greeting_text = (
            f"Hello {c_name}! I am {agent_name} from BCT Fibernet, calling for quick feedback on your internet service. "
            "How is your experience?"
        )
        closing_text = "Thank you for your feedback! Goodbye."

    if customer:
        customer["transcript"] = [{"speaker": "ai", "text": greeting_text}]
        save_customers_to_disk()

    gather = response.gather(
        input="speech",
        action=feedback_url,
        method="POST",
        speech_timeout="auto",
        language=stt_lang,
    )
    gather.say(greeting_text, voice=v)

    response.say(closing_text, voice=v)
    response.hangup()

    return Response(content=str(response), status_code=200, media_type="text/xml")


@app.post("/api/twilio/feedback")
async def twilio_feedback(request: Request, customer_id: Optional[str] = None):
    """Processes customer speech result and renders conversational response."""
    form_data = await request.form()
    called_phone = form_data.get("To") or form_data.get("From")
    customer_text = form_data.get("SpeechResult", "").strip()
    
    customer = find_customer(customer_id=customer_id, phone=called_phone)

    response = VoiceResponse()
    base = get_base_url()
    cid_param = f"?customer_id={customer['id']}" if customer else ""
    feedback_url = f"{base}/api/twilio/feedback{cid_param}"
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
        return Response(content=str(response), status_code=200, media_type="text/xml")

    if customer:
        customer.setdefault("feedback", []).append(customer_text)
        customer.setdefault("transcript", []).append({"speaker": "customer", "text": customer_text})

        if customer.get("rating") is None:
            nums = re.findall(r"\b([1-5])\b", customer_text)
            if nums:
                customer["rating"] = int(nums[0])

        pos_words = ["good", "great", "excellent", "amazing", "wonderful", "awesome", "fast", "love", "nice", "5", "4", "बढ़िया", "सही", "चोखो", "बढिया", "ठीक"]
        neg_words = ["bad", "poor", "terrible", "horrible", "slow", "delay", "worst", "hate", "1", "2", "खराब", "धीमी", "बेकार", "परेशानी", "बंद"]
        lower = customer_text.lower()
        if any(w in lower for w in pos_words):
            customer["sentiment"] = "Positive"
        elif any(w in lower for w in neg_words):
            customer["sentiment"] = "Negative"
        else:
            customer["sentiment"] = "Neutral"

    ai_text = generate_ai_response(customer_text, customer)
    if customer:
        customer.setdefault("transcript", []).append({"speaker": "ai", "text": ai_text})

    bye_msg = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।" if is_marwari else "Have a fantastic day! Goodbye."

    # Always deliver response, polite closing, and HANG UP cleanly after feedback
    response.say(ai_text, voice=v)
    response.say(bye_msg, voice=v)
    response.hangup()

    if customer:
        customer["status"] = "completed"
        save_customers_to_disk()

    return Response(content=str(response), status_code=200, media_type="text/xml")


@app.post("/api/twilio/status")
async def twilio_status(request: Request, customer_id: Optional[str] = None):
    """Webhook for Twilio call state transitions."""
    form_data = await request.form()
    call_status = form_data.get("CallStatus", "")
    phone = form_data.get("To", "") or form_data.get("From", "")

    customer = find_customer(customer_id=customer_id, phone=phone)
    if customer:
        if call_status == "completed":
            customer["status"] = "completed"
        elif call_status in ("failed", "busy", "no-answer", "canceled"):
            customer["status"] = "failed"
        elif call_status in ("initiated", "ringing", "in-progress"):
            customer["status"] = "calling"
        save_customers_to_disk()

    return Response(content="OK", status_code=200)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)