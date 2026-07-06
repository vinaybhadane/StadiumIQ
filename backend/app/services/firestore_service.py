"""Firestore service for real-time data.

Lazy initialization — Firestore client created on first call only.
Graceful degradation when USE_FIRESTORE=false.
"""

import logging
from datetime import UTC, datetime
from typing import Any

import google.cloud.firestore as firestore

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: Any = None


class FirestoreUnavailableError(Exception):
    """Raised when Firestore is not available."""


def _get_client() -> Any:
    """Lazy-init the Firestore client."""
    global _client  # noqa: PLW0603
    if _client is None:
        settings = get_settings()
        if not settings.use_firestore:
            raise FirestoreUnavailableError("Firestore is disabled (USE_FIRESTORE=false)")

        _client = firestore.AsyncClient(
            project=settings.gcp_project_id,
            database=settings.firestore_database,
        )
    return _client


async def get_document(collection: str, document_id: str) -> dict[str, Any] | None:
    """Retrieve a single document from Firestore.

    Args:
        collection: Firestore collection name.
        document_id: Document ID.

    Returns:
        Document data as dict, or None if not found.

    Raises:
        FirestoreUnavailableError: If Firestore is disabled/unavailable.
    """
    try:
        client = _get_client()
        doc_ref = client.collection(collection).document(document_id)
        doc = await doc_ref.get()
        if doc.exists:
            result: dict[str, Any] = doc.to_dict()
            return result
        return None
    except FirestoreUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Firestore read failed: %s", exc)
        raise FirestoreUnavailableError(f"Firestore read failed: {exc}") from exc


async def set_document(collection: str, document_id: str, data: dict[str, Any]) -> None:
    """Write a document to Firestore.

    Args:
        collection: Firestore collection name.
        document_id: Document ID.
        data: Document data to write.

    Raises:
        FirestoreUnavailableError: If Firestore is disabled/unavailable.
    """
    try:
        client = _get_client()
        doc_ref = client.collection(collection).document(document_id)
        await doc_ref.set(data)
    except FirestoreUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Firestore write failed: %s", exc)
        raise FirestoreUnavailableError(f"Firestore write failed: {exc}") from exc


async def add_document(collection: str, data: dict[str, Any]) -> str:
    """Add a new document with auto-generated ID.

    Args:
        collection: Firestore collection name.
        data: Document data to write.

    Returns:
        The auto-generated document ID.

    Raises:
        FirestoreUnavailableError: If Firestore is disabled/unavailable.
    """
    try:
        client = _get_client()
        data["created_at"] = datetime.now(tz=UTC).isoformat()
        doc_ref = client.collection(collection).document()
        await doc_ref.set(data)
        return str(doc_ref.id)
    except FirestoreUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Firestore add failed: %s", exc)
        raise FirestoreUnavailableError(f"Firestore add failed: {exc}") from exc


async def query_collection(
    collection: str,
    field: str,
    operator: str,
    value: Any,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Query a Firestore collection with a filter.

    Args:
        collection: Firestore collection name.
        field: Field to filter on.
        operator: Comparison operator (==, >, <, etc.).
        value: Value to compare against.
        limit: Maximum documents to return.

    Returns:
        List of matching documents as dicts.

    Raises:
        FirestoreUnavailableError: If Firestore is disabled/unavailable.
    """
    try:
        client = _get_client()
        query = client.collection(collection).where(field, operator, value).limit(limit)
        docs = query.stream()
        results: list[dict[str, Any]] = []
        async for doc in docs:
            results.append(doc.to_dict())
        return results
    except FirestoreUnavailableError:
        raise
    except Exception as exc:
        logger.warning("Firestore query failed: %s", exc)
        raise FirestoreUnavailableError(f"Firestore query failed: {exc}") from exc
