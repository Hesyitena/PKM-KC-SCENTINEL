"""
SCENTINEL - Database Seed Script
Seeds users (admin + viewer) and a default device.
Run: python -m app.database.seed
"""
import asyncio
from sqlalchemy import select
from app.database.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.device import Device, DeviceStatus
from app.core.security import hash_password


async def seed():
    async with AsyncSessionLocal() as session:
        # Seed admin user
        result = await session.execute(select(User).where(User.username == "admin"))
        existing_admin = result.scalar_one_or_none()

        if not existing_admin:
            user = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
            )
            session.add(user)
            print("✅ User created: admin / admin123 (role: ADMIN)")
        else:
            # Ensure existing admin has ADMIN role
            if existing_admin.role != UserRole.ADMIN:
                existing_admin.role = UserRole.ADMIN
                print("✅ Updated existing admin to ADMIN role")

        # Seed viewer user
        result = await session.execute(select(User).where(User.username == "viewer"))
        existing_viewer = result.scalar_one_or_none()

        if not existing_viewer:
            viewer = User(
                username="viewer",
                password_hash=hash_password("viewer123"),
                role=UserRole.VIEWER,
            )
            session.add(viewer)
            print("✅ User created: viewer / viewer123 (role: VIEWER)")

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
