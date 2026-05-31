"""
SCENTINEL - Device Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel
from app.models.device import DeviceStatus


class DeviceBase(BaseModel):
    device_name: str
    serial_number: str
    firmware_version: str | None = "v1.0.0"


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    device_name: str | None = None
    firmware_version: str | None = None
    status: DeviceStatus | None = None


class DeviceResponse(DeviceBase):
    id: int
    last_seen: datetime | None = None
    status: DeviceStatus

    model_config = {"from_attributes": True}
