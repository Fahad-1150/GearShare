from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from .database import get_db
from .schemas import UserRegister, UserLogin
from .security import verify_password, create_access_token

router = APIRouter()


# REGISTER
@router.post("/signup")
def signup(user: UserRegister):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if user already exists
        cursor.execute("""
            SELECT "UserName_PK" FROM "User"
            WHERE "Email" = %s OR "UserName_PK" = %s
        """, (user.email, user.username))
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            raise HTTPException(status_code=400, detail="Username or Email already exists")
        
        # Insert new user
        cursor.execute("""
            INSERT INTO "User" ("UserName_PK", "Email", "Password", "Location")
            VALUES (%s, %s, %s, %s)
            RETURNING "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
        """, (user.username, user.email, user.password, user.location))
        
        new_user = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        token = create_access_token({
            "sub": new_user["UserName_PK"],
            "role": new_user["Role"]
        })
        
        return {
            "message": "User registered successfully",
            "token": token,
            "user": {
                "UserName_PK": new_user['UserName_PK'],
                "Email": new_user['Email'],
                "Role": new_user['Role'],
                "Location": new_user['Location'],
                "CreatedAt": new_user['CreatedAt'].isoformat() if new_user['CreatedAt'] else None
            }
        }
    finally:
        conn.close()


# LOGIN
@router.post("/login")
def login(user: UserLogin):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get user by email
        cursor.execute("""
            SELECT "UserName_PK", "Email", "Password", "Role", "Location", "CreatedAt"
            FROM "User"
            WHERE "Email" = %s
        """, (user.email,))
        db_user = cursor.fetchone()
        cursor.close()
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid user")
        
        if not verify_password(user.password, db_user['Password']):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        token = create_access_token({
            "sub": db_user['UserName_PK'],
            "role": db_user['Role']
        })
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "UserName_PK": db_user['UserName_PK'],
                "Email": db_user['Email'],
                "Role": db_user['Role'],
                "Location": db_user['Location'],
                "CreatedAt": db_user['CreatedAt'].isoformat() if db_user['CreatedAt'] else None
            }
        }
    finally:
        conn.close()
