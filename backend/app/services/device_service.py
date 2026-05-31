"""
SCENTINEL - Device Service
Business logic for IoT device management.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate


class DeviceService:
    def __init__(self, db: AsyncSession):
        self.repo = DeviceRepository(db)

    async def get_all_devices(self) -> list[DeviceResponse]:
        devices = await self.repo.get_all()
        return [DeviceResponse.model_validate(d) for d in devices]

    async def get_device_by_id(self, device_id: int) -> DeviceResponse:
        device = await self.repo.get_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Device with id={device_id} not found",
            )
        return DeviceResponse.model_validate(device)

    async def create_device(self, payload: DeviceCreate) -> DeviceResponse:
        existing = await self.repo.get_by_serial(payload.serial_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Device with serial '{payload.serial_number}' already exists",
            )
        device = Device(**payload.model_dump())
        created = await self.repo.create(device)
        return DeviceResponse.model_validate(created)

    async def update_device(self, device_id: int, payload: DeviceUpdate) -> DeviceResponse:
        device = await self.repo.get_by_id(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        for field, value in payload.model_dump(exclude_none=True).items():
            setattr(device, field, value)
        updated = await self.repo.update(device)
        return DeviceResponse.model_validate(updated)

    async def delete_device(self, device_id: int) -> dict:
        device = await self.repo.get_by_id(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        await self.repo.delete(device)
        return {"message": f"Device {device_id} deleted"}
