# youtube_utils.py

import os
import json
import time
import random
import datetime
from fastapi import HTTPException
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.helpers.time_utils import build_scheduled_start_utc
from app.config import settings

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

'''
def authenticate_youtube():
    """Authenticate and return the YouTube API client."""
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(settings.YT_CLIENT_SECRETS_PATH, SCOPES)
        creds = flow.run_local_server(port=5000, access_type='offline', prompt='consent')
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return build("youtube", "v3", credentials=creds)
'''

def ensure_client_secrets_file():
    if not os.path.exists("client_secrets.json"):
        secrets = os.getenv("GOOGLE_CLIENT_SECRETS")
        if not secrets:
            raise RuntimeError("Missing GOOGLE_CLIENT_SECRETS environment variable.")
        with open("client_secrets.json", "w") as f:
            f.write(secrets)

def get_youtube_auth_url():
    ensure_client_secrets_file()
    flow = Flow.from_client_secrets_file(
        settings.GOOGLE_CLIENT_SECRETS,
        scopes=SCOPES,
        redirect_uri=settings.YT_REDIRECT_URI
    )
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return auth_url

def handle_youtube_callback(full_url: str) -> Credentials:
    flow = Flow.from_client_secrets_file(
        settings.GOOGLE_CLIENT_SECRETS,
        scopes=SCOPES,
        redirect_uri=settings.YT_REDIRECT_URI
    )
    flow.fetch_token(authorization_response=full_url)
    creds = flow.credentials
    with open("token.json", "w") as token_file:
        token_file.write(creds.to_json())
    return creds

def get_youtube_client():
    if not os.path.exists("token.json"):
        raise FileNotFoundError("YouTube token not found. Please authenticate.")
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    return build("youtube", "v3", credentials=creds)

def create_broadcast(youtube, title, scheduled_start, description="", max_retries=5):
    """Create a new YouTube live broadcast."""
    start_time = scheduled_start.isoformat() + "Z"
    end_time = (scheduled_start + datetime.timedelta(hours=3)).isoformat() + "Z"

    retries = 0
    while retries < max_retries:
        try:
            request = youtube.liveBroadcasts().insert(
                part="snippet,status,contentDetails",
                body={
                    "snippet": {
                        "title": title,
                        "description": description,
                        "scheduledStartTime": start_time,
                        "scheduledEndTime": end_time
                    },
                    "status": {
                        "privacyStatus": "public",
                        "selfDeclaredMadeForKids": False
                    },
                    "contentDetails": {
                        "enableAutoStart": False,
                        "enableAutoStop": True
                    }
                }
            )
            response = request.execute()
            broadcast_id = response["id"]
            youtube_url = f"https://www.youtube.com/embed/{broadcast_id}"

            # Save URL if stream starts soon
            now = datetime.datetime.utcnow()
            if abs((scheduled_start - now).total_seconds()) < 300:
                with open("live_url.txt", "w") as file:
                    file.write(youtube_url)

            return broadcast_id, youtube_url
        except HttpError as e:
            if "503" in str(e):
                wait_time = random.randint(5, 15)
                time.sleep(wait_time)
                #retries += 1
            else:
                raise HTTPException(status_code=500, detail=f"YouTube API error: {e}")
    raise HTTPException(status_code=500, detail="Unable to schedule broadcast after retries.")


def schedule_broadcast(title: str, month: int, day: int, time_str: str, description: str = ""):
    youtube = get_youtube_client()
    scheduled_start = build_scheduled_start_utc(month, day, time_str)
    return create_broadcast(youtube, title, scheduled_start, description)


def get_scheduled_broadcasts():
    """Fetch all scheduled (upcoming) YouTube broadcasts."""
    try:
        youtube = get_youtube_client()
        request = youtube.liveBroadcasts().list(
            part="snippet,contentDetails,status",
            broadcastStatus="upcoming",
            maxResults=50
        )
        response = request.execute()

        broadcasts = []
        for item in response.get("items", []):
            start_time = datetime.datetime.strptime(
                item["snippet"]["scheduledStartTime"], "%Y-%m-%dT%H:%M:%SZ"
            )
            broadcasts.append({
                "id": item["id"],
                "title": item["snippet"]["title"],
                "description": item["snippet"].get("description", ""),
                "url": f"https://www.youtube.com/embed/{item['id']}",
                "status": item["status"]["lifeCycleStatus"],
                "date": start_time.strftime("%Y-%m-%d"),
                "time": start_time.strftime("%H:%M")
            })
        return broadcasts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch broadcasts: {e}")


def update_broadcast(broadcast_id: str, title: str, scheduled_start: datetime.datetime):
    """Update an existing YouTube broadcast."""
    try:
        youtube = get_youtube_client()
        start_time = scheduled_start.isoformat() + "Z"
        end_time = (scheduled_start + datetime.timedelta(hours=3)).isoformat() + "Z"

        request = youtube.liveBroadcasts().update(
            part="snippet",
            body={
                "id": broadcast_id,
                "snippet": {
                    "title": title,
                    "scheduledStartTime": start_time,
                    "scheduledEndTime": end_time
                }
            }
        )
        response = request.execute()
        return {
            "id": response["id"],
            "title": response["snippet"]["title"],
            "description": response["snippet"].get("description", ""),
            "url": f"https://www.youtube.com/embed/{response['id']}",
            "date": scheduled_start.strftime("%Y-%m-%d"),
            "time": scheduled_start.strftime("%H:%M")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube update failed: {e}")


def delete_broadcast(broadcast_id: str):
    """Delete a broadcast from YouTube."""
    try:
        youtube = get_youtube_client()
        youtube.liveBroadcasts().delete(id=broadcast_id).execute()
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete broadcast: {e}")


def get_current_broadcast():
    """Return the currently active or next starting broadcast."""
    try:
        youtube = get_youtube_client()

        # Try active broadcast
        response = youtube.liveBroadcasts().list(
            part="snippet,contentDetails,status",
            broadcastStatus="active",
            maxResults=1
        ).execute()

        if response.get("items"):
            item = response["items"][0]
            url = f"https://www.youtube.com/embed/{item['id']}"
            with open("live_url.txt", "w") as f:
                f.write(url)
            return {
                "id": item["id"],
                "title": item["snippet"]["title"],
                "url": url,
                "status": item["status"]["lifeCycleStatus"]
            }

        # Check for broadcast starting soon
        response = youtube.liveBroadcasts().list(
            part="snippet,contentDetails,status",
            broadcastStatus="upcoming",
            maxResults=1,
            orderBy="startTime"
        ).execute()

        if response.get("items"):
            item = response["items"][0]
            scheduled = datetime.datetime.strptime(
                item["snippet"]["scheduledStartTime"], "%Y-%m-%dT%H:%M:%SZ"
            )
            now = datetime.datetime.utcnow()
            if abs((scheduled - now).total_seconds()) < 300:
                url = f"https://www.youtube.com/embed/{item['id']}"
                with open("live_url.txt", "w") as f:
                    f.write(url)
                return {
                    "id": item["id"],
                    "title": item["snippet"]["title"],
                    "url": url,
                    "status": "starting_soon"
                }

        # Clear saved URL if nothing is live
        with open("live_url.txt", "w") as f:
            f.write("")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get live broadcast: {e}")
