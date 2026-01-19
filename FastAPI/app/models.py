from sqlalchemy import Column, String, Boolean, TIMESTAMP, text, Integer, Numeric, Date, ForeignKey
from .database import Base

class User(Base):
    __tablename__ = "User"   # Case-sensitive table name

    UserName_PK = Column(
        String(255),
        primary_key=True,
        index=True
    )

    Email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    Password = Column(
        String(255),
        nullable=False
    )

    Role = Column(
        String(50),
        server_default=text("'User'"),
        index=True
    )

    Location = Column(
        String
    )

    VerificationStatus = Column(
        Boolean,
        server_default=text("TRUE")
    )

    CreatedAt = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    UpdatedAt = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )


class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    photo_url = Column(
        String(500)
    )

    photo_binary = Column(
        String
    )

    owner_username = Column(
        String(255),
        ForeignKey("User.UserName_PK", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    category = Column(
        String(100),
        index=True
    )

    daily_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    status = Column(
        String(20),
        server_default=text("'available'"),
        index=True
    )

    booked_till = Column(
        Date
    )

    pickup_location = Column(
        String(255)
    )

    rating_avg = Column(
        Numeric(2, 1),
        server_default=text("0.0")
    )

    rating_count = Column(
        Integer,
        server_default=text("0")
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )


class Reservation(Base):
    __tablename__ = "reservation"

    reservation_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    equipment_id = Column(
        Integer,
        ForeignKey("equipment.equipment_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    owner_username = Column(
        String(255),
        ForeignKey("User.UserName_PK", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    reserver_username = Column(
        String(255),
        ForeignKey("User.UserName_PK", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    status = Column(
        String(20),
        server_default=text("'pending'"),
        index=True
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    per_day_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    total_price = Column(
        Numeric(12, 2),
        nullable=False
    )

    review_id = Column(
        Integer,
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )


