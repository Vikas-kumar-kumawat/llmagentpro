from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services.twilio_service import TwilioService
from app.db.repositories.data_repository import DataRepository

class RechargeReminderAgent(BaseAgent):
    @property
    def id(self) -> str:
        return "recharge_reminder"

    @property
    def name(self) -> str:
        return "Recharge Reminder Agent"

    @property
    def description(self) -> str:
        return "Automated AI voice calls & SMS notifications reminding broadband subscribers of upcoming plan expirations and one-click renewals."

    @property
    def framework(self) -> str:
        return "Twilio Voice + LangGraph"

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        customer_name = inputs.get("customer_name", "Customer")
        phone = inputs.get("phone", "")
        plan_name = inputs.get("plan_name", "Fiber 100Mbps Ultra")
        expiry_date = inputs.get("expiry_date", "Today")
        amount = inputs.get("amount", "₹799")

        # Save to contacts
        DataRepository.add_contact(customer_name, phone)

        # Generate custom greeting voice TwiML message
        speech_script = (
            f"Hello {customer_name}, this is BFibernet AI assistant calling. "
            f"Your broadband plan {plan_name} valued at {amount} is expiring {expiry_date}. "
            f"To recharge immediately with one click and avoid service disruption, please press 1."
        )

        call_result = TwilioService.make_call(phone, speech_script)

        # Save call log
        DataRepository.add_call_log(
            name=customer_name,
            phone=phone,
            call_sid=call_result.get("call_sid", "N/A"),
            status=call_result.get("status", "initiated"),
            details=call_result.get("message", f"Recharge reminder call dispatched to {customer_name}")
        )

        return {
            "success": call_result.get("success", False),
            "agent": self.name,
            "call_sid": call_result.get("call_sid"),
            "status": call_result.get("status", "completed"),
            "message": f"Recharge reminder call dispatched to {customer_name} ({phone}) for plan {plan_name}.",
            "trace_messages": [
                f"[Step 1] Customer {customer_name} ({phone}) identified with plan '{plan_name}' expiring {expiry_date}.",
                f"[Step 2] Speech script synthesized: '{speech_script}'",
                f"[Step 3] Twilio Outbound Voice Call SID: {call_result.get('call_sid', 'MOCK_SID')}"
            ]
        }
