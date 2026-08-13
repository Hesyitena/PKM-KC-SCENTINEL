# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SCENTINEL — IoT food-spoilage monitoring using Edge AI. ESP32 reads gas sensors (MQ-3, MQ-4, MQ-135, TGS-2602) + DHT22 (temp/humidity), runs local inference, and POSTs a `LAYAK` / `TIDAK LAYAK` verdict to the backend. A Next.js dashboard shows readings in real time over SSE. Program: PKM-KC 2026.

Deeper references already in the repo (read these before large changes):
- `AGENTS.md` — most detailed guide (Indonesian): data models, component internals, design-system utilities, conventions. **Caveat:** its port numbers are stale — use the ports below, not AGENTS.md's.
- `DESIGN.md` — UI/design-system spec. `README.md` — architecture overview. `scentinel_blueprint.md` — original blueprint.

## Repository layout (monorepo, 4 + 1 parts)

- `backend/` — FastAPI (async SQLAlchemy 2.0 + Alembic + PostgreSQL). Entry `app/main.py`.
- `frontend/` — Next.js 15 App Router + TypeScript + Zustand + Tailwind.
- `nginx/` — reverse proxy fronting backend + frontend.
- `hardware/` — ESP32 firmware.
- `ml/` — model training + data collection: `notebooks/train_model.ipynb`, `datasets/`, `models/`, `data_collection/` (`*.ino` sketches + `serial_logger.py` that captures serial output to CSV for training). This is where the edge classifier that ships to the ESP32 is produced.

## Commands

Full stack (from repo root, Docker — the canonical run):
```bash
make up          # docker compose up -d
make down
make rebuild     # down + up --build
make logs        # follow logs
```
After `make up`: dashboard via nginx at **http://localhost:8081**, API at **http://localhost:8000/api**, Swagger at **http://localhost:8000/api/docs**. Postgres is exposed on host **5433** (→5432 in container).

Frontend (`cd frontend`):
```bash
pnpm dev        # next dev on :3000 (standalone UI dev)
pnpm build
pnpm lint       # next lint
pnpm type-check # tsc --noEmit — run this after TS changes; strict mode
```

Backend (`cd backend`, venv in `backend/venv`):
```bash
pytest app/tests/ -v                       # full suite (pytest + pytest-asyncio)
pytest app/tests/test_auth.py -v           # one file
pytest app/tests/test_readings.py::test_name # one test
alembic upgrade head                       # apply migrations
alembic revision --autogenerate -m "msg"   # new migration
python -m app.database.seed                 # create default admin user
```
Type-checking is Pyright (`backend/pyrightconfig.json`).

## Architecture — the parts that span files

**Data flow / ingestion split.** ESP32 → `POST /api/readings` authenticated with header `X-API-Key: <ESP32_API_KEY>` (device auth, *not* JWT). Dashboard/user requests use `Authorization: Bearer <jwt>`. Two separate auth paths hit the same `readings` router; don't collapse them. Routers are mounted in `app/main.py`: `auth`→`/api/auth`, `devices`→`/api/devices`, `readings`→`/api/readings`, `stream`→`/api` (so the SSE endpoint is `/api/stream`). Backend layering: `routers/` (HTTP) → `services/` (business logic) → `repositories/` (queries) → `models/` (ORM). Keep new logic in the matching layer.

**Realtime.** New readings are pushed to the browser via `sse-starlette` from `/api/stream`; frontend consumes with an `EventSource` hook (`lib/useSSE.ts`).

**Demo mode (frontend gotcha).** When `NEXT_PUBLIC_DEMO_MODE=true`, the frontend runs with **no backend**: `lib/useMockSSE.ts` fakes SSE (~2s interval), the auth store is seeded with a dummy user, and auth middleware is bypassed. Many components branch on this flag — don't remove the checks. Set `false` for real integration.

**Role-based routing (newer than AGENTS.md).** Users have a `role` of `ADMIN` or `VIEWER` (`frontend/types/auth.ts`). `frontend/middleware.ts` gates paths: ADMIN gets the full dashboard (`/`, `/history`, `/devices`, `/profile`, `/settings`); VIEWER is confined to `/monitor` (full-screen kiosk view). Post-login redirect is decided client-side in `hooks/useAuth.ts` (VIEWER → `/monitor`). Backend exposes `/api/auth/me` to resolve the role when a stale localStorage token lacks it.

**Dashboard layout invariant.** `app/(dashboard)/layout.tsx` sets `main` to `overflow-hidden h-full`; the live (`/`) and history pages are `flex` columns with `h-full` where only inner components (table, chart) scroll, while other pages wrap in `overflow-y-auto h-full p-6`. Changing the layout overflow rules can silently break scrolling across every page — verify all pages if you touch it.

## Conventions

- Components PascalCase; hooks `use`-prefixed in `hooks/`; global state as Zustand stores in `store/`.
- Prefer Tailwind; use inline `style` only for state-driven dynamic values (e.g. `GasChart` `height`). Design-system utility classes (`.glass-card`, `.gradient-text`, `.btn-primary`, …) live in `frontend/app/globals.css`.
- TypeScript strict — no unjustified `any`.
- `SensorReading` shape must stay in sync across `frontend/types/reading.ts`, backend Pydantic schemas, and the ORM model — change all three together.
