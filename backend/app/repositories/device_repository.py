"""
SCENTINEL - Device Repository
Data access layer for Device model.
"""
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device, DeviceStatus


class DeviceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, device_id: int) -> Device | None:
        result = await self.db.execute(select(Device).where(Device.id == device_id))
        return result.scalar_one_or_none()

    async def get_by_serial(self, serial_number: str) -> Device | None:
        result = await self.db.execute(
            select(Device).where(Device.serial_number == serial_number)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Device]:
        result = await self.db.execute(select(Device).order_by(Device.device_name))
        return list(result.scalars().all())

    async def create(self, device: Device) -> Device:
        self.db.add(device)
        await self.db.flush()
        await self.db.refresh(device)
        return device

    async def update(self, device: Device) -> Device:
        await self.db.flush()
        await self.db.refresh(device)
        return device

    async def update_last_seen(self, device_id: int) -> None:
        """Mark device as ONLINE and update last_seen timestamp."""
        result = await self.db.execute(select(Device).where(Device.id == device_id))
        device = result.scalar_one_or_none()
        if device:
            device.last_seen = datetime.now(timezone.utc)
            device.status = DeviceStatus.ONLINE
            await self.db.flush()

    async def delete(self, device: Device) -> None:
        await self.db.delete(device)
        await self.db.flush()
