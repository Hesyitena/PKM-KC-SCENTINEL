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
    ▼ HTTP POST /api/readings (X-API-Key)
FastAPI Backend
    │ PostgreSQL (SQLAlchemy Async + Alembic)
    │ JWT Auth untuk dashboard
    │ SSE untuk realtime push
    │
    ▼ REST API + Server-Sent Events
Next.js Dashboard
    │ Live monitoring, history, device management
```

---

## 🗂️ Struktur Repository

```
scentinel/
├── backend/          # FastAPI + SQLAlchemy + Alembic
├── frontend/         # Next.js 15 App Router + TypeScript
├── nginx/            # Reverse proxy config
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (untuk dev frontend)
- Python 3.11+ (untuk dev backend)

### 1. Clone & Setup Environment

```bash
# Copy environment template
cp .env.example .env
# Edit .env sesuai kebutuhan
```

### 2. Jalankan Sistem (Daily Development Workflow)

> ⚠️ **PENTING:** Selalu jalankan perintah `npm run dev` dari **dalam folder `frontend/`**, bukan dari root project.

Jalankan dua terminal secara bersamaan:

**Terminal 1 — Backend & Database (Docker):**
```bash
# Pastikan kamu di folder root project: .../scentinel/
docker-compose up backend
```

**Terminal 2 — Frontend (Local):**
```bash
# Masuk ke folder frontend dulu!
cd ~/Documents/PKM-KC_2026/WEBSITE/scentinel/frontend
npm run dev
```

Buka browser di **http://localhost:3000**

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Backend API | http://localhost:8000/api |

---

### Cara Mematikan

**Frontend:** Tekan `Ctrl+C` di Terminal 2.

**Backend & Database:** Tekan `Ctrl+C` di Terminal 1, lalu:
```bash
docker-compose down
```

---

### Troubleshooting: Error `KeyError: 'ContainerConfig'`

Jika `docker-compose up` gagal dengan error ini, artinya ada *container* lama yang nyangkut. Jalankan perintah ini untuk membersihkannya:

```bash
# Lihat container yang ada
docker ps -a

# Hapus semua container lama (ganti ID sesuai output di atas)
docker rm -f <CONTAINER_ID>

# Jalankan ulang
docker-compose up backend
```

---

> **Catatan:** Jika ini adalah **pertama kalinya** menjalankan project ini di komputer baru, jalankan dulu:
> ```bash
> docker-compose up --build
> ```

### 3. Login Default

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| viewer | viewer123 | VIEWER |

> ⚠️ **Wajib ganti password setelah pertama login!**

---

## 🔧 Development Setup

### Backend (tanpa Docker)

```bash
cd backend

# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database (PostgreSQL harus running)
# Edit DATABASE_URL_LOCAL di .env
alembic upgrade head
python -m app.database.seed

# Jalankan development server
uvicorn app.main:app --reload --port 8000
```

### Frontend (tanpa Docker)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
# Buka http://localhost:3000
```

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
  "food_name": "Ayam"
}
```

**Response `201 Created`:**
```json
{
  "id": 42,
  "timestamp": "2026-05-31T14:30:00Z",
  "prediction": "LAYAK",
  "confidence": 0.9523,
  ...
}
```

### Contoh Kode ESP32 (Arduino)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER_URL = "http://your-server/api/readings";
const char* API_KEY = "esp32-static-api-key";

void submitReading(float mq3, float mq4, float mq135, float tgs2602,
                   float temp, float hum, String prediction, float confidence) {
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  StaticJsonDocument<512> doc;
  doc["device_id"] = 1;
  doc["mq3"] = mq3;
  doc["mq4"] = mq4;
  doc["mq135"] = mq135;
  doc["tgs2602"] = tgs2602;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["prediction"] = prediction;
  doc["confidence"] = confidence;
  doc["food_name"] = "Ayam";

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("HTTP Response: %d\n", code);
  http.end();
}
```

---

## 🗄️ Database Schema (ERD)

```
users
  id, username, password_hash, role (ADMIN|VIEWER), created_at

devices
  id, device_name, serial_number, firmware_version,
  last_seen, status (ONLINE|OFFLINE)

sensor_readings
  id, timestamp, device_id (FK),
  mq3, mq4, mq135, tgs2602,
  temperature, humidity,
  prediction (LAYAK|TIDAK LAYAK), confidence, food_name
```

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
git clone https://github.com/your-org/scentinel.git
cd scentinel

# 4. Setup environment
cp .env.example .env
nano .env  # Isi SECRET_KEY, ESP32_API_KEY, dll

# 5. Build & jalankan
docker-compose up -d --build

# 6. Cek status
docker-compose ps
docker-compose logs -f backend

# 7. Setup Alembic migrations
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.database.seed
```

### Konfigurasi Domain & HTTPS (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Dapatkan SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 🔑 API Reference

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/auth/login` | — | Login dashboard |
| GET | `/api/auth/me` | JWT | Info user aktif |
| POST | `/api/auth/change-password` | JWT | Ubah password |
| GET | `/api/devices/` | JWT | Daftar perangkat |
| GET | `/api/devices/{id}` | JWT | Detail perangkat |
| POST | `/api/devices/` | JWT (ADMIN) | Daftarkan perangkat |
| POST | `/api/readings/` | API Key | Submit dari ESP32 |
| GET | `/api/readings/latest` | JWT | Pembacaan terbaru |
| GET | `/api/readings/history` | JWT | Riwayat (paginated) |
| GET | `/api/readings/export` | JWT | Export CSV |
| GET | `/api/stream` | — | SSE realtime |

---

## 🗓️ Roadmap Implementasi

### Phase 1: Development (Minggu 1-2)
- [x] Setup project structure
- [x] Backend: Models, Schemas, Repositories, Services, Routers
- [x] Frontend: Layout, Auth, Dashboard komponen dasar
- [x] Docker Compose setup

### Phase 2: Integrasi (Minggu 3)
- [ ] Koneksi ESP32 ke backend (uji POST /readings)
- [ ] Verifikasi SSE realtime di dashboard
- [ ] Uji end-to-end flow sensor → dashboard

### Phase 3: Polish (Minggu 4)
- [ ] UI/UX refinement untuk presentasi
- [ ] Testing (pytest backend, unit tests frontend)
- [ ] Dokumentasi API lengkap

### Phase 4: Deployment (Minggu 5)
- [ ] Deploy ke VPS / server lab
- [ ] Setup HTTPS dengan Let's Encrypt
- [ ] Load testing & monitoring
- [ ] Persiapan demo PKP2 & PIMNAS

---

## 📊 Best Practices PKM-KC

1. **Keamanan**: Ganti semua default secret keys sebelum demo
2. **Data**: Selalu seed database dengan data sampel yang realistis sebelum presentasi
3. **Backup**: Backup PostgreSQL secara rutin (`pg_dump`)
4. **Demo Mode**: Siapkan data dummy yang menarik untuk PIMNAS
5. **Dokumentasi**: Update README setiap ada perubahan signifikan

---

## 👥 Tim SCENTINEL PKM-KC 2026

> *Sistem Deteksi Dini Pembusukan Makanan Menggunakan Sensor Gas Portabel Berbasis Edge AI*

---

## 📄 Lisensi

MIT License — PKM-KC 2026
# PKM-KC-SCENTINEL
