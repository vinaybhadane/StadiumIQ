"""Tests for BigQuery and PubSub services — verify they NEVER raise."""

import pytest

from app.services import bigquery_service, pubsub_service


@pytest.mark.asyncio()
async def test_bigquery_log_event_never_raises():
    """BigQuery log_event should never raise, even when disabled."""
    # Should not raise — service is disabled
    await bigquery_service.log_event(
        event_type="test_event",
        stadium_id="STD-001",
        data={"key": "value"},
    )


@pytest.mark.asyncio()
async def test_bigquery_log_event_with_match_id():
    """BigQuery log_event handles optional match_id."""
    await bigquery_service.log_event(
        event_type="test_event",
        stadium_id="STD-001",
        data={"key": "value"},
        match_id="M001",
    )


@pytest.mark.asyncio()
async def test_bigquery_query_returns_empty_when_disabled():
    """BigQuery query returns empty list when disabled."""
    result = await bigquery_service.query_attendance_trends("STD-001")
    assert result == []


@pytest.mark.asyncio()
async def test_pubsub_publish_alert_never_raises():
    """PubSub publish_alert should never raise, even when disabled."""
    await pubsub_service.publish_alert(
        alert_type="test_alert",
        message={"test": True},
    )


@pytest.mark.asyncio()
async def test_pubsub_publish_schedule_change_never_raises():
    """PubSub publish_schedule_change should never raise, even when disabled."""
    await pubsub_service.publish_schedule_change(
        change_type="test_change",
        match_data={"match_id": "M001"},
    )


@pytest.mark.asyncio()
async def test_bigquery_handles_exception_gracefully():
    """BigQuery swallows exceptions from the client."""
    import app.services.bigquery_service as bq_svc

    # Temporarily set a failing client
    original = bq_svc._client

    class FailingClient:
        def insert_rows_json(self, *args, **kwargs):
            raise RuntimeError("BQ down")

    bq_svc._client = FailingClient()

    try:
        # Should NOT raise
        await bigquery_service.log_event(
            event_type="test",
            stadium_id="STD-001",
            data={},
        )
    finally:
        bq_svc._client = original


@pytest.mark.asyncio()
async def test_pubsub_handles_exception_gracefully():
    """PubSub swallows exceptions from the publisher."""
    import app.services.pubsub_service as ps_svc

    original = ps_svc._publisher

    class FailingPublisher:
        def topic_path(self, *args):
            raise RuntimeError("PubSub down")

    ps_svc._publisher = FailingPublisher()

    try:
        # Should NOT raise
        await pubsub_service.publish_alert("test", {"msg": "test"})
    finally:
        ps_svc._publisher = original


@pytest.mark.asyncio()
async def test_firestore_disabled():
    """Firestore raises FirestoreUnavailableError when disabled."""
    from app.services import firestore_service
    from app.services.firestore_service import FirestoreUnavailableError

    with pytest.raises(FirestoreUnavailableError, match="disabled"):
        await firestore_service.get_document("col", "doc")

    with pytest.raises(FirestoreUnavailableError, match="disabled"):
        await firestore_service.set_document("col", "doc", {})

    with pytest.raises(FirestoreUnavailableError, match="disabled"):
        await firestore_service.add_document("col", {})

    with pytest.raises(FirestoreUnavailableError, match="disabled"):
        await firestore_service.query_collection("col", "f", "==", "v")


@pytest.mark.asyncio()
async def test_firestore_enabled_mocked():
    """Test firestore service methods when client is mocked/active."""
    from unittest.mock import AsyncMock, MagicMock

    import app.services.firestore_service as fs_svc

    # Setup mocks
    mock_client = MagicMock()
    mock_collection = MagicMock()
    mock_document = MagicMock()
    mock_doc_snapshot = MagicMock()

    # Configure async methods
    mock_doc_snapshot.exists = True
    mock_doc_snapshot.to_dict.return_value = {"hello": "world"}
    mock_document.get = AsyncMock(return_value=mock_doc_snapshot)
    mock_document.set = AsyncMock()
    mock_document.id = "mock-auto-id"

    mock_collection.document.return_value = mock_document

    # query mock stream
    mock_query = MagicMock()
    mock_query.limit.return_value = mock_query

    async def mock_stream():
        yield mock_doc_snapshot

    mock_query.stream.return_value = mock_stream()
    mock_collection.where.return_value = mock_query

    mock_client.collection.return_value = mock_collection

    # Temporarily set mocked client
    original_client = fs_svc._client
    fs_svc._client = mock_client

    try:
        # 1. get_document
        res_get = await fs_svc.get_document("test-col", "test-doc")
        assert res_get == {"hello": "world"}

        # 2. set_document
        await fs_svc.set_document("test-col", "test-doc", {"data": 123})
        mock_document.set.assert_called_with({"data": 123})

        # 3. add_document
        res_add = await fs_svc.add_document("test-col", {"foo": "bar"})
        assert res_add == "mock-auto-id"

        # 4. query_collection
        res_query = await fs_svc.query_collection("test-col", "status", "==", "open")
        assert len(res_query) == 1
        assert res_query[0] == {"hello": "world"}
    finally:
        fs_svc._client = original_client
