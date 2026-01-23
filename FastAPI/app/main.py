from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .auth import router as auth_router
from .equipment import router as equipment_router
from .reservation import router as reservation_router
from .users import router as users_router
from .reports import router as reports_router
from .review import router as review_router

# Create static directory for images if it doesn't exist
os.makedirs("static/images", exist_ok=True)

app = FastAPI(
    title="GearShare API",
    version="1.0.0"
)

# Add CORS middleware FIRST (before any routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {"message": "GearShare API running"}


# Include authentication routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Include users routes
app.include_router(users_router, prefix="/users", tags=["Users"])

# Include equipment routes
app.include_router(equipment_router, prefix="/equipment", tags=["Equipment"])

# Include reservation routes
app.include_router(reservation_router, prefix="/reservation", tags=["Reservation"])

# Include reports routes
app.include_router(reports_router, prefix="/reports", tags=["Reports"])

# Include review routes
app.include_router(review_router, prefix="/review", tags=["Reviews"])