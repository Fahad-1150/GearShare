from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date

from .database import get_db
from .models import Reservation, Equipment, User
from .schemas import ReservationCreate, ReservationUpdate, ReservationResponse

router = APIRouter()


# GET all reservations
@router.get("/", response_model=list[ReservationResponse])
async def get_all_reservations(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Reservation))
    reservations = result.scalars().all()
    return reservations


# CREATE reservation
@router.post("/", response_model=ReservationResponse)
async def create_reservation(
    reservation: ReservationCreate,
    reserver_username: str = Header(None, convert_underscores=False),
    db: AsyncSession = Depends(get_db)
):
    print(f"\n=== CREATE RESERVATION REQUEST ===")
    print(f"Equipment ID: {reservation.equipment_id}")
    print(f"Start Date: {reservation.start_date}")
    print(f"End Date: {reservation.end_date}")
    print(f"Reserver Username: {reserver_username}")
    
    if not reserver_username:
        print("ERROR: reserver_username header is required")
        raise HTTPException(status_code=400, detail="reserver_username header is required")
    
    # Get equipment details
    equipment_result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == reservation.equipment_id)
    )
    equipment = equipment_result.scalar_one_or_none()
    
    if not equipment:
        print(f"ERROR: Equipment not found with ID {reservation.equipment_id}")
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    print(f"Equipment found: {equipment.name}, Owner: {equipment.owner_username}")
    
    # Calculate total price
    days = (reservation.end_date - reservation.start_date).days
    if days <= 0:
        print(f"ERROR: Invalid date range. Days: {days}")
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    total_price = float(equipment.daily_price) * days
    print(f"Days: {days}, Daily Price: {equipment.daily_price}, Total: {total_price}")
    
    new_reservation = Reservation(
        equipment_id=reservation.equipment_id,
        owner_username=equipment.owner_username,
        reserver_username=reserver_username,
        status='pending',
        start_date=reservation.start_date,
        end_date=reservation.end_date,
        per_day_price=equipment.daily_price,
        total_price=total_price
    )
    
    try:
        db.add(new_reservation)
        await db.commit()
        await db.refresh(new_reservation)
        print(f"SUCCESS: Reservation created with ID {new_reservation.reservation_id}")
        print(f"=== END CREATE RESERVATION ===\n")
        return new_reservation
    except Exception as e:
        print(f"ERROR during save: {str(e)}")
        print(f"=== END CREATE RESERVATION ===\n")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create reservation: {str(e)}")


# GET all reservations for reserver
@router.get("/reserver/{username}", response_model=list[ReservationResponse])
async def get_reserver_reservations(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reservation).where(Reservation.reserver_username == username)
    )
    reservations = result.scalars().all()
    return reservations


# GET all reservations for owner
@router.get("/owner/{username}", response_model=list[ReservationResponse])
async def get_owner_reservations(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reservation).where(Reservation.owner_username == username)
    )
    reservations = result.scalars().all()
    return reservations


# GET specific reservation
@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reservation).where(Reservation.reservation_id == reservation_id)
    )
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return reservation


# UPDATE reservation status
@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: int,
    reservation_update: ReservationUpdate,
    owner_username: str = Header(None, convert_underscores=False),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reservation).where(Reservation.reservation_id == reservation_id)
    )
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Only owner or reserver can update
    if owner_username != reservation.owner_username and owner_username != reservation.reserver_username:
        raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    update_data = reservation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(reservation, field, value)
    
    await db.commit()
    await db.refresh(reservation)
    
    return reservation


# DELETE reservation
@router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    reserver_username: str = Header(None, convert_underscores=False),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reservation).where(Reservation.reservation_id == reservation_id)
    )
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reserver_username != reservation.reserver_username:
        raise HTTPException(status_code=403, detail="Only reserver can delete reservation")
    
    if reservation.status != 'pending':
        raise HTTPException(status_code=400, detail="Can only delete pending reservations")
    
    await db.delete(reservation)
    await db.commit()
    
    return {"message": "Reservation deleted successfully"}

# GET total earnings for a user (owner)
@router.get("/earnings/{owner_username}")
async def get_total_earnings(
    owner_username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate total earnings for an owner by summing all returned and completed reservations' total_price
    where the owner_username matches and status is 'returned' or 'completed'
    """
    result = await db.execute(
        select(func.sum(Reservation.total_price)).where(
            (Reservation.owner_username == owner_username) & 
            (Reservation.status.in_(['returned', 'completed']))
        )
    )
    total_earnings = result.scalar() or 0
    
    return {
        "owner_username": owner_username,
        "total_earnings": float(total_earnings),
        "currency": "BDT"
    }


# GET earnings breakdown for a user (owner) - with details
@router.get("/earnings-details/{owner_username}")
async def get_earnings_details(
    owner_username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed earnings breakdown for an owner including completed reservations
    """
    result = await db.execute(
        select(Reservation).where(
            (Reservation.owner_username == owner_username) & 
            (Reservation.status == 'completed')
        )
    )
    completed_reservations = result.scalars().all()
    
    total_earnings = sum(float(res.total_price) for res in completed_reservations)
    
    return {
        "owner_username": owner_username,
        "total_earnings": total_earnings,
        "completed_reservations_count": len(completed_reservations),
        "reservations": [
            {
                "reservation_id": res.reservation_id,
                "equipment_id": res.equipment_id,
                "reserver_username": res.reserver_username,
                "start_date": res.start_date.isoformat(),
                "end_date": res.end_date.isoformat(),
                "total_price": float(res.total_price),
                "status": res.status
            }
            for res in completed_reservations
        ],
        "currency": "BDT"
    }