"""BigQuery analytics service.

Fire-and-forget pattern — logging analytics events should NEVER
raise exceptions or block the request lifecycle. All errors are
logged and swallowed.
"""

import logging
from datetime import UTC, datetime
from typing import Any

from google.cloud import bigquery
from google.cloud.bigquery import QueryJobConfig, ScalarQueryParameter

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: Any = None


def _get_client() -> Any | None:
    """Lazy-init the BigQuery client. Returns None if disabled."""
    global _client  # noqa: PLW0603
    if _client is None:
        settings = get_settings()
        if not settings.use_bigquery:
            return None

        _client = bigquery.Client(project=settings.gcp_project_id)
    return _client


async def log_event(
    event_type: str,
    stadium_id: str,
    data: dict[str, Any],
    match_id: str = "",
) -> None:
    """Log an analytics event to BigQuery (fire-and-forget).

    This function NEVER raises. All exceptions are caught and logged.

    Args:
        event_type: Type of event (e.g., "crowd_snapshot", "match_result").
        stadium_id: Associated stadium ID.
        data: Event data payload.
        match_id: Optional associated match ID.
    """
    try:
        client = _get_client()
        if client is None:
            logger.debug("BigQuery disabled, skipping event: %s", event_type)
            return

        settings = get_settings()
        table_id = f"{settings.gcp_project_id}.{settings.bigquery_dataset}.events"

        row = {
            "event_type": event_type,
            "stadium_id": stadium_id,
            "match_id": match_id,
            "timestamp": datetime.now(tz=UTC).isoformat(),
            "data": str(data),
        }

        errors = client.insert_rows_json(table_id, [row])
        if errors:
            logger.warning("BigQuery insert errors: %s", errors)

    except Exception as exc:
        # Fire-and-forget: NEVER raise from analytics
        logger.warning("BigQuery log_event failed (swallowed): %s", exc)


async def query_attendance_trends(
    stadium_id: str,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Query attendance trends from BigQuery.

    Returns empty list if BigQuery is unavailable.

    Args:
        stadium_id: Stadium to query trends for.
        limit: Maximum rows to return.

    Returns:
        List of attendance data rows.
    """
    try:
        client = _get_client()
        if client is None:
            return []

        settings = get_settings()
        query = f"""
            SELECT match_id, timestamp, data
            FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.events`
            WHERE stadium_id = @stadium_id
              AND event_type = 'attendance'
            ORDER BY timestamp DESC
            LIMIT @limit
        """

        job_config = None
        try:
            job_config = QueryJobConfig(
                query_parameters=[
                    ScalarQueryParameter("stadium_id", "STRING", stadium_id),
                    ScalarQueryParameter("limit", "INT64", limit),
                ]
            )
        except Exception:
            return []

        query_job = client.query(query, job_config=job_config)
        results: list[dict[str, Any]] = [dict(row) for row in query_job]
        return results

    except Exception as exc:
        logger.warning("BigQuery query failed (swallowed): %s", exc)
        return []
