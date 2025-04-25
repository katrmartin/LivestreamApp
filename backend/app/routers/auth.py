# auth.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.config import settings
import bcrypt
import os
from supabase import create_client
from app.services.auth_utils import create_access_token, verify_token


router = APIRouter()

url = settings.SUPABASE_URL
key = settings.SUPABASE_KEY
supabase = create_client(url, key)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.post("/register")
def register(user: UserCreate):
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    result = supabase.table("users").insert({
        "email": user.email,
        "password_hash": hashed_pw,
        "name": user.name
    }).execute()

    return {"message": "User registered", "id": result.data[0]["id"]}

@router.post("/login")
def login(user: UserLogin):
    result = supabase.table("users").select("*").eq("email", user.email).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    db_user = result.data[0]
    if not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "id": db_user["id"],
        "email": db_user["email"],
        "pay_status": db_user["pay_status"]
    })

    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_my_info(current_user: dict = Depends(get_current_user)):
    return current_user
