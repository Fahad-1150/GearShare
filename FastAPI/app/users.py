from fastapi import APIRouter
from psycopg2.extras import RealDictCursor
from .database import get_db
from .schemas import UserResponse

router = APIRouter()


# GET all users (admin only)
@router.get("/", response_model=list[UserResponse])
def get_all_users():
    """Get all users in the system"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
            FROM "User"
        """)
        users = cursor.fetchall()
        cursor.close()
        return users
    finally:
        conn.close()


# GET user count
@router.get("/count")
def get_user_count():
    """Get total count of users"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM "User"
        """)
        result = cursor.fetchone()
        cursor.close()
        return {"count": result['count']}
    finally:
        conn.close()


# GET specific user by username
@router.get("/{username}", response_model=UserResponse)
def get_user(username: str):
    """Get a specific user by username"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
            FROM "User"
            WHERE "UserName_PK" = %s
        """, (username,))
        user = cursor.fetchone()
        cursor.close()
        return user
    finally:
        conn.close()
