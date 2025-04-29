from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_websocket():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_json({"username": "tester", "message": "go nuggets"})
        data = websocket.receive_json()
        assert data == {"username": "tester", "message": "go nuggets"}

def test_chat_multiple_messages():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_json({"username": "tester1", "message": "yo"})
        response1 = websocket.receive_json()
        assert response1["message"] == "yo"

        websocket.send_json({"username": "tester2", "message": "yo again"})
        response2 = websocket.receive_json()
        assert response2["message"] == "yo again"


def test_chat_empty_message():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_json({"username": "tester", "message": ""})
        response = websocket.receive_json()
        assert response["message"] == ""


def test_chat_missing_username():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_json({"message": "ayo no username"})
        response = websocket.receive_json()
        assert "message" in response


def test_chat_broadcast_to_multiple_clients():
    with client.websocket_connect("/ws/chat") as websocket1:
        with client.websocket_connect("/ws/chat") as websocket2:
            websocket1.send_json({"username": "tester1", "message": "Hello everyone"})
            
            response1 = websocket1.receive_json()
            response2 = websocket2.receive_json()

            assert response1["message"] == "Hello everyone"
            assert response2["message"] == "Hello everyone"


