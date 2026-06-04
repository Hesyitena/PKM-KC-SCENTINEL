"""
SCENTINEL - Devices Router
GET  /devices         →  List all devices
GET  /devices/{id}    →  Get single device
POST /devices         →  Register new device (ADMIN only)
PUT  /devices/{id}    →  Update device info (ADMIN only)
DELETE /devices/{id}  →  Delete device (ADMIN only)
"""
from fastapi import APIRouter

from app.core.dependencies import CurrentUser, AdminUser, DBSession
from app.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate
from app.services.device_service import DeviceService

router = APIRouter()


@router.get("", response_model=list[DeviceResponse], summary="List All Devices")
async def list_devices(current_user: CurrentUser, db: DBSession):
    """Retrieve all registered IoT devices."""
    service = DeviceService(db)
    return await service.get_all_devices()


@router.get("/{device_id}", response_model=DeviceResponse, summary="Get Device by ID")
async def get_device(device_id: int, current_user: CurrentUser, db: DBSession):
    """Retrieve a single device by its ID."""
    service = DeviceService(db)
    return await service.get_device_by_id(device_id)


@router.post("/", response_model=DeviceResponse, status_code=201, summary="Register New Device")
async def create_device(payload: DeviceCreate, admin_user: AdminUser, db: DBSession):
    """Register a new ESP32 device. Requires ADMIN role."""
    service = DeviceService(db)
    return await service.create_device(payload)


@router.put("/{device_id}", response_model=DeviceResponse, summary="Update Device")
async def update_device(
    device_id: int, payload: DeviceUpdate, admin_user: AdminUser, db: DBSession
):
    """Update device information. Requires ADMIN role."""
    service = DeviceService(db)
    return await service.update_device(device_id, payload)


@router.delete("/{device_id}", summary="Delete Device")
async def delete_device(device_id: int, admin_user: AdminUser, db: DBSession):
    """Delete a device by ID. Requires ADMIN role."""
    service = DeviceService(db)
    return await service.delete_device(device_id)
