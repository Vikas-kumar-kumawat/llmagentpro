from fastapi import APIRouter
from app.api.v1 import contacts, calls, agents, voices, customers, twilio, rag

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(contacts.router)
api_router.include_router(calls.router)
api_router.include_router(agents.router)
api_router.include_router(voices.router)
api_router.include_router(customers.router)
api_router.include_router(twilio.router)
api_router.include_router(rag.router)

