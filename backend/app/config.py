from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "TeeTime Tracker"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/teetimes")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    # Golf Course Booking
    GOLF_COURSE_LOGIN_URL: str = os.getenv("GOLF_COURSE_LOGIN_URL", "")
    GOLF_COURSE_USERNAME: str = os.getenv("GOLF_COURSE_USERNAME", "")
    GOLF_COURSE_PASSWORD: str = os.getenv("GOLF_COURSE_PASSWORD", "")
    
    class Config:
        case_sensitive = True

settings = Settings() 