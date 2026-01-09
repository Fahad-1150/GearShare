# GearShare FastAPI backend

This is a minimal FastAPI backend for GearShare with signup and login endpoints that use PostgreSQL.

Environment variables:
- DATABASE_URL: postgres://user:pass@host:port/dbname
- JWT_SECRET: secret used to sign JWT tokens
- CORS_ORIGINS: comma-separated allowed origins, or `*` for any origin

Run (from FastAPI folder):
- pip install -r requirements.txt
- uvicorn app.main:app --reload --port 8000

Endpoints:
- POST /auth/signup  { username, email, password, location }  -> returns { user, token }
- POST /auth/login   { email, password } -> returns { user, token }
- GET /health/db -> checks DB connection

Notes:
- Passwords are hashed with bcrypt (passlib).
- The code uses asyncpg directly and maps to your existing table named `"User"` with columns: `"UserName_PK"`, `"Email"`, `"Password"`, `"Location"`, `"VerificationStatus"`.

