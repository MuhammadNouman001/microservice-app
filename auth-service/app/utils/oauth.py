from typing import Optional
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests
from app.config import settings


# 1. Google ID Token Verifier
def verify_google_id_token(id_token_str: str) -> Optional[dict]:
    try:
        # Request transport to fetch Google's public keys
        request = requests.Request()
        
        # Verify the token against Google's OAuth servers
        id_info = id_token.verify_oauth2_token(
            id_token_str,
            request,
            audience=settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        )

        return {
            "email": id_info.get("email"),
            "full_name": id_info.get("name"),
            "profile_picture": id_info.get("picture"),
        }
    except Exception:
        return None


# 2. GitHub Code Exchanger
async def exchange_github_code(code: str) -> Optional[dict]:
    try:
        async with httpx.AsyncClient() as client:
            # Step A: Exchange code for GitHub access token
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
            )
            token_data = token_response.json()
            access_token = token_data.get("access_token")

            if not access_token:
                return None

            # Step B: Fetch user profile
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_response.json()

            # Step C: Fetch primary email (if email is private on user profile)
            email = user_data.get("email")
            if not email:
                email_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                emails = email_response.json()
                primary_email = next((e["email"] for e in emails if e.get("primary")), None)
                email = primary_email or (emails[0]["email"] if emails else None)

            if not email:
                return None

            return {
                "email": email,
                "full_name": user_data.get("name") or user_data.get("login"),
                "profile_picture": user_data.get("avatar_url"),
            }
    except Exception:
        return None
