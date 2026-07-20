"""
SCENTINEL - SensorReading SQLAlchemy Model
Stores all sensor data and AI prediction results from ESP32 devices.
"""
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Float, Enum, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.device import Device


class PredictionLabel(str, enum.Enum):
    LAYAK = "LAYAK"
    TIDAK_LAYAK = "TIDAK LAYAK"


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Gas sensor values (from MQ series & TGS)
    mq3: Mapped[float] = mapped_column(Float, nullable=False)
    mq4: Mapped[float] = mapped_column(Float, nullable=False)
    mq135: Mapped[float] = mapped_column(Float, nullable=False)
    tgs2602: Mapped[float] = mapped_column(Float, nullable=False)

    # Environmental sensors
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=False)

    # Edge AI prediction results
    prediction: Mapped[PredictionLabel] = mapped_column(
        Enum(PredictionLabel, name="predictionlabel"),
        nullable=False,
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    is_syncing: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Foreign key
    device_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Relationships
    device: Mapped["Device"] = relationship("Device", back_populates="readings")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<SensorReading id={self.id} prediction={self.prediction} "
            f"confidence={self.confidence:.2f} device={self.device_id}>"
        )
