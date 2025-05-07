import os
from dotenv import load_dotenv

load_dotenv()  # Load .env values into os.environ

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")
    GOOGLE_CLIENT_SECRETS = os.getenv("GOOGLE_CLIENT_SECRETS", "client_secrets.json")
    YT_REDIRECT_URI = os.getenv("YT_REDIRECT_URI", "https://livestreamapptest-umwf.onrender.com/youtube/callback")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://musical-bombolone-72e781.netlify.app")

settings = Settings()