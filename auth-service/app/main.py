from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth_router


# 1. Lifespan Manager (Database Table Creation on Startup)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables in PostgreSQL if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Dispose engine connection pool
    await engine.dispose()


# 2. Instantiate FastAPI App
app = FastAPI(
    title="Auth Microservice",
    description="SSO, OAuth, and Local Authentication Microservice",
    version="1.0.0",
    lifespan=lifespan,
)


# 3. Configure CORS (Allows Next.js frontend to talk to FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 4. Include API Routers
app.include_router(auth_router)


# 5. Root & Health Check Endpoints
@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
        "docs_url": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
