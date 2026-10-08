from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase

from app.schemas.request import RequestCreate, RequestStatusUpdate
from app.utils.notifier import notify_request_created, notify_request_status_updated


class RequestService:
    def __init__(self, db: AsyncDatabase):
        self.collection = db["requests"]

    async def create_request(self, payload: RequestCreate, requester_email: str) -> dict:
        """
        Creates a new request ticket in MongoDB and notifies the superior email.
        """
        now = datetime.now(timezone.utc)
        doc = {
            "title": payload.title,
            "description": payload.description,
            "type": payload.type.value,
            "urgency": payload.urgency.value,
            "status": "PENDING",
            "requester_email": requester_email,
            "superior_email": payload.superior_email,
            "comment": None,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id

        # Trigger async notification to superior/manager (Non-blocking)
        await notify_request_created(
            request_id=str(result.inserted_id),
            title=doc["title"],
            description=doc["description"],
            type=doc["type"],
            urgency=doc["urgency"],
            requester_email=doc["requester_email"],
            superior_email=doc["superior_email"]
        )

        return doc

    async def get_my_requests(self, requester_email: str) -> list[dict]:
        """
        Retrieves all request tickets created by the specified user email.
        """
        cursor = self.collection.find({"requester_email": requester_email}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def get_pending_approvals(self, superior_email: str) -> list[dict]:
        """
        Retrieves all PENDING requests assigned to a superior email.
        """
        cursor = self.collection.find({
            "superior_email": superior_email,
            "status": "PENDING"
        }).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def update_request_status(
        self,
        request_id: str,
        payload: RequestStatusUpdate,
        superior_email: str
    ) -> dict:
        """
        Approves or Rejects a request ticket if the current user is the authorized superior.
        """
        if not ObjectId.is_valid(request_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request ID format"
            )

        obj_id = ObjectId(request_id)
        existing = await self.collection.find_one({"_id": obj_id})

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request ticket not found"
            )

        # Authorization check: Only the designated superior can update the status
        if existing["superior_email"] != superior_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to approve or reject this request"
            )

        now = datetime.now(timezone.utc)
        update_data = {
            "status": payload.status.value,
            "comment": payload.comment,
            "updated_at": now
        }

        updated_doc = await self.collection.find_one_and_update(
            {"_id": obj_id},
            {"$set": update_data},
            return_document=True
        )

        # Trigger notification to the requester regarding approval/rejection
        await notify_request_status_updated(
            request_id=request_id,
            title=updated_doc["title"],
            status=updated_doc["status"],
            requester_email=updated_doc["requester_email"],
            superior_email=updated_doc["superior_email"],
            comment=updated_doc.get("comment")
        )

        return updated_doc
