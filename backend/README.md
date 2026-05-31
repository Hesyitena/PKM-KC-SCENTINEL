# SCENTINEL Backend

FastAPI backend untuk sistem monitoring IoT SCENTINEL.

## Stack
- **FastAPI** 0.111 — async web framework
- **SQLAlchemy** 2.0 async + **asyncpg** — ORM dan driver PostgreSQL
- **Alembic** — database migrations
- **Pydantic v2** — validasi data dan settings
- **python-jose** — JWT token
- **passlib + bcrypt** — password hashing

## Struktur

```
app/
├── core/           # config, security, dependencies
├── database/       # engine, session, seed, migrations helper
├── models/         # SQLAlchemy models (user, device, reading)
├── schemas/        # Pydantic schemas (request/response)
├── repositories/   # Data access layer (pure DB queries)
├── services/       # Business logic layer
├── routers/        # FastAPI route handlers
├── utils/          # CSV export, helpers, constants
└── tests/          # pytest test suite
```

## Setup Development

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Jalankan migrasi
alembic upgrade head

# Seed data awal
python -m app.database.seed

# Dev server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL asyncpg URL |
| `SECRET_KEY` | JWT signing key (minimal 32 char) |
| `ALGORITHM` | JWT algorithm (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL (default: 1440 = 24 jam) |
| `ESP32_API_KEY` | Static API key untuk ESP32 |
| `CORS_ORIGINS` | JSON array allowed origins |

## API Docs

Setelah server berjalan, buka:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Menjalankan Tests

```bash
pytest app/tests/ -v
```
