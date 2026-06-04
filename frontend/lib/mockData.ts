// SCENTINEL - Realistic Dummy/Mock Data for Demo Mode
// Digunakan saat backend tidak berjalan (NEXT_PUBLIC_DEMO_MODE=true)
import { ReadingLatest, SensorReading, PaginatedReadings } from "@/types/reading";
import { Device } from "@/types/device";

// ─── Helper ───────────────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

// ─── Perangkat ────────────────────────────────────────────────────────────────

export const MOCK_DEVICES: Device[] = [
  {
    id: 1,
    device_name: "SCENTINEL-Node-01",
    serial_number: "SCN-2026-001",
    firmware_version: "v1.2.3",
    last_seen: minutesAgo(2),
    status: "ONLINE",
  },
  {
    id: 2,
    device_name: "SCENTINEL-Node-02",
    serial_number: "SCN-2026-002",
    firmware_version: "v1.2.1",
    last_seen: hoursAgo(3),
    status: "OFFLINE",
  },
  {
    id: 3,
    device_name: "SCENTINEL-Node-03",
    serial_number: "SCN-2026-003",
    firmware_version: "v1.2.3",
    last_seen: minutesAgo(8),
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
  food_name: "Ayam Segar",
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
  // Variasi kecil ±5% dari nilai sebelumnya, clamped ke range sensor
  const jitter = (val: number, range: number, min = 0, max = 4095) =>
    Math.max(min, Math.min(max, val + (Math.random() - 0.5) * 2 * range));

  const mq3 = jitter(prev.mq3, 15, 80, 600);
  const mq4 = jitter(prev.mq4, 12, 100, 500);
  const mq135 = jitter(prev.mq135, 20, 150, 700);
  const tgs2602 = jitter(prev.tgs2602, 8, 40, 300);
  const temperature = jitter(prev.temperature, 0.3, 15, 45);
  const humidity = jitter(prev.humidity, 0.8, 20, 95);

  // Confidence berfluktuasi sedikit
  const confidence = Math.max(0.7, Math.min(0.999, prev.confidence + (Math.random() - 0.5) * 0.04));

  return {
    ...prev,
    id: _readingIdCounter++,
    timestamp: new Date().toISOString(),
    mq3: parseFloat(mq3.toFixed(1)),
    mq4: parseFloat(mq4.toFixed(1)),
    mq135: parseFloat(mq135.toFixed(1)),
    tgs2602: parseFloat(tgs2602.toFixed(1)),
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    confidence: parseFloat(confidence.toFixed(4)),
  };
}

// ─── Riwayat Pembacaan (untuk halaman History) ────────────────────────────────

const FOOD_SAMPLES = ["Ayam Segar", "Daging Sapi", "Ikan Nila", "Tahu", "Tempe", "Susu Murni"];
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
    food_name: FOOD_SAMPLES[id % FOOD_SAMPLES.length],
    device_id: (id % 3) + 1,
  };
}

// Buat 60 data historis (interval 15 menit → ~15 jam ke belakang)
const ALL_HISTORY: SensorReading[] = Array.from({ length: 60 }, (_, i) =>
  buildHistoryItem(2000 - i, i * 15)
);

export function getMockHistory(
  offset = 0,
  limit = 20,
  filters: { device_id?: number; prediction?: string; food_name?: string } = {}
): PaginatedReadings {
  let filtered = [...ALL_HISTORY];

  if (filters.device_id) {
    filtered = filtered.filter((r) => r.device_id === filters.device_id);
  }
  if (filters.prediction) {
    filtered = filtered.filter((r) => r.prediction === filters.prediction);
  }
  if (filters.food_name) {
    filtered = filtered.filter((r) =>
      r.food_name?.toLowerCase().includes(filters.food_name!.toLowerCase())
    );
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
  let prev: SensorReading = { ...MOCK_LATEST_READING };

  for (let i = 29; i >= 0; i--) {
    const reading: SensorReading = {
      ...prev,
      id: 2018 + (29 - i),
      timestamp: new Date(Date.now() - i * 5000).toISOString(),
    };
    points.push(reading);
    prev = generateNextReading(reading);
  }
  return points;
})();
