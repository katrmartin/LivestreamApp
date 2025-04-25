import pytest
from unittest.mock import patch, MagicMock
from app.services import youtube_utils
import datetime

# Testing if Youtube API interactions are correct and reliable

@patch("app.services.youtube_utils.authenticate_youtube")
def test_create_broadcast_builds_correct_payload(mock_auth):
    """Test that create_broadcast returns the correct YouTube embed URL and ID when the API responds successfully."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    mock_youtube.liveBroadcasts.return_value.insert.return_value.execute.return_value = {
        "id": "abc123"
    }

    scheduled_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)

    broadcast_id, url = youtube_utils.create_broadcast(
        youtube=mock_youtube,
        title="Test Stream",
        scheduled_start=scheduled_time,
        description="Unit test"
    )

    assert broadcast_id == "abc123"
    assert "youtube.com/embed/abc123" in url


@patch("app.services.youtube_utils.authenticate_youtube")
def test_get_scheduled_broadcasts_returns_list(mock_auth):
    """Test that get_scheduled_broadcasts returns a list of broadcast dictionaries with the expected keys."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    mock_youtube.liveBroadcasts.return_value.list.return_value.execute.return_value = {
        "items": [
            {
                "id": "xyz456",
                "snippet": {
                    "title": "Scheduled Broadcast",
                    "description": "Test description",
                    "scheduledStartTime": "2025-04-30T18:00:00Z"
                },
                "status": {
                    "lifeCycleStatus": "ready"
                }
            }
        ]
    }

    broadcasts = youtube_utils.get_scheduled_broadcasts()
    assert isinstance(broadcasts, list)
    assert broadcasts[0]["id"] == "xyz456"
    assert broadcasts[0]["title"] == "Scheduled Broadcast"


@patch("app.services.youtube_utils.authenticate_youtube")
def test_schedule_broadcast_calls_create(mock_auth):
    """Test that schedule_broadcast calls create_broadcast and returns the expected values."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    with patch("app.services.youtube_utils.create_broadcast") as mock_create:
        mock_create.return_value = ("mock_id", "https://youtube.com/embed/mock_id")

        result = youtube_utils.schedule_broadcast(
            title="Scheduled from utility",
            month=4,
            day=30,
            time_str="18:00",
            description="desc"
        )

        assert result[0] == "mock_id"
        assert "youtube.com/embed/mock_id" in result[1]


@patch("app.services.youtube_utils.authenticate_youtube")
def test_update_broadcast_sends_correct_payload(mock_auth):
    """Test that update_broadcast correctly formats and sends an update request to YouTube."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    mock_youtube.liveBroadcasts.return_value.update.return_value.execute.return_value = {
        "id": "abc123",
        "snippet": {
            "title": "Updated Stream",
            "description": "Updated desc",
            "scheduledStartTime": "2025-04-30T18:00:00Z",
            "scheduledEndTime": "2025-04-30T21:00:00Z"
        }
    }

    dt = datetime.datetime(2025, 4, 30, 18, 0)
    result = youtube_utils.update_broadcast("abc123", "Updated Stream", dt)

    assert result["id"] == "abc123"
    assert result["title"] == "Updated Stream"


@patch("app.services.youtube_utils.authenticate_youtube")
def test_delete_broadcast_executes_delete(mock_auth):
    """Test that delete_broadcast sends a delete request and returns True if successful."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    mock_youtube.liveBroadcasts.return_value.delete.return_value.execute.return_value = None

    result = youtube_utils.delete_broadcast("delete123")
    assert result is True


@patch("app.services.youtube_utils.authenticate_youtube")
def test_get_current_broadcast_returns_active(mock_auth):
    """Test that get_current_broadcast returns a broadcast when one is active."""
    mock_youtube = MagicMock()
    mock_auth.return_value = mock_youtube

    mock_youtube.liveBroadcasts.return_value.list.return_value.execute.side_effect = [
        {
            "items": [
                {
                    "id": "live1",
                    "snippet": {"title": "Live Now"},
                    "status": {"lifeCycleStatus": "live"}
                }
            ]
        }
    ]

    result = youtube_utils.get_current_broadcast()
    assert result["id"] == "live1"
    assert result["status"] == "live"
