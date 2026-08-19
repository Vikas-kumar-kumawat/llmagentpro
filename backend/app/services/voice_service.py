import os
import re
import urllib.parse
import urllib.request
from typing import Dict, Any, List, Optional
from app.core.config import settings

VOICE_CATALOG: List[Dict[str, str]] = [
    {
        "id": "Google.hi-IN-Wavenet-B",
        "name": "Ratan Singh (Neural Male - Marwari & Rajasthani)",
        "accent": "Rajasthani & Marwari Hindi",
        "gender": "Male",
        "sample_text": "राम राम सा! खम्मा घणी। मैं रतन सिंह, बीसीटी फ़ाइबरनेट से बात कर रहा हूँ।",
    },
    {
        "id": "Google.hi-IN-Wavenet-D",
        "name": "Aarav Sharma (Warm Natural Male - Hindi)",
        "accent": "Conversational Hindi",
        "gender": "Male",
        "sample_text": "नमस्ते! मैं आरव शर्मा बात कर रहा हूँ बीसीटी फ़ाइबरनेट से। आपकी इंटरनेट सेवा कैसी चल रही है?",
    },
    {
        "id": "Google.hi-IN-Wavenet-C",
        "name": "Ananya Verma (Soft Conversational Female - Hindi)",
        "accent": "Expressive Hindi",
        "gender": "Female",
        "sample_text": "नमस्ते! मैं अनन्या वर्मा बोल रही हूँ। आपकी सहायता के लिए बीसीटी फ़ाइबरनेट कस्टमर केयर।",
    },
    {
        "id": "Google.en-IN-Wavenet-D",
        "name": "Priya Sharma (Neural Female - Indian English)",
        "accent": "Indian English",
        "gender": "Female",
        "sample_text": "Namaste! I am Priya Sharma. I deliver warm, polite, and natural human customer feedback calls.",
    },
    {
        "id": "Google.en-IN-Wavenet-B",
        "name": "Rohan Kapoor (Professional Male - Indian English)",
        "accent": "Indian English",
        "gender": "Male",
        "sample_text": "Hello! I am Rohan Kapoor, your AI Voice Support Specialist from BFibernet.",
    },
    {
        "id": "Google.hi-IN-Wavenet-A",
        "name": "Gauri Devi (Neural Female - Rajasthani & Hindi)",
        "accent": "Rajasthani & Marwari Hindi",
        "gender": "Female",
        "sample_text": "खम्मा घणी! राम राम सा। मैं गौरी हूँ, बीसीटी फ़ाइबरनेट सेवा फ़ीडबैक के लिए कॉलिंग।",
    },
]

ACTIVE_VOICE = "Google.hi-IN-Wavenet-B"

def get_active_voice() -> str:
    global ACTIVE_VOICE
    return ACTIVE_VOICE

def set_active_voice(voice_id: str) -> Optional[Dict[str, Any]]:
    global ACTIVE_VOICE
    found = next((v for v in VOICE_CATALOG if v["id"] == voice_id), None)
    if found:
        ACTIVE_VOICE = voice_id
        return found
    return None

def get_active_agent_info() -> Dict[str, Any]:
    global ACTIVE_VOICE
    v_info = next((v for v in VOICE_CATALOG if v["id"] == ACTIVE_VOICE), VOICE_CATALOG[0])
    return {
        "voice_id": ACTIVE_VOICE,
        "agent_name": v_info["name"].split(" ")[0],
        "info": v_info,
    }

def get_active_agent_name() -> str:
    return get_active_agent_info()["agent_name"]

def get_twilio_voice(voice_id: str) -> str:
    if not voice_id:
        return "Google.hi-IN-Wavenet-B"
        
    valid_twilio_voices = {
        "Google.hi-IN-Wavenet-A",
        "Google.hi-IN-Wavenet-B",
        "Google.hi-IN-Wavenet-C",
        "Google.hi-IN-Wavenet-D",
        "Google.en-IN-Wavenet-A",
        "Google.en-IN-Wavenet-B",
        "Google.en-IN-Wavenet-C",
        "Google.en-IN-Wavenet-D",
        "Polly.Aditi",
        "Polly.Kajal",
        "alice",
        "man",
        "woman"
    }
    if voice_id in valid_twilio_voices:
        return voice_id

    if "Neural2-A" in voice_id or "Male" in voice_id:
        return "Google.hi-IN-Wavenet-B"
    if "Neural2-D" in voice_id or "Female" in voice_id or "Bulbul" in voice_id or "Sarvam" in voice_id:
        return "Google.hi-IN-Wavenet-A"
    if "hi-IN" in voice_id:
        return "Google.hi-IN-Wavenet-B"

    return "Google.hi-IN-Wavenet-B"

def is_marwari_accent_active() -> bool:
    v = get_active_voice()
    info = get_active_agent_info()
    accent = info.get("info", {}).get("accent", "")
    return any(k in v for k in ["hi-IN", "Neural2", "Sarvam", "Bulbul", "Aditi", "Kajal"]) or "Rajasthani" in accent or "Marwari" in accent or "Hindi" in accent

def analyze_customer_feedback_with_gemini(customer_text: str) -> Dict[str, Any]:
    """Uses Gemini LLM to accurately analyze customer feedback sentiment and rating."""
    rating = None
    sentiment = "neutral"
    
    if settings.gemini_api_key:
        try:
            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            prompt = (
                f'Analyze this customer response regarding internet service feedback: "{customer_text}"\n\n'
                "Strict rules:\n"
                "1. If customer says service is not good, bad, poor, slow, has issues, or expresses dissatisfaction, sentiment MUST be 'negative' and rating MUST be 1 or 2.\n"
                "2. If customer says service is good, great, excellent, working well, sentiment MUST be 'positive' and rating MUST be 4 or 5.\n"
                "3. If rating is explicitly mentioned (e.g., '1 star', '5 stars'), use that number.\n\n"
                "Respond ONLY with a JSON object matching this schema:\n"
                '{"rating": <number 1-5>, "sentiment": "<positive|negative|neutral>"}'
            )
            model_name = "gemini-1.5-flash"
            res = client.models.generate_content(model=model_name, contents=prompt)
            if res and res.text:
                clean = res.text.strip().replace("```json", "").replace("```", "").strip()
                data = json.loads(clean)
                if isinstance(data, dict):
                    if data.get("rating") in [1, 2, 3, 4, 5]:
                        rating = int(data["rating"])
                    if data.get("sentiment") in ["positive", "negative", "neutral"]:
                        sentiment = str(data["sentiment"])
                    return {"rating": rating, "sentiment": sentiment}
        except Exception as ex:
            print(f"[Gemini Sentiment Analysis Error] {ex}")

    # Fallback rule-based analysis (Check negative phrases FIRST!)
    lower = customer_text.lower()
    neg_phrases = ["not good", "no good", "not working", "bad", "poor", "terrible", "horrible", "slow", "delay", "worst", "hate", "1", "2", "kharab", "bekar", "खराब", "धीमी", "बेकार", "परेशानी", "बंद", "अच्छा नहीं", "सही नहीं"]
    pos_phrases = ["good", "great", "excellent", "amazing", "wonderful", "awesome", "fast", "love", "nice", "5", "4", "बढ़िया", "सही", "चोखो", "बढिया", "अच्छा"]
    
    nums = re.findall(r"\b([1-5])\b", customer_text)
    if nums:
        rating = int(nums[0])

    if any(p in lower for p in neg_phrases):
        sentiment = "negative"
        if not rating:
            rating = 1 if any(w in lower for w in ["worst", "terrible", "horrible", "1"]) else 2
    elif any(p in lower for p in pos_phrases):
        sentiment = "positive"
        if not rating:
            rating = 5 if any(w in lower for w in ["excellent", "amazing", "5"]) else 4
    else:
        sentiment = "neutral"
        if not rating:
            rating = 3
            
    return {"rating": rating, "sentiment": sentiment}

def generate_ai_response(customer_text: str, rating: Optional[int] = None, sentiment: str = "neutral") -> str:
    ai_text = ""
    lower = customer_text.lower()
    active_v = get_active_voice()
    agent_info = get_active_agent_info()
    agent_name = agent_info["agent_name"]
    is_rajasthani_hindi = is_marwari_accent_active()

    if settings.gemini_api_key:
        try:
            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            if is_rajasthani_hindi:
                prompt = (
                    f"You are {agent_name} calling from BFibernet for customer feedback.\n"
                    f'The customer said: "{customer_text}"\n\n'
                    "EXACT DIALOGUE SCRIPT & STYLE RULES:\n"
                    "1. MUST RESPOND IN HINDI SCRIPT (Devanagari). DO NOT OUTPUT ENGLISH LETTERS.\n"
                    "2. Start with 'राम राम सा!' when appropriate.\n"
                    "3. If customer says service is NOT good/has issues: apologize sincerely and say 'अरेरे, आपकी परेशानी नोट कर ली है। हमारी टीम तुरंत जांच करेगी।'\n"
                    "4. If customer says service is good/fine: say 'अच्छा, ये सुनकर अच्छा लगा।'\n"
                    "5. Keep replies super concise (maximum 15 words).\n"
                    "6. Output ONLY plain text without markdown, quotes, or internal labels.\n"
                    f"Context: the parsed sentiment is '{sentiment}' and rating is {rating}/5."
                )
            else:
                prompt = (
                    f"You are {agent_name} calling from BFibernet regarding internet service feedback.\n"
                    f'The customer said: "{customer_text}"\n\n'
                    "Rules:\n"
                    "1. MUST RESPOND IN ENGLISH ONLY.\n"
                    "2. If customer says service is NOT good/has issues, apologize sincerely and state that technical support will inspect it.\n"
                    "3. If customer says service is good, thank them warmly.\n"
                    "4. Keep your reply super concise (maximum 15 words).\n"
                    "5. Speak naturally without markdown or internal labels.\n"
                    f"Context: the parsed sentiment is '{sentiment}' and rating is {rating}/5."
                )
            model_name = "gemini-1.5-flash"
            res = client.models.generate_content(model=model_name, contents=prompt)
            if res and res.text:
                ai_text = res.text.strip()
        except Exception as ex:
            print(f"[Gemini Voice Response Warning] {ex}")

    if not ai_text:
        nums = re.findall(r"\b([1-5])\b", customer_text)
        rating_num = int(nums[0]) if nums else rating
        greetings = ["hi", "hello", "hey", "ji", "haa", "boliye", "yes", "yep", "नमस्ते", "राम राम"]
        bye_words = ["bye", "goodbye", "thank you", "thanks", "that's all", "done", "no", "that is all", "धन्यवाद"]

        is_greeting = any(lower == g or lower.startswith(g + " ") for g in greetings)

        if is_greeting and not rating_num:
            ai_text = "राम राम सा! आपकी इंटरनेट स्पीड और सेवा कैसी चल रही है? 1 से 5 स्टार रेटिंग दीजिए।" if is_rajasthani_hindi else "Hello! How is your BFibernet fiber internet working today? Could you rate your experience from 1 to 5 stars?"
        elif any(w in lower for w in bye_words):
            ai_text = "राम राम! आपका दिन अच्छा रहे। बीसीटी फ़ाइबरनेट को समय देने के लिए धन्यवाद।" if is_rajasthani_hindi else "Thank you so much for your valuable feedback! Have a wonderful day. Goodbye!"
        elif any(w in lower for w in ["not good", "no good", "not working", "bad", "poor", "slow", "worst", "terrible", "issue", "delay", "खराब", "धीमी", "बंद", "अच्छा नहीं"]):
            ai_text = "आपकी परेशानी हमने नोट कर ली है। हमारी टीम जल्द सुधार करेगी।" if is_rajasthani_hindi else "We apologize for the poor service. Our technical support team will look into this immediately."
        elif any(w in lower for w in ["good", "great", "excellent", "awesome", "amazing", "wonderful", "nice", "happy", "बढ़िया", "सही", "चोखो", "ठीक", "अच्छा"]):
            ai_text = "बहुत बढ़िया! आपकी प्रतिक्रिया के लिए धन्यवाद।" if is_rajasthani_hindi else "That is so wonderful to hear! Thank you for your feedback."
        elif rating_num:
            if rating_num >= 4:
                ai_text = f"अच्छा, ये सुनकर अच्छा लगा। {rating_num} स्टार देने के लिए धन्यवाद।" if is_rajasthani_hindi else f"Thank you so much for giving us {rating_num} stars! We are delighted to hear your feedback."
            else:
                ai_text = f"ठीक है, आपकी बात नोट कर लेते हैं। {rating_num} स्टार रेटिंग के लिए धन्यवाद।" if is_rajasthani_hindi else f"Thank you for your {rating_num} star rating. We sincerely apologize for any inconvenience."
        else:
            ai_text = "आपकी प्रतिक्रिया के लिए बीसीटी फ़ाइबरनेट की ओर से बहुत-बहुत धन्यवाद!" if is_rajasthani_hindi else "Thank you for sharing your valuable feedback with BFibernet!"

    return ai_text
