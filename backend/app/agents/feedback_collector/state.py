from typing import TypedDict, Optional, List

class FeedbackState(TypedDict):
    """
    LangGraph State Schema for Customer Feedback Collector Agent.
    """
    customer_name: str
    phone: str
    rating: int  # 1 to 5
    feedback_text: str
    
    # Processed Fields
    sentiment: Optional[str]        # 'positive', 'neutral', 'negative'
    category: Optional[str]         # 'speed', 'billing', 'service_quality', 'support', 'general'
    summary: Optional[str]          # Short summary of feedback
    followup_needed: Optional[bool] # True if rating <= 2 or negative sentiment
    ticket_id: Optional[int]        # Created support ticket ID if followup needed
    feedback_id: Optional[int]      # Database feedback entry ID
    status: str                     # 'in_progress', 'completed', 'failed'
    messages: List[str]             # Traceability execution log messages
