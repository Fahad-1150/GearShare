# GearShare Equipment Management System - Setup Instructions

## Overview
The equipment system has been fully implemented with dynamic database-backed equipment management. Users can now add, edit, and delete their own equipment which will be displayed on the home page in real-time.

## What's Been Created

### 1. **Database Schema** (`equipment_table.sql`)
- Equipment table with all required fields
- Foreign key relationship with User table
- Status enum constraint for availability tracking
- Indexes for optimized queries

### 2. **Backend Models & Schemas**

#### Equipment Model (`models.py`)
- SQLAlchemy ORM model for equipment table
- All fields: name, category, price, status, ratings, owner, etc.

#### Pydantic Schemas (`schemas.py`)
- `EquipmentCreate`: For creating new equipment
- `EquipmentUpdate`: For updating equipment
- `EquipmentResponse`: For API responses

### 3. **API Routes** (`equipment.py`)

Available endpoints:
- `GET /equipment/` - Get all available equipment (with optional category filter)
- `GET /equipment/{equipment_id}` - Get specific equipment
- `GET /equipment/owner/{username}` - Get equipment by owner
- `POST /equipment/` - Create new equipment (requires owner_username header)
- `PUT /equipment/{equipment_id}` - Update equipment (requires owner_username header)
- `DELETE /equipment/{equipment_id}` - Delete equipment (requires owner_username header)

### 4. **Frontend Components**

#### EquipmentForm Component (`src/components/EquipmentForm.jsx`)
- Modal form for adding/editing equipment
- Form validation and error handling
- Image URL support
- Category selection dropdown

#### Updated Home Page (`src/pages/Home.jsx`)
- Fetches real equipment from API on mount
- Falls back to mock data if API fails
- Real-time filtering by category and search

#### Updated User Dashboard (`src/pages/UserDash.jsx`)
- My Equipments tab now shows user's actual equipment
- Add Equipment button opens modal form
- Edit and Delete buttons for each equipment
- Real-time equipment list refresh after operations

## Setup Instructions

### 1. **Create Database Table**
Run the SQL file in your PostgreSQL database:
```sql
-- Run: FastAPI/equipment_table.sql
```

### 2. **Start FastAPI Server**
```bash
cd FastAPI
uvicorn app.main:app --reload
```

The server should now be running at `http://127.0.0.1:8000`

### 3. **Start Frontend Dev Server**
```bash
npm run dev
```

The frontend should be running at `http://127.0.0.1:5173` or `http://localhost:5173`

## How to Use

### As a User:

1. **Sign up/Login** to your account
2. **Go to User Dashboard** (click your profile)
3. **Navigate to "My Equipments" tab**
4. **Click "+ Add Equipment"** to add your first item
5. **Fill in the form:**
   - Equipment Name (e.g., "Sony A7 IV Camera")
   - Category (Photography, Outdoor, Music, Electronics, etc.)
   - Daily Price (in TK)
   - Photo URL (optional, must be valid URL)
   - Pickup Location
6. **Click "Add Equipment"**

### View Your Equipment:

- Your equipment appears in "My Equipments" tab with Edit/Delete buttons
- All your equipment is automatically listed on the Home page
- Other users can see and potentially rent your equipment

### Edit/Delete Equipment:

- Click **Edit** to modify equipment details
- Click **Delete** to remove equipment from your listings

## API Request Examples

### Create Equipment
```bash
curl -X POST "http://127.0.0.1:8000/equipment/" \
  -H "Content-Type: application/json" \
  -H "owner_username: nazmul_fahad" \
  -d '{
    "name": "Sony A7 IV Camera",
    "category": "Photography",
    "daily_price": 2000.00,
    "photo_url": "https://example.com/camera.jpg",
    "pickup_location": "Feni, Bangladesh"
  }'
```

### Get All Equipment
```bash
curl "http://127.0.0.1:8000/equipment/"
```

### Get User's Equipment
```bash
curl "http://127.0.0.1:8000/equipment/owner/nazmul_fahad"
```

## Important Notes

1. **Photo URLs**: Currently, the system accepts external URLs. For production, consider implementing file upload functionality.

2. **Ownership**: Equipment can only be edited/deleted by the owner (verified via owner_username header).

3. **Status Management**: Status field supports 'available', 'booked', 'unavailable' values.

4. **Ratings**: Rating fields are aggregated (rating_avg and rating_count) for future review/rating functionality.

5. **Fallback Mode**: If the backend is down, Home page falls back to mock data automatically.

## Frontend-Backend Connection

The system uses the existing `apiRequest` utility from `src/utils/api.js`:
- Base URL: `http://127.0.0.1:8000`
- Automatically includes auth token in headers
- Proper error handling with user feedback

## Next Steps (Optional Enhancements)

1. **File Upload**: Replace URL-based images with file uploads
2. **Ratings System**: Implement review/rating functionality
3. **Rental History**: Connect equipment rentals with rental management
4. **Search Enhancement**: Add advanced filters (price range, location, etc.)
5. **Image Gallery**: Allow multiple photos per equipment

## Troubleshooting

### Equipment not showing on home page?
- Ensure FastAPI is running: `http://127.0.0.1:8000/docs`
- Check browser console for API errors (F12)
- Verify CORS is configured (should be in main.py)

### Can't add equipment?
- Make sure you're logged in
- Check that all required fields are filled
- Look at browser console for validation errors

### Delete not working?
- Verify you're the equipment owner
- Check browser console for error messages

---

The equipment system is now fully integrated with your GearShare application!
