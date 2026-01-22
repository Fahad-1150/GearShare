from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_db
from .models import User
from .schemas import UserResponse

router = APIRouter()


# GET all users (admin only)
@router.get("/", response_model=list[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    """Get all users in the system"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


# GET user count
@router.get("/count")
async def get_user_count(db: AsyncSession = Depends(get_db)):
    """Get total count of users"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return {"count": len(users)}


# GET specific user by username
@router.get("/{username}", response_model=UserResponse)
async def get_user(username: str, db: AsyncSession = Depends(get_db)):
    """Get a specific user by username"""
    result = await db.execute(select(User).where(User.UserName_PK == username))
    user = result.scalar_one_or_none()
    return user
