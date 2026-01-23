from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from .database import get_db
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
def create_review(review_data: ReviewCreate):
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get reservation details
        cursor.execute("""
            SELECT reservation_id, reserver_username, owner_username, status
            FROM reservation
            WHERE reservation_id = %s
        """, (review_data.reservation_id,))
        reservation = cursor.fetchone()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if reservation['status'] not in ["returned", "completed"]:
            raise HTTPException(status_code=400, detail="Can only review returned or completed rentals")
        
        # Check if review already exists
        cursor.execute("""
            SELECT review_id FROM review
            WHERE reservation_id = %s
        """, (review_data.reservation_id,))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Review already exists for this reservation")
        
        # Create review
        cursor.execute("""
            INSERT INTO review (reservation_id, equipment_id, reviewer_username, owner_username, rating, comment)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING review_id, reservation_id, equipment_id, reviewer_username, owner_username, 
                      rating, comment, created_at, updated_at
        """, (review_data.reservation_id, review_data.equipment_id, 
              reservation['reserver_username'], reservation['owner_username'],
              review_data.rating, review_data.comment))
        
        new_review = cursor.fetchone()
        
        # Update equipment rating
        cursor.execute("""
            SELECT AVG(rating) as avg_rating, COUNT(*) as count
            FROM review
            WHERE equipment_id = %s
        """, (review_data.equipment_id,))
        
        rating_data = cursor.fetchone()
        if rating_data:
            cursor.execute("""
                UPDATE equipment
                SET rating_avg = %s, rating_count = %s
                WHERE equipment_id = %s
            """, (float(rating_data['avg_rating']), rating_data['count'], review_data.equipment_id))
        
        conn.commit()
        cursor.close()
        return new_review
    finally:
        conn.close()


# GET reviews for equipment
@router.get("/review/equipment/{equipment_id}", response_model=List[ReviewResponse])
def get_equipment_reviews(equipment_id: int):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT review_id, reservation_id, equipment_id, reviewer_username, owner_username, 
                   rating, comment, created_at, updated_at
            FROM review
            WHERE equipment_id = %s
            ORDER BY created_at DESC
        """, (equipment_id,))
        reviews = cursor.fetchall()
        cursor.close()
        return reviews
    finally:
        conn.close()


# GET reviews for reservation
@router.get("/review/reservation/{reservation_id}", response_model=ReviewResponse)
def get_reservation_review(reservation_id: int):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT review_id, reservation_id, equipment_id, reviewer_username, owner_username, 
                   rating, comment, created_at, updated_at
            FROM review
            WHERE reservation_id = %s
        """, (reservation_id,))
        review = cursor.fetchone()
        cursor.close()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return review
    finally:
        conn.close()


# DELETE review
@router.delete("/review/{review_id}")
def delete_review(review_id: int, reviewer_username: str):
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT review_id, reviewer_username, equipment_id
            FROM review
            WHERE review_id = %s
        """, (review_id,))
        review = cursor.fetchone()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        if review['reviewer_username'] != reviewer_username:
            raise HTTPException(status_code=403, detail="Not authorized to delete this review")
        
        equipment_id = review['equipment_id']
        
        # Delete review
        cursor.execute("DELETE FROM review WHERE review_id = %s", (review_id,))
        
        # Recalculate equipment rating
        cursor.execute("""
            SELECT AVG(rating) as avg_rating, COUNT(*) as count
            FROM review
            WHERE equipment_id = %s
        """, (equipment_id,))
        
        rating_data = cursor.fetchone()
        if rating_data and rating_data['count'] > 0:
            cursor.execute("""
                UPDATE equipment
                SET rating_avg = %s, rating_count = %s
                WHERE equipment_id = %s
            """, (float(rating_data['avg_rating']), rating_data['count'], equipment_id))
        else:
            cursor.execute("""
                UPDATE equipment
                SET rating_avg = 0.0, rating_count = 0
                WHERE equipment_id = %s
            """, (equipment_id,))
        
        conn.commit()
        cursor.close()
        return {"message": "Review deleted successfully"}
    finally:
        conn.close()


# GET average rating for an owner
@router.get("/owner/{owner_username}/average-rating")
def get_owner_average_rating(owner_username: str):
    """
    Calculate average rating for an owner by averaging all reviews 
    from returned or completed rentals where owner_username matches
    """
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT AVG(rating) as avg_rating, COUNT(review_id) as review_count
            FROM review
            WHERE owner_username = %s
        """, (owner_username,))
        
        result = cursor.fetchone()
        cursor.close()
        
        average_rating = float(result['avg_rating']) if result['avg_rating'] else 0.0
        review_count = result['review_count'] if result else 0
        
        return {
            "owner_username": owner_username,
            "average_rating": average_rating,
            "total_reviews": review_count,
            "scale": 5
        }
    finally:
        conn.close()


# GET detailed rating breakdown for an owner
@router.get("/owner/{owner_username}/rating-details")
def get_owner_rating_details(owner_username: str):
    """
    Get detailed rating breakdown for an owner including all reviews on their equipment
    """
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
            "5_star": len([r for r in reviews if r['rating'] == 5]),
            "4_star": len([r for r in reviews if r['rating'] == 4]),
            "3_star": len([r for r in reviews if r['rating'] == 3]),
            "2_star": len([r for r in reviews if r['rating'] == 2]),
            "1_star": len([r for r in reviews if r['rating'] == 1])
        }
        
        average_rating = sum(r['rating'] for r in reviews) / len(reviews)
        
        return {
            "owner_username": owner_username,
            "average_rating": float(average_rating),
            "total_reviews": len(reviews),
            "rating_distribution": rating_distribution,
            "reviews": [
                {
                    "review_id": r['review_id'],
                    "equipment_id": r['equipment_id'],
                    "reviewer_username": r['reviewer_username'],
                    "rating": r['rating'],
                    "comment": r['comment'],
                    "created_at": r['created_at'].isoformat() if hasattr(r['created_at'], 'isoformat') else str(r['created_at'])
                }
                for r in reviews
            ]
        }
    finally:
        conn.close()
