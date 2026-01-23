# PycopG2 FastAPI Setup & Testing Guide

## Installation Steps

### 1. Install Python Dependencies

```bash
cd FastAPI
pip install -r requirements.txt
```

**Required packages**:
- fastapi - Web framework
- uvicorn[standard] - ASGI server
- psycopg2-binary - PostgreSQL adapter (NEW)
- python-multipart - Form data handling
- passlib[bcrypt] - Password hashing
- python-jose - JWT token handling
- pydantic[email] - Data validation
- python-dotenv - Environment variables

### 2. Verify PostgreSQL Connection

Test database connectivity:

```python
import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        database='GearShare',
        user='postgres',
        password='fdjm0881',
        port=5432
    )
    print("✅ Database connection successful")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### 3. Create Database Tables (if not exists)

Run SQL scripts in PostgreSQL:

```bash
# In PostgreSQL client or tools like pgAdmin
\c GearShare  # Connect to database

\i user_table.sql
\i equipment_table.sql
\i reservation_table.sql
\i review_table.sql
\i report_table.sql
```

Or manually create from scripts in FastAPI folder:
- `user_table.sql`
- `equipment_table.sql`
- `reservation_table.sql`
- `review_table.sql`
- `report_table.sql`

### 4. Configure Environment (Optional)

Create `.env` file in FastAPI folder:

```env
DATABASE_HOST=localhost
DATABASE_NAME=GearShare
DATABASE_USER=postgres
DATABASE_PASSWORD=fdjm0881
DATABASE_PORT=5432
```

Or use defaults in `database.py`:
```python
DB_PARAMS = {
    'host': 'localhost',
    'database': 'GearShare',
    'user': 'postgres',
    'password': 'fdjm0881',
    'port': 5432
}
```

---

## Running the Application

### Development Mode

```bash
cd FastAPI
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output should show**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Production Mode

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Access API

- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Testing Endpoints

### 1. Test Basic Connectivity

```bash
curl http://localhost:8000/
# Expected: {"message":"GearShare API running"}
```

### 2. User Registration (Signup)

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "location": "New York"
  }'
```

**Success Response** (200):
```json
{
  "message": "User registered successfully",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "UserName_PK": "testuser",
    "Email": "test@example.com",
    "Role": "User",
    "Location": "New York",
    "CreatedAt": "2026-01-23T12:00:00"
  }
}
```

### 3. User Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Success Response** (200):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "UserName_PK": "testuser",
    "Email": "test@example.com",
    "Role": "User",
    "Location": "New York",
    "CreatedAt": "2026-01-23T12:00:00"
  }
}
```

### 4. Get All Users

```bash
curl http://localhost:8000/users/
```

**Success Response** (200):
```json
[
  {
    "UserName_PK": "testuser",
    "Email": "test@example.com",
    "Role": "User",
    "Location": "New York",
    "VerificationStatus": true,
    "CreatedAt": "2026-01-23T12:00:00"
  }
]
```

### 5. Create Equipment

```bash
# Requires: owner_username header
curl -X POST http://localhost:8000/equipment/ \
  -H "owner_username: testuser" \
  -F "name=Mountain Bike" \
  -F "category=Sports" \
  -F "daily_price=50.00" \
  -F "pickup_location=Central Park" \
  -F "photo=@/path/to/bike.jpg"
```

**Success Response** (200):
```json
{
  "equipment_id": 1,
  "name": "Mountain Bike",
  "category": "Sports",
  "daily_price": 50.0,
  "photo_url": null,
  "photo_binary": "iVBORw0KGgoAAAANS...",
  "owner_username": "testuser",
  "pickup_location": "Central Park",
  "status": "available",
  "booked_till": null,
  "rating_avg": 0.0,
  "rating_count": 0,
  "created_at": "2026-01-23T12:00:00"
}
```

### 6. Get Equipment by ID

```bash
curl http://localhost:8000/equipment/1
```

### 7. Get User's Equipment

```bash
curl http://localhost:8000/equipment/owner/testuser
```

### 8. Create Reservation

```bash
# Requires: reserver_username header
curl -X POST http://localhost:8000/reservation/ \
  -H "Content-Type: application/json" \
  -H "reserver_username: renteruser" \
  -d '{
    "equipment_id": 1,
    "start_date": "2026-02-01",
    "end_date": "2026-02-05"
  }'
```

**Success Response** (200):
```json
{
  "reservation_id": 1,
  "equipment_id": 1,
  "owner_username": "testuser",
  "reserver_username": "renteruser",
  "status": "pending",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "per_day_price": 50.0,
  "total_price": 200.0,
  "review_id": null,
  "created_at": "2026-01-23T12:00:00"
}
```

### 9. Create Review

```bash
curl -X POST http://localhost:8000/api/review/ \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": 1,
    "equipment_id": 1,
    "rating": 5,
    "comment": "Great equipment!"
  }'
```

### 10. Get Owner Rating

```bash
curl http://localhost:8000/api/owner/testuser/average-rating
```

**Response**:
```json
{
  "owner_username": "testuser",
  "average_rating": 5.0,
  "total_reviews": 1,
  "scale": 5
}
```

### 11. Get Owner Rating Details

```bash
curl http://localhost:8000/api/owner/testuser/rating-details
```

**Response**:
```json
{
  "owner_username": "testuser",
  "average_rating": 5.0,
  "total_reviews": 1,
  "rating_distribution": {
    "5_star": 1,
    "4_star": 0,
    "3_star": 0,
    "2_star": 0,
    "1_star": 0
  },
  "reviews": [
    {
      "review_id": 1,
      "equipment_id": 1,
      "reviewer_username": "renteruser",
      "rating": 5,
      "comment": "Great equipment!",
      "created_at": "2026-01-23T12:00:00"
    }
  ]
}
```

### 12. Create Report

```bash
curl -X POST http://localhost:8000/reports/ \
  -H "Content-Type: application/json" \
  -H "reporter_username: testuser" \
  -d '{
    "report_type": "equipment_damage",
    "subject": "Bike damage",
    "description": "Equipment damaged during rental",
    "equipment_id": 1,
    "priority": "high"
  }'
```

### 13. Get All Reports

```bash
curl http://localhost:8000/reports/
```

### 14. Update Reservation Status

```bash
curl -X PUT http://localhost:8000/reservation/1 \
  -H "Content-Type: application/json" \
  -H "owner_username: testuser" \
  -d '{
    "status": "completed"
  }'
```

### 15. Get Earnings

```bash
curl http://localhost:8000/reservation/earnings/testuser
```

**Response**:
```json
{
  "owner_username": "testuser",
  "total_earnings": 200.0,
  "currency": "BDT"
}
```

---

## Common Error Responses

### 400 - Bad Request
```json
{
  "detail": "End date must be after start date"
}
```

### 404 - Not Found
```json
{
  "detail": "Equipment not found"
}
```

### 403 - Forbidden
```json
{
  "detail": "Not authorized to update this equipment"
}
```

### 500 - Server Error
```json
{
  "detail": "Failed to create reservation: <error details>"
}
```

---

## Debugging Database Issues

### Check PostgreSQL Connection

```python
import psycopg2
import logging

logging.basicConfig(level=logging.DEBUG)

try:
    conn = psycopg2.connect(
        host='localhost',
        database='GearShare',
        user='postgres',
        password='fdjm0881'
    )
    print("Connected!")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM equipment")
    count = cursor.fetchone()[0]
    print(f"Equipment count: {count}")
    conn.close()
except psycopg2.Error as e:
    print(f"Database error: {e}")
```

### Enable SQL Logging

Check PostgreSQL logs:
```bash
# Linux/Mac
tail -f /var/log/postgresql/postgresql.log

# Or set in PostgreSQL:
ALTER SYSTEM SET log_statement = 'all';
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check PostgreSQL is running: `pg_isready` |
| Authentication failed | Verify credentials in database.py |
| Table not found | Create tables from SQL scripts |
| Column not found | Check table schema matches queries |
| Type mismatch | Ensure parameterized queries use correct types |

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test endpoint
ab -n 100 -c 10 http://localhost:8000/users/

# Output shows:
# Requests per second: [value]
# Time per request: [value]ms
```

### Connection Pool Monitoring

Monitor active connections:
```sql
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

---

## Troubleshooting Common Issues

### 1. ModuleNotFoundError: No module named 'psycopg2'

```bash
# Solution: Install psycopg2-binary
pip install psycopg2-binary

# Or from requirements.txt
pip install -r requirements.txt
```

### 2. psycopg2.OperationalError: connection failed

```python
# Check database.py configuration
DB_PARAMS = {
    'host': 'localhost',
    'database': 'GearShare',
    'user': 'postgres',
    'password': 'fdjm0881',  # Check password is correct
    'port': 5432
}
```

### 3. psycopg2.ProgrammingError: relation "equipment" does not exist

```bash
# Solution: Create tables
# In PostgreSQL client:
\c GearShare
\i FastAPI/equipment_table.sql
```

### 4. JSON serialization error for datetime

This should be handled by pydantic, but if issues occur:
```python
# In response, ensure datetime is converted:
"created_at": result['created_at'].isoformat() if result['created_at'] else None
```

### 5. File upload not working

```python
# Verify Form parameters are being used in FastAPI
# Check photo.file.read() syntax (not photo.read())
contents = photo.file.read()
photo_binary = base64.b64encode(contents).decode("utf-8")
```

---

## Testing Checklist

- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] PostgreSQL running and accessible
- [ ] Database tables created from SQL scripts
- [ ] Application starts without errors
- [ ] Root endpoint returns OK
- [ ] User signup works
- [ ] User login works
- [ ] Equipment CRUD works
- [ ] Reservations can be created
- [ ] Reviews can be created
- [ ] Ratings calculate correctly
- [ ] Reports work
- [ ] File uploads work (photos save as base64)
- [ ] Error responses are correct format
- [ ] Database connections properly close
- [ ] No connection timeouts after sustained use

---

## Production Deployment Notes

### Before Deploying

1. **Update Credentials**:
   - Change database password
   - Use environment variables instead of hardcoding

2. **Security**:
   - Enable HTTPS
   - Implement rate limiting
   - Add CORS restrictions
   - Use auth tokens properly

3. **Database**:
   - Enable query logging
   - Setup backups
   - Monitor connection pool
   - Create database indexes on frequently queried columns

4. **Performance**:
   - Consider connection pooling (PgBouncer)
   - Monitor query performance
   - Cache frequently accessed data

### Recommended setup.py edits

```python
# database.py - use environment variables
import os

DB_PARAMS = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'GearShare'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'fdjm0881'),
    'port': int(os.getenv('DB_PORT', 5432))
}
```

---

## Next Steps

1. **Run application**: `python -m uvicorn app.main:app --reload`
2. **Visit API docs**: http://localhost:8000/docs
3. **Create test user**: Use signup endpoint
4. **Create test equipment**: Use equipment endpoint
5. **Test all endpoints**: Systematically test each route
6. **Monitor logs**: Watch for errors and performance issues
7. **Load test**: Use ab or locust for stress testing

---

**Created**: January 23, 2026
**Version**: 1.0.0 (PycopG2 Edition)
