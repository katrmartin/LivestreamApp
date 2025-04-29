from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_update_score_and_websocket():
    with client.websocket_connect("/ws/score") as websocket:
        # update the score via POST
        response = client.post("/score/update", json={"team": "home", "points": 3})
        assert response.status_code == 200
        assert response.json()["home"] >= 3

        # receive updated score via websocket
        data = websocket.receive_json()
        assert "home" in data
        assert "away" in data

def test_update_team_names():
    response = client.post("/score/team_names", json={"home_name": "CMU", "away_name": "CSM"})
    assert response.status_code == 200
    data = response.json()
    assert data["home_name"] == "CMU"
    assert data["away_name"] == "CSM"

def test_update_score_invalid_team():
    response = client.post("/score/update", json={"team": "invalid_team", "points": 5})
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid team"

def test_update_score_invalid_team():
    response = client.post("/score/update", json={"team": "invalid_team", "points": 5})
    assert response.status_code == 400
    assert response.json()["error"] == "Invalid team"

def test_websocket_disconnect_gracefully():
    with client.websocket_connect("/ws/score") as websocket:
        websocket.close()

