from fastapi import APIRouter, HTTPException
from app.schemas import FeedbackCollectRequest, RechargeReminderRequest, NewOfferCallRequest
from app.db.repositories.data_repository import DataRepository
from app.agents.registry import agent_registry

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/info")
def get_agents_directory():
    """Returns directory of registered AI Agents"""
    return {
        "active_agents": agent_registry.list_agents()
    }

@router.post("/feedback/collect")
def collect_feedback(request: FeedbackCollectRequest):
    """
    Executes the Feedback Collector Agent dynamically via AgentRegistry.
    """
    if not request.customer_name.strip() or not request.phone.strip():
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    agent = agent_registry.get_agent("feedback_collector")
    if not agent:
        raise HTTPException(status_code=500, detail="Feedback Collector Agent is not registered.")

    agent_input = {
        "customer_name": request.customer_name.strip(),
        "phone": request.phone.strip(),
        "rating": request.rating,
        "feedback_text": request.feedback_text or ""
    }
    
    agent_output = agent.run(agent_input)

    return {
        "success": True,
        "agent": agent.name,
        "feedback_id": agent_output.get("feedback_id"),
        "ticket_id": agent_output.get("ticket_id"),
        "sentiment": agent_output.get("sentiment"),
        "category": agent_output.get("category"),
        "summary": agent_output.get("summary"),
        "followup_needed": agent_output.get("followup_needed"),
        "status": agent_output.get("status"),
        "trace_messages": agent_output.get("messages", [])
    }

@router.post("/recharge/reminder")
def trigger_recharge_reminder(request: RechargeReminderRequest):
    """
    Executes the Recharge Reminder Agent dynamically via AgentRegistry.
    """
    if not request.customer_name.strip() or not request.phone.strip():
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    agent = agent_registry.get_agent("recharge_reminder")
    if not agent:
        raise HTTPException(status_code=500, detail="Recharge Reminder Agent is not registered.")

    agent_input = {
        "customer_name": request.customer_name.strip(),
        "phone": request.phone.strip(),
        "plan_name": request.plan_name or "Fiber 100Mbps Ultra",
        "expiry_date": request.expiry_date or "Today",
        "amount": request.amount or "₹799"
    }

    return agent.run(agent_input)

@router.post("/offers/broadcast")
def trigger_new_offers_call(request: NewOfferCallRequest):
    """
    Executes the New Offers Call Agent dynamically via AgentRegistry.
    """
    if not request.customer_name.strip() or not request.phone.strip():
        raise HTTPException(status_code=400, detail="Customer name and phone number are required.")

    agent = agent_registry.get_agent("new_offers")
    if not agent:
        raise HTTPException(status_code=500, detail="New Offers Call Agent is not registered.")

    agent_input = {
        "customer_name": request.customer_name.strip(),
        "phone": request.phone.strip(),
        "offer_title": request.offer_title or "Fiber 300Mbps Festive Discount",
        "discount_percent": request.discount_percent or 30,
        "special_price": request.special_price or "₹999/mo"
    }

    return agent.run(agent_input)

from fastapi import APIRouter, HTTPException, Response

@router.get("/feedback/export")
def export_feedback_csv():
    """Exports all feedback entries in CSV format"""
    entries = DataRepository.get_feedback_and_tickets()
    
    headers = ["ID", "Customer Name", "Phone", "Rating", "Sentiment", "Summary", "Feedback Text", "Category", "Created At"]
    csv_rows = [",".join(headers)]
    
    for item in entries:
        row = [
            f'"{item.get("id", "")}"',
            f'"{item.get("customer_name", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("phone", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("rating", "")}"',
            f'"{item.get("sentiment", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("summary", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("feedback_text", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("category", "").replace(chr(34), chr(34)+chr(34))}"',
            f'"{item.get("created_at", "")}"'
        ]
        csv_rows.append(",".join(row))
        
    csv_content = "\n".join(csv_rows)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=feedback_reviews.csv"}
    )


