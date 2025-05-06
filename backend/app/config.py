import os
from dotenv import load_dotenv

load_dotenv()  # Load .env values into os.environ

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")
    YT_CLIENT_SECRETS_PATH = os.getenv("YT_CLIENT_SECRETS_PATH", "client_secrets.json")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://musical-bombolone-72e781.netlify.app/login")

settings = Settings()
