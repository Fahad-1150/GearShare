from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from .database import get_db
from .models import User
from .schemas import UserRegister, UserLogin, Token
from .security import verify_password, create_access_token

router = APIRouter()

# REGISTER
@router.post("/signup")
async def signup(user: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(or_(User.Email == user.email, User.UserName_PK == user.username))
    )
    existing = result.scalars().first()

    if existing:
        raise HTTPException(status_code=400, detail="Username or Email already exists")

    new_user = User(
        UserName_PK=user.username,
        Email=user.email,
        Password=user.password,
        Location=user.location
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.UserName_PK,
        "role": new_user.Role
    })

    return {
        "message": "User registered successfully",
        "token": token,
        "user": {
            "UserName_PK": new_user.UserName_PK,
            "Email": new_user.Email,
            "Role": new_user.Role,
            "Location": new_user.Location,
            "CreatedAt": new_user.CreatedAt.isoformat() if new_user.CreatedAt else None
        }
    }

# LOGIN
@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.Email == user.email)
    )
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid user")

    if not verify_password(user.password, db_user.Password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
        "sub": db_user.UserName_PK,
        "role": db_user.Role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "UserName_PK": db_user.UserName_PK,
            "Email": db_user.Email,
            "Role": db_user.Role,
            "Location": db_user.Location,
            "CreatedAt": db_user.CreatedAt.isoformat() if db_user.CreatedAt else None
        }
    }
