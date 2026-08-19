from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.twilio_service import TwilioService
from app.db.repositories.data_repository import DataRepository

class NewOffersCallAgent(BaseAgent):
    @property
    def id(self) -> str:
        return "new_offers"

    @property
    def name(self) -> str:
        return "New Offers Call Agent"

    @property
    def description(self) -> str:
        return "Targeted promotional AI voice marketing calls broadcasting exclusive fiber speed upgrades and discount offers."

    @property
    def framework(self) -> str:
        return "Twilio Voice + LangGraph"

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        customer_name = inputs.get("customer_name", "Valued Customer")
        phone = inputs.get("phone", "")
        offer_title = inputs.get("offer_title", "Fiber 300Mbps Festive Upgrade")
        discount_percent = inputs.get("discount_percent", 30)
        special_price = inputs.get("special_price", "₹999/mo")

        # Save contact
        DataRepository.add_contact(customer_name, phone)

        # Generate custom offer greeting script
        speech_script = (
            f"Hello {customer_name}, great news from BFibernet! "
            f"You are eligible for an exclusive offer: {offer_title} with {discount_percent}% discount "
            f"at a special price of {special_price}. Press 1 to activate this upgrade right now."
        )

        call_result = TwilioService.make_call(phone, speech_script)

        # Save call log
        DataRepository.add_call_log(
            name=customer_name,
            phone=phone,
            call_sid=call_result.get("call_sid", "N/A"),
            status=call_result.get("status", "initiated"),
            details=call_result.get("message", f"Promotional offer call '{offer_title}' placed to {customer_name}")
        )

        return {
            "success": call_result.get("success", False),
            "agent": self.name,
            "call_sid": call_result.get("call_sid"),
            "status": call_result.get("status", "completed"),
            "message": f"Promotional offer call '{offer_title}' placed to {customer_name} ({phone}).",
            "trace_messages": [
                f"[Step 1] Target customer {customer_name} ({phone}) matched with promotion '{offer_title}'.",
                f"[Step 2] Speech script synthesized: '{speech_script}'",
                f"[Step 3] Twilio Promotional Voice Call SID: {call_result.get('call_sid', 'MOCK_SID')}"
            ]
        }
