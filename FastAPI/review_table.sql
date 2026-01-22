-- Review Table for GearShare
-- Use this SQL in pgAdmin or psql to create the table

-- DROP existing table if it exists
DROP TABLE IF EXISTS review CASCADE;

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    
    reservation_id INTEGER NOT NULL,
    equipment_id INTEGER NOT NULL,
    
    -- Reviewer (the person who rented)
    reviewer_username VARCHAR(255) NOT NULL,
    
    -- Owner (the equipment owner)
    owner_username VARCHAR(255) NOT NULL,
    
    -- Rating: 1-5 stars
    rating INTEGER NOT NULL,
    CHECK (rating >= 1 AND rating <= 5),
    
    -- Review comment/text
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_review_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservation(reservation_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_review_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_review_reviewer
        FOREIGN KEY (reviewer_username)
        REFERENCES "User"("UserName_PK")
        ON DELETE CASCADE,
    
    CONSTRAINT fk_review_owner
        FOREIGN KEY (owner_username)
        REFERENCES "User"("UserName_PK")
        ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_review_equipment ON review(equipment_id);
CREATE INDEX idx_review_reviewer ON review(reviewer_username);
CREATE INDEX idx_review_owner ON review(owner_username);
CREATE INDEX idx_review_reservation ON review(reservation_id);

-- Optional: Add unique constraint to prevent duplicate reviews for same reservation
ALTER TABLE review ADD CONSTRAINT uq_review_reservation UNIQUE (reservation_id);

-- Note: 
-- - review_id: Unique identifier for each review
-- - reservation_id: Links to the rental that was completed
-- - equipment_id: Equipment being reviewed
-- - reviewer_username: User who rented and is writing the review (reserver)
-- - owner_username: Equipment owner receiving the review
-- - rating: 1-5 star rating
-- - comment: Detailed review text (optional)
-- - CASCADE deletion ensures reviews are deleted if reservation or equipment is deleted
