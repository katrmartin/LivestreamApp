from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from typing import List
from datetime import date, time, datetime
from models.broadcast_models import BroadcastRequest, BroadcastResponse
from services.youtube_utils import (
    schedule_broadcast,
    get_scheduled_broadcasts,
    update_broadcast as youtube_update_broadcast,
    delete_broadcast as youtube_delete_broadcast,
    get_current_broadcast
)
from routers.auth import supabase

router = APIRouter()


def safe_parse_time_string(raw: str) -> str:
    """Ensure HH:MM format with padding and validate."""
    try:
        hour, minute = map(int, raw.strip().split(":"))
        return f"{hour:02d}:{minute:02d}"
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid time format. Expected 'HH:MM'")


@router.post("/broadcast", response_model=BroadcastResponse)
def create_broadcast(request: BroadcastRequest):
    try:
        padded_time = safe_parse_time_string(request.time)

        broadcast_id, youtube_url = schedule_broadcast(
            title=request.title,
            month=request.month,
            day=request.day,
            time_str=padded_time,
            description=request.description
        )

        if not broadcast_id:
            raise HTTPException(status_code=500, detail="Broadcast creation failed via YouTube API.")

        year = datetime.utcnow().year
        date_obj = date(year, request.month, request.day)

        # Pad time to ensure it's HH:MM:SS (if it's just HH:MM)
        time_parts = request.time.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1])
        second = int(time_parts[2]) if len(time_parts) > 2 else 0
        time_obj = time(hour, minute, second)


        supabase_response = supabase.table("broadcasts").insert({
            "id": broadcast_id,
            "title": request.title,
            "description": request.description,
            "date": date_obj.isoformat(),
            "time": time_obj.strftime("%H:%M:%S"),
            "url": youtube_url,
            "opponent": request.opponent,
            "team_color": request.team_color,
            "location": request.location
        }).execute()

        if not hasattr(supabase_response, "data") or not supabase_response.data:
            raise HTTPException(status_code=500, detail="Broadcast created on YouTube, but Supabase insert failed.")

        return BroadcastResponse(
            id=broadcast_id,
            title=request.title,
            description=request.description,
            date=date_obj.isoformat(),
            time=time_obj.strftime("%H:%M:%S"),
            url=youtube_url,
            opponent=request.opponent,
            team_color=request.team_color,
            location=request.location
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating broadcast: {e}")


@router.get("/broadcasts", response_model=List[BroadcastResponse])
def list_broadcasts():
    try:
        response = supabase.table("broadcasts").select("*").execute()

        # Return an empty list if no broadcasts exist — NOT an error
        if not hasattr(response, "data"):
            return []

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not retrieve broadcasts: {e}")


@router.put("/broadcast/{broadcast_id}", response_model=BroadcastResponse)
def update_broadcast(broadcast_id: str, request: BroadcastRequest):
    try:
        padded_time = safe_parse_time_string(request.time)

        year = datetime.utcnow().year
        scheduled_start = datetime(
            year=year,
            month=request.month,
            day=request.day,
            hour=int(padded_time.split(":")[0]),
            minute=int(padded_time.split(":")[1])
        )

        updated = youtube_update_broadcast(
            broadcast_id=broadcast_id,
            title=request.title,
            scheduled_start=scheduled_start
        )

        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update broadcast on YouTube.")

        date_obj = date(year, request.month, request.day)
        # Pad time to ensure it's HH:MM:SS (if it's just HH:MM)
        time_parts = request.time.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1])
        second = int(time_parts[2]) if len(time_parts) > 2 else 0
        time_obj = time(hour, minute, second)


        response = supabase.table("broadcasts").update({
            "title": request.title,
            "description": request.description,
            "date": date_obj.isoformat(),
            "time": time_obj.strftime("%H:%M:%S"),
            "opponent": request.opponent,
            "team_color": request.team_color,
            "location": request.location
        }).eq("id", broadcast_id).execute()

        if not hasattr(response, "data") or not response.data:
            raise HTTPException(status_code=500, detail="Supabase failed to update broadcast metadata.")

        updated_data = response.data[0]

        return BroadcastResponse(
            id=updated_data["id"],
            title=updated_data["title"],
            description=updated_data.get("description", ""),
            date=updated_data["date"],
            time=updated_data["time"],
            url=updated_data["url"],
            opponent=updated_data.get("opponent", ""),
            team_color=updated_data.get("team_color", "#610028"),
            location=updated_data.get("location", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating broadcast: {e}")


@router.delete("/broadcast/{broadcast_id}")
def delete_broadcast(broadcast_id: str):
    try:
        success = youtube_delete_broadcast(broadcast_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete broadcast from YouTube.")

        supabase.table("broadcasts").delete().eq("id", broadcast_id).execute()
        return {"message": "Broadcast deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting broadcast: {e}")


@router.get("/live_url", response_class=PlainTextResponse)
def get_live_url():
    try:
        current = get_current_broadcast()
        return current["url"] if current else "No livestream available."
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch the current livestream URL: {e}")
