# ws/chat.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

chat_clients = []

@router.websocket("/ws/chat")
async def chat(websocket: WebSocket):
    await websocket.accept()
    chat_clients.append(websocket)
    print("[CHAT] Client connected")

    try:
        while True:
            data = await websocket.receive_json()
            print("[CHAT] Received:", data)
            for client in chat_clients:
                await client.send_json(data)
    except WebSocketDisconnect:
        chat_clients.remove(websocket)
        print("[CHAT] Client disconnected")
