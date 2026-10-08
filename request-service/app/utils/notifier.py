import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


async def notify_request_created(
    request_id: str,
    title: str,
    description: str,
    type: str,
    urgency: str,
    requester_email: str,
    superior_email: str
):
    """
    Sends an async HTTP request to notification-service when a new request ticket is created.
    """
    url = f"{settings.NOTIFICATION_SERVICE_URL}/notify/request-created"
    payload = {
        "requestId": request_id,
        "title": title,
        "description": description,
        "type": type,
        "urgency": urgency,
        "requesterEmail": requester_email,
        "superiorEmail": superior_email,
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code in (200, 201):
                logger.info(f"Notification sent successfully for request {request_id}")
            else:
                logger.warning(f"Notification service returned status {response.status_code}: {response.text}")
    except Exception as exc:
        logger.error(f"Failed to communicate with notification-service: {exc}")


async def notify_request_status_updated(
    request_id: str,
    title: str,
    status: str,
    requester_email: str,
    superior_email: str,
    comment: str | None = None
):
    """
    Sends an async HTTP request to notification-service when a request status is updated (Approved/Rejected).
    """
    url = f"{settings.NOTIFICATION_SERVICE_URL}/notify/request-status"
    payload = {
        "requestId": request_id,
        "title": title,
        "status": status,
        "requesterEmail": requester_email,
        "superiorEmail": superior_email,
        "comment": comment or "",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code in (200, 201):
                logger.info(f"Status update notification sent for request {request_id}")
            else:
                logger.warning(f"Notification service returned status {response.status_code}: {response.text}")
    except Exception as exc:
        logger.error(f"Failed to communicate with notification-service: {exc}")
