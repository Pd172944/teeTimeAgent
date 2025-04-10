from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        handicap=user.handicap
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_course(db: Session, course_id: int) -> Optional[models.Course]:
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_courses(db: Session, skip: int = 0, limit: int = 100) -> List[models.Course]:
    return db.query(models.Course).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate) -> models.Course:
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_tee_time(db: Session, tee_time_id: int) -> Optional[models.TeeTime]:
    return db.query(models.TeeTime).filter(models.TeeTime.id == tee_time_id).first()

def get_user_tee_times(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.TeeTime]:
    return (
        db.query(models.TeeTime)
        .filter(models.TeeTime.owner_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_tee_time(
    db: Session,
    tee_time: schemas.TeeTimeCreate,
    owner_id: int
) -> models.TeeTime:
    db_tee_time = models.TeeTime(**tee_time.dict(), owner_id=owner_id)
    db.add(db_tee_time)
    db.commit()
    db.refresh(db_tee_time)
    return db_tee_time

def update_tee_time(
    db: Session,
    tee_time_id: int,
    tee_time_update: schemas.TeeTimeCreate
) -> Optional[models.TeeTime]:
    db_tee_time = get_tee_time(db, tee_time_id)
    if db_tee_time:
        update_data = tee_time_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tee_time, key, value)
        db.commit()
        db.refresh(db_tee_time)
    return db_tee_time

def delete_tee_time(db: Session, tee_time_id: int) -> bool:
    db_tee_time = get_tee_time(db, tee_time_id)
    if db_tee_time:
        db.delete(db_tee_time)
        db.commit()
        return True
    return False

def get_trade(db: Session, trade_id: int) -> Optional[models.Trade]:
    return db.query(models.Trade).filter(models.Trade.id == trade_id).first()

def create_trade(
    db: Session,
    trade: schemas.TradeCreate,
    offered_by_id: int
) -> models.Trade:
    db_trade = models.Trade(**trade.dict(), offered_by_id=offered_by_id)
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade

def update_trade_status(
    db: Session,
    trade_id: int,
    status: models.TradeStatus
) -> Optional[models.Trade]:
    db_trade = get_trade(db, trade_id)
    if db_trade:
        db_trade.status = status
        db.commit()
        db.refresh(db_trade)
    return db_trade

def get_user_trades(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Trade]:
    return (
        db.query(models.Trade)
        .filter(
            (models.Trade.offered_by_id == user_id) |
            (models.Trade.offered_to_id == user_id)
        )
        .offset(skip)
        .limit(limit)
        .all()
    ) 