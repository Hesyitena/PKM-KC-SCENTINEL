"""
SCENTINEL - Device SQLAlchemy Model
Represents ESP32 IoT devices registered in the system.
"""
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import String, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.reading import SensorReading


class DeviceStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_name: Mapped[str] = mapped_column(String(150), nullable=False)
    serial_number: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    firmware_version: Mapped[str] = mapped_column(String(50), nullable=True, default="v1.0.0")
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[DeviceStatus] = mapped_column(
        Enum(DeviceStatus, name="devicestatus"),
        nullable=False,
        default=DeviceStatus.OFFLINE,
    )

    # Relationships
    readings: Mapped[list["SensorReading"]] = relationship(  # noqa: F821
        "SensorReading", back_populates="device", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Device id={self.id} serial={self.serial_number} status={self.status}>"
