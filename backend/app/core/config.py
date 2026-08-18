import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "BFibernet Multi-Agent Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    DB_FILE: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db", "app.db")

    @property
    def twilio_account_sid(self) -> str:
        load_dotenv(override=True)
        return os.getenv("TWILIO_ACCOUNT_SID", "").strip()

    @property
    def twilio_auth_token(self) -> str:
        load_dotenv(override=True)
        return os.getenv("TWILIO_AUTH_TOKEN", "").strip()

    @property
    def twilio_phone_number(self) -> str:
        load_dotenv(override=True)
        return os.getenv("TWILIO_PHONE_NUMBER", "").strip()

    @property
    def gemini_api_key(self) -> str:
        load_dotenv(override=True)
        return os.getenv("GEMINI_API_KEY", "").strip()

    @property
    def gemini_model(self) -> str:
        load_dotenv(override=True)
        return os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    @property
    def elevenlabs_api_key(self) -> str:
        load_dotenv(override=True)
        return os.getenv("ELEVENLABS_API_KEY", "").strip()

    @property
    def elevenlabs_voice_id(self) -> str:
        load_dotenv(override=True)
        return os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM").strip()

    @property
    def sarvam_api_key(self) -> str:
        load_dotenv(override=True)
        return os.getenv("SARVAM_API_KEY", "").strip()

    @property
    def base_url(self) -> str:
        load_dotenv(override=True)
        return os.getenv("BASE_URL", "").strip().rstrip("/")

    def is_twilio_configured(self) -> bool:
        sid = self.twilio_account_sid
        token = self.twilio_auth_token
        phone = self.twilio_phone_number
        return bool(sid and token and phone and 
                    sid != "your_twilio_account_sid_here" and 
                    token != "your_twilio_auth_token_here")

settings = Settings()
