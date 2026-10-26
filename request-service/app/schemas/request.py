from datetime import datetime
from enum import Enum
from typing import Annotated, Any, Optional
from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field


# Helper function to convert MongoDB BSON ObjectId to string for Pydantic v2
def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError("Invalid MongoDB ObjectId format")


# Custom PyObjectId type for Pydantic v2 model field conversion
PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


class RequestType(str, Enum):
    EQUIPMENT = "EQUIPMENT"
    LEAVE = "LEAVE"
    ACCESS = "ACCESS"
    BUDGET = "BUDGET"
    OTHER = "OTHER"


class RequestUrgency(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# Schema for payload sent when a user submits a new request
class RequestCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100, json_schema_extra={"example": "Request for new laptop"})
    description: str = Field(..., min_length=5, max_length=1000, json_schema_extra={"example": "Need M3 Pro for local dev work"})
    type: RequestType = Field(default=RequestType.EQUIPMENT)
    urgency: RequestUrgency = Field(default=RequestUrgency.MEDIUM)
    superior_email: EmailStr = Field(..., json_schema_extra={"example": "manager@example.com"})


# Schema for payload sent when a superior approves or rejects a request
class RequestStatusUpdate(BaseModel):
    status: RequestStatus = Field(..., json_schema_extra={"example": RequestStatus.APPROVED})
    comment: Optional[str] = Field(None, max_length=500, json_schema_extra={"example": "Approved budget for Q3"})


# Response schema returned by API endpoints
class RequestResponse(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    title: str
    description: str
    type: RequestType
    urgency: RequestUrgency
    status: RequestStatus
    requester_email: EmailStr
    superior_email: EmailStr
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )
