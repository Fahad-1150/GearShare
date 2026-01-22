from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    UserName_PK: str
    Email: str
    Role: str
    Location: Optional[str] = None
    VerificationStatus: bool
    CreatedAt: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class EquipmentCreate(BaseModel):
    name: str
    category: str
    daily_price: float
    photo_url: Optional[str] = None
    pickup_location: Optional[str] = None


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    daily_price: Optional[float] = None
    photo_url: Optional[str] = None
    pickup_location: Optional[str] = None
    status: Optional[str] = None
    booked_till: Optional[date] = None


class EquipmentResponse(BaseModel):
    equipment_id: int
    name: str
    category: str
    daily_price: float
    photo_url: Optional[str] = None
    photo_binary: Optional[str] = None
    owner_username: str
    pickup_location: Optional[str] = None
    status: str
    booked_till: Optional[date] = None
    rating_avg: float
    rating_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    report_type: str
    subject: str
    description: Optional[str] = None
    equipment_id: Optional[int] = None
    reservation_id: Optional[int] = None
    priority: Optional[str] = "medium"


class ReportUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: int
    reporter_username: str
    report_type: str
    subject: str
    description: Optional[str] = None
    equipment_id: Optional[int] = None
    reservation_id: Optional[int] = None
    status: str
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReservationCreate(BaseModel):
    equipment_id: int
    start_date: date
    end_date: date


class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    review_id: Optional[int] = None


class ReservationResponse(BaseModel):
    reservation_id: int
    equipment_id: int
    owner_username: str
    reserver_username: str
    status: str
    start_date: date
    end_date: date
    per_day_price: float
    total_price: float
    review_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True