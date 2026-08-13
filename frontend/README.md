# SCENTINEL Frontend

Next.js 15 App Router dashboard untuk sistem monitoring IoT SCENTINEL. Lihat [README.md root](../README.md) untuk gambaran arsitektur keseluruhan sistem.

## Stack

- **Next.js 15** App Router + TypeScript strict mode
- **Tailwind CSS** — styling utama; komponen dinamis (state-driven, mis. tinggi `GasChart`) pakai inline `style`
- **Design-system utilities kustom** di `app/globals.css` — `.glass-card`, `.gradient-text`, `.btn-primary`, animasi (`.animate-*`), skeleton, dll. Bukan library komponen pihak ketiga; lihat [DESIGN.md](../DESIGN.md) untuk spek lengkap
- **Zustand** — global state management (`authStore`, `sensorStore`)
- **Axios** — HTTP client dengan interceptor JWT (`lib/api.ts`)
- **Recharts** — visualisasi data sensor
- **React Hook Form + Zod** — validasi form
- **Sonner** — toast notification
- **SSE (EventSource)** — push data realtime, dengan auto-reconnect + backoff

## Struktur

```
app/
├── (auth)/login/       # Halaman login
├── (dashboard)/        # Halaman dashboard terproteksi
│   ├── layout.tsx      # main: overflow-hidden h-full — lihat catatan layout di bawah
│   ├── page.tsx        # Live monitoring
│   ├── history/        # Riwayat pengujian
│   ├── devices/        # Daftar perangkat
│   ├── monitor/        # Kiosk full-screen khusus role VIEWER
│   ├── profile/        # Profil pengguna
│   └── settings/       # Pengaturan sistem
├── globals.css         # Design tokens + utility classes
middleware.ts           # Auth gate + role-based path routing
components/
├── layout/             # Sidebar, Navbar
├── dashboard/          # SensorCard, GasChart, StatusBadge, LiveMonitoringPanel
├── history/            # ReadingTable, DateFilter, ExportButton
└── forms/              # LoginForm
lib/
├── api.ts              # Axios instance + interceptors
├── auth.ts             # Utilitas token di localStorage
├── useSSE.ts           # Hook SSE nyata (EventSource + auto-reconnect)
├── useMockSSE.ts        # Hook SSE palsu untuk demo mode (interval ~2s)
├── mockData.ts          # Data dummy dipakai useMockSSE
└── utils.ts             # cn, formatDate, formatConfidence
store/
├── authStore.ts        # Zustand auth state (persisted)
└── sensorStore.ts       # Zustand sensor/SSE state
hooks/
├── useAuth.ts           # Login/logout + redirect (VIEWER → /monitor)
├── useDevices.ts         # Fetch data perangkat
└── useReadings.ts        # History + latest reading
types/
├── auth.ts              # User, Token, UserRole ("ADMIN" | "VIEWER")
├── device.ts            # Device types
└── reading.ts           # SensorReading, ReadingCreate, dll — harus sinkron dengan schema Pydantic backend & model ORM
```

## Role-Based Routing

User punya `role`: `ADMIN` atau `VIEWER` (`types/auth.ts`).

- **ADMIN** — akses penuh: `/`, `/history`, `/devices`, `/profile`, `/settings`.
- **VIEWER** — dikunci ke `/monitor` (tampilan kiosk full-screen), diatur di `middleware.ts` (`ADMIN_PATHS` vs `VIEWER_PATHS`).
- Redirect setelah login diputuskan di client (`hooks/useAuth.ts`), bukan di middleware.
- Token JWT lama di localStorage yang belum punya `role` di-resolve lewat `GET /api/auth/me`.

## Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` untuk menjalankan frontend **tanpa backend sama sekali**:

- `lib/useMockSSE.ts` mensimulasikan SSE dengan data fluktuatif tiap ~2 detik, menggantikan `lib/useSSE.ts`.
- Auth store di-seed user dummy — tidak perlu login sungguhan.
- `middleware.ts` bypass semua pengecekan auth.

Banyak komponen bercabang pada flag ini (`process.env.NEXT_PUBLIC_DEMO_MODE === "true"`) — jangan hapus percabangan tersebut saat refactor. Set `false` untuk integrasi nyata ke backend.

## Layout Invariant

`app/(dashboard)/layout.tsx` mengatur `main` jadi `overflow-hidden h-full`. Halaman live (`/`) dan `history` adalah kolom `flex` dengan `h-full` di mana hanya komponen dalam (tabel, chart) yang scroll; halaman lain dibungkus `overflow-y-auto h-full p-6`. Mengubah aturan overflow di layout ini bisa diam-diam merusak scroll di semua halaman — verifikasi seluruh halaman kalau menyentuh file ini.

## Setup Development

```bash
pnpm install
pnpm dev
# Buka http://localhost:3000
```

> ⚠️ Jalankan `pnpm dev` dari dalam folder `frontend/`, bukan dari root repo.

## Environment Variables

| Variabel | Deskripsi |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base API backend (mis. `http://localhost/api` atau `/api` di belakang Nginx) |
| `NEXT_PUBLIC_SSE_URL` | URL endpoint SSE stream (`/api/stream`) |
| `NEXT_PUBLIC_DEMO_MODE` | `true`/`false` — aktifkan mode demo tanpa backend (lihat di atas) |

## Scripts

```bash
pnpm dev        # next dev di :3000
pnpm build      # production build
pnpm start      # jalankan production build
pnpm lint       # next lint
pnpm type-check # tsc --noEmit — WAJIB dijalankan setelah perubahan TypeScript (strict mode)
pnpm test:e2e   # Playwright e2e (lihat bawah)
```

## E2E Testing (Playwright)

```bash
pnpm test:e2e                             # semua browser (chromium, firefox, webkit)
npx playwright test --project=chromium       # satu browser saja
npx playwright test --ui                     # mode UI interaktif untuk debug
npx playwright show-report                   # buka HTML report run terakhir
```

- Config: [`playwright.config.ts`](playwright.config.ts). `webServer` otomatis jalanin `pnpm dev` (dengan `NEXT_PUBLIC_DEMO_MODE=true`) sebelum test — gak perlu start dev server manual.
- Test files di `tests/`. Test yang butuh API (mis. login) memakai `page.route()` untuk mock response backend, jadi suite ini jalan tanpa FastAPI/Postgres running.
- First-time setup butuh browser binary: `npx playwright install`. Kalau muncul error dependency OS (mis. `libavif13` untuk WebKit), jalankan `sudo apt-get install libavif13` atau `sudo env "PATH=$PATH" npx playwright install-deps` (`sudo npx ...` polos bisa gagal kalau Node diinstall lewat nvm — sudo jatuh balik ke Node sistem yang lebih lama).
- CI: [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) — install deps otomatis via `npx playwright install --with-deps`.

## Konvensi

- Komponen PascalCase; hook diawali `use` di `hooks/`; state global sebagai Zustand store di `store/`.
- TypeScript strict — hindari `any` tanpa justifikasi jelas.
- `SensorReading` (di `types/reading.ts`) harus tetap sinkron dengan schema Pydantic backend dan model ORM — ubah ketiganya bersamaan kalau ada perubahan field.
