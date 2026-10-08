from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.request import PyObjectId, RequestStatus, RequestType, RequestUrgency


class RequestModel(BaseModel):
    """
    Domain Model representing a Request Ticket document as stored in MongoDB.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    description: str
    type: RequestType
    urgency: RequestUrgency
    status: RequestStatus = RequestStatus.PENDING
    requester_email: EmailStr
    superior_email: EmailStr
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
