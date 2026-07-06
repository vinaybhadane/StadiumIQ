"""Pub/Sub messaging service.

Fire-and-forget pattern — publishing alerts and notifications should
NEVER raise exceptions or block the request lifecycle. All errors
are logged and swallowed.
"""

import json
import logging
from typing import Any

import google.cloud.pubsub_v1 as pubsub_v1

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_publisher: Any = None


def _get_publisher() -> Any | None:
    """Lazy-init the Pub/Sub publisher client. Returns None if disabled."""
    global _publisher  # noqa: PLW0603
    if _publisher is None:
        settings = get_settings()
        if not settings.use_pubsub:
            return None

        _publisher = pubsub_v1.PublisherClient()
    return _publisher


async def publish_alert(
    alert_type: str,
    message: dict[str, Any],
) -> None:
    """Publish a crowd/emergency alert to the alerts topic.

    This function NEVER raises. All exceptions are caught and logged.

    Args:
        alert_type: Type of alert (e.g., "surge_warning", "evacuation").
        message: Alert data payload.
    """
    try:
        publisher = _get_publisher()
        if publisher is None:
            logger.debug("Pub/Sub disabled, skipping alert: %s", alert_type)
            return

        settings = get_settings()
        topic_path = publisher.topic_path(
            settings.gcp_project_id,
            settings.pubsub_topic_alerts,
        )

        data = json.dumps({"alert_type": alert_type, **message}).encode("utf-8")
        publisher.publish(topic_path, data=data)
        logger.info("Published alert: %s", alert_type)

    except Exception as exc:
        # Fire-and-forget: NEVER raise from alert publishing
        logger.warning("Pub/Sub publish_alert failed (swallowed): %s", exc)


async def publish_schedule_change(
    change_type: str,
    match_data: dict[str, Any],
) -> None:
    """Publish a schedule change notification.

    This function NEVER raises. All exceptions are caught and logged.

    Args:
        change_type: Type of change (e.g., "reschedule", "cancellation").
        match_data: Match data associated with the change.
    """
    try:
        publisher = _get_publisher()
        if publisher is None:
            logger.debug("Pub/Sub disabled, skipping schedule change: %s", change_type)
            return

        settings = get_settings()
        topic_path = publisher.topic_path(
            settings.gcp_project_id,
            settings.pubsub_topic_schedule,
        )

        data = json.dumps({"change_type": change_type, **match_data}).encode("utf-8")
        publisher.publish(topic_path, data=data)
        logger.info("Published schedule change: %s", change_type)

    except Exception as exc:
        # Fire-and-forget: NEVER raise from schedule notifications
        logger.warning("Pub/Sub publish_schedule_change failed (swallowed): %s", exc)
