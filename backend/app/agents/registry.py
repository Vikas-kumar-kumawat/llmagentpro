from typing import Dict, List, Optional
from app.agents.base_agent import BaseAgent

class AgentRegistry:
    """
    Central Agent Registry Engine for BCT Fibernet Multi-Agent Platform.
    Allows dynamic registration, discovery, and execution of AI agents.
    """
    _registry: Dict[str, BaseAgent] = {}

    @classmethod
    def register(cls, agent: BaseAgent):
        cls._registry[agent.id] = agent
        print(f"[AgentRegistry] Registered AI Agent: {agent.name} (id: '{agent.id}')")

    @classmethod
    def get_agent(cls, agent_id: str) -> Optional[BaseAgent]:
        return cls._registry.get(agent_id)

    @classmethod
    def list_agents(cls) -> List[dict]:
        return [
            {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "framework": agent.framework
            }
            for agent in cls._registry.values()
        ]

agent_registry = AgentRegistry
