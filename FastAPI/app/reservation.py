from fastapi import APIRouter, HTTPException, Header
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor
import os

from .schemas import ReservationCreate, ReservationUpdate, ReservationResponse

router = APIRouter()

# Database connection parameters
DB_PARAMS = {
    'host': 'localhost',
    'database': 'GearShare',
    'user': 'postgres',
    'password': 'fdjm0881',
    'port': 5432
}

def get_db_connection():
    """Create and return a database connection"""
    return psycopg2.connect(**DB_PARAMS)

def dict_from_cursor(cursor):
    """Convert cursor results to dictionary"""
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


# GET all reservations
@router.get("/", response_model=list[ReservationResponse])
def get_all_reservations():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT reservation_id, equipment_id, owner_username, reserver_username, 
                   status, start_date, end_date, per_day_price, total_price, review_id, created_at
            FROM reservation
        """)
        reservations = cursor.fetchall()
        cursor.close()
        return reservations
    finally:
        conn.close()

# CREATE reservation
@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation: ReservationCreate,
    reserver_username: str = Header(None, convert_underscores=False)
):
    print(f"\n=== CREATE RESERVATION REQUEST ===")
    print(f"Equipment ID: {reservation.equipment_id}")
    print(f"Start Date: {reservation.start_date}")
    print(f"End Date: {reservation.end_date}")
    print(f"Reserver Username: {reserver_username}")
    
    if not reserver_username:
        print("ERROR: reserver_username header is required")
        raise HTTPException(status_code=400, detail="reserver_username header is required")
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get equipment details
        cursor.execute("""
            SELECT equipment_id, name, owner_username, daily_price
            FROM equipment
            WHERE equipment_id = %s
        """, (reservation.equipment_id,))
        equipment = cursor.fetchone()
        
        if not equipment:
            print(f"ERROR: Equipment not found with ID {reservation.equipment_id}")
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        print(f"Equipment found: {equipment['name']}, Owner: {equipment['owner_username']}")
        
        # Calculate total price
        days = (reservation.end_date - reservation.start_date).days
        if days <= 0:
            print(f"ERROR: Invalid date range. Days: {days}")
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        total_price = float(equipment['daily_price']) * days
        print(f"Days: {days}, Daily Price: {equipment['daily_price']}, Total: {total_price}")
        
        # Insert new reservation
        cursor.execute("""
            INSERT INTO reservation 
            (equipment_id, owner_username, reserver_username, status, start_date, end_date, per_day_price, total_price)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING reservation_id, equipment_id, owner_username, reserver_username, 
                      status, start_date, end_date, per_day_price, total_price, review_id, created_at
        """, (
            reservation.equipment_id,
            equipment['owner_username'],
            reserver_username,
            'pending',
            reservation.start_date,
            reservation.end_date,
            equipment['daily_price'],
            total_price
        ))
        
        new_reservation = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        print(f"SUCCESS: Reservation created with ID {new_reservation['reservation_id']}")
        print(f"=== END CREATE RESERVATION ===\n")
        return new_reservation
        
    except HTTPException as he:
        conn.rollback()
        cursor.close()
        raise he
    except Exception as e:
        conn.rollback()
        print(f"ERROR during save: {str(e)}")
        print(f"=== END CREATE RESERVATION ===\n")
        cursor.close()
        raise HTTPException(status_code=500, detail=f"Failed to create reservation: {str(e)}")
    finally:
        conn.close()

# GET all reservations for reserver
@router.get("/reserver/{username}", response_model=list[ReservationResponse])
def get_reserver_reservations(username: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT reservation_id, equipment_id, owner_username, reserver_username, 
                   status, start_date, end_date, per_day_price, total_price, review_id, created_at
            FROM reservation
            WHERE reserver_username = %s
        """, (username,))
        reservations = cursor.fetchall()
        cursor.close()
        return reservations
    finally:
        conn.close()

# GET all reservations for owner
@router.get("/owner/{username}", response_model=list[ReservationResponse])
def get_owner_reservations(username: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT reservation_id, equipment_id, owner_username, reserver_username, 
                   status, start_date, end_date, per_day_price, total_price, review_id, created_at
            FROM reservation
            WHERE owner_username = %s
        """, (username,))
        reservations = cursor.fetchall()
        cursor.close()
        return reservations
    finally:
        conn.close()

# GET specific reservation
@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(reservation_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT reservation_id, equipment_id, owner_username, reserver_username, 
                   status, start_date, end_date, per_day_price, total_price, review_id, created_at
            FROM reservation
            WHERE reservation_id = %s
        """, (reservation_id,))
        reservation = cursor.fetchone()
        cursor.close()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        return reservation
    finally:
        conn.close()

# UPDATE reservation status
@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation_update: ReservationUpdate,
    owner_username: str = Header(None, convert_underscores=False)
):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT reservation_id, equipment_id, owner_username, reserver_username, 
                   status, start_date, end_date, per_day_price, total_price, review_id, created_at
            FROM reservation
            WHERE reservation_id = %s
        """, (reservation_id,))
        reservation = cursor.fetchone()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Only owner or reserver can update
        if owner_username != reservation['owner_username'] and owner_username != reservation['reserver_username']:
            raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
        
        # Build update query dynamically
        update_data = reservation_update.dict(exclude_unset=True)
        if not update_data:
            return reservation
        
        set_clauses = []
        values = []
        for field, value in update_data.items():
            if value is not None:
                set_clauses.append(f"{field} = %s")
                values.append(value)
        
        values.append(reservation_id)
        
        query = f"""
            UPDATE reservation
            SET {', '.join(set_clauses)}
            WHERE reservation_id = %s
            RETURNING reservation_id, equipment_id, owner_username, reserver_username, 
                      status, start_date, end_date, per_day_price, total_price, review_id, created_at
        """
        
        cursor.execute(query, values)
        updated_reservation = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        return updated_reservation
    finally:
        conn.close()

# DELETE reservation
@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    reserver_username: str = Header(None, convert_underscores=False)
):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT reservation_id, reserver_username, status
            FROM reservation
            WHERE reservation_id = %s
        """, (reservation_id,))
        reservation = cursor.fetchone()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reserver_username != reservation['reserver_username']:
            raise HTTPException(status_code=403, detail="Only reserver can delete reservation")
        
        if reservation['status'] != 'pending':
            raise HTTPException(status_code=400, detail="Can only delete pending reservations")
        
        cursor.execute("""
            DELETE FROM reservation
            WHERE reservation_id = %s
        """, (reservation_id,))
        
        conn.commit()
        cursor.close()
        
        return {"message": "Reservation deleted successfully"}
    finally:
        conn.close()

# GET total earnings for a user (owner)
@router.get("/earnings/{owner_username}")
def get_total_earnings(owner_username: str):
    """
    Calculate total earnings for an owner by summing all returned and completed reservations' total_price
    where the owner_username matches and status is 'returned' or 'completed'
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT COALESCE(SUM(total_price), 0) as total_earnings
            FROM reservation
            WHERE owner_username = %s AND status IN ('returned', 'completed')
        """, (owner_username,))
        result = cursor.fetchone()
        cursor.close()
        
        total_earnings = float(result['total_earnings']) if result else 0
        
        return {
            "owner_username": owner_username,
            "total_earnings": total_earnings,
            "currency": "BDT"
        }
    finally:
        conn.close()


# GET earnings breakdown for a user (owner) - with details
@router.get("/earnings-details/{owner_username}")
def get_earnings_details(owner_username: str):
    """
    Get detailed earnings breakdown for an owner including completed reservations
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT reservation_id, equipment_id, reserver_username, start_date, end_date, total_price, status
            FROM reservation
            WHERE owner_username = %s AND status = 'completed'
        """, (owner_username,))
        completed_reservations = cursor.fetchall()
        cursor.close()
        
        total_earnings = sum(float(res['total_price']) for res in completed_reservations)
        
        return {
            "owner_username": owner_username,
            "total_earnings": total_earnings,
            "completed_reservations_count": len(completed_reservations),
            "reservations": [
                {
                    "reservation_id": res['reservation_id'],
                    "equipment_id": res['equipment_id'],
                    "reserver_username": res['reserver_username'],
                    "start_date": res['start_date'].isoformat() if hasattr(res['start_date'], 'isoformat') else str(res['start_date']),
                    "end_date": res['end_date'].isoformat() if hasattr(res['end_date'], 'isoformat') else str(res['end_date']),
                    "total_price": float(res['total_price']),
                    "status": res['status']
                }
                for res in completed_reservations
            ],
            "currency": "BDT"
        }
    finally:
        conn.close()