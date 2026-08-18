import re

def format_phone_number(phone: str) -> str:
    """
    Formats phone numbers to standard E.164 (+91XXXXXXXXXX) without duplicate prefixes like +9191.
    """
    if not phone:
        return ""
    cleaned = re.sub(r"[^\d+]", "", str(phone).strip())
    if not cleaned:
        return ""
    if cleaned.startswith("+"):
        return cleaned
    if cleaned.startswith("00"):
        return "+" + cleaned[2:]
    if cleaned.startswith("0") and len(cleaned) == 11:
        cleaned = cleaned[1:]
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    if len(cleaned) == 12 and cleaned.startswith("91"):
        return f"+{cleaned}"
    return f"+{cleaned}"
