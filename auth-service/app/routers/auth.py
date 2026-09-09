from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegister,
    UserLogin,
    GoogleAuthRequest,
    GithubAuthRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserOut,
)
from app.services.auth_service import AuthService
from app.utils import decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security_scheme = HTTPBearer()


# Helper dependency to get the current authenticated user from Authorization Header
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # pyrefly: ignore [bad-argument-type]
    user_id = int(payload.get("sub"))
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    return user


# --- Route Handlers ---

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    return await AuthService.register_user(db, data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await AuthService.login_local_user(db, data)


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.login_google_user(db, data.id_token)


@router.post("/github", response_model=TokenResponse)
async def github_login(data: GithubAuthRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.login_github_user(db, data.code)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService.refresh_tokens(db, data.refresh_token)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
