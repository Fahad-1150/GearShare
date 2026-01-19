-- Reservation table for GearShare
-- Use this SQL in pgAdmin or psql to create the table

CREATE TABLE reservation (
    reservation_id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL,

    owner_username VARCHAR(255) NOT NULL,
    reserver_username VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, returned, completed

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    per_day_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,

    review_id INTEGER NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservation_owner
        FOREIGN KEY (owner_username)
        REFERENCES "User"("UserName_PK")
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_reserver
        FOREIGN KEY (reserver_username)
        REFERENCES "User"("UserName_PK")
        ON DELETE CASCADE,

    CONSTRAINT fk_reservation_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_reservation_status
        CHECK (status IN ('pending','running','returned','completed'))
);

-- Indexes for faster lookups
CREATE INDEX idx_reservation_owner ON reservation(owner_username);
CREATE INDEX idx_reservation_reserver ON reservation(reserver_username);
CREATE INDEX idx_reservation_equipment ON reservation(equipment_id);
CREATE INDEX idx_reservation_status ON reservation(status);

-- Optional: If you have a reviews table, you can add a FK for review_id like:
-- ALTER TABLE reservation ADD CONSTRAINT fk_reservation_review FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE SET NULL;

-- Note: total_price should be calculated by the application as (per_day_price * number_of_days). This file intentionally does not include privacy or sensitive defaults.
