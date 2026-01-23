from fastapi import APIRouter, HTTPException, Header, File, UploadFile, Form
import base64
from psycopg2.extras import RealDictCursor
from .database import get_db
from .schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse

router = APIRouter()


# GET all equipment
@router.get("/", response_model=list[EquipmentResponse])
def get_all_equipment(category: str = None, user: str = None):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if user:
            if category and category != 'All':
                cursor.execute("""
                    SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                           owner_username, pickup_location, status, booked_till, rating_avg, 
                           rating_count, created_at
                    FROM equipment
                    WHERE (status != %s OR owner_username = %s) AND category = %s
                """, ('unavailable', user, category))
            else:
                cursor.execute("""
                    SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                           owner_username, pickup_location, status, booked_till, rating_avg, 
                           rating_count, created_at
                    FROM equipment
                    WHERE (status != %s OR owner_username = %s)
                """, ('unavailable', user))
        else:
            if category and category != 'All':
                cursor.execute("""
                    SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                           owner_username, pickup_location, status, booked_till, rating_avg, 
                           rating_count, created_at
                    FROM equipment
                    WHERE status != %s AND category = %s
                """, ('unavailable', category))
            else:
                cursor.execute("""
                    SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                           owner_username, pickup_location, status, booked_till, rating_avg, 
                           rating_count, created_at
                    FROM equipment
                    WHERE status != %s
                """, ('unavailable',))
        
        equipment = cursor.fetchall()
        cursor.close()
        return equipment
    finally:
        conn.close()


# GET equipment by ID
@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(equipment_id: int):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                   owner_username, pickup_location, status, booked_till, rating_avg, 
                   rating_count, created_at
            FROM equipment
            WHERE equipment_id = %s
        """, (equipment_id,))
        equipment = cursor.fetchone()
        cursor.close()
        
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        return equipment
    finally:
        conn.close()


# GET equipment by owner
@router.get("/owner/{username}", response_model=list[EquipmentResponse])
def get_user_equipment(username: str):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                   owner_username, pickup_location, status, booked_till, rating_avg, 
                   rating_count, created_at
            FROM equipment
            WHERE owner_username = %s
        """, (username,))
        equipment = cursor.fetchall()
        cursor.close()
        return equipment
    finally:
        conn.close()


# CREATE equipment
@router.post("/", response_model=EquipmentResponse)
def create_equipment(
    name: str = Form(...),
    category: str = Form(...),
    daily_price: float = Form(...),
    pickup_location: str = Form(...),
    photo: UploadFile = File(None),
    owner_username: str = Header(..., alias="owner_username")
):
    photo_binary_data = None
    if photo:
        import io
        # Read file and convert to base64
        contents = photo.file.read()
        photo_binary_data = base64.b64encode(contents).decode("utf-8")
    
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            INSERT INTO equipment (name, category, daily_price, photo_url, photo_binary, 
                                  pickup_location, owner_username, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING equipment_id, name, category, daily_price, photo_url, photo_binary,
                     owner_username, pickup_location, status, booked_till, rating_avg, 
                     rating_count, created_at
        """, (name, category, daily_price, None, photo_binary_data, pickup_location, 
              owner_username, 'available'))
        
        new_equipment = cursor.fetchone()
        conn.commit()
        cursor.close()
        return new_equipment
    finally:
        conn.close()


# UPDATE equipment
@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    name: str = Form(None),
    category: str = Form(None),
    daily_price: float = Form(None),
    pickup_location: str = Form(None),
    photo_url: str = Form(None),
    status: str = Form(None),
    photo: UploadFile = File(None),
    owner_username: str = Header(..., alias="owner_username")
):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get current equipment
        cursor.execute("""
            SELECT equipment_id, name, category, daily_price, photo_url, photo_binary,
                   owner_username, pickup_location, status, booked_till, rating_avg, 
                   rating_count, created_at
            FROM equipment
            WHERE equipment_id = %s
        """, (equipment_id,))
        equipment = cursor.fetchone()
        
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        if equipment['owner_username'] != owner_username:
            raise HTTPException(status_code=403, detail="Not authorized to update this equipment")
        
        # Build update query
        updates = {}
        if name is not None:
            updates['name'] = name
        if category is not None:
            updates['category'] = category
        if daily_price is not None:
            updates['daily_price'] = daily_price
        if pickup_location is not None:
            updates['pickup_location'] = pickup_location
        if photo_url is not None:
            updates['photo_url'] = photo_url
        if status is not None:
            updates['status'] = status
        
        if photo:
            contents = photo.file.read()
            photo_binary_data = base64.b64encode(contents).decode("utf-8")
            updates['photo_binary'] = photo_binary_data
            updates['photo_url'] = None
        
        if not updates:
            cursor.close()
            return equipment
        
        set_clauses = []
        values = []
        for field, value in updates.items():
            set_clauses.append(f"{field} = %s")
            values.append(value)
        
        values.append(equipment_id)
        
        query = f"""
            UPDATE equipment
            SET {', '.join(set_clauses)}
            WHERE equipment_id = %s
            RETURNING equipment_id, name, category, daily_price, photo_url, photo_binary,
                     owner_username, pickup_location, status, booked_till, rating_avg, 
                     rating_count, created_at
        """
        
        cursor.execute(query, values)
        updated_equipment = cursor.fetchone()
        conn.commit()
        cursor.close()
        return updated_equipment
    finally:
        conn.close()


# DELETE equipment
@router.delete("/{equipment_id}")
def delete_equipment(
    equipment_id: int,
    owner_username: str = Header(..., alias="owner_username")
):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT equipment_id, owner_username
            FROM equipment
            WHERE equipment_id = %s
        """, (equipment_id,))
        equipment = cursor.fetchone()
        
        if not equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        if equipment['owner_username'] != owner_username:
            raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")
        
        cursor.execute("DELETE FROM equipment WHERE equipment_id = %s", (equipment_id,))
        conn.commit()
        cursor.close()
        
        return {"message": "Equipment deleted successfully"}
    finally:
        conn.close()
