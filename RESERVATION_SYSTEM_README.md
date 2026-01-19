# Reservation System Implementation Guide

## Overview
The reservation system has been successfully implemented with a complete flow from booking request to owner approval.

## Components Created/Modified

### 1. **ReservationForm Component** (`src/components/ReservationForm.jsx`)
- Modal popup triggered when clicking "Reserve Now" on equipment details
- Features:
  - Date selection (start_date, end_date)
  - Automatic price calculation based on daily rate and rental duration
  - Real-time date validation
  - Form error handling
  - Uses header-based authentication (reserver_username)

### 2. **GearDetails Component** (Updated)
- Added state: `showReservationForm`
- Modified "Reserve Now" button to trigger ReservationForm modal
- Passes equipment data to the modal

### 3. **UserDash Component** (Updated)
- New "My Reservations" tab showing:
  - **"Requests to Rent Your Equipment"** - Incoming reservations as owner
    - Shows pending requests with Accept/Reject buttons
    - Displays equipment ID, dates, reserver name, and total price
  - **"Your Rental Requests"** - Outgoing reservations as reserver
    - Shows your booking requests with their status
    - Tracks all rental requests across their lifecycle
- New functions:
  - `handleAcceptReservation()` - Owner accepts pending reservation (status → "accepted")
  - `handleRejectReservation()` - Owner rejects pending reservation
- Auto-fetches reservations on component mount

### 4. **Styling**
- **ReservationForm.css** - Modal styling with animations
- **UserDash.css** - Reservation table layout and status badges

## User Flow

### For Renters (Equipment Seekers)
1. Browse equipment on Home page
2. Click on equipment card → GearDetails component opens
3. Click "Reserve Now" button → ReservationForm modal appears
4. Select start and end dates
5. System calculates total price (daily_price × number_of_days)
6. Click "Confirm Reservation" → API POST `/reservation/` with:
   - `equipment_id`: Equipment being requested
   - `start_date`: Check-in date
   - `end_date`: Check-out date
   - Header `reserver_username`: Current logged-in user
7. Status shows "pending" until owner accepts/rejects
8. Visit UserDash → "My Reservations" → "Your Rental Requests" to track status

### For Equipment Owners
1. Visit UserDash → "My Reservations" tab
2. Section: "Requests to Rent Your Equipment" shows incoming requests
3. For each pending request:
   - View reserver name, dates, equipment, and total price
   - Click **"✓ Accept"** → Status changes to "accepted"
   - Click **"✕ Reject"** → Request is deleted
4. Accepted reservations remain visible with status updated

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/reservation/` | Create new reservation request |
| GET | `/reservation/owner/{username}` | Fetch incoming reservations (as owner) |
| GET | `/reservation/reserver/{username}` | Fetch outgoing reservations (as reserver) |
| PUT | `/reservation/{reservation_id}` | Update reservation status (accept/reject/etc) |
| DELETE | `/reservation/{reservation_id}` | Cancel pending reservation |

## Data Validation

### In ReservationForm:
- ✓ Start date must be today or later
- ✓ End date must be after start date
- ✓ Both dates are required
- ✓ User must be logged in (localStorage check)
- ✓ Price calculation enforces at least 1 day rental

### In Backend (`FastAPI/app/reservation.py`):
- ✓ Equipment must exist and be available
- ✓ Owner cannot reserve own equipment
- ✓ Date validation (end > start)
- ✓ Authorization checks on all operations

## Reservation Status Flow

```
pending → accepted → running → returned → [review possible]
   ↓
rejected (deleted)
```

- **pending**: Awaiting owner acceptance/rejection
- **accepted**: Owner approved, awaiting renter to pick up
- **running**: Active rental period
- **returned**: Equipment returned to owner
- **review**: After completion, reserver can leave review

## Database Schema (PostgreSQL)

The `reservation` table includes:
- `reservation_id` (Primary Key)
- `equipment_id` (Foreign Key → Equipment)
- `owner_username` (Foreign Key → User)
- `reserver_username` (Foreign Key → User)
- `start_date` (DATE)
- `end_date` (DATE)
- `status` (ENUM: pending, accepted, running, returned)
- `per_day_price` (DECIMAL - snapshot of daily rate)
- `total_price` (DECIMAL - calculated)
- `review_id` (Foreign Key → Review, nullable)

## Next Steps

1. ✅ Reservation request creation from GearDetails
2. ✅ Owner approval/rejection from UserDash
3. ⏳ **Upcoming**: Frontend UI for status transitions (running → returned)
4. ⏳ **Upcoming**: Review system after rental completion
5. ⏳ **Upcoming**: Payment integration (if needed)

## Testing Checklist

- [ ] Click "Reserve Now" on any equipment
- [ ] Modal appears with proper styling
- [ ] Date picker works and enforces constraints
- [ ] Price calculates correctly on date change
- [ ] "Confirm Reservation" successfully creates reservation
- [ ] Reservation appears in owner's UserDash with pending status
- [ ] Owner can accept/reject reservation
- [ ] Status updates reflect on both owner and renter dashboards
- [ ] Error messages display for validation failures

## Notes

- Reservations use header-based user identification for better security
- Equipment daily_price is stored in reservation for price history tracking
- The system supports multiple concurrent reservations per equipment
- Reviews can be added after rental completion (review_id field ready)
