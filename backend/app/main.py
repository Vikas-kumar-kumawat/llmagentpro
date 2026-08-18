from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db
from app.agents.registry import agent_registry
from app.agents.feedback_collector.graph import FeedbackCollectorAgent
from app.agents.recharge_reminder import RechargeReminderAgent
from app.agents.new_offers import NewOffersCallAgent
from app.api.v1.router import api_router

def create_application() -> FastAPI:
    # Initialize DB Tables
    init_db()

    # Register Agents in Central Agent Registry
    agent_registry.register(FeedbackCollectorAgent())
    agent_registry.register(RechargeReminderAgent())
    agent_registry.register(NewOffersCallAgent())

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Enterprise Multi-Agent Platform powered by FastAPI, LangGraph, and Twilio Voice"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include Versioned API v1 Router (/api/v1)
    app.include_router(api_router)

    # Backward compatibility router prefix (/api)
    app.include_router(api_router, prefix="/api")

    @app.get("/")
    def read_root():
        return {
            "service": settings.PROJECT_NAME,
            "status": "online",
            "version": settings.VERSION,
            "twilio_configured": settings.is_twilio_configured(),
            "active_agents": agent_registry.list_agents()
        }

    @app.get("/api/hello")
    def hello_world():
        return {"message": "Hello World from BCT AI Support Multi-Agent Platform!"}

    return app

app = create_application()
