from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db_manager
from app.routers.request import router as request_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes MongoDB connection on startup and closes it on shutdown.
    """
    print(f"🚀 Starting {settings.APP_NAME} on port {settings.PORT}...")
    await db_manager.connect()
    yield
    print(f"🛑 Shutting down {settings.APP_NAME}...")
    await db_manager.close()


app = FastAPI(
    title=settings.APP_NAME,
    description="Microservice responsible for managing request tickets and status approvals",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(request_router)


@app.get("/health", tags=["Health Check"])
async def health_check():
    """
    Health check endpoint for service monitoring.
    """
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "port": settings.PORT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
