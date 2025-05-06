from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import broadcasts
from app.ws.scoreboard import router as scoreboard_router
from app.ws.chat import router as chat_router
from app.config import settings

app = FastAPI()

app.include_router(chat_router)
app.include_router(scoreboard_router)
app.include_router(broadcasts.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],  # Or settings.FRONTEND_ORIGIN if you're using a config file
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
