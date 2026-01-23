# Admin Panel Quick Reference

## Files Modified/Created

### Modified Files:
1. **src/pages/AdminDash.jsx**
   - Changed "Reports" to "Reviews"
   - Updated path to `/admin/reviews`

2. **src/pages/ActiveRentals.jsx**
   - Added edit modal with all reservation fields
   - Added delete functionality
   - Enhanced with modal CSS

3. **src/App.jsx**
   - Imported ReviewsAdmin
   - Changed `/admin/reviews` route to use ReviewsAdmin

### New Files Created:
1. **src/pages/ReviewsAdmin.jsx** - Complete reviews management page
2. **src/pages/ReviewsAdmin.css** - Comprehensive styling for reviews page

## Admin Panel Paths

| Page | URL | Component | Features |
|------|-----|-----------|----------|
| Dashboard | `/admin` | AdminDash | Stats, Recent Activity |
| Active Rentals | `/admin/rentals` | ActiveRentals | View, Edit, Delete Rentals |
| Reviews | `/admin/reviews` | ReviewsAdmin | View, Edit, Delete Reviews |
| Users | `/admin/users` | TotalUser | User Management |
| Listings | `/admin/listings` | TotalListings | Equipment Management |

## Features by Page

### Active Rentals (/admin/rentals)
- **View:** All reservation data from database
- **Filter:** By status, days left, search
- **Edit:** All fields (equipment, users, dates, prices)
- **Delete:** Remove rental records
- **Actions:** Accept/Reject pending reservations

### Reviews (/admin/reviews)
- **View:** All review data from database
- **Filter:** By rating (1-5 stars), search
- **Edit:** All fields (reviewer, owner, rating, comment)
- **Delete:** Remove review records
- **Statistics:** Average rating, distribution breakdown
- **Display:** Visual star ratings

## Modal Features

Both Active Rentals and Reviews have identical modal functionality:
- Click "Edit" button to open modal
- Modify any field
- Click "Save Changes" to update
- Click "Cancel" to discard changes
- Click "✕" to close modal

## API Endpoints Used

### Reservations:
```
GET    /reservation/          - Fetch all rentals
PUT    /reservation/{id}      - Update rental
DELETE /reservation/{id}      - Delete rental
```

### Reviews:
```
GET    /review/               - Fetch all reviews
PUT    /review/{id}           - Update review
DELETE /review/{id}           - Delete review
```

## Styling Notes

- Modal overlays use fixed positioning
- Responsive design adapts to mobile (< 768px)
- Color scheme:
  - Primary: #4f46e5 (Indigo)
  - Edit: #f59e0b (Amber)
  - Delete: #ef4444 (Red)
  - Success: Green (confirmations)

## Testing Credentials

If you need to test, use:
- **Admin Account:** admin2 (or any admin user)
- **Role:** Must be 'Admin' to access these pages

## Troubleshooting

1. **Rentals not loading?**
   - Check if `/reservation/` API endpoint is working
   - Verify database has rental records

2. **Reviews not loading?**
   - Check if `/review/` API endpoint is working
   - Verify database has review records

3. **Edit not saving?**
   - Check browser console for API errors
   - Verify PUT endpoints are functioning
   - Check request body format matches API expectations

4. **Delete confirmation not appearing?**
   - Check if browser allows confirmations
   - Verify JavaScript is enabled

## Future Enhancements

Consider adding:
- Bulk edit operations
- CSV export/import
- Advanced filtering
- Activity logging
- Sorting by columns
- Pagination for large datasets
- Status badges with colors
- Automated status transitions
