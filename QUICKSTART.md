# Quick Start - PycopG2 FastAPI

## 🚀 Installation (2 minutes)

```bash
# 1. Navigate to FastAPI folder
cd FastAPI

# 2. Install dependencies
pip install -r requirements.txt

# 3. Verify PostgreSQL connection
python -c "import psycopg2; print('✅ PycopG2 installed')"
```

## 📊 Setup Database (5 minutes)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (if not exists)
CREATE DATABASE GearShare;

# Connect to database
\c GearShare

# Create tables
\i app/user_table.sql
\i app/equipment_table.sql
\i app/reservation_table.sql
\i app/review_table.sql
\i app/report_table.sql

# Verify tables created
\dt

# Exit PostgreSQL
\q
```

## ▶️ Run Application (1 minute)

```bash
# Start FastAPI server
python -m uvicorn app.main:app --reload

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
```

## 🧪 Quick Test (3 minutes)

### Open Swagger UI
```
http://localhost:8000/docs
```

### Test Signup
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "location": "NYC"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Equipment
```bash
curl -X POST http://localhost:8000/equipment/ \
  -H "owner_username: testuser" \
  -F "name=Mountain Bike" \
  -F "category=Sports" \
  -F "daily_price=50.00" \
  -F "pickup_location=Central Park"
```

### Get All Equipment
```bash
curl http://localhost:8000/equipment/
```

## 📚 Documentation

- **PYCOPG2_CONVERSION_SUMMARY.md** - What changed and why
- **CONVERSION_EXAMPLES.md** - Before/after code examples
- **SETUP_AND_TESTING.md** - Complete testing guide
- **README_CONVERSION.md** - Full conversion details

## ✅ Verification Checklist

- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] PostgreSQL running: `pg_isready`
- [ ] Database created: `psql -l | grep GearShare`
- [ ] Tables created: `psql -d GearShare -c "\dt"`
- [ ] App starts: `python -m uvicorn app.main:app --reload`
- [ ] Swagger UI loads: http://localhost:8000/docs
- [ ] Signup works: POST /auth/signup
- [ ] Login works: POST /auth/login
- [ ] Equipment works: GET /equipment/

## 🔧 Troubleshooting

### Error: ModuleNotFoundError: No module named 'psycopg2'
```bash
pip install psycopg2-binary
```

### Error: connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Update credentials in app/database.py if needed
```

### Error: relation "equipment" does not exist
```bash
# Create tables (see Setup Database section above)
psql -d GearShare -f app/equipment_table.sql
```

### Port 8000 already in use
```bash
python -m uvicorn app.main:app --reload --port 8001
```

## 📝 Key Files Changed

| File | Status | Notes |
|------|--------|-------|
| app/database.py | ✅ Changed | PycopG2 instead of SQLAlchemy |
| app/main.py | ✅ Changed | Removed async lifespan |
| app/auth.py | ✅ Changed | Raw SQL queries |
| app/users.py | ✅ Changed | Raw SQL queries |
| app/equipment.py | ✅ Changed | Raw SQL queries |
| app/review.py | ✅ Changed | Raw SQL queries |
| app/reports.py | ✅ Changed | Raw SQL queries |
| app/reservation.py | ✅ Changed | Raw SQL queries |
| requirements.txt | ✅ Changed | psycopg2-binary instead of asyncpg/sqlalchemy |
| app/security.py | ✅ Unchanged | No changes needed |
| app/schemas.py | ✅ Unchanged | No changes needed |

## 🎯 What's New

**Before**: SQLAlchemy async ORM  
**After**: PycopG2 synchronous SQL  

- ✅ More transparent SQL queries
- ✅ Simpler dependencies  
- ✅ Easier to debug
- ✅ All 36+ endpoints still work
- ✅ All business logic preserved

## 💡 Endpoint Examples

### Users
```bash
GET  /users/              # All users
GET  /users/count         # Count
GET  /users/{username}    # One user
```

### Equipment
```bash
GET    /equipment/                        # List
POST   /equipment/                        # Create
GET    /equipment/{id}                    # Get one
PUT    /equipment/{id}                    # Update
DELETE /equipment/{id}                    # Delete
GET    /equipment/owner/{username}        # User's equipment
```

### Reservations
```bash
GET  /reservation/                        # All
POST /reservation/                        # Create
GET  /reservation/{id}                    # Get one
PUT  /reservation/{id}                    # Update
DELETE /reservation/{id}                  # Cancel
GET  /reservation/reserver/{username}     # My rentals
GET  /reservation/owner/{username}        # My reservations
GET  /reservation/earnings/{username}     # My earnings
```

### Reviews
```bash
POST /api/review/                                      # Create
GET  /api/review/equipment/{id}                        # Equipment reviews
GET  /api/review/reservation/{id}                      # Reservation review
GET  /api/owner/{username}/average-rating             # Owner rating
GET  /api/owner/{username}/rating-details             # Rating breakdown
```

### Reports
```bash
GET    /reports/              # All
POST   /reports/              # Create
GET    /reports/{id}          # Get one
PUT    /reports/{id}          # Update
DELETE /reports/{id}          # Delete
GET    /reports/count         # Count
GET    /reports/status/{status}  # By status
```

## 🔐 Authentication

All protected endpoints require the appropriate header:

```bash
# For endpoints requiring user context
-H "owner_username: username"
-H "reserver_username: username"
-H "reporter_username: username"
```

Token-based auth:
```bash
# From login response, use token in Authorization header
-H "Authorization: Bearer <token>"
```

## 📦 Requirements

- Python 3.8+
- PostgreSQL 10+
- pip

## 🌐 API Documentation

After starting the server:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Root API**: http://localhost:8000/

## 📞 Support

For detailed information, see:
1. SETUP_AND_TESTING.md - Full testing guide
2. CONVERSION_EXAMPLES.md - Code comparisons
3. PYCOPG2_CONVERSION_SUMMARY.md - Technical details

---

**Status**: ✅ Ready to use  
**Last Updated**: January 23, 2026
