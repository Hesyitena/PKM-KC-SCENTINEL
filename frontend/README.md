# SCENTINEL Frontend

Next.js 15 App Router dashboard untuk sistem monitoring IoT SCENTINEL.

## Stack
- **Next.js 15** App Router + TypeScript strict mode
- **Tailwind CSS** + shadcn/ui komponen
- **Zustand** — global state management
- **Axios** — HTTP client dengan JWT interceptor
- **Recharts** — sensor data visualisasi
- **React Hook Form + Zod** — form validasi
- **Sonner** — toast notifications
- **SSE (EventSource)** — realtime data push

## Struktur

```
app/
├── (auth)/login/       # Login page
├── (dashboard)/        # Protected dashboard pages
│   ├── page.tsx        # Live monitoring
│   ├── history/        # Riwayat pengujian
│   ├── devices/        # Daftar perangkat
│   ├── profile/        # Profil pengguna
│   └── settings/       # Pengaturan sistem
components/
├── layout/             # Sidebar, Navbar
├── dashboard/          # SensorCard, GasChart, StatusBadge, LiveMonitoringPanel
├── history/            # ReadingTable, DateFilter, ExportButton
└── forms/              # LoginForm
lib/
├── api.ts              # Axios instance + interceptors
├── auth.ts             # localStorage token utilities
├── useSSE.ts           # SSE hook dengan auto-reconnect
└── utils.ts            # cn, formatDate, formatConfidence
store/
├── authStore.ts        # Zustand auth state (persisted)
└── sensorStore.ts      # Zustand sensor/SSE state
hooks/
├── useAuth.ts          # Login/logout dengan router
├── useDevices.ts       # Device data fetching
└── useReadings.ts      # History + latest reading
types/
├── auth.ts             # User, Token types
├── device.ts           # Device types
└── reading.ts          # SensorReading types
```

## Setup Development

```bash
npm install
npm run dev
# Buka http://localhost:3000
```

## Environment Variables

| Variabel | Deskripsi |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base API backend |
| `NEXT_PUBLIC_SSE_URL` | URL endpoint SSE stream |

## Build Production

```bash
npm run build
npm run start
```
