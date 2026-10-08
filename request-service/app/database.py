from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from app.config import settings


class DatabaseManager:
    """
    Manages the asynchronous MongoDB connection lifecycle.
    """
    def __init__(self):
        self.client: AsyncMongoClient | None = None
        self.db: AsyncDatabase | None = None

    async def connect(self):
        """Initializes the AsyncMongoClient connection pool."""
        self.client = AsyncMongoClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        print(f" Connected to MongoDB at '{settings.MONGODB_URL}' (DB: '{settings.MONGODB_DB_NAME}')")

    async def close(self):
        """Closes the MongoDB connection pool cleanly."""
        if self.client:
            await self.client.close()
            print(" Connection to MongoDB closed cleanly.")


# Global singleton instance of DatabaseManager
db_manager = DatabaseManager()


def get_database() -> AsyncDatabase:
    """
    Dependency helper to retrieve the active MongoDB database instance.
    """
    if db_manager.db is None:
        raise RuntimeError("Database is not initialized. Ensure connect() has been called.")
    return db_manager.db
