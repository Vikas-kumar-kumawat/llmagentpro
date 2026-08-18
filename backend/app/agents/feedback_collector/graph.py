from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.agents.feedback_collector.state import FeedbackState
from app.agents.feedback_collector.nodes import (
    ingest_feedback_node,
    analyze_sentiment_node,
    decide_followup_node,
    save_feedback_node
)

# LangGraph Compilation
try:
    from langgraph.graph import StateGraph, END

    def build_feedback_graph():
        workflow = StateGraph(FeedbackState)
        workflow.add_node("ingest", ingest_feedback_node)
        workflow.add_node("analyze", analyze_sentiment_node)
        workflow.add_node("decide", decide_followup_node)
        workflow.add_node("save", save_feedback_node)

        workflow.set_entry_point("ingest")
        workflow.add_edge("ingest", "analyze")
        workflow.add_edge("analyze", "decide")
        workflow.add_edge("decide", "save")
        workflow.add_edge("save", END)

        return workflow.compile()

    _compiled_graph = build_feedback_graph()
except Exception as e:
    print(f"[LangGraph Notice] Compiling graph with sequential fallback: {e}")
    _compiled_graph = None


class FeedbackCollectorAgent(BaseAgent):
    """
    Customer Feedback Collector Agent built using LangGraph & LangChain.
    """

    @property
    def id(self) -> str:
        return "feedback_collector"

    @property
    def name(self) -> str:
        return "Customer Feedback Collector Agent (LangGraph)"

    @property
    def description(self) -> str:
        return "Ingests customer feedback, performs sentiment analysis & categorization using LangChain, and auto-generates support tickets for negative ratings."

    @property
    def framework(self) -> str:
        return "LangGraph (StateGraph) + LangChain"

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        initial_state: FeedbackState = {
            "customer_name": inputs.get("customer_name", "Anonymous"),
            "phone": inputs.get("phone", ""),
            "rating": int(inputs.get("rating", 5)),
            "feedback_text": inputs.get("feedback_text", ""),
            "sentiment": None,
            "category": None,
            "summary": None,
            "followup_needed": None,
            "ticket_id": None,
            "feedback_id": None,
            "status": "in_progress",
            "messages": []
        }

        if _compiled_graph:
            return _compiled_graph.invoke(initial_state)
        else:
            s1 = ingest_feedback_node(initial_state)
            s2 = analyze_sentiment_node(s1)
            s3 = decide_followup_node(s2)
            s4 = save_feedback_node(s3)
            return s4
