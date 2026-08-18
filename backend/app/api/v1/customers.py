import time
import re
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.repositories.data_repository import DataRepository
from app.utils.formatters import format_phone_number

router = APIRouter(prefix="/customers", tags=["Customers"])

class CreateCustomerRequest(BaseModel):
    name: str
    phone: str

class UpdateCustomerRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[int] = None
    feedback_text: Optional[str] = None
    sentiment: Optional[str] = None

@router.get("")
def list_customers():
    """Lists all customer feedback records."""
    data = DataRepository.get_feedback_and_tickets()
    return data.get("feedback_entries", [])

@router.post("")
def create_customer(request: CreateCustomerRequest):
    """Creates a new customer feedback record."""
    name = request.name.strip()
    phone = format_phone_number(request.phone.strip())

    if not name or not phone:
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    fb_id, ticket_id = DataRepository.save_feedback(
        customer_name=name,
        phone=phone,
        rating=5,
        feedback_text="New customer record added",
        sentiment="neutral",
        category="general",
        followup_needed=False
    )

    return {"success": True, "id": fb_id, "customer_name": name, "phone": phone}

@router.get("/{customer_id}")
def get_customer(customer_id: str):
    """Gets a single customer feedback record by ID (includes live transcript)."""
    entry = DataRepository.get_feedback_by_id(customer_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Customer not found")
    return entry


@router.put("/{customer_id}")
def update_customer(customer_id: str, request: UpdateCustomerRequest):
    """Updates a customer feedback entry by ID."""
    existing = DataRepository.get_feedback_by_id(customer_id)
    name = request.name.strip() if request.name else (existing.get("customer_name") if existing else "Customer")
    phone = format_phone_number(request.phone.strip()) if request.phone else (existing.get("phone") if existing else "")
    rating = request.rating if request.rating is not None else (existing.get("rating") if existing else 5)
    feedback_text = request.feedback_text.strip() if request.feedback_text else (existing.get("feedback_text") if existing else "")
    sentiment = request.sentiment.strip() if request.sentiment else (existing.get("sentiment") if existing else "neutral")

    updated = DataRepository.update_feedback_entry(customer_id, name, phone, rating, feedback_text, sentiment)
    return {"success": True, "message": "Customer updated successfully", "updated": updated}

@router.delete("/{customer_id}")
def delete_customer(customer_id: str):
    """Deletes a customer feedback entry by ID."""
    DataRepository.delete_feedback_entry(customer_id)
    return {"success": True, "message": "Customer deleted successfully"}

@router.delete("/{customer_id}/feedback")
def clear_customer_feedback(customer_id: str):
    """Clears customer feedback content."""
    entry = DataRepository.get_feedback_by_id(customer_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Customer not found")
    DataRepository.update_feedback_entry(customer_id, entry.get("customer_name"), entry.get("phone"), 5, "", "neutral")
    return {"success": True, "message": "Customer feedback cleared successfully"}
