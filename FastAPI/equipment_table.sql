-- Create the Equipment table
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    -- Image storage
    photo_url TEXT,
    photo_binary BYTEA,

    owner_username VARCHAR(255) NOT NULL,

    category VARCHAR(100),

    daily_price NUMERIC(10,2) NOT NULL,

    -- Availability
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    booked_till DATE,

    pickup_location VARCHAR(255),

    -- Ratings (aggregated)
    rating_avg NUMERIC(2,1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_owner
        FOREIGN KEY (owner_username)
        REFERENCES "User"(UserName_PK)
        ON DELETE CASCADE,

    CONSTRAINT chk_status
        CHECK (status IN ('available', 'booked', 'unavailable'))
);

-- Create indexes for faster queries
CREATE INDEX idx_equipment_owner ON equipment(owner_username);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
