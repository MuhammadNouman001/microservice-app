from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# 1. Input payload when signing up with email/password
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


# 2. Input payload when logging in with email/password
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 3. Input payload when logging in with Google
class GoogleAuthRequest(BaseModel):
    id_token: str


# 4. Input payload when logging in with GitHub
class GithubAuthRequest(BaseModel):
    code: str


# 5. Public User Response (Sent to frontend - notice password is NOT included!)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    auth_provider: str
    profile_picture: Optional[str] = None
    is_active: bool
    created_at: datetime

    # Allows Pydantic to read directly from SQLAlchemy User ORM models
    model_config = ConfigDict(from_attributes=True)


# 6. Response returned on successful authentication containing the JWT token
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

# 7. Request payload when asking for a new access token
class RefreshTokenRequest(BaseModel):
    refresh_token: str