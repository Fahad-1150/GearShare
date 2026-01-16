from sqlalchemy import Column, String, Boolean, TIMESTAMP, text
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
