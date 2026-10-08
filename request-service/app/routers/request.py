from __future__ import annotations
from fastapi import APIRouter, Depends, status
from pymongo.asynchronous.database import AsyncDatabase

from app.database import get_database
from app.schemas.request import RequestCreate, RequestResponse, RequestStatusUpdate
from app.services.request_service import RequestService
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/requests",
    tags=["Request Tickets"]
)


@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: RequestCreate,
    db: AsyncDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Submits a new request ticket for the logged-in user.
    """
    service = RequestService(db)
    requester_email = current_user["email"]
    return await service.create_request(payload, requester_email)


@router.get("/my-requests", response_model=list[RequestResponse])
async def get_my_requests(
    db: AsyncDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves all request tickets submitted by the logged-in user.
    """
    service = RequestService(db)
    requester_email = current_user["email"]
    return await service.get_my_requests(requester_email)


@router.get("/pending-approvals", response_model=list[RequestResponse])
async def get_pending_approvals(
    db: AsyncDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves all PENDING requests assigned to the logged-in user as a superior.
    """
    service = RequestService(db)
    superior_email = current_user["email"]
    return await service.get_pending_approvals(superior_email)


@router.patch("/{request_id}/status", response_model=RequestResponse)
async def update_request_status(
    request_id: str,
    payload: RequestStatusUpdate,
    db: AsyncDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Approves or Rejects a request ticket (Authorized superior only).
    """
    service = RequestService(db)
    superior_email = current_user["email"]
    return await service.update_request_status(request_id, payload, superior_email)
