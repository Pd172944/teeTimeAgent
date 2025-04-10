from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import TeeTimeStatus, TradeStatus

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    handicap: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class CourseBase(BaseModel):
    name: str
    location: str
    website: str
    booking_url: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TeeTimeBase(BaseModel):
    course_id: int
    date: datetime
    time: str
    number_of_players: int
    status: TeeTimeStatus

class TeeTimeCreate(TeeTimeBase):
    pass

class TeeTime(TeeTimeBase):
    id: int
    owner_id: int
    created_at: datetime
    course: Course

    class Config:
        from_attributes = True

class TradeBase(BaseModel):
    tee_time_id: int
    offered_to_id: int
    status: TradeStatus

class TradeCreate(TradeBase):
    pass

class Trade(TradeBase):
    id: int
    offered_by_id: int
    created_at: datetime
    updated_at: datetime
    tee_time: TeeTime

    class Config:
        from_attributes = True 