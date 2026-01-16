# Equipment API Documentation

## Base URL
```
http://127.0.0.1:8000
```

## Authentication
All requests that modify data require the `owner_username` header:
```
owner_username: <username>
```

The system will automatically include the JWT token from localStorage.

## Endpoints

### 1. Get All Equipment
**GET** `/equipment/`

Get all available equipment with optional category filter.

#### Query Parameters
- `category` (optional): Filter by category (e.g., "Photography", "Outdoor")

#### Example Request
```bash
curl "http://127.0.0.1:8000/equipment/"
curl "http://127.0.0.1:8000/equipment/?category=Photography"
```

#### Example Response
```json
[
  {
    "equipment_id": 1,
    "name": "Sony A7 IV Camera",
    "category": "Photography",
    "daily_price": 2000.0,
    "photo_url": "https://example.com/camera.jpg",
    "owner_username": "nazmul_fahad",
    "pickup_location": "Feni, Bangladesh",
    "status": "available",
    "booked_till": null,
    "rating_avg": 4.9,
    "rating_count": 24,
    "created_at": "2026-01-16T10:30:00"
  }
]
```

#### Response Codes
- `200` - Success
- `500` - Server error

---

### 2. Get Specific Equipment
**GET** `/equipment/{equipment_id}`

Get details for a specific equipment item.

#### Path Parameters
- `equipment_id` (required): The equipment ID

#### Example Request
```bash
curl "http://127.0.0.1:8000/equipment/1"
```

#### Example Response
```json
{
  "equipment_id": 1,
  "name": "Sony A7 IV Camera",
  "category": "Photography",
  "daily_price": 2000.0,
  "photo_url": "https://example.com/camera.jpg",
  "owner_username": "nazmul_fahad",
  "pickup_location": "Feni, Bangladesh",
  "status": "available",
  "booked_till": null,
  "rating_avg": 4.9,
  "rating_count": 24,
  "created_at": "2026-01-16T10:30:00"
}
```

#### Response Codes
- `200` - Success
- `404` - Equipment not found

---

### 3. Get User's Equipment
**GET** `/equipment/owner/{username}`

Get all equipment owned by a specific user.

#### Path Parameters
- `username` (required): The owner's username

#### Example Request
```bash
curl "http://127.0.0.1:8000/equipment/owner/nazmul_fahad"
```

#### Example Response
```json
[
  {
    "equipment_id": 1,
    "name": "Sony A7 IV Camera",
    "category": "Photography",
    "daily_price": 2000.0,
    "photo_url": "https://example.com/camera.jpg",
    "owner_username": "nazmul_fahad",
    "pickup_location": "Feni, Bangladesh",
    "status": "available",
    "booked_till": null,
    "rating_avg": 4.9,
    "rating_count": 24,
    "created_at": "2026-01-16T10:30:00"
  }
]
```

#### Response Codes
- `200` - Success (empty array if no equipment)

---

### 4. Create Equipment
**POST** `/equipment/`

Add new equipment to your listings.

#### Headers
- `Content-Type: application/json`
- `owner_username: <your_username>` ⚠️ **Required**

#### Request Body
```json
{
  "name": "Sony A7 IV Camera",
  "category": "Photography",
  "daily_price": 2000.00,
  "photo_url": "https://example.com/camera.jpg",
  "pickup_location": "Feni, Bangladesh"
}
```

#### Required Fields
- `name` (string): Equipment name
- `category` (string): Equipment category
- `daily_price` (number): Price per day

#### Optional Fields
- `photo_url` (string): URL to equipment image
- `pickup_location` (string): Where to pickup the equipment

#### Example Request
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

#### Example Response
```json
{
  "equipment_id": 2,
  "name": "Sony A7 IV Camera",
  "category": "Photography",
  "daily_price": 2000.0,
  "photo_url": "https://example.com/camera.jpg",
  "owner_username": "nazmul_fahad",
  "pickup_location": "Feni, Bangladesh",
  "status": "available",
  "booked_till": null,
  "rating_avg": 0.0,
  "rating_count": 0,
  "created_at": "2026-01-16T10:35:00"
}
```

#### Response Codes
- `201` - Created successfully
- `400` - Bad request (missing required fields)
- `500` - Server error

---

### 5. Update Equipment
**PUT** `/equipment/{equipment_id}`

Update equipment details. Only the owner can update.

#### Headers
- `Content-Type: application/json`
- `owner_username: <your_username>` ⚠️ **Required**

#### Path Parameters
- `equipment_id` (required): The equipment ID

#### Request Body (all optional)
```json
{
  "name": "Updated Camera Name",
  "category": "Photography",
  "daily_price": 2500.00,
  "photo_url": "https://example.com/new-photo.jpg",
  "pickup_location": "Dhaka, Bangladesh",
  "status": "available",
  "booked_till": "2026-01-20"
}
```

#### Example Request
```bash
curl -X PUT "http://127.0.0.1:8000/equipment/2" \
  -H "Content-Type: application/json" \
  -H "owner_username: nazmul_fahad" \
  -d '{
    "daily_price": 2500.00,
    "pickup_location": "Dhaka, Bangladesh"
  }'
```

#### Example Response
```json
{
  "equipment_id": 2,
  "name": "Sony A7 IV Camera",
  "category": "Photography",
  "daily_price": 2500.0,
  "photo_url": "https://example.com/camera.jpg",
  "owner_username": "nazmul_fahad",
  "pickup_location": "Dhaka, Bangladesh",
  "status": "available",
  "booked_till": null,
  "rating_avg": 0.0,
  "rating_count": 0,
  "created_at": "2026-01-16T10:35:00"
}
```

#### Response Codes
- `200` - Updated successfully
- `403` - Forbidden (not the owner)
- `404` - Equipment not found
- `500` - Server error

---

### 6. Delete Equipment
**DELETE** `/equipment/{equipment_id}`

Delete equipment from your listings. Only the owner can delete.

#### Headers
- `owner_username: <your_username>` ⚠️ **Required**

#### Path Parameters
- `equipment_id` (required): The equipment ID

#### Example Request
```bash
curl -X DELETE "http://127.0.0.1:8000/equipment/2" \
  -H "owner_username: nazmul_fahad"
```

#### Example Response
```json
{
  "message": "Equipment deleted successfully"
}
```

#### Response Codes
- `200` - Deleted successfully
- `403` - Forbidden (not the owner)
- `404` - Equipment not found
- `500` - Server error

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid auth |
| 403 | Forbidden - Not authorized for this action |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

---

## Categories

Valid equipment categories:
- Photography
- Outdoor
- Music
- Electronics
- Lighting
- Video
- Audio
- Other

---

## Status Values

Equipment status can be one of:
- `available` - Equipment is available for rent
- `booked` - Equipment is currently booked
- `unavailable` - Equipment is not available

---

## Data Types

| Field | Type | Description |
|-------|------|-------------|
| equipment_id | integer | Unique identifier (auto-generated) |
| name | string | Equipment name (max 150 chars) |
| category | string | Equipment category |
| daily_price | decimal | Price per day (max 9999.99) |
| photo_url | string | URL to equipment photo |
| owner_username | string | Owner's username (FK to User) |
| pickup_location | string | Where to pickup (max 255 chars) |
| status | string | Availability status |
| booked_till | date | Date until which booked |
| rating_avg | decimal | Average rating (0-5) |
| rating_count | integer | Number of ratings |
| created_at | timestamp | Creation timestamp |

---

## Examples with JavaScript/Fetch

### Fetch all equipment
```javascript
const response = await fetch('http://127.0.0.1:8000/equipment/');
const equipment = await response.json();
console.log(equipment);
```

### Add new equipment
```javascript
const newEquipment = {
  name: "DJI Mavic 3 Drone",
  category: "Electronics",
  daily_price: 1500.00,
  photo_url: "https://example.com/drone.jpg",
  pickup_location: "Dhaka, Bangladesh"
};

const response = await fetch('http://127.0.0.1:8000/equipment/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'owner_username': 'nazmul_fahad'
  },
  body: JSON.stringify(newEquipment)
});

const created = await response.json();
console.log(created);
```

### Update equipment
```javascript
const updates = {
  daily_price: 1800.00
};

const response = await fetch('http://127.0.0.1:8000/equipment/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'owner_username': 'nazmul_fahad'
  },
  body: JSON.stringify(updates)
});

const updated = await response.json();
console.log(updated);
```

### Delete equipment
```javascript
const response = await fetch('http://127.0.0.1:8000/equipment/1', {
  method: 'DELETE',
  headers: {
    'owner_username': 'nazmul_fahad'
  }
});

const result = await response.json();
console.log(result.message);
```

---

## Frontend Integration

The frontend uses the `apiRequest` utility which automatically:
- Sets correct headers
- Includes authentication token
- Handles errors
- Manages CORS

Example frontend usage:
```javascript
import { apiRequest } from '../utils/api';

// Get all equipment
const response = await apiRequest('/equipment/');
const data = await response.json();

// Add equipment (owner_username is sent as header by apiRequest)
const response = await apiRequest('/equipment/', {
  method: 'POST',
  body: JSON.stringify(equipmentData)
});
```

---

## Error Responses

All errors return JSON with error details:

```json
{
  "detail": "Equipment not found"
}
```

For validation errors (400):
```json
{
  "detail": [
    {
      "loc": ["body", "daily_price"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Add as needed for production.

---

## Pagination

Currently all results are returned. Consider implementing pagination for large datasets.

---

## Testing with Swagger UI

Visit: `http://127.0.0.1:8000/docs`

All endpoints are interactive and can be tested directly from the browser!

---

Last Updated: 2026-01-16
