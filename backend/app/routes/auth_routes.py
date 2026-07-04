from fastapi import APIRouter, Depends
from app.models.schemas import UserRegister, UserLogin
from app.services.auth_service import register_user, authenticate_user, build_token_response
from app.utils.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(payload: UserRegister):
    user = register_user(payload.name, payload.email, payload.password, payload.role)
    return build_token_response(user)


@router.post("/login")
async def login(payload: UserLogin):
    user = authenticate_user(payload.email, payload.password)
    return build_token_response(user)


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
