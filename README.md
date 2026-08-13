# 🌿 SCENTINEL — Food Spoilage Detection System

> Sistem Monitoring IoT Berbasis Edge AI untuk Deteksi Dini Pembusukan Makanan
> **Program PKM-KC 2026**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

---

## 📐 Arsitektur Sistem

```
ESP32 (Edge AI)
    │ MQ-3, MQ-4, MQ-135, TGS-2602 + DHT22
    │ Model klasifikasi lokal (LAYAK / TIDAK LAYAK)
    │
    ▼ HTTP POST /api/readings  (header X-API-Key)
FastAPI Backend
    │ routers/ → services/ → repositories/ → models/
    │ PostgreSQL (SQLAlchemy 2.0 async + Alembic)
    │ JWT auth untuk dashboard, API Key statis untuk ESP32
    │ SSE (sse-starlette) untuk realtime push
    │
    ▼ REST API + Server-Sent Events  (lewat Nginx reverse proxy)
Next.js 15 Dashboard
    │ Live monitoring, history, device management
    │ Role-based routing: ADMIN (dashboard penuh) / VIEWER (kiosk /monitor)
```

Dua jalur otentikasi terpisah menyentuh router `readings` yang sama: ESP32 pakai `X-API-Key` (device auth), dashboard/pengguna pakai `Authorization: Bearer <jwt>`. Keduanya sengaja tidak digabung.

---

## 🗂️ Struktur Repository

```
scentinel/
├── backend/          # FastAPI + SQLAlchemy async + Alembic — lihat backend/README.md
├── frontend/         # Next.js 15 App Router + TypeScript — lihat frontend/README.md
│   ├── tests/            # Playwright e2e specs
│   └── playwright.config.ts
├── nginx/            # Reverse proxy (fronting backend + frontend)
├── hardware/         # Firmware ESP32 (contoh produksi + tes koneksi)
├── ml/               # Training model + pengumpulan data untuk edge classifier
│   ├── data_collection/scentinel_logger/   # Sketch .ino pengambil data (server HTTP di ESP32)
│   ├── web-logger/        # Dashboard browser (index.html) — konsumsi endpoint sketch di atas, simpan ke CSV
│   ├── datasets/          # Dataset hasil logging (CSV)
│   ├── models/            # Model terlatih (di-.gitignore, kecuali kode training)
│   └── notebooks/         # train_model.ipynb, SCENTINEL_Training_RandomForest.ipynb
├── docker-compose.yml
├── Makefile          # make up / down / rebuild / logs / restart / clean
├── .env.example
└── README.md
```

---

## 🚀 Menjalankan dari Nol (Docker — canonical)

Panduan ini asumsi repo baru saja di-`clone`, belum ada apa-apa yang ter-install.

### Prerequisites

| Tool | Versi | Wajib untuk |
|------|-------|-------------|
| Docker + Docker Compose v2 (`docker compose`, bukan `docker-compose`) | terbaru | Menjalankan seluruh stack (jalur canonical) |
| Node.js | 20+ | Dev frontend standalone di luar Docker |
| pnpm | 10.28.2 (lihat `frontend/package.json` → `packageManager`, aktifkan via `corepack enable`) | Dev frontend standalone |
| Python | 3.11+ | Dev backend standalone di luar Docker |

Cek versi Docker: `docker --version && docker compose version`. Kalau `docker compose` tidak dikenali tapi `docker-compose` (dash) ada, itu Compose v1 lama — upgrade Docker Desktop/Engine dulu, semua perintah di repo ini (`Makefile`, dokumentasi) pakai sintaks v2.

### Langkah demi Langkah

```bash
# 1. Clone repo
git clone <url-repo-anda>.git
cd scentinel

# 2. Setup environment
cp .env.example .env
nano .env   # isi SECRET_KEY, ESP32_API_KEY, kredensial Postgres — jangan pakai nilai default untuk demo/deploy publik

# 3. Jalankan seluruh stack
make up     # = docker compose up -d
```

Container `backend` otomatis menjalankan `alembic upgrade head` lalu `python -m app.database.seed` sebelum start `uvicorn` — **tidak perlu migrasi/seed manual** di jalur Docker. Tunggu sekitar 10–30 detik untuk build image pertama kali dan healthcheck Postgres lolos.

```bash
# 4. Cek semua service hidup
docker compose ps
make logs         # follow logs semua service (Ctrl+C untuk keluar)
```

| Service | URL |
|---------|-----|
| Dashboard (via Nginx) | http://localhost:8081 |
| Backend API | http://localhost:8000/api |
| Swagger UI | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |
| PostgreSQL (host) | `localhost:5433` → container `5432` |

```bash
# 5. Buka dashboard di browser
xdg-open http://localhost:8081   # atau buka manual
```

Perintah harian lain:

```bash
make down         # docker compose down
make rebuild       # down + up --build (setelah ubah Dockerfile/deps)
make restart       # docker compose restart
make clean        # docker image prune -f
```

### 6. Login Default

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| viewer | viewer123 | VIEWER |

> ⚠️ **Wajib ganti password setelah login pertama** (via halaman Profile). ADMIN dapat akses dashboard penuh (`/`, `/history`, `/devices`, `/profile`, `/settings`); VIEWER dikunci ke tampilan kiosk full-screen `/monitor` (lihat `frontend/middleware.ts`).

Selesai — stack lengkap (DB + API + dashboard) sudah jalan. Bagian di bawah untuk kasus development lebih spesifik (iterasi UI cepat, tanpa backend sama sekali, atau deploy ke server).

---

## 🔧 Development Setup (tanpa Docker per-service)

Berguna saat iterasi cepat di satu sisi (mis. UI) sambil backend tetap jalan di Docker.

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Pastikan PostgreSQL jalan & DATABASE_URL di .env mengarah kesana
# (localhost:5433 kalau pakai `db` service docker-compose, localhost:5432 kalau native)
alembic upgrade head
python -m app.database.seed

uvicorn app.main:app --reload --port 8000
```

### Frontend

> ⚠️ Selalu jalankan `pnpm dev` dari **dalam folder `frontend/`**, bukan dari root.

```bash
cd frontend
corepack enable   # sekali saja per mesin — aktifkan pnpm versi yang di-pin di package.json
pnpm install
pnpm dev
# Buka http://localhost:3000
```

Buat `frontend/.env.local` kalau mau override default (lihat tabel env var di [frontend/README.md](frontend/README.md#environment-variables)):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SSE_URL=http://localhost:8000/api/stream
NEXT_PUBLIC_DEMO_MODE=false
```

**Mode Demo (tanpa backend sama sekali):** set `NEXT_PUBLIC_DEMO_MODE=true` di `frontend/.env.local`. Frontend akan memakai `lib/useMockSSE.ts` (simulasi SSE ~2 detik interval), auth store diisi user dummy, dan middleware auth di-bypass. Set `false` untuk integrasi nyata ke backend. Lihat detail di [frontend/README.md](frontend/README.md).

Detail lengkap masing-masing bagian — termasuk e2e testing (Playwright) — ada di [backend/README.md](backend/README.md) dan [frontend/README.md](frontend/README.md).

---

## 📡 ESP32 Integration

### Submit Sensor Reading

```http
POST /api/readings
X-API-Key: your-esp32-api-key
Content-Type: application/json

{
  "device_id": 1,
  "mq3": 123.4,
  "mq4": 200.1,
  "mq135": 310.5,
  "tgs2602": 150.0,
  "temperature": 27.5,
  "humidity": 65.0,
  "prediction": "LAYAK",
  "confidence": 0.9523,
  "is_syncing": false
}
```

`is_syncing: true` menandakan data dikirim belakangan dari penyimpanan offline (SD Card), bukan pembacaan real-time.

**Response `201 Created`:**
```json
{
  "id": 42,
  "timestamp": "2026-05-31T14:30:00Z",
  "mq3": 123.4,
  "mq4": 200.1,
  "mq135": 310.5,
  "tgs2602": 150.0,
  "temperature": 27.5,
  "humidity": 65.0,
  "prediction": "LAYAK",
  "confidence": 0.9523,
  "is_syncing": false,
  "device_id": 1
}
```

### Firmware

- `hardware/scentinel_esp32_example.ino` — sketch produksi: baca sensor, jalankan model edge, POST ke `/api/readings`. Flag `DATA_COLLECTION_MODE` menentukan apakah sketch sedang mode logging data (ke Serial/SD) atau mode kirim hasil inferensi ke backend.
- `hardware/test_koneksi.ino` — sketch minimal untuk uji koneksi WiFi + endpoint sebelum flashing firmware penuh.
- `ml/data_collection/scentinel_logger/scentinel_logger.ino` — sketch khusus pengumpulan data: ESP32 jalankan server HTTP lokal (`/data`, `/start`, `/stop`, `/calibrate`) yang dipolling dari browser, bukan nulis ke Serial/SD.
- `ml/web-logger/index.html` — dashboard browser statis (buka langsung, tanpa build) untuk konek ke IP ESP32 di atas, kalibrasi baseline, rekam sesi per sampel/batch/label, dan export ke CSV. Lihat cara pakai di komentar sketch atau jalankan `xdg-open ml/web-logger/index.html`.
- Pipeline training ada di `ml/notebooks/train_model.ipynb` dan `ml/notebooks/SCENTINEL_Training_RandomForest.ipynb`; model hasil training inilah yang di-flash sebagai edge classifier ke ESP32.

---

## 🗄️ Database Schema

```
users
  id, username, password_hash, role (ADMIN|VIEWER), created_at

devices
  id, device_name, serial_number (unique), firmware_version,
  last_seen, status (ONLINE|OFFLINE)

sensor_readings
  id, timestamp, device_id (FK → devices.id, cascade delete),
  mq3, mq4, mq135, tgs2602,
  temperature, humidity,
  prediction (LAYAK|TIDAK LAYAK), confidence (0.0-1.0), is_syncing
```

---

## 🔑 API Reference

Semua endpoint di-mount dengan prefix `/api` (lihat `backend/app/main.py`).

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/auth/login` | — | Login dashboard, kembalikan JWT |
| GET | `/api/auth/me` | JWT | Profil user aktif |
| POST | `/api/auth/change-password` | JWT | Ubah password |
| GET | `/api/devices` | JWT | Daftar semua perangkat |
| GET | `/api/devices/{id}` | JWT | Detail satu perangkat |
| POST | `/api/devices/` | JWT | Daftarkan perangkat baru |
| PUT | `/api/devices/{id}` | JWT | Update data perangkat |
| DELETE | `/api/devices/{id}` | JWT | Hapus perangkat |
| POST | `/api/readings/` | API Key | Submit reading dari ESP32 |
| GET | `/api/readings/latest` | JWT | Reading terbaru (opsional filter `device_id`) |
| GET | `/api/readings/history` | JWT | Riwayat paginated (`device_id`, `start_date`, `end_date`, `prediction`, `limit`, `offset`) |
| GET | `/api/readings/stats` | JWT | Statistik agregat (total baris, reading tertua, ukuran storage) untuk halaman Settings |
| DELETE | `/api/readings/all` | JWT | Hapus SEMUA reading (tidak bisa dibatalkan) |
| GET | `/api/readings/export` | JWT | Export CSV (opsional filter) |
| GET | `/api/stream` | — | SSE realtime push ke dashboard |

Swagger interaktif selalu jadi sumber kebenaran paling akurat: http://localhost:8000/api/docs.

---

## 🐳 Deployment ke VPS Ubuntu

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Clone repository
git clone <url-repo-anda>.git
cd scentinel

# 4. Setup environment
cp .env.example .env
nano .env  # Isi SECRET_KEY, ESP32_API_KEY, kredensial Postgres, dll — WAJIB ganti default

# 5. Build & jalankan
make rebuild      # atau: docker compose up -d --build

# 6. Cek status
docker compose ps
make logs
```

Migrasi Alembic dan seed database berjalan otomatis lewat entrypoint container `backend` (lihat `docker-compose.yml`) — tidak perlu dijalankan manual setelah deploy.

### Konfigurasi Domain & HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

---

## 📊 Best Practices PKM-KC

1. **Keamanan** — ganti `SECRET_KEY`, `ESP32_API_KEY`, dan password default sebelum demo/deploy publik.
2. **Data** — seed database dengan data sampel realistis sebelum presentasi.
3. **Backup** — backup PostgreSQL rutin (`pg_dump`), terutama sebelum sesi demo.
4. **Demo Mode** — gunakan `NEXT_PUBLIC_DEMO_MODE=true` di frontend saat perlu tampil tanpa bergantung koneksi backend/hardware live.
5. **Dokumentasi** — update README ini serta `backend/README.md` / `frontend/README.md` setiap ada perubahan arsitektur signifikan.

---

## 📚 Referensi Lanjutan

- `AGENTS.md` — panduan paling detail (Bahasa Indonesia): model data, internal komponen, utilitas design-system, konvensi kode. Catatan: nomor port di dalamnya sudah usang — pakai port pada README ini.
- `DESIGN.md` — spesifikasi UI/design-system.
- `scentinel_blueprint.md` — blueprint awal proyek.
- [backend/README.md](backend/README.md) — detail backend FastAPI.
- [frontend/README.md](frontend/README.md) — detail frontend Next.js.

---

## 👥 Tim SCENTINEL PKM-KC 2026

> *Sistem Deteksi Dini Pembusukan Makanan Menggunakan Sensor Gas Portabel Berbasis Edge AI*

---

## 📄 Lisensi

MIT License — PKM-KC 2026
