import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

    @app.on_event("startup")
    def startup_event():
        # Start Cloudflare Tunnel only if running locally and BASE_URL is not set
        if not os.getenv("RENDER") and not os.getenv("RENDER_EXTERNAL_URL"):
            try:
                from app.services.tunnel_service import start_cloudflare_tunnel
                start_cloudflare_tunnel(port=int(os.getenv("PORT", 8000)))
            except Exception as e:
                print(f"[Startup Warning] Could not start Cloudflare Tunnel: {e}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include Versioned API v1 Router (/api/v1 and /api)
    app.include_router(api_router)
    app.include_router(api_router, prefix="/api")

    @app.get("/api/health")
    def health_check():
        return {
            "service": settings.PROJECT_NAME,
            "status": "online",
            "version": settings.VERSION,
            "twilio_configured": settings.is_twilio_configured(),
            "base_url": settings.base_url,
            "active_agents": agent_registry.list_agents()
        }

    # Mount Frontend Static Files if frontend/dist exists (Render / Production single deployment)
    app_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(app_dir))
    frontend_dist = os.path.join(project_root, "frontend", "dist")

    if os.path.exists(frontend_dist):
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}")
        async def serve_spa(request: Request, full_path: str):
            if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
                return None
            target_file = os.path.join(frontend_dist, full_path)
            if os.path.exists(target_file) and os.path.isfile(target_file):
                return FileResponse(target_file)
            return FileResponse(os.path.join(frontend_dist, "index.html"))
    else:
        @app.get("/")
        def read_root():
            return {
                "service": settings.PROJECT_NAME,
                "status": "online",
                "version": settings.VERSION,
                "twilio_configured": settings.is_twilio_configured(),
                "active_agents": agent_registry.list_agents()
            }

    return app

app = create_application()
