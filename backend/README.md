# SCENTINEL Backend

FastAPI backend untuk sistem monitoring IoT SCENTINEL. Lihat [README.md root](../README.md) untuk gambaran arsitektur keseluruhan sistem.

## Stack

- **FastAPI** 0.111 — async web framework
- **SQLAlchemy** 2.0 async + **asyncpg** — ORM dan driver PostgreSQL
- **Alembic** — database migrations
- **Pydantic v2** — validasi data dan settings (`pydantic-settings`)
- **python-jose** — JWT token (dashboard auth)
- **passlib + bcrypt** — password hashing
- **sse-starlette** — Server-Sent Events untuk push realtime
- **pytest + pytest-asyncio** — test suite
- Type-checking pakai **Pyright** (`pyrightconfig.json`), bukan mypy

## Layering

```
routers/       # HTTP layer — parsing request, response_model, status code
services/      # Business logic
repositories/  # Query layer — akses DB murni
models/        # SQLAlchemy ORM models
schemas/       # Pydantic request/response schemas
```

Alur satu arah: `routers` → `services` → `repositories` → `models`. Logic baru masuk ke layer yang sesuai — jangan taruh business logic di router atau query mentah di service.

## Struktur

```
app/
├── core/           # config (Settings), security (JWT/hash), dependencies (auth DI)
├── database/       # engine, session, seed.py, migrations helper
├── models/         # user.py, device.py, reading.py (SQLAlchemy)
├── schemas/        # auth.py, user.py, device.py, reading.py (Pydantic)
├── repositories/   # Data access layer (pure DB queries)
├── services/       # auth_service, device_service, reading_service
├── routers/        # auth.py, devices.py, readings.py, stream.py
├── utils/          # CSV export, helpers, constants
├── tests/          # test_auth.py, test_devices.py, test_readings.py
└── main.py         # Entry point — mounting semua router + prefix
```

## Auth: Dua Jalur Terpisah

- **Dashboard/user** — `Authorization: Bearer <jwt>`. Dependency `CurrentUser` (`core/dependencies.py`) decode token via `HTTPBearer`.
- **ESP32/device** — header `X-API-Key: <ESP32_API_KEY>`, dicek statis lewat dependency `ESP32Auth` (`APIKeyHeader`), tanpa JWT.

Kedua jalur sengaja terpisah walau sama-sama menyentuh router `readings` — jangan digabung jadi satu skema auth.

## Data Model

```
User      — username, password_hash, role: UserRole (ADMIN | VIEWER)
Device    — device_name, serial_number (unique), firmware_version, last_seen, status: DeviceStatus (ONLINE | OFFLINE)
SensorReading
  — device_id (FK → devices, cascade delete)
  — mq3, mq4, mq135, tgs2602 (float, sensor gas)
  — temperature, humidity (float)
  — prediction: PredictionLabel (LAYAK | TIDAK LAYAK)
  — confidence (0.0–1.0)
  — is_syncing (bool) — true kalau data dikirim belakangan dari SD Card offline, bukan realtime
```

`SensorReading` harus tetap sinkron dengan `frontend/types/reading.ts` dan skema Pydantic (`schemas/reading.py`) — ubah ketiganya bersamaan kalau ada perubahan field.

## Setup Development

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Jalankan migrasi
alembic upgrade head

# Seed data awal (admin/admin123, viewer/viewer123, 1 device default)
python -m app.database.seed

# Dev server
uvicorn app.main:app --reload --port 8000
```

Lewat Docker (`docker compose up backend` atau `make up` dari root), migrasi + seed dijalankan otomatis oleh entrypoint container sebelum `uvicorn` start — tidak perlu langkah manual di atas.

## Environment Variables

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL asyncpg URL (`postgresql+asyncpg://user:pass@host:5432/db`) |
| `SECRET_KEY` | JWT signing key (minimal 32 karakter, wajib diganti untuk produksi) |
| `ALGORITHM` | JWT algorithm (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Umur token (default: 1440 = 24 jam) |
| `ESP32_API_KEY` | API key statis untuk otentikasi ESP32 |
| `CORS_ORIGINS` | JSON array origin yang diizinkan |

## API Docs

Setelah server jalan:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

Endpoint lengkap ada di tabel API Reference pada [README.md root](../README.md#-api-reference).

## Migrations

```bash
alembic upgrade head                       # apply migrasi terbaru
alembic revision --autogenerate -m "msg"   # buat migrasi baru dari perubahan model
```

## Menjalankan Tests

```bash
pytest app/tests/ -v                          # full suite
pytest app/tests/test_readings.py -v          # satu file
pytest app/tests/test_readings.py::test_name  # satu test
```

## Type Checking

```bash
npx pyright   # via backend/pyrightconfig.json — tidak butuh instalasi pip
```
