from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    handicap = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tee_times = relationship("TeeTime", back_populates="owner")
    trades_offered = relationship("Trade", back_populates="offered_by", foreign_keys="Trade.offered_by_id")
    trades_received = relationship("Trade", back_populates="offered_to", foreign_keys="Trade.offered_to_id")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    website = Column(String)
    booking_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tee_times = relationship("TeeTime", back_populates="course")

class TeeTimeStatus(enum.Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    CANCELLED = "cancelled"
    TRADED = "traded"

class TeeTime(Base):
    __tablename__ = "tee_times"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime)
    time = Column(String)
    number_of_players = Column(Integer)
    status = Column(Enum(TeeTimeStatus))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="tee_times")
    owner = relationship("User", back_populates="tee_times")
    trades = relationship("Trade", back_populates="tee_time")

class TradeStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    tee_time_id = Column(Integer, ForeignKey("tee_times.id"))
    offered_by_id = Column(Integer, ForeignKey("users.id"))
    offered_to_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(TradeStatus))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tee_time = relationship("TeeTime", back_populates="trades")
    offered_by = relationship("User", back_populates="trades_offered", foreign_keys=[offered_by_id])
    offered_to = relationship("User", back_populates="trades_received", foreign_keys=[offered_to_id]) 