from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from .database import engine, Base
from .auth import router as auth_router
from .equipment import router as equipment_router
from .reservation import router as reservation_router
# Create static directory for images if it doesn't exist
# This must be done BEFORE app.mount is called to prevent RuntimeError
os.makedirs("static/images", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield

app = FastAPI(
    title="GearShare API",
    version="1.0.0",
    lifespan=lifespan
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
async def root():
    return {"message": "GearShare API running"}

# Include authentication routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Include equipment routes
app.include_router(equipment_router, prefix="/equipment", tags=["Equipment"])
# Include reservation routes
app.include_router(reservation_router, prefix="/reservation", tags=["Reservation"])