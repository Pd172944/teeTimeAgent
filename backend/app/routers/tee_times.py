from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from .. import models, schemas, crud
from ..database import get_db
from ..auth import get_current_active_user
from ..scraper import run_bot

router = APIRouter()

@router.post("/", response_model=schemas.TeeTime)
async def create_tee_time(
    tee_time: schemas.TeeTimeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a new tee time."""
    return crud.create_tee_time(db=db, tee_time=tee_time, owner_id=current_user.id)

@router.get("/", response_model=List[schemas.TeeTime])
async def read_tee_times(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all tee times for the current user."""
    return crud.get_user_tee_times(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{tee_time_id}", response_model=schemas.TeeTime)
async def read_tee_time(
    tee_time_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get a specific tee time by ID."""
    tee_time = crud.get_tee_time(db=db, tee_time_id=tee_time_id)
    if tee_time is None:
        raise HTTPException(status_code=404, detail="Tee time not found")
    if tee_time.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this tee time")
    return tee_time

@router.put("/{tee_time_id}", response_model=schemas.TeeTime)
async def update_tee_time(
    tee_time_id: int,
    tee_time_update: schemas.TeeTimeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a tee time."""
    tee_time = crud.get_tee_time(db=db, tee_time_id=tee_time_id)
    if tee_time is None:
        raise HTTPException(status_code=404, detail="Tee time not found")
    if tee_time.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this tee time")
    return crud.update_tee_time(db=db, tee_time_id=tee_time_id, tee_time_update=tee_time_update)

@router.delete("/{tee_time_id}")
async def delete_tee_time(
    tee_time_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a tee time."""
    tee_time = crud.get_tee_time(db=db, tee_time_id=tee_time_id)
    if tee_time is None:
        raise HTTPException(status_code=404, detail="Tee time not found")
    if tee_time.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this tee time")
    crud.delete_tee_time(db=db, tee_time_id=tee_time_id)
    return {"message": "Tee time deleted successfully"}

@router.post("/auto-book")
async def auto_book_tee_time(
    course_id: int,
    preferred_date: datetime,
    preferred_times: List[str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Attempt to automatically book a tee time."""
    course = crud.get_course(db=db, course_id=course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Run the booking bot
    success = run_bot()
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to book tee time automatically"
        )
    
    # Create a new tee time record
    tee_time = schemas.TeeTimeCreate(
        course_id=course_id,
        date=preferred_date,
        time=preferred_times[0],  # Use the first preferred time
        number_of_players=1,
        status=models.TeeTimeStatus.BOOKED
    )
    
    return crud.create_tee_time(db=db, tee_time=tee_time, owner_id=current_user.id)

@router.get("/available/{course_id}")
async def get_available_tee_times(
    course_id: int,
    date: datetime,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get available tee times for a specific course and date."""
    course = crud.get_course(db=db, course_id=course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # This would typically involve calling the course's booking system API
    # For now, we'll return a mock response
    available_times = [
        {"time": "7:00 AM", "available": True},
        {"time": "7:15 AM", "available": True},
        {"time": "7:30 AM", "available": False},
        {"time": "7:45 AM", "available": True},
    ]
    
    return available_times 