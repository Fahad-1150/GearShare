# SQLAlchemy to PycopG2 Conversion Examples

This document shows side-by-side before and after examples of the conversion.

## Basic SELECT Query

### Before (SQLAlchemy)
```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Equipment

async def get_equipment(equipment_id: int, db: AsyncSession):
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    return equipment
```

### After (PycopG2)
```python
from psycopg2.extras import RealDictCursor
from .database import get_db

def get_equipment(equipment_id: int):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM equipment WHERE equipment_id = %s
        """, (equipment_id,))
        equipment = cursor.fetchone()
        cursor.close()
        return equipment
    finally:
        conn.close()
```

**Key Changes**:
- Removed `async`/`await`
- Replaced ORM `select()` with raw SQL
- Used parameterized query with `%s` placeholder
- Manual connection/cursor management
- RealDictCursor for dict-like result access

---

## INSERT with RETURNING

### Before (SQLAlchemy)
```python
async def create_equipment(
    name: str,
    category: str,
    daily_price: float,
    owner_username: str,
    db: AsyncSession
):
    new_equipment = Equipment(
        name=name,
        category=category,
        daily_price=daily_price,
        owner_username=owner_username,
        status='available'
    )
    
    db.add(new_equipment)
    await db.commit()
    await db.refresh(new_equipment)
    
    return new_equipment
```

### After (PycopG2)
```python
def create_equipment(
    name: str,
    category: str,
    daily_price: float,
    owner_username: str
):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            INSERT INTO equipment (name, category, daily_price, owner_username, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING equipment_id, name, category, daily_price, owner_username, status
        """, (name, category, daily_price, owner_username, 'available'))
        
        new_equipment = cursor.fetchone()
        conn.commit()
        cursor.close()
        return new_equipment
    finally:
        conn.close()
```

**Key Changes**:
- ORM object creation → SQL INSERT
- `db.add()` + `db.commit()` → direct `cursor.execute()` + `conn.commit()`
- `RETURNING` clause to get inserted record
- Explicit list of returned columns (safer)

---

## Complex WHERE Clause with OR

### Before (SQLAlchemy)
```python
from sqlalchemy import or_

async def get_all_equipment(category: str = None, user: str = None, db: AsyncSession):
    if user:
        query = select(Equipment).where(
            or_(Equipment.status != 'unavailable', Equipment.owner_username == user)
        )
    else:
        query = select(Equipment).where(Equipment.status != 'unavailable')
    
    if category and category != 'All':
        query = query.where(Equipment.category == category)
    
    result = await db.execute(query)
    equipment = result.scalars().all()
    return equipment
```

### After (PycopG2)
```python
def get_all_equipment(category: str = None, user: str = None):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if user:
            if category and category != 'All':
                cursor.execute("""
                    SELECT * FROM equipment
                    WHERE (status != %s OR owner_username = %s) AND category = %s
                """, ('unavailable', user, category))
            else:
                cursor.execute("""
                    SELECT * FROM equipment
                    WHERE (status != %s OR owner_username = %s)
                """, ('unavailable', user))
        else:
            if category and category != 'All':
                cursor.execute("""
                    SELECT * FROM equipment
                    WHERE status != %s AND category = %s
                """, ('unavailable', category))
            else:
                cursor.execute("""
                    SELECT * FROM equipment
                    WHERE status != %s
                """, ('unavailable',))
        
        equipment = cursor.fetchall()
        cursor.close()
        return equipment
    finally:
        conn.close()
```

**Key Changes**:
- ORM `or_()` function → SQL `OR` operator
- Query building with `query.where()` → conditional SQL strings
- ORM filter chaining → explicit SQL WHERE clauses
- `.scalars().all()` → `.fetchall()`

---

## UPDATE with Conditional Fields

### Before (SQLAlchemy)
```python
async def update_equipment(
    equipment_id: int,
    update_data: EquipmentUpdate,
    db: AsyncSession
):
    equipment = await db.get(Equipment, equipment_id)
    
    if not equipment:
        raise HTTPException(status_code=404)
    
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            setattr(equipment, field, value)
    
    await db.commit()
    await db.refresh(equipment)
    return equipment
```

### After (PycopG2)
```python
def update_equipment(equipment_id: int, update_data: EquipmentUpdate):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get current record
        cursor.execute("SELECT * FROM equipment WHERE equipment_id = %s", (equipment_id,))
        equipment = cursor.fetchone()
        
        if not equipment:
            raise HTTPException(status_code=404)
        
        # Build dynamic update
        updates = {}
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            if value is not None:
                updates[field] = value
        
        if not updates:
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
            RETURNING *
        """
        
        cursor.execute(query, values)
        updated_equipment = cursor.fetchone()
        conn.commit()
        cursor.close()
        return updated_equipment
    finally:
        conn.close()
```

**Key Changes**:
- ORM `setattr()` → SQL UPDATE statement
- Dynamic query building with string concatenation (safe with parameterized values)
- `.refresh()` → `RETURNING *` clause
- Manual update validation

---

## Aggregation Functions

### Before (SQLAlchemy)
```python
from sqlalchemy import func

async def get_total_earnings(owner_username: str, db: AsyncSession):
    result = await db.execute(
        select(func.sum(Reservation.total_price)).where(
            (Reservation.owner_username == owner_username) &
            (Reservation.status.in_(['returned', 'completed']))
        )
    )
    total_earnings = result.scalar() or 0
    return {"total_earnings": float(total_earnings)}
```

### After (PycopG2)
```python
def get_total_earnings(owner_username: str):
    conn = get_db()
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
        return {"total_earnings": total_earnings}
    finally:
        conn.close()
```

**Key Changes**:
- `func.sum()` → SQL `SUM()` function
- `func.in_()` → SQL `IN` operator
- `&` logical AND → SQL `AND`
- `COALESCE()` for NULL handling
- `.scalar()` → accessing dict field

---

## Complex Rating Calculation

### Before (SQLAlchemy)
```python
async def get_owner_rating_details(owner_username: str, db: AsyncSession):
    result = await db.execute(
        select(Review).where(
            Review.owner_username == owner_username
        ).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    
    if not reviews:
        return {"total_reviews": 0, "reviews": []}
    
    rating_distribution = {
        "5_star": len([r for r in reviews if r.rating == 5]),
        "4_star": len([r for r in reviews if r.rating == 4]),
        # ... etc
    }
    
    average_rating = sum(r.rating for r in reviews) / len(reviews)
    
    return {
        "average_rating": float(average_rating),
        "total_reviews": len(reviews),
        "rating_distribution": rating_distribution,
        "reviews": [...]
    }
```

### After (PycopG2)
```python
def get_owner_rating_details(owner_username: str):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT review_id, equipment_id, reviewer_username, rating, comment, created_at
            FROM review
            WHERE owner_username = %s
            ORDER BY created_at DESC
        """, (owner_username,))
        
        reviews = cursor.fetchall()
        cursor.close()
        
        if not reviews:
            return {"total_reviews": 0, "reviews": []}
        
        # Same calculation logic
        rating_distribution = {
            "5_star": len([r for r in reviews if r['rating'] == 5]),
            "4_star": len([r for r in reviews if r['rating'] == 4]),
            # ... etc
        }
        
        average_rating = sum(r['rating'] for r in reviews) / len(reviews)
        
        return {
            "average_rating": float(average_rating),
            "total_reviews": len(reviews),
            "rating_distribution": rating_distribution,
            "reviews": [...]
        }
    finally:
        conn.close()
```

**Key Changes**:
- ORM relationship handling → SQL JOIN (if needed) or separate queries
- Dictionary field access `r['rating']` instead of `r.rating`
- Business logic remains identical
- No change to calculation methods

---

## Error Handling & Transactions

### Before (SQLAlchemy)
```python
async def create_reservation(data: ReservationCreate, db: AsyncSession):
    try:
        equipment = await db.get(Equipment, data.equipment_id)
        if not equipment:
            raise HTTPException(404)
        
        # ... create reservation logic
        
        db.add(new_reservation)
        await db.commit()
        await db.refresh(new_reservation)
        return new_reservation
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(500)
```

### After (PycopG2)
```python
def create_reservation(data: ReservationCreate):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM equipment WHERE equipment_id = %s", (data.equipment_id,))
        equipment = cursor.fetchone()
        
        if not equipment:
            raise HTTPException(404)
        
        # ... create reservation logic
        
        cursor.execute("""
            INSERT INTO reservation (...)
            VALUES (...) RETURNING *
        """, (...))
        
        new_reservation = cursor.fetchone()
        conn.commit()
        cursor.close()
        return new_reservation
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500)
    finally:
        conn.close()
```

**Key Changes**:
- No `await` on database operations
- Explicit `conn.rollback()` on error
- `finally` block ensures connection closure
- Same exception handling logic

---

## File Upload Handling

### Before (SQLAlchemy)
```python
async def create_equipment(
    photo: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    if photo:
        contents = await photo.read()  # ← async
        photo_binary = base64.b64encode(contents).decode("utf-8")
```

### After (PycopG2)
```python
def create_equipment(photo: UploadFile = File(None)):
    if photo:
        contents = photo.file.read()  # ← synchronous, different API
        photo_binary = base64.b64encode(contents).decode("utf-8")
```

**Key Changes**:
- `await photo.read()` → `photo.file.read()` (SpooledTemporaryFile object)
- No async context manager needed
- Same base64 encoding logic

---

## Connection Management Pattern

### Pattern Used Throughout All Files
```python
from .database import get_db
from psycopg2.extras import RealDictCursor

def endpoint_function():
    conn = get_db()  # Get connection
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # ... perform operations
        cursor.execute(sql, params)
        result = cursor.fetchone()  # or fetchall()
        
        conn.commit()  # Commit transaction
        cursor.close()  # Clean up cursor
        
        return result
    except SpecificException:
        # Handle specific errors
        raise
    except Exception as e:
        conn.rollback()  # Rollback on error
        raise HTTPException(500, detail=str(e))
    finally:
        conn.close()  # Always close connection
```

**Best Practices**:
1. Always use parameterized queries (`%s` placeholders)
2. Always close cursor and connection in finally block
3. Only commit when operation succeeds
4. Rollback on exceptions
5. Use RealDictCursor for dict-style access
6. Return actual SQL columns needed (not `SELECT *` when possible)

---

## Testing Notes

When testing the converted application:

1. **Verify SQL Syntax**: Run SQL queries directly in PostgreSQL to verify syntax
2. **Check Parameterization**: Ensure all user input is parameterized (no f-strings in SQL)
3. **Test Transactions**: Verify rollback behavior on errors
4. **Connection Cleanup**: Monitor for connection leaks
5. **Response Format**: Ensure responses match expected JSON structure
6. **Error Codes**: Verify HTTP status codes are correct
7. **File Uploads**: Test photo upload and base64 encoding
8. **Calculations**: Verify aggregations and math operations
9. **Async Removal**: Confirm no async/await in endpoints

---

## Performance Considerations

- **Pros**: Direct SQL often faster than ORM
- **Cons**: No query optimization from SQLAlchemy
- **Neutral**: Synchronous requests may handle fewer concurrent users
- **Recommendation**: Monitor response times in production

---

**Created**: January 23, 2026  
**Purpose**: Educational reference for SQLAlchemy → PycopG2 conversion
