"""
SCENTINEL - Device Tests
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_devices_unauthenticated():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        response = await client.get("/api/devices/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_devices_authenticated(auth_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:  # type: ignore[arg-type]
        response = await client.get(
            "/api/devices/",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
