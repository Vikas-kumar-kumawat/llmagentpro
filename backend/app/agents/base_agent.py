from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    """
    Abstract Base Class for Multi-Agent Architecture in BCT AI Platform.
    Every agent (Feedback, Billing, Outage, etc.) implements this interface.
    """
    
    @property
    @abstractmethod
    def id(self) -> str:
        """Unique identifier for the agent (e.g. 'feedback_collector')"""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Display name of the AI Agent"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Description of agent capabilities"""
        pass

    @property
    @abstractmethod
    def framework(self) -> str:
        """Framework used (e.g. 'LangGraph StateGraph')"""
        pass

    @abstractmethod
    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Executes the agent workflow and returns final state/result"""
        pass
