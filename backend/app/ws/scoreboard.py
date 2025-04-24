# ws/scoreboard.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import Body

router = APIRouter()

scoreboard = {
    "home": 0, 
    "away": 0,
    "home_name": "Home",
    "away_name": "Away"
    }
clients: list[WebSocket] = []

class ScoreUpdate(BaseModel):
    team: str
    points: int

@router.post("/score/update")
async def update_score(update: ScoreUpdate):
    if update.team not in scoreboard:
        return JSONResponse(status_code=400, content={"error": "Invalid team"})

    scoreboard[update.team] += update.points
    print(f"[UPDATE] {update.team} +{update.points} → {scoreboard}")

    for ws in clients:
        try:
            await ws.send_json(scoreboard)
        except Exception as e:
            print(f"[ERROR] Failed to notify client: {e}")

    return scoreboard

@router.websocket("/ws/score")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[WS] Client connected.")
    clients.append(websocket)

    try:
        await websocket.send_json(scoreboard)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print("[WS] Client disconnected.")
        clients.remove(websocket)

@router.post("/score/team_names")
async def update_team_names(
    home_name: str = Body(...),
    away_name: str = Body(...)
):
    scoreboard["home_name"] = home_name
    scoreboard["away_name"] = away_name

    # Notify all clients of new names
    for ws in clients:
        try:
            await ws.send_json(scoreboard)
        except Exception as e:
            print(f"[ERROR] Failed to notify client: {e}")

    return scoreboard