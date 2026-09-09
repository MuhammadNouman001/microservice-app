from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User
from app.schemas import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserOut,
)
from app.utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_google_id_token,
    exchange_github_code,
)


class AuthService:

    @staticmethod
    async def register_user(db: AsyncSession, data: UserRegister) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )

        hashed_pwd = hash_password(data.password)
        new_user = User(
            email=data.email,
            hashed_password=hashed_pwd,
            full_name=data.full_name,
            auth_provider="local"
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        token_payload = {"sub": str(new_user.id), "email": new_user.email}
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(new_user)
        )

    @staticmethod
    async def login_local_user(db: AsyncSession, data: UserLogin) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalars().first()

        if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        token_payload = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user)
        )

    @staticmethod
    async def login_google_user(db: AsyncSession, id_token_str: str) -> TokenResponse:
        google_data = verify_google_id_token(id_token_str)
        if not google_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google ID Token."
            )

        email = google_data["email"]
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user:
            user = User(
                email=email,
                full_name=google_data["full_name"],
                profile_picture=google_data["profile_picture"],
                auth_provider="google"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        token_payload = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user)
        )

    @staticmethod
    async def login_github_user(db: AsyncSession, code: str) -> TokenResponse:
        github_data = await exchange_github_code(code)
        if not github_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired GitHub OAuth code."
            )

        email = github_data["email"]
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user:
            user = User(
                email=email,
                full_name=github_data["full_name"],
                profile_picture=github_data["profile_picture"],
                auth_provider="github"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        token_payload = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user)
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> TokenResponse:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        # pyrefly: ignore [bad-argument-type]
        user_id = int(payload.get("sub"))
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User inactive or no longer exists."
            )

        token_payload = {"sub": str(user.id), "email": user.email}
        new_access_token = create_access_token(token_payload)
        new_refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user=UserOut.model_validate(user)
        )
