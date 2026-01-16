# 🎯 Equipment System Setup Checklist

## Before You Start
- [ ] PostgreSQL database is running
- [ ] FastAPI virtual environment is activated
- [ ] Node.js dependencies are installed (`npm install`)

## Step 1: Database Setup
- [ ] Open PostgreSQL client (pgAdmin or psql)
- [ ] Execute the SQL from `FastAPI/equipment_table.sql`
- [ ] Verify table created: `SELECT * FROM equipment;` (should be empty)

## Step 2: Backend Verification
- [ ] Check `FastAPI/app/models.py` has Equipment class ✓
- [ ] Check `FastAPI/app/schemas.py` has equipment schemas ✓
- [ ] Check `FastAPI/app/equipment.py` exists ✓
- [ ] Check `FastAPI/app/main.py` imports equipment router ✓

## Step 3: Start Backend
```bash
cd FastAPI
uvicorn app.main:app --reload
```
- [ ] Server starts without errors
- [ ] Visit http://127.0.0.1:8000/docs
- [ ] Verify `/equipment/` endpoints appear in Swagger

## Step 4: Frontend Verification
- [ ] Check `src/components/EquipmentForm.jsx` exists ✓
- [ ] Check `src/components/EquipmentForm.css` exists ✓
- [ ] Check `src/pages/Home.jsx` has useEffect for API calls ✓
- [ ] Check `src/pages/UserDash.jsx` imports EquipmentForm ✓

## Step 5: Start Frontend
```bash
npm run dev
```
- [ ] Frontend starts at http://127.0.0.1:5173
- [ ] No console errors

## Step 6: Test Equipment System

### 6.1 Sign Up New User
- [ ] Go to http://127.0.0.1:5173/signup
- [ ] Create account with test data
- [ ] Verify signup successful

### 6.2 Add Equipment
- [ ] Go to User Dashboard (click profile icon)
- [ ] Click "My Equipments" tab
- [ ] Click "+ Add Equipment" button
- [ ] Fill in form:
  - Name: "Test Camera"
  - Category: "Photography"
  - Daily Price: "1500"
  - Photo URL: (any valid image URL or leave empty)
  - Location: "Dhaka, Bangladesh"
- [ ] Click "Add Equipment"
- [ ] Should see success message

### 6.3 Verify Equipment Added
- [ ] Equipment appears in "My Equipments" tab
- [ ] Edit and Delete buttons visible
- [ ] Go to Home page
- [ ] Your equipment should appear in "Trending Equipment"
- [ ] Can filter by category

### 6.4 Edit Equipment
- [ ] Click "Edit" on any equipment in dashboard
- [ ] Modify any field (e.g., price)
- [ ] Click "Update Equipment"
- [ ] Changes appear immediately

### 6.5 Delete Equipment
- [ ] Click "Delete" on any equipment
- [ ] Confirm deletion
- [ ] Equipment disappears from dashboard and home page

## Step 7: Test Edge Cases

### 7.1 Empty State
- [ ] If no equipment, should show "You haven't added any equipment yet"
- [ ] Button should still work

### 7.2 API Error Handling
- [ ] Stop FastAPI server
- [ ] Home page should show mock data instead
- [ ] Error messages should display properly

### 7.3 Search & Filter
- [ ] Home page search works for equipment names
- [ ] Category filter shows only selected category
- [ ] "All" category shows everything

## Step 8: Verify Database
```sql
-- Check equipment was created
SELECT * FROM equipment;

-- Check user relationship
SELECT e.name, e.owner_username, e.daily_price 
FROM equipment e 
JOIN "User" u ON e.owner_username = u.UserName_PK;
```
- [ ] Equipment records exist
- [ ] Owner username matches

## Troubleshooting

### Equipment not showing on home page?
- [ ] Check browser console (F12) for errors
- [ ] Verify FastAPI is running
- [ ] Check API endpoint in Swagger UI
- [ ] Verify equipment_table.sql was executed

### Can't add equipment?
- [ ] Check you're logged in
- [ ] Check all required fields filled
- [ ] Check browser console for validation errors
- [ ] Verify FastAPI backend is running

### Form won't open?
- [ ] Check browser console for errors
- [ ] Verify EquipmentForm.jsx import in UserDash
- [ ] Check CSS file is imported

### Database connection error?
- [ ] Verify PostgreSQL is running
- [ ] Check database name in `FastAPI/app/database.py`
- [ ] Verify equipment table created: `\dt` in psql

## Success Indicators ✅

All of these should be true:
- [ ] Equipment table exists in PostgreSQL
- [ ] FastAPI server runs without errors
- [ ] Home page shows equipment (real or mock)
- [ ] Can add equipment from dashboard
- [ ] Equipment appears on home page immediately
- [ ] Can edit equipment details
- [ ] Can delete equipment
- [ ] Empty state shows when no equipment
- [ ] Search and filters work
- [ ] No console errors

## Important Files to Check

1. **Backend Configuration**
   - `FastAPI/app/database.py` - Database connection
   - `FastAPI/app/main.py` - Equipment router included?

2. **Frontend Configuration**
   - `src/utils/api.js` - API_BASE_URL set to `http://127.0.0.1:8000`
   - `.env` files - No conflicting URLs

3. **Imports**
   - `src/pages/UserDash.jsx` - Has EquipmentForm import?
   - `src/components/EquipmentForm.jsx` - Has CSS import?

## Quick Commands

```bash
# Backend
cd FastAPI && uvicorn app.main:app --reload

# Frontend (new terminal)
npm run dev

# Database setup
psql -U postgres -d gearshare_db -f equipment_table.sql

# Check database
psql -U postgres -d gearshare_db -c "SELECT * FROM equipment;"
```

## Next Features (Optional)

After basic equipment system works:
1. Implement file upload for images
2. Add equipment reviews/ratings
3. Create rental booking system
4. Add equipment availability calendar
5. Implement equipment search filters
6. Add equipment condition/specifications

---

**Status:** Equipment system ready to test! 🚀

Run through this checklist to verify everything is working correctly.
