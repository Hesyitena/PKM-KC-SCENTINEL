// SCENTINEL - Realistic Dummy/Mock Data for Demo Mode
// Digunakan saat backend tidak berjalan (NEXT_PUBLIC_DEMO_MODE=true)
import { ReadingLatest, SensorReading, PaginatedReadings } from "@/types/reading";
import { Device } from "@/types/device";

/** Interval antar data point live (ms) — harus sinkron dengan useMockSSE */
export const LIVE_INTERVAL_MS = 1500;

// ─── Helper ───────────────────────────────────────────────────────────────────

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

// ─── Perangkat ────────────────────────────────────────────────────────────────

export const MOCK_DEVICES: Device[] = [
  {
    id: 1,
    device_name: "SCENTINEL-Node-01",
    serial_number: "SCT-ESP32-001",
    firmware_version: "v1.0.0",
    last_seen: minutesAgo(2),
    status: "ONLINE",
  },
];

// ─── Pembacaan Sensor Terbaru (untuk Live Dashboard) ─────────────────────────

export const MOCK_LATEST_READING: ReadingLatest = {
  id: 2048,
  timestamp: minutesAgo(1),
  mq3: 134.5,
  mq4: 198.2,
  mq135: 312.7,
  tgs2602: 87.4,
  temperature: 28.3,
  humidity: 67.1,
  prediction: "LAYAK",
  confidence: 0.9412,
  device_id: 1,
  device_name: "SCENTINEL-Node-01",
  device_serial: "SCN-2026-001",
};

// ─── Generator data sensor yang berfluktuasi secara realistis ─────────────────

let _readingIdCounter = 2049;

/**
 * Menghasilkan pembacaan sensor baru berdasarkan pembacaan sebelumnya,
 * dengan sedikit variasi acak yang realistis.
 */
export function generateNextReading(prev: SensorReading): SensorReading {
  // Variasi ±12% dari nilai sebelumnya, clamped ke range sensor
  const jitter = (val: number, range: number, min = 0, max = 4095) =>
    Math.max(min, Math.min(max, val + (Math.random() - 0.5) * 2 * range));

  const mq3     = jitter(prev.mq3,     40,  60,  700);
  const mq4     = jitter(prev.mq4,     35,  80,  600);
  const mq135   = jitter(prev.mq135,   55, 120,  900);
  const tgs2602 = jitter(prev.tgs2602, 22,  30,  400);
  const temperature = jitter(prev.temperature, 0.6, 15, 45);
  const humidity    = jitter(prev.humidity,    1.5, 20, 95);

  const confidence = Math.max(0.70, Math.min(0.999, prev.confidence + (Math.random() - 0.5) * 0.06));

  return {
    ...prev,
    id: _readingIdCounter++,
    timestamp: new Date().toISOString(),
    mq3:      parseFloat(mq3.toFixed(1)),
    mq4:      parseFloat(mq4.toFixed(1)),
    mq135:    parseFloat(mq135.toFixed(1)),
    tgs2602:  parseFloat(tgs2602.toFixed(1)),
    temperature: parseFloat(temperature.toFixed(1)),
    humidity:    parseFloat(humidity.toFixed(1)),
    confidence:  parseFloat(confidence.toFixed(4)),
  };
}

// ─── Riwayat Pembacaan (untuk halaman History) ────────────────────────────────

const PREDICTIONS: Array<{ prediction: "LAYAK" | "TIDAK LAYAK"; confidence: [number, number] }> = [
  { prediction: "LAYAK",       confidence: [0.88, 0.99] },
  { prediction: "LAYAK",       confidence: [0.82, 0.97] },
  { prediction: "LAYAK",       confidence: [0.91, 0.99] },
  { prediction: "TIDAK LAYAK", confidence: [0.75, 0.95] },
  { prediction: "LAYAK",       confidence: [0.85, 0.98] },
  { prediction: "TIDAK LAYAK", confidence: [0.80, 0.93] },
  { prediction: "LAYAK",       confidence: [0.94, 0.99] },
  { prediction: "LAYAK",       confidence: [0.88, 0.96] },
];

function randomBetween(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function buildHistoryItem(id: number, minsAgo: number): SensorReading {
  const p = PREDICTIONS[id % PREDICTIONS.length];
  const confidence = randomBetween(p.confidence[0], p.confidence[1], 4);
  const isSpoiled = p.prediction === "TIDAK LAYAK";

  return {
    id,
    timestamp: minutesAgo(minsAgo),
    mq3:      isSpoiled ? randomBetween(380, 900)   : randomBetween(80, 200),
    mq4:      isSpoiled ? randomBetween(300, 700)   : randomBetween(100, 250),
    mq135:    isSpoiled ? randomBetween(500, 1100)  : randomBetween(150, 380),
    tgs2602:  isSpoiled ? randomBetween(180, 450)   : randomBetween(30, 120),
    temperature: randomBetween(25, 32),
    humidity:    randomBetween(55, 80),
    prediction:  p.prediction,
    confidence,
    device_id: 1,
  };
}

// Buat 60 data historis (interval 15 menit → ~15 jam ke belakang)
const ALL_HISTORY: SensorReading[] = Array.from({ length: 60 }, (_, i) =>
  buildHistoryItem(2000 - i, i * 15)
);

export function getMockHistory(
  offset = 0,
  limit = 20,
  filters: { prediction?: string } = {}
): PaginatedReadings {
  let filtered = [...ALL_HISTORY];

  if (filters.prediction) {
    filtered = filtered.filter((r) => r.prediction === filters.prediction);
  }

  return {
    total: filtered.length,
    limit,
    offset,
    items: filtered.slice(offset, offset + limit),
  };
}

// ─── Initial chart data (30 titik ke belakang, interval 5 detik) ──────────────

export const MOCK_INITIAL_CHART_DATA: SensorReading[] = (() => {
  const points: SensorReading[] = [];
  const N = 60; // match MAX_CHART_POINTS

  // Base values — realistic mid-range
  const base = {
    mq3: 130, mq4: 200, mq135: 310, tgs2602: 85,
    temperature: 28.5, humidity: 67,
  };

  // Amplitude of oscillations per sensor
  const amp = {
    mq3: 85, mq4: 75, mq135: 120, tgs2602: 50,
    temperature: 2.5, humidity: 9,
  };

  for (let i = 0; i < N; i++) {
    // 3 full wave cycles across all 60 points, each sensor has own phase
    const t = (i / N) * Math.PI * 6;
    const noise = () => (Math.random() - 0.5) * 14;

    // Occasional spikes to simulate real sensor events (~10% chance)
    const spike = Math.random() < 0.10 ? (Math.random() * 50 + 20) : 0;

    const reading: SensorReading = {
      ...MOCK_LATEST_READING,
      id: 2018 + i,
      timestamp: new Date(Date.now() - (N - 1 - i) * 1500).toISOString(),
      mq3:      parseFloat(Math.max(40,  base.mq3     + Math.sin(t + 0.0) * amp.mq3     + noise() + spike).toFixed(1)),
      mq4:      parseFloat(Math.max(60,  base.mq4     + Math.sin(t + 1.2) * amp.mq4     + noise()).toFixed(1)),
      mq135:    parseFloat(Math.max(100, base.mq135   + Math.sin(t + 2.4) * amp.mq135   + noise()).toFixed(1)),
      tgs2602:  parseFloat(Math.max(20,  base.tgs2602 + Math.sin(t + 0.8) * amp.tgs2602 + noise()).toFixed(1)),
      temperature: parseFloat((base.temperature + Math.sin(t + 1.6) * amp.temperature + (Math.random() - 0.5) * 0.6).toFixed(1)),
      humidity:    parseFloat((base.humidity    + Math.sin(t + 3.0) * amp.humidity    + (Math.random() - 0.5) * 2.0).toFixed(1)),
      is_syncing:  true, // Simulasi bahwa data awal ini adalah sinkronisasi dari memori internal/SD Card
    };
    points.push(reading);
  }

  return points;
})();
