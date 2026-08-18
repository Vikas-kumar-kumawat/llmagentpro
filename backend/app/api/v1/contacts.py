from fastapi import APIRouter, HTTPException
from app.schemas import ContactCreate
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("")
def get_contacts():
    contacts = DataRepository.get_all_contacts()
    call_logs = DataRepository.get_call_logs()
    return {"contacts": contacts, "call_logs": call_logs}

@router.post("")
def create_contact(contact: ContactCreate):
    name = contact.name.strip()
    phone = format_phone_number(contact.phone)

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Name and phone number are required.")
    
    new_contact = DataRepository.add_contact(name, phone)
    return {
        "success": True,
        "message": "Contact stored successfully",
        "contact": new_contact
    }
