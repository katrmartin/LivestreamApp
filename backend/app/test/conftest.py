# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app


@pytest.fixture(scope="module")
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    """Mock the Supabase client used in broadcast routes."""
    with patch("app.routers.broadcasts.supabase") as mock:
        mock_instance = MagicMock()
        mock.table.return_value = mock_instance
        yield mock


@pytest.fixture
def mock_youtube():
    """Mock YouTube API integration."""
    with patch("app.routers.broadcasts.schedule_broadcast") as mock_schedule, \
         patch("app.routers.broadcasts.youtube_update_broadcast") as mock_update, \
         patch("app.routers.broadcasts.youtube_delete_broadcast") as mock_delete:

        # Mock default return values
        mock_schedule.return_value = ("mock_id", "https://youtube.com/embed/mock_id")
        mock_update.return_value = {
            "id": "mock_id",
            "title": "Mock Title",
            "description": "",
            "url": "https://youtube.com/embed/mock_id",
            "date": "2025-04-25",
            "time": "18:00"
        }
        mock_delete.return_value = True

        yield {
            "schedule": mock_schedule,
            "update": mock_update,
            "delete": mock_delete
        }
