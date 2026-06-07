"""
SCENTINEL - Database Seed Script
Seeds a single user and a single default device.
Run: python -m app.database.seed
"""
import asyncio
from sqlalchemy import select
from app.database.database import AsyncSessionLocal
from app.models.user import User
from app.models.device import Device, DeviceStatus
from app.core.security import hash_password


async def seed():
    async with AsyncSessionLocal() as session:
        # Seed default user
        result = await session.execute(select(User).where(User.username == "admin"))
        existing_user = result.scalar_one_or_none()

        if not existing_user:
            user = User(
                username="admin",
                password_hash=hash_password("admin123"),
            )
            session.add(user)
            print("✅ User created: admin / admin123")

        # Seed default device
        result = await session.execute(
            select(Device).where(Device.serial_number == "SCT-ESP32-001")
        )
        existing_device = result.scalar_one_or_none()

        if not existing_device:
            device = Device(
                device_name="SCENTINEL Unit 1",
                serial_number="SCT-ESP32-001",
                firmware_version="v1.0.0",
                status=DeviceStatus.OFFLINE,
            )
            session.add(device)
            print("✅ Default device created: SCT-ESP32-001")

        await session.commit()
        print("🌱 Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed())
