"""
SCENTINEL - Reading Service
Business logic for sensor reading ingestion and retrieval.
Handles SSE event broadcasting.
"""
import asyncio
import json
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reading import SensorReading, PredictionLabel
from app.repositories.reading_repository import ReadingRepository
from app.repositories.device_repository import DeviceRepository
from app.schemas.reading import (
    ReadingCreate, ReadingResponse, PaginatedReadings, ReadingLatestResponse
)
from app.utils.csv_export import generate_csv_content


# Global SSE subscriber queue list
_sse_subscribers: list[asyncio.Queue] = []


def get_sse_subscribers() -> list[asyncio.Queue]:
    return _sse_subscribers


def add_sse_subscriber(queue: asyncio.Queue) -> None:
    _sse_subscribers.append(queue)


def remove_sse_subscriber(queue: asyncio.Queue) -> None:
    if queue in _sse_subscribers:
        _sse_subscribers.remove(queue)


async def broadcast_reading(reading_data: dict) -> None:
    """Broadcast a new reading to all SSE subscribers."""
    dead_queues = []
    for queue in _sse_subscribers:
        try:
            await queue.put(reading_data)
        except Exception:
            dead_queues.append(queue)
    for q in dead_queues:
        remove_sse_subscriber(q)


class ReadingService:
    def __init__(self, db: AsyncSession):
        self.repo = ReadingRepository(db)
        self.device_repo = DeviceRepository(db)

    async def ingest_reading(self, payload: ReadingCreate) -> ReadingResponse:
        """Ingest a new reading from ESP32 and broadcast to SSE clients."""
        # Verify device exists
        device = await self.device_repo.get_by_id(payload.device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Device id={payload.device_id} not found",
            )

        # Create reading
        reading = SensorReading(**payload.model_dump())
        created = await self.repo.create(reading)

        # Update device last_seen and status
        await self.device_repo.update_last_seen(payload.device_id)

        # Serialize for SSE broadcast
        reading_dict = ReadingResponse.model_validate(created).model_dump(mode="json")
        await broadcast_reading(reading_dict)

        return ReadingResponse.model_validate(created)

    async def get_latest(self, device_id: int | None = None) -> ReadingLatestResponse:
        reading = await self.repo.get_latest(device_id)
        if not reading:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No readings found",
            )
        data = ReadingLatestResponse.model_validate(reading)
        if reading.device:
            data.device_name = reading.device.device_name
            data.device_serial = reading.device.serial_number
        return data

    async def get_history(
        self,
        device_id: int | None,
        start_date: datetime | None,
        end_date: datetime | None,
        prediction: PredictionLabel | None,
        limit: int,
        offset: int,
    ) -> PaginatedReadings:
        items, total = await self.repo.get_history(
            device_id=device_id,
            start_date=start_date,
            end_date=end_date,
            prediction=prediction,
            limit=limit,
            offset=offset,
        )
        return PaginatedReadings(
            total=total,
            limit=limit,
            offset=offset,
            items=[ReadingResponse.model_validate(r) for r in items],
        )

    async def export_csv(
        self,
        device_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> str:
        readings = await self.repo.get_all_for_export(device_id, start_date, end_date)
        return generate_csv_content(readings)

    async def delete_all_readings(self) -> dict:
        """Delete all sensor readings from the database."""
        deleted_count = await self.repo.delete_all()
        return {"message": f"{deleted_count} data pembacaan berhasil dihapus.", "deleted": deleted_count}
