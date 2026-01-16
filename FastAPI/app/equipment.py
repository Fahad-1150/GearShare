from fastapi import APIRouter, Depends, HTTPException, Header, File, UploadFile, Form
import base64
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_db
from .models import Equipment
from .schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse

router = APIRouter()


# GET all equipment
@router.get("/", response_model=list[EquipmentResponse])
async def get_all_equipment(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Equipment).where(Equipment.status != 'unavailable')
    
    if category and category != 'All':
        query = query.where(Equipment.category == category)
    
    result = await db.execute(query)
    equipment = result.scalars().all()
    return equipment


# GET equipment by ID
@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(equipment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    return equipment


# GET equipment by owner
@router.get("/owner/{username}", response_model=list[EquipmentResponse])
async def get_user_equipment(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Equipment).where(Equipment.owner_username == username)
    )
    equipment = result.scalars().all()
    return equipment


# CREATE equipment
@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    name: str = Form(...),
    category: str = Form(...),
    daily_price: float = Form(...),
    pickup_location: str = Form(...),
    photo: UploadFile = File(None),
    owner_username: str = Header(..., alias="owner_username"),
    db: AsyncSession = Depends(get_db)
):
    photo_binary_data = None
    if photo:
        # Read file and convert to base64
        contents = await photo.read()
        photo_binary_data = base64.b64encode(contents).decode("utf-8")

    new_equipment = Equipment(
        name=name,
        category=category,
        daily_price=daily_price,
        photo_url=None,
        photo_binary=photo_binary_data,
        pickup_location=pickup_location,
        owner_username=owner_username,
        status='available'
    )
    
    db.add(new_equipment)
    await db.commit()
    await db.refresh(new_equipment)
    
    return new_equipment


# UPDATE equipment
@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_update: EquipmentUpdate,
    owner_username: str = Header(..., alias="owner_username"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment.owner_username != owner_username:
        raise HTTPException(status_code=403, detail="Not authorized to update this equipment")
    
    update_data = equipment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    await db.commit()
    await db.refresh(equipment)
    
    return equipment


# DELETE equipment
@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    owner_username: str = Header(..., alias="owner_username"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Equipment).where(Equipment.equipment_id == equipment_id)
    )
    equipment = result.scalar_one_or_none()
    
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment.owner_username != owner_username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this equipment")
    
    await db.delete(equipment)
    await db.commit()
    
    return {"message": "Equipment deleted successfully"}
