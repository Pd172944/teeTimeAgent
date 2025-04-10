from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from .database import get_db
from . import models, schemas, crud
from .auth import get_current_user
from .routers import tee_times, users, courses, trades

app = FastAPI(
    title="TeeTime Tracker",
    description="A comprehensive golf tee time management system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tee_times.router, prefix="/api/tee-times", tags=["tee-times"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])

@app.get("/")
async def root():
    return {"message": "Welcome to TeeTime Tracker API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 