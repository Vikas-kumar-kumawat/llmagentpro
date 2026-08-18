from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ContactCreate(BaseModel):
    name: str = Field(..., example="Rahul Sharma")
    phone: str = Field(..., example="9876543210")

class ContactResponse(BaseModel):
    id: int
    name: str
    phone: str
    created_at: str

class MakeCallRequest(BaseModel):
    name: str = Field(..., example="Rahul Sharma")
    phone: str = Field(..., example="9876543210")
    message: Optional[str] = Field(None, example="Custom greeting voice script")

class FeedbackCollectRequest(BaseModel):
    customer_name: str = Field(..., example="Rahul Sharma")
    phone: str = Field(..., example="9876543210")
    rating: int = Field(..., ge=1, le=5, example=5)
    feedback_text: Optional[str] = Field(None, example="Super fast internet speed!")

class FeedbackCollectResponse(BaseModel):
    success: bool
    agent: str
    feedback_id: Optional[int]
    ticket_id: Optional[int]
    sentiment: Optional[str]
    category: Optional[str]
    summary: Optional[str]
    followup_needed: Optional[bool]
    status: str
    trace_messages: List[str]

class RechargeReminderRequest(BaseModel):
    customer_name: str = Field(..., example="Vikas Kumar")
    phone: str = Field(..., example="9876543210")
    plan_name: Optional[str] = Field("Fiber 100Mbps Ultra", example="Fiber 100Mbps Ultra")
    expiry_date: Optional[str] = Field("Today", example="Aug 20, 2025")
    amount: Optional[str] = Field("₹799", example="₹799")

class NewOfferCallRequest(BaseModel):
    customer_name: str = Field(..., example="Vikas Kumar")
    phone: str = Field(..., example="9876543210")
    offer_title: Optional[str] = Field("Fiber 300Mbps Festive Discount", example="Fiber 300Mbps Festive Discount")
    discount_percent: Optional[int] = Field(30, example=30)
    special_price: Optional[str] = Field("₹999/mo", example="₹999/mo")

