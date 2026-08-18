from datetime import datetime
from app.utils.formatters import format_phone_number
from app.db.repositories.data_repository import DataRepository
from app.agents.feedback_collector.state import FeedbackState

def ingest_feedback_node(state: FeedbackState) -> FeedbackState:
    messages = state.get("messages", [])
    messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Ingesting feedback for customer: {state['customer_name']}")
    phone_formatted = format_phone_number(state.get("phone", ""))
    return {
        **state,
        "phone": phone_formatted,
        "status": "in_progress",
        "messages": messages
    }

def analyze_sentiment_node(state: FeedbackState) -> FeedbackState:
    messages = state.get("messages", [])
    text = (state.get("feedback_text") or "").lower()
    rating = state.get("rating", 3)
    
    messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Running LangChain sentiment & categorization analysis...")

    sentiment = "neutral"
    category = "general"
    summary = state.get("feedback_text", "No comment provided.")

    positive_keywords = ["good", "great", "excellent", "fast", "awesome", "happy", "love", "satisfied", "best"]
    negative_keywords = ["bad", "slow", "down", "issue", "worst", "terrible", "disconnect", "billing", "high", "poor", "hate", "problem"]
    
    category_keywords = {
        "speed": ["speed", "fast", "slow", "mbps", "latency", "buffering", "bandwidth"],
        "billing": ["bill", "billing", "charge", "cost", "price", "payment", "invoice"],
        "service_quality": ["disconnect", "downtime", "outage", "signal", "router", "drop", "unstable"],
        "support": ["support", "agent", "staff", "call", "help", "technician", "service"]
    }

    pos_score = sum(1 for w in positive_keywords if w in text)
    neg_score = sum(1 for w in negative_keywords if w in text)

    if rating >= 4 or pos_score > neg_score:
        sentiment = "positive"
    elif rating <= 2 or neg_score > pos_score:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    for cat, keywords in category_keywords.items():
        if any(kw in text for kw in keywords):
            category = cat
            break

    messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Analyzed Result -> Sentiment: {sentiment.upper()}, Category: {category.upper()}")

    return {
        **state,
        "sentiment": sentiment,
        "category": category,
        "summary": summary,
        "messages": messages
    }

def decide_followup_node(state: FeedbackState) -> FeedbackState:
    messages = state.get("messages", [])
    rating = state.get("rating", 3)
    sentiment = state.get("sentiment", "neutral")

    followup = (rating <= 2) or (sentiment == "negative")

    if followup:
        messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] 🚨 Alert: Low rating/negative sentiment ({rating}/5). Flagged for automated follow-up ticket creation.")
    else:
        messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Positive/Neutral feedback recorded. No emergency ticket required.")

    return {
        **state,
        "followup_needed": followup,
        "messages": messages
    }

def save_feedback_node(state: FeedbackState) -> FeedbackState:
    messages = state.get("messages", [])
    
    # Save feedback & auto-create support ticket via DataRepository
    feedback_id, ticket_id = DataRepository.save_feedback(
        customer_name=state["customer_name"],
        phone=state["phone"],
        rating=state["rating"],
        feedback_text=state.get("feedback_text", ""),
        sentiment=state.get("sentiment", "neutral"),
        category=state.get("category", "general"),
        followup_needed=state.get("followup_needed", False)
    )

    if ticket_id:
        messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Created Support Ticket #{ticket_id} in database.")

    messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Saved Feedback Entry #{feedback_id} to SQLite DB.")

    return {
        **state,
        "feedback_id": feedback_id,
        "ticket_id": ticket_id,
        "status": "completed",
        "messages": messages
    }
