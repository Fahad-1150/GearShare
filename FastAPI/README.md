# GearShare FastAPI backend

This is a minimal FastAPI backend for GearShare with signup and login endpoints that use PostgreSQL.

## Setup

1. Install PostgreSQL and create a database
2. Update the `.env` file with your database credentials:
   ```
   DATABASE_URL=postgresql+asyncpg://your_username:your_password@localhost:5432/your_database_name
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

## Environment variables:
- DATABASE_URL: postgres://user:pass@host:port/dbname
- JWT_SECRET: secret used to sign JWT tokens
- CORS_ORIGINS: comma-separated allowed origins, or `*` for any origin

## Endpoints:
- POST /auth/signup  { username, email, password, location }  -> returns { user, token }
- POST /auth/login   { email, password } -> returns { user, token }
- GET /health/db -> checks DB connection
- GET / -> Basic root endpoint
- GET /test-db -> Test database connection

## Notes:
- Passwords are hashed with bcrypt (passlib).
- The code uses asyncpg directly and maps to your existing table named `"User"` with columns: `"UserName_PK"`, `"Email"`, `"Password"`, `"Location"`, `"VerificationStatus"`.

