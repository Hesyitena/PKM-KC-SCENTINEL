"""
SCENTINEL Backend - Main Application Entry Point
FastAPI application with CORS, routers, and startup events.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import engine, Base
from app.routers import auth, devices, readings, stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Create tables on startup (handled by Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    await engine.dispose()


app = FastAPI(
    title="SCENTINEL API",
    description="IoT Monitoring System for Food Spoilage Detection using Edge AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(readings.router, prefix="/api/readings", tags=["Sensor Readings"])
app.include_router(stream.router, prefix="/api", tags=["Realtime SSE"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "SCENTINEL API", "version": "1.0.0"}


@app.get("/api", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to SCENTINEL API",
        "docs": "/api/docs",
        "health": "/api/health"
    }
