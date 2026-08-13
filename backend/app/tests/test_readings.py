"""
SCENTINEL - Readings Tests
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_submit_reading_invalid_api_key():
    payload = {
        "device_id": 1,
        "mq3": 123.4, "mq4": 200.1, "mq135": 310.5, "tgs2602": 150.0,
        "temperature": 27.5, "humidity": 65.0,
        "prediction": "LAYAK", "confidence": 0.95
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        response = await client.post(
            "/api/readings/",
            json=payload,
            headers={"X-API-Key": "wrong-key"}
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_submit_reading_valid_api_key():
    payload = {
        "device_id": 1,
        "mq3": 123.4, "mq4": 200.1, "mq135": 310.5, "tgs2602": 150.0,
        "temperature": 27.5, "humidity": 65.0,
        "prediction": "LAYAK", "confidence": 0.95
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        response = await client.post(
            "/api/readings/",
            json=payload,
            headers={"X-API-Key": settings.ESP32_API_KEY}
        )
    # 201 if device exists, 404 if not seeded
    assert response.status_code in [201, 404]


@pytest.mark.asyncio
async def test_get_stats_requires_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        response = await client.get("/api/readings/stats")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_stats_authenticated():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        login = await client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        token = login.json()["access_token"]
        response = await client.get(
            "/api/readings/stats",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert "total" in data and "storage_bytes" in data
    assert data["total"] >= 0
    assert data["storage_bytes"] >= 0
