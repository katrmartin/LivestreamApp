import pytest

# Testing if the user-facing API is behaving correctly

def test_create_broadcast(client, mock_supabase, mock_youtube):
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{"id": "mock_id"}]

    response = client.post("/broadcast", json={
        "title": "Game vs Rivals",
        "month": 4,
        "day": 30,
        "time": "18:00",
        "description": "Test broadcast",
        "opponent": "Rivals",
        "team_color": "#123456",
        "location": "Home Field"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "mock_id"
    assert data["title"] == "Game vs Rivals"


def test_update_broadcast(client, mock_supabase, mock_youtube):
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{
        "id": "mock_id",
        "title": "Updated Title",
        "description": "Updated description",
        "date": "2025-04-25",
        "time": "18:00",
        "url": "https://youtube.com/embed/mock_id",
        "opponent": "New Opponent",
        "team_color": "#654321",
        "location": "Updated Field"
    }]

    response = client.put("/broadcast/mock_id", json={
        "title": "Updated Title",
        "month": 4,
        "day": 25,
        "time": "18:00",
        "description": "Updated description",
        "opponent": "New Opponent",
        "team_color": "#654321",
        "location": "Updated Field"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["opponent"] == "New Opponent"


def test_delete_broadcast(client, mock_supabase, mock_youtube):
    response = client.delete("/broadcast/mock_id")
    assert response.status_code == 200
    assert response.json()["message"] == "Broadcast deleted successfully."


def test_list_broadcasts(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.execute.return_value.data = [
        {
            "id": "mock_id",
            "title": "Game vs Rivals",
            "description": "Test broadcast",
            "date": "2025-04-30",
            "time": "18:00:00",
            "url": "https://youtube.com/embed/mock_id",
            "opponent": "Rivals",
            "team_color": "#123456",
            "location": "Home Field"
        }
    ]

    response = client.get("/broadcasts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["title"] == "Game vs Rivals"


def test_get_live_url(client, mock_youtube):
    with pytest.MonkeyPatch.context() as mp:
        # Patch the function that fetches the live URL
        from app.routers import broadcasts
        mp.setattr(broadcasts, "get_current_broadcast", lambda: {
            "id": "live_id",
            "title": "Live Match",
            "url": "https://youtube.com/embed/live_id",
            "status": "active"
        })

        response = client.get("/live_url")
        assert response.status_code == 200
        assert "youtube.com/embed/live_id" in response.text

def test_create_broadcast_invalid_time(client):
    bad_data = {
        "title": "Broken Match",
        "month": 4,
        "day": 30,
        "time": "18",  # Invalid format (should be HH:MM)
        "description": "This should fail",
        "opponent": "Nobody",
        "team_color": "#000000",
        "location": "Nowhere"
    }

    response = client.post("/broadcast", json=bad_data)
    assert response.status_code == 422

def test_create_broadcast_supabase_failure(client, mock_supabase, mock_youtube):
    # YouTube succeeds
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = None

    response = client.post("/broadcast", json={
        "title": "Fail Supabase",
        "month": 4,
        "day": 30,
        "time": "18:00",
        "description": "Should fail Supabase insert",
        "opponent": "Testers",
        "team_color": "#FF0000",
        "location": "Failtown"
    })

    assert response.status_code == 500
    assert "Supabase insert failed" in response.text

def test_update_broadcast_invalid_time(client):
    response = client.put("/broadcast/mock_id", json={
        "title": "Bad Time Update",
        "month": 4,
        "day": 30,
        "time": "65:00",  # Invalid hour
        "description": "Invalid time",
        "opponent": "Not Reals",
        "team_color": "#333333",
        "location": "Somewhere"
    })

    assert response.status_code == 400 or response.status_code == 500
    assert "Invalid time format" in response.text or "Error updating broadcast" in response.text

def test_delete_broadcast_youtube_failure(client, mock_supabase, mock_youtube):
    mock_youtube["delete"].return_value = False  # Simulate failure

    response = client.delete("/broadcast/mock_id")
    assert response.status_code == 500
    assert "Failed to delete broadcast" in response.text
