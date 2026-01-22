from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from .models import Review, Reservation, Equipment
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()


class ReviewCreate(BaseModel):
    reservation_id: int
    equipment_id: int
    rating: int
    comment: str = None


class ReviewResponse(BaseModel):
    review_id: int
    reservation_id: int
    equipment_id: int
    reviewer_username: str
    owner_username: str
    rating: int
    comment: str = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# CREATE review
@router.post("/review/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Get reservation details
    result = await db.execute(
        select(Reservation).where(Reservation.reservation_id == review_data.reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.status not in ["returned", "completed"]:
        raise HTTPException(status_code=400, detail="Can only review returned or completed rentals")

    # Check if review already exists
    existing_review = await db.execute(
        select(Review).where(Review.reservation_id == review_data.reservation_id)
    )
    if existing_review.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Review already exists for this reservation")

    # Create review
    new_review = Review(
        reservation_id=review_data.reservation_id,
        equipment_id=review_data.equipment_id,
        reviewer_username=reservation.reserver_username,
        owner_username=reservation.owner_username,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)

    # Update equipment rating
    result = await db.execute(
        select(Review).where(Review.equipment_id == review_data.equipment_id)
    )
    reviews = result.scalars().all()

    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        equipment = await db.get(Equipment, review_data.equipment_id)
        equipment.rating_avg = float(avg_rating)
        equipment.rating_count = len(reviews)
        await db.commit()

    return new_review


# GET reviews for equipment
@router.get("/review/equipment/{equipment_id}", response_model=List[ReviewResponse])
async def get_equipment_reviews(
    equipment_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Review)
        .where(Review.equipment_id == equipment_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return reviews


# GET reviews for reservation
@router.get("/review/reservation/{reservation_id}", response_model=ReviewResponse)
async def get_reservation_review(
    reservation_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Review).where(Review.reservation_id == reservation_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return review


# DELETE review
@router.delete("/review/{review_id}")
async def delete_review(
    review_id: int,
    reviewer_username: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Review).where(Review.review_id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.reviewer_username != reviewer_username:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    equipment_id = review.equipment_id

    await db.delete(review)
    await db.commit()

    # Recalculate equipment rating
    result = await db.execute(
        select(Review).where(Review.equipment_id == equipment_id)
    )
    reviews = result.scalars().all()

    equipment = await db.get(Equipment, equipment_id)
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        equipment.rating_avg = float(avg_rating)
        equipment.rating_count = len(reviews)
    else:
        equipment.rating_avg = 0.0
        equipment.rating_count = 0

    await db.commit()

    return {"message": "Review deleted successfully"}

# GET average rating for an owner (based on reviews of their equipment)
@router.get("/owner/{owner_username}/average-rating")
async def get_owner_average_rating(
    owner_username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate average rating for an owner by averaging all reviews 
    from returned or completed rentals where owner_username matches
    """
    result = await db.execute(
        select(func.avg(Review.rating)).where(
            Review.owner_username == owner_username
        )
    )
    average_rating = result.scalar() or 0.0
    
    # Get count of reviews
    count_result = await db.execute(
        select(func.count(Review.review_id)).where(
            Review.owner_username == owner_username
        )
    )
    review_count = count_result.scalar() or 0
    
    return {
        "owner_username": owner_username,
        "average_rating": float(average_rating) if average_rating else 0.0,
        "total_reviews": review_count,
        "scale": 5
    }


# GET detailed rating breakdown for an owner
@router.get("/owner/{owner_username}/rating-details")
async def get_owner_rating_details(
    owner_username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed rating breakdown for an owner including all reviews on their equipment
    """
    result = await db.execute(
        select(Review).where(
            Review.owner_username == owner_username
        ).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    
    if not reviews:
        return {
            "owner_username": owner_username,
            "average_rating": 0.0,
            "total_reviews": 0,
            "rating_distribution": {
                "5_star": 0,
                "4_star": 0,
                "3_star": 0,
                "2_star": 0,
                "1_star": 0
            },
            "reviews": []
        }
    
    # Calculate rating distribution
    rating_distribution = {
        "5_star": len([r for r in reviews if r.rating == 5]),
        "4_star": len([r for r in reviews if r.rating == 4]),
        "3_star": len([r for r in reviews if r.rating == 3]),
        "2_star": len([r for r in reviews if r.rating == 2]),
        "1_star": len([r for r in reviews if r.rating == 1])
    }
    
    average_rating = sum(r.rating for r in reviews) / len(reviews)
    
    return {
        "owner_username": owner_username,
        "average_rating": float(average_rating),
        "total_reviews": len(reviews),
        "rating_distribution": rating_distribution,
        "reviews": [
            {
                "review_id": r.review_id,
                "equipment_id": r.equipment_id,
                "reviewer_username": r.reviewer_username,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat()
            }
            for r in reviews
        ]
    }