# Reservation Data Not Saving - Debugging Guide

## 🔴 Problem
When you try to create a reservation through the UI, the data is not being saved to the database.

## ✅ Fixes Applied

1. **Fixed API Call Format** - ReservationForm now uses correct `apiRequest()` syntax
2. **Added Console Logging** - Frontend now logs all API responses
3. **Added Backend Logging** - FastAPI logs all reservation creation attempts
4. **Better Error Messages** - UI shows detailed error information

## 🔍 How to Debug

### Step 1: Check Frontend Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try creating a reservation
4. Look for these logs:
   ```
   Reservation response status: [number]
   Reservation response data: {data}
   ```

### Step 2: Check FastAPI Terminal
1. Look at the terminal where FastAPI is running
2. It should print:
   ```
   === CREATE RESERVATION REQUEST ===
   Equipment ID: 1
   Start Date: 2026-01-20
   End Date: 2026-01-25
   Reserver Username: bapon
   Equipment found: [name]...
   SUCCESS: Reservation created with ID [number]
   === END CREATE RESERVATION ===
   ```

### Step 3: Test API Directly
Open the test file: `test_api.html` in browser at `http://localhost:5173/test_api.html`

This tool allows you to:
- ✓ Fetch available equipment
- ✓ Create a test reservation manually
- ✓ Check incoming/outgoing reservations
- ✓ See live logs

### Step 4: Verify Database

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Connect to "GearShare" database
3. Run these queries:

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'reservation';

-- View all data
SELECT * FROM reservation;

-- Check for errors
SELECT * FROM equipment LIMIT 1;
SELECT * FROM "User" LIMIT 1;
```

**Option B: Using PostgreSQL Terminal**
```bash
# Connect to database
psql -U postgres -d GearShare

# Check tables
\dt

# View reservations
SELECT * FROM reservation;
```

## 🐛 Common Issues & Solutions

### Issue 1: "Equipment not found" error
**Cause:** Equipment ID doesn't exist in database
**Fix:**
- First create an equipment through UserDash
- Check equipment_id in database

### Issue 2: "reserver_username header is required" error
**Cause:** Header not being sent to API
**Fix:**
- Check that user is logged in
- Verify localStorage has 'user' data
- Check browser console for login errors

### Issue 3: No data in database
**Cause:** Reservation was created but not saved
**Fix:**
- Check FastAPI logs for SQL errors
- Verify PostgreSQL is running
- Check foreign key constraints (equipment and user must exist)

### Issue 4: "Foreign key violation" error
**Cause:** Referenced equipment or user doesn't exist
**Fix:**
1. Create equipment first in UserDash
2. Make sure both owner and reserver usernames exist in User table
3. Verify equipment_id is correct

## 📊 Expected Flow

```
1. User fills reservation form
   ↓
2. Frontend sends POST to /reservation/ with:
   - equipment_id
   - start_date
   - end_date
   - reserver_username (header)
   ↓
3. FastAPI validates:
   - User is logged in (header check)
   - Equipment exists
   - Dates are valid
   ↓
4. Database saves:
   - Inserts into reservation table
   - Sets status = 'pending'
   ↓
5. Frontend shows:
   - Success message
   - Closes modal
   - Refreshes user dashboard
```

## 🧪 Manual Test Steps

1. **Create Equipment** (if not already created):
   - Go to Dashboard
   - Click "My Equipments"
   - Click "+ Add Equipment"
   - Fill form and save
   - Note the equipment_id

2. **Try Creating Reservation**:
   - Go to Home page
   - Click on equipment
   - Click "Reserve Now"
   - Select dates
   - Click "Confirm Reservation"

3. **Check Results**:
   - Look at browser console (F12)
   - Look at FastAPI terminal output
   - Query database: `SELECT * FROM reservation;`

## 🔗 API Endpoint Details

**POST /reservation/**

Request:
```json
{
  "equipment_id": 1,
  "start_date": "2026-01-20",
  "end_date": "2026-01-25"
}
```

Headers:
```
Content-Type: application/json
reserver_username: bapon
Authorization: Bearer [token]
```

Success Response (200):
```json
{
  "reservation_id": 1,
  "equipment_id": 1,
  "owner_username": "owner_name",
  "reserver_username": "bapon",
  "status": "pending",
  "start_date": "2026-01-20",
  "end_date": "2026-01-25",
  "per_day_price": 500,
  "total_price": 2500,
  "review_id": null
}
```

Error Response (400/404/500):
```json
{
  "detail": "Error message here"
}
```

## ⚠️ If Still Not Working

1. **Restart FastAPI**:
   ```bash
   cd FastAPI
   python -m uvicorn app.main:app --reload
   ```

2. **Restart Frontend**:
   ```bash
   npm run dev
   ```

3. **Clear Browser Cache** (Ctrl+Shift+Delete)

4. **Check Database Connection**:
   - Verify PostgreSQL is running
   - Verify connection string in `FastAPI/app/database.py`
   - Verify database exists: `psql -U postgres -l`

5. **Enable Query Logging** in database.py:
   ```python
   engine = create_async_engine(DATABASE_URL, echo=True)  # echo=True shows all SQL
   ```

## 📝 Files to Check

- Frontend: `src/components/ReservationForm.jsx` (API call)
- Backend: `FastAPI/app/reservation.py` (endpoint)
- Models: `FastAPI/app/models.py` (Reservation class)
- Schema: `FastAPI/app/schemas.py` (ReservationCreate)
- Database: `FastAPI/app/database.py` (connection)
