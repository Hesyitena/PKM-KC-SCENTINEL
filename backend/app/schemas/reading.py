"""
SCENTINEL - Sensor Reading Pydantic Schemas
Used for ESP32 POST payload and dashboard response.
"""
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.reading import PredictionLabel


class ReadingCreate(BaseModel):
    """Payload sent by ESP32 via POST /api/readings"""
    device_id: int = 1
    mq3: float = Field(..., ge=0, description="MQ-3 alcohol sensor ADC value")
    mq4: float = Field(..., ge=0, description="MQ-4 methane sensor ADC value")
    mq135: float = Field(..., ge=0, description="MQ-135 air quality sensor ADC value")
    tgs2602: float = Field(..., ge=0, description="TGS-2602 VOC sensor ADC value")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage")
    prediction: PredictionLabel
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence 0-1")
    is_syncing: bool = Field(False, description="True if data is from SD Card offline storage")


class ReadingResponse(BaseModel):
    id: int
    timestamp: datetime
    mq3: float
    mq4: float
    mq135: float
    tgs2602: float
    temperature: float
    humidity: float
    prediction: PredictionLabel
    confidence: float
    is_syncing: bool = False
    device_id: int

    model_config = {"from_attributes": True}


class ReadingLatestResponse(ReadingResponse):
    """Latest reading, includes device info."""
    device_name: str | None = None
    device_serial: str | None = None


class ReadingHistoryParams(BaseModel):
    """Query params for history endpoint."""
    device_id: int | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    prediction: PredictionLabel | None = None
    limit: int = Field(50, ge=1, le=500)
    offset: int = Field(0, ge=0)


class PaginatedReadings(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[ReadingResponse]
