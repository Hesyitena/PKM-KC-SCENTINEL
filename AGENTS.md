# AGENTS.md — SCENTINEL Project

> Panduan konteks untuk AI coding agents yang bekerja di repositori ini.  
> Baca file ini terlebih dahulu sebelum membuat perubahan apa pun.

---

## 1. Deskripsi Proyek

**SCENTINEL** adalah sistem IoT monitoring pembusukan makanan berbasis Edge AI.  
Perangkat **ESP32** membaca data sensor gas (MQ-3, MQ-4, MQ-135, TGS-2602) serta suhu dan kelembapan (DHT22), melakukan inferensi AI di edge, lalu mengirim hasil (`LAYAK` / `TIDAK LAYAK`) ke backend via REST API. Dashboard web menampilkan data secara realtime menggunakan Server-Sent Events (SSE).

**Program:** PKM-KC 2026  
**Stack:** Next.js 15 · FastAPI · PostgreSQL · Nginx · Docker

---

## 2. Struktur Repositori

```
scentinel/
├── backend/          # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── core/         # config.py, security.py
│   │   ├── database/     # database.py, seed.py
│   │   ├── models/       # SQLAlchemy ORM: user.py, device.py, reading.py
│   │   ├── repositories/ # Query layer
│   │   ├── routers/      # auth.py, devices.py, readings.py, stream.py
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers
│   │   └── main.py       # Entry point FastAPI
│   ├── alembic/          # Migrasi database
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/         # Next.js 15 (App Router, TypeScript)
│   ├── app/
│   │   ├── (auth)/       # Login page
│   │   └── (dashboard)/  # Layout + halaman dashboard
│   │       ├── page.tsx          # Dashboard utama (live monitoring)
│   │       ├── history/page.tsx  # Riwayat pembacaan
│   │       ├── devices/page.tsx  # Daftar perangkat
│   │       ├── profile/page.tsx  # Profil pengguna
│   │       └── settings/page.tsx # Pengaturan
│   ├── components/
│   │   ├── dashboard/    # LiveMonitoringPanel, SensorCard, GasChart, StatusBadge
│   │   ├── history/      # ReadingTable, DateFilter, ExportButton
│   │   ├── layout/       # Sidebar, Navbar
│   │   ├── forms/        # LoginForm
│   │   └── ui/           # Komponen UI primitif
│   ├── hooks/            # useReadings, useDevices, useAuth
│   ├── lib/              # api.ts, useSSE.ts, useMockSSE.ts, utils.ts
│   ├── store/            # Zustand: authStore.ts, sensorStore.ts
│   ├── types/            # reading.ts, device.ts
│   ├── globals.css       # CSS design system, animasi, komponen
│   └── .env.local        # Environment variables lokal
├── nginx/            # nginx.conf, default.conf (reverse proxy)
├── docker-compose.yml
├── .env              # Root env (PostgreSQL, secrets)
└── .env.example
```

---

## 3. Tech Stack

### Backend
| Layer | Teknologi |
|-------|-----------|
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 |
| Migrasi | Alembic 1.13 |
| Auth | JWT via `python-jose`, bcrypt |
| Realtime | `sse-starlette` (SSE) |
| Runtime | Python 3.12, Uvicorn |

### Frontend
| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 + Vanilla CSS (`globals.css`) |
| State | Zustand 5 |
| HTTP | Axios (dengan JWT interceptor) |
| Realtime | `EventSource` (SSE) / `useMockSSE` (demo) |
| Charts | Recharts 2.13 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

### Infrastruktur
| Komponen | Detail |
|----------|--------|
| Reverse proxy | Nginx (port 8080) |
| Containerisasi | Docker Compose |
| Jaringan | `scentinel-network` bridge |

---

## 4. API Endpoints

Base URL: `/api`  
Dokumentasi interaktif: `http://localhost/api/docs`

| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| `POST` | `/api/auth/login` | Login, kembalikan JWT | ❌ |
| `POST` | `/api/auth/change-password` | Ubah password | ✅ JWT |
| `GET` | `/api/devices` | Daftar perangkat ESP32 | ✅ JWT |
| `GET` | `/api/readings` | Riwayat pembacaan sensor | ✅ JWT |
| `POST` | `/api/readings` | Kirim data sensor (dari ESP32) | ✅ API Key |
| `GET` | `/api/stream` | SSE stream realtime | ✅ JWT |
| `GET` | `/api/health` | Health check | ❌ |

**Header ESP32:** `X-API-Key: <ESP32_API_KEY>`  
**Header user:** `Authorization: Bearer <access_token>`

---

## 5. Data Model Utama

### `SensorReading`
```typescript
{
  id: number;
  device_id: number;
  food_name?: string;        // Nama sampel makanan
  mq3: number;               // ADC gas alkohol
  mq4: number;               // ADC gas metana
  mq135: number;             // ADC gas udara/VOC
  tgs2602: number;           // ADC VOC
  temperature: number;       // °C
  humidity: number;          // %
  prediction: "LAYAK" | "TIDAK LAYAK";
  confidence?: number;       // 0.0 – 1.0
  timestamp: string;         // ISO 8601
}
```

### `Device`
```typescript
{
  id: number;
  name: string;
  api_key: string;
  is_active: boolean;
  last_seen?: string;
}
```

---

## 6. Environment Variables

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=/api              # Base URL backend
NEXT_PUBLIC_SSE_URL=/api/stream       # URL SSE stream
NEXT_PUBLIC_DEMO_MODE=true            # "true" = gunakan mock data (tanpa backend)
```

### Backend (`backend/.env`)
```bash
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=<jwt-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ESP32_API_KEY=<api-key-untuk-esp32>
CORS_ORIGINS=["http://localhost","http://localhost:3000"]
```

### Root (`.env`)
```bash
POSTGRES_USER=scentinel
POSTGRES_PASSWORD=scentinel_secret
POSTGRES_DB=scentinel_db
SECRET_KEY=<jwt-secret>
ESP32_API_KEY=<api-key>
```

---

## 7. Demo Mode

Ketika `NEXT_PUBLIC_DEMO_MODE=true`, frontend berjalan **tanpa backend**:
- `useMockSSE` di `lib/useMockSSE.ts` mensimulasikan SSE dengan interval 2 detik
- Data sensor di-generate secara random (realistis)
- Auth store di-inject dengan user dummy (`demo / ADMIN`)
- Middleware auth di-bypass

> **Untuk development UI**: gunakan demo mode.  
> **Untuk production/integrasi**: set `NEXT_PUBLIC_DEMO_MODE=false`.

---

## 8. Layout & Routing Dashboard

Dashboard menggunakan **Next.js App Router** dengan layout bersarang:

```
app/layout.tsx                    → root layout (fonts, toaster)
app/(dashboard)/layout.tsx        → sidebar + navbar + auth guard
  app/(dashboard)/page.tsx        → /  (live monitoring)
  app/(dashboard)/history/page.tsx → /history
  app/(dashboard)/devices/page.tsx → /devices
  app/(dashboard)/profile/page.tsx → /profile
  app/(dashboard)/settings/page.tsx → /settings
app/(auth)/login/page.tsx         → /login
```

**Penting — aturan overflow layout:**
- `(dashboard)/layout.tsx` → `main` menggunakan `overflow-hidden h-full`
- Halaman dashboard (`/`) dan history (`/history`) → **flex column** dengan `h-full`, konten scroll hanya di dalam komponen tertentu (tabel, chart)
- Halaman lain (devices, profile, settings) → wrapper `overflow-y-auto h-full p-6`

---

## 9. Komponen Penting

### `LiveMonitoringPanel`
`components/dashboard/LiveMonitoringPanel.tsx`

Komponen utama dashboard. Struktur internal:
1. **Status Card** — 3 zona horizontal:
   - _Left_: AI prediction (LAYAK/TIDAK LAYAK), icon ShieldCheck/ShieldX
   - _Center_: SVG arc gauge akurasi (96px, dengan glow filter)
   - _Right_: Timestamp + status perangkat
2. **Sensor Cards** — grid 6 kolom (MQ-3, MQ-4, MQ-135, TGS-2602, Suhu, Kelembapan)
3. **GasChart** — Recharts AreaChart, height `100%` (flex-1)

### `GasChart`
`components/dashboard/GasChart.tsx`
- `height` prop: `number | string` (default `300`, dashboard pakai `"100%"`)
- Wrapper div menggunakan `style={{ height }}` agar bisa mengisi flex parent

### `ReadingTable`
`components/history/ReadingTable.tsx`
- Layout: `flex flex-col h-full` — area tabel scroll internal (`overflow-y-auto flex-1 min-h-0`)
- Pagination di bagian bawah (`flex-shrink-0`)

---

## 10. Design System (`globals.css`)

### CSS Custom Properties
```css
--primary: 227 68% 28%     /* Navy/indigo brand */
--background: 220 25% 97%  /* Light gray */
--radius: 0.75rem
```

### Utility Classes
| Class | Deskripsi |
|-------|-----------|
| `.glass-card` | Kartu semi-transparan dengan backdrop-blur |
| `.gradient-text` | Teks dengan gradient primary |
| `.gradient-bg` | Background gradient halus |
| `.btn-primary` | Tombol primary dengan gradient |
| `.input-base` | Input field standar |
| `.skeleton` | Loading shimmer animation |
| `.animate-fade-in` | Fade-in + translateY entrance |

---

## 11. Menjalankan Proyek

### Development (frontend only, demo mode)
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```
Pastikan `NEXT_PUBLIC_DEMO_MODE=true` di `.env.local`.

### Full stack (Docker)
```bash
# Di root scentinel/
cp .env.example .env   # isi variabel yang diperlukan
docker compose up -d --build
```
Akses: `http://localhost:8080`

### Migrasi database manual
```bash
cd backend
alembic upgrade head
python -m app.database.seed   # buat admin user default
```

---

## 12. Panduan untuk Agent

### ✅ Boleh
- Mengedit file di `frontend/` dan `backend/app/`
- Menambah halaman baru di `app/(dashboard)/`
- Menambah komponen baru di `components/`
- Mengubah styling di `globals.css` dan komponen

### ⚠️ Hati-hati
- **Jangan ubah** `app/(dashboard)/layout.tsx` overflow rules tanpa memastikan semua halaman tetap berfungsi
- **Jangan hapus** `NEXT_PUBLIC_DEMO_MODE` check — banyak komponen bergantung pada ini
- **Jangan ubah** struktur `SensorReading` di `types/reading.ts` tanpa update schema backend
- **Jangan ubah** `lib/api.ts` interceptor tanpa test auth flow

### 🔑 Konvensi Kode
- **Komponen**: PascalCase, file sesuai nama komponen
- **Hooks**: `use` prefix, di folder `hooks/`
- **Styling**: utamakan Tailwind, inline `style` untuk nilai dinamis (warna berdasarkan state)
- **State global**: Zustand store di `store/`
- **ID unik**: setiap elemen interaktif wajib punya `id` attribute (untuk testing)
- **TypeScript**: strict mode — tidak ada `any` tanpa komentar justifikasi

---

*Dibuat: 07 Juni 2026 · SCENTINEL v1.0.0 · PKM-KC 2026*
