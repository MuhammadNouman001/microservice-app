from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "request-service"
    PORT: int = 8003
    DEBUG: bool = True

    # MongoDB Settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "request_db"

    # JWT / Security (Matches auth-service key to verify incoming Bearer tokens)
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    # Microservice Communication
    NOTIFICATION_SERVICE_URL: str = "http://localhost:8002"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
