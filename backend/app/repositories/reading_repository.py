"""
SCENTINEL - Reading Repository
Data access layer for SensorReading model with filtering and pagination.
"""
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reading import SensorReading, PredictionLabel


class ReadingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, reading: SensorReading) -> SensorReading:
        self.db.add(reading)
        await self.db.flush()
        await self.db.refresh(reading)
        return reading

    async def get_by_id(self, reading_id: int) -> SensorReading | None:
        result = await self.db.execute(
            select(SensorReading)
            .options(selectinload(SensorReading.device))
            .where(SensorReading.id == reading_id)
        )
        return result.scalar_one_or_none()

    async def get_latest(self, device_id: int | None = None) -> SensorReading | None:
        """Get the single most recent reading, optionally filtered by device."""
        query = (
            select(SensorReading)
            .options(selectinload(SensorReading.device))
            .order_by(SensorReading.timestamp.desc())
            .limit(1)
        )
        if device_id:
            query = query.where(SensorReading.device_id == device_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_history(
        self,
        device_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        prediction: PredictionLabel | None = None,
        food_name: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[SensorReading], int]:
        """Paginated and filtered history. Returns (items, total_count)."""
        filters = []
        if device_id:
            filters.append(SensorReading.device_id == device_id)
        if start_date:
            filters.append(SensorReading.timestamp >= start_date)
        if end_date:
            filters.append(SensorReading.timestamp <= end_date)
        if prediction:
            filters.append(SensorReading.prediction == prediction)
        if food_name:
            filters.append(SensorReading.food_name.ilike(f"%{food_name}%"))

        where_clause = and_(*filters) if filters else True

        # Count query
        count_result = await self.db.execute(
            select(func.count()).select_from(SensorReading).where(where_clause)
        )
        total = count_result.scalar_one()

        # Data query
        result = await self.db.execute(
            select(SensorReading)
            .where(where_clause)
            .order_by(SensorReading.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        return items, total

    async def get_all_for_export(
        self,
        device_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[SensorReading]:
        """Fetch all readings for CSV export (no pagination)."""
        filters = []
        if device_id:
            filters.append(SensorReading.device_id == device_id)
        if start_date:
            filters.append(SensorReading.timestamp >= start_date)
        if end_date:
            filters.append(SensorReading.timestamp <= end_date)

        where_clause = and_(*filters) if filters else True
        result = await self.db.execute(
            select(SensorReading)
            .options(selectinload(SensorReading.device))
            .where(where_clause)
            .order_by(SensorReading.timestamp.asc())
        )
        return list(result.scalars().all())

    async def delete_all(self) -> int:
        """Delete ALL sensor readings from database. Returns count of deleted rows."""
        from sqlalchemy import delete
        result = await self.db.execute(delete(SensorReading))
        return result.rowcount
