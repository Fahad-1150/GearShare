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
