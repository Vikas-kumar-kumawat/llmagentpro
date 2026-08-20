from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    clean_user = request.username.strip().lower()
    clean_pass = request.password.strip()

    if (clean_user == "vikas" and clean_pass == "7014") or \
       (clean_user == "admin" and clean_pass in ["admin", "7014", "123456"]):
        return {
            "success": True,
            "message": "Authentication successful",
            "user": {
                "username": request.username.strip(),
                "role": "admin"
            },
            "token": "bfibernet_admin_token_active"
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Admin Name or Password. Default: vikas / 7014 or admin / admin"
    )
