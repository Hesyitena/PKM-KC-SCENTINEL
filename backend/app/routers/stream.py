"""
SCENTINEL - SSE Stream Router
GET /stream  →  Server-Sent Events for realtime dashboard updates.
Clients receive new sensor reading events as they are ingested.

Auth: JWT token accepted via ?token= query param because browser
      EventSource API cannot set custom Authorization headers.
"""
import asyncio
import json
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.core.security import decode_access_token
from app.services.reading_service import add_sse_subscriber, remove_sse_subscriber

router = APIRouter()


async def event_generator(request: Request, queue: asyncio.Queue):
    """Async generator that yields SSE-formatted events from the queue."""
    # Send initial connection event
    yield "event: connected\ndata: {\"message\": \"SSE connected to SCENTINEL\"}\n\n"

    try:
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            try:
                # Wait for data with timeout (keepalive every 15s)
                data = await asyncio.wait_for(queue.get(), timeout=15.0)
                json_str = json.dumps(data, default=str)
                yield f"event: reading\ndata: {json_str}\n\n"
            except asyncio.TimeoutError:
                # Send keepalive comment
                yield ": keepalive\n\n"
    except asyncio.CancelledError:
        pass
    finally:
        remove_sse_subscriber(queue)


@router.get("/stream", summary="Realtime SSE Stream")
async def sse_stream(request: Request, token: str | None = None):
    """
    Server-Sent Events endpoint for realtime sensor data.
    Dashboard subscribes here to receive live readings as they arrive from ESP32.

    Auth: pass JWT via `?token=<access_token>` query param.
    (Browser EventSource cannot set custom Authorization headers.)

    Event types:
    - `connected`: Sent once on connection
    - `reading`: New sensor reading data (JSON)
    - `: keepalive`: Keepalive comment every 15s
    """
    # Validate JWT token from query param
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required. Pass ?token=<access_token>",
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    add_sse_subscriber(queue)

    return StreamingResponse(
        event_generator(request, queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering for SSE
            "Connection": "keep-alive",
        },
    )
