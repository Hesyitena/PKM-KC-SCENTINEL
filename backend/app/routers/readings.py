"""
SCENTINEL - Readings Router
POST /readings           →  Ingest from ESP32 (API Key auth)
GET  /readings/latest    →  Get latest reading (JWT)
GET  /readings/history   →  Paginated history (JWT)
GET  /readings/export    →  Export CSV (JWT)
"""
from datetime import datetime
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
import io

from app.core.dependencies import CurrentUser, ESP32Auth, DBSession
from app.models.reading import PredictionLabel
from app.schemas.reading import ReadingCreate, ReadingResponse, PaginatedReadings, ReadingLatestResponse
from app.services.reading_service import ReadingService

router = APIRouter()


@router.post(
    "/",
    response_model=ReadingResponse,
    status_code=201,
    summary="Submit Sensor Reading (ESP32)",
)
async def submit_reading(
    payload: ReadingCreate,
    db: DBSession,
    _api_key: ESP32Auth,
):
    """
    Endpoint for ESP32 to submit sensor readings.
    Authentication: X-API-Key header (static).
    """
    service = ReadingService(db)
    return await service.ingest_reading(payload)


@router.get(
    "/latest",
    response_model=ReadingLatestResponse,
    summary="Get Latest Sensor Reading",
)
async def get_latest(
    device_id: int | None = Query(None),
    current_user: CurrentUser = ...,
    db: DBSession = ...,
):
    """Get the most recent sensor reading, optionally filtered by device."""
    service = ReadingService(db)
    return await service.get_latest(device_id)


@router.get(
    "/history",
    response_model=PaginatedReadings,
    summary="Get Reading History",
)
async def get_history(
    device_id: int | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    prediction: PredictionLabel | None = Query(None),
    food_name: str | None = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: CurrentUser = ...,
    db: DBSession = ...,
):
    """Get paginated sensor reading history with optional filters."""
    service = ReadingService(db)
    return await service.get_history(
        device_id=device_id,
        start_date=start_date,
        end_date=end_date,
        prediction=prediction,
        food_name=food_name,
        limit=limit,
        offset=offset,
    )


@router.delete(
    "/all",
    summary="Delete All Sensor Readings",
    status_code=200,
)
async def delete_all_readings(
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Permanently delete ALL sensor readings from the database.
    This action cannot be undone.
    """
    service = ReadingService(db)
    return await service.delete_all_readings()


@router.get("/export", summary="Export Readings as CSV")
async def export_csv(
    device_id: int | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    current_user: CurrentUser = ...,
    db: DBSession = ...,
):
    """Export sensor readings as a downloadable CSV file."""
    service = ReadingService(db)
    csv_content = await service.export_csv(device_id, start_date, end_date)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scentinel_readings.csv"},
    )
