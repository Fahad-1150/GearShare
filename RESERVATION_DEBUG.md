# Reservation System Debugging Guide

## Issue: Reservations not showing from database

The reservation system has test data enabled temporarily. Here's how to verify the actual API:

### Step 1: Verify FastAPI Server is Running

1. Open a terminal in the `FastAPI` directory
2. Run: `python -m uvicorn app.main:app --reload`
3. You should see the server running on `http://127.0.0.1:8000`

### Step 2: Verify Database Connection

1. Open pgAdmin or psql
2. Connect to the `GearShare` database
3. Run these commands to check the tables:

```sql
-- Check if reservation table exists
SELECT * FROM information_schema.tables WHERE table_name = 'reservation';

-- Check if any data exists
SELECT * FROM reservation;

-- Check equipment table has data
SELECT * FROM equipment LIMIT 5;

-- Check user table has data
SELECT * FROM "User" LIMIT 5;
```

### Step 3: Test API Directly

Use curl or Postman to test these endpoints:

```bash
# Get incoming reservations (as owner)
curl -X GET "http://127.0.0.1:8000/reservation/owner/bapon" \
  -H "Authorization: Bearer {token}"

# Get outgoing reservations (as reserver)
curl -X GET "http://127.0.0.1:8000/reservation/reserver/bapon" \
  -H "Authorization: Bearer {token}"
```

### Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for these logs when visiting the dashboard:
   - "Fetching reservations for user: [username]"
   - "Owner response status: 200/404/error"
   - "Incoming reservations: [data]"

### Step 5: Database Table Creation

If the reservation table doesn't exist:

1. FastAPI app automatically creates tables on startup using SQLAlchemy
2. Or manually run: `FastAPI/reservation_table.sql` in pgAdmin

### Common Issues:

| Problem | Solution |
|---------|----------|
| 404 errors on /reservation endpoints | FastAPI server might not be running |
| Empty array returned | No reservations in database yet (create one via UI) |
| Foreign key errors | Equipment or User records don't exist |
| "User not found" | Username doesn't exist in User table |
| CORS errors | Check main.py CORS middleware configuration |

### Test Data Available

A test reservation has been added to UserDash for development:
- It shows in "Your Rental Requests" section
- Status: pending
- Equipment ID: 1
- Duration: 5 days
- Price: 2500 TK

### To Remove Test Data

Edit [src/pages/UserDash.jsx](src/pages/UserDash.jsx) line ~100:
Remove the test data assignment in the catch block for outgoing reservations.

### Monitoring API Calls

To see real-time API calls:

1. Open browser DevTools → Network tab
2. Go to Dashboard
3. Look for requests to `/reservation/owner/...` and `/reservation/reserver/...`
4. Check Response tab for actual data

### Next Steps

Once database has real reservations:
1. Remove the test data fallback
2. Verify API returns proper status codes
3. Handle error cases gracefully in UI
