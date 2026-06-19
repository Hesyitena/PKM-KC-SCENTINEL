"use client";

import { useRef } from "react";
import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { toast } from "sonner";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  ShieldX,
  Cpu,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/* ── Premium SVG Confidence Gauge ── */
function ConfidenceGauge({ value, isLayak }: { value: number; isLayak: boolean }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const sweep = C * 0.78; // ~280° arc
  const offset = sweep * (1 - value);
  const size = 136;
  const center = size / 2;

  const colorA = isLayak ? "#34d399" : "#f87171";
  const colorB = isLayak ? "#10b981" : "#ea2261";
  const glowColor = isLayak ? "rgba(16,185,129,0.45)" : "rgba(234,34,97,0.45)";
  const trackColor = isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.10)";
  const gradId = isLayak ? "gaugeGradL" : "gaugeGradS";
  const startAngle = -C * 0.11; // rotate to start at ~-140deg

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
        <filter id="glow-gauge" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx={center} cy={center} r={R}
        stroke={trackColor}
        strokeWidth="9"
        strokeDasharray={`${sweep} ${C - sweep}`}
        strokeDashoffset={startAngle}
        strokeLinecap="round"
      />
      {/* Active arc */}
      <circle
        cx={center} cy={center} r={R}
        stroke={`url(#${gradId})`}
        strokeWidth="9"
        strokeDasharray={`${sweep} ${C - sweep}`}
        strokeDashoffset={startAngle + offset}
        strokeLinecap="round"
        filter="url(#glow-gauge)"
        style={{
          transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)",
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
    </svg>
  );
}

export function LiveMonitoringPanel() {
  const { latestReading, chartData, setConnected, pushChartReading } =
    useSensorStore();

  const prevPredictionRef = useRef<string | null>(null);
  const wasConnectedRef = useRef<boolean>(false);

  const handleReading = (reading: SensorReading, isLive = true) => {
    pushChartReading(reading);
    
    if (isLive) {
      setConnected(true);

      if (!wasConnectedRef.current) {
        wasConnectedRef.current = true;
        toast.success("Perangkat ESP32 terhubung", {
          description: "Live stream aktif — data sedang masuk.",
          duration: 3000,
        });
      }
    }

    if (prevPredictionRef.current !== null && prevPredictionRef.current !== reading.prediction) {
      if (reading.prediction === "TIDAK LAYAK") {
        toast.error("Peringatan: Kualitas Menurun!", {
          description: `Deteksi AI: TIDAK LAYAK (${((reading.confidence ?? 0) * 100).toFixed(1)}% confidence)`,
          duration: 5000,
        });
      } else {
        toast.success("Status kembali normal", {
          description: `Deteksi AI: LAYAK (${((reading.confidence ?? 0) * 100).toFixed(1)}% confidence)`,
          duration: 4000,
        });
      }
    }
    prevPredictionRef.current = reading.prediction;
  };

  const handleError = () => {
    setConnected(false);
    if (wasConnectedRef.current) {
      wasConnectedRef.current = false;
      toast.warning("Koneksi terputus", {
        description: "Mencoba menghubungkan kembali ke perangkat...",
        duration: 4000,
      });
    }
  };

  useSSE({ onReading: handleReading, onError: handleError, enabled: !DEMO_MODE });
  useMockSSE({ onReading: handleReading, enabled: DEMO_MODE });

  if (!latestReading) {
    return <DashboardSkeleton />;
  }

  const isLayak = latestReading.prediction === "LAYAK";
  const conf = latestReading.confidence ?? 0;
  const confPct = Math.round(conf * 100);

  const S = {
    bgGrad: isLayak
      ? "linear-gradient(135deg, #f0fdf8 0%, #ffffff 60%)"
      : "linear-gradient(135deg, #fff5f5 0%, #ffffff 60%)",
    border:     isLayak ? "#a7f3d0" : "#fecdd3",
    borderGlow: isLayak ? "rgba(16,185,129,0.15)" : "rgba(234,34,97,0.12)",
    text:       isLayak ? "#065f46" : "#9f1239",
    textSub:    isLayak ? "#047857" : "#be123c",
    accent:     isLayak ? "#10b981" : "#ea2261",
    accentSoft: isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.09)",
    accentMid:  isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
    shadow: isLayak
      ? "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.10)"
      : "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(234,34,97,0.10), 0 0 0 1px rgba(234,34,97,0.10)",
    iconGrad: isLayak
      ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
      : "linear-gradient(135deg, #f87171 0%, #ea2261 100%)",
    iconShadow: isLayak
      ? "0 8px 24px rgba(16,185,129,0.40)"
      : "0 8px 24px rgba(234,34,97,0.35)",
    confLabel: isLayak ? "#10b981" : "#ea2261",
    divider:   isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
  };

  const accuracyLabel =
    conf >= 0.92 ? "Akurasi Tinggi" : conf >= 0.75 ? "Akurasi Sedang" : "Akurasi Rendah";

  return (
    <div id="live-monitoring-panel" className="flex flex-col gap-4 h-full min-h-0">

      {/* ══ STATUS CARD ══ */}
      <div
        className="flex-shrink-0 flex flex-col md:flex-row items-stretch overflow-hidden animate-slide-up"
        style={{
          background: S.bgGrad,
          border: `1px solid ${S.border}`,
          borderRadius: "22px",
          boxShadow: S.shadow,
        }}
      >
        {/* LEFT: Confidence Gauge zone */}
        <div
          className="flex flex-col items-center justify-center px-8 py-6 md:flex-shrink-0 border-b md:border-b-0 md:border-r relative"
          style={{
            borderColor: S.divider,
            minWidth: "170px",
            background: `radial-gradient(ellipse at 50% 30%, ${S.accentSoft} 0%, transparent 70%)`,
          }}
        >
          <div className="relative">
            <ConfidenceGauge value={conf} isLayak={isLayak} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: S.confLabel,
                  opacity: 0.7,
                  marginBottom: "2px",
                }}
              >
                Confidence
              </span>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  letterSpacing: "-1.5px",
                  fontFeatureSettings: '"tnum" 1',
                  color: S.text,
                  lineHeight: 1,
                }}
              >
                {confPct}%
              </span>
            </div>
          </div>
          <div
            className="mt-3 px-4 py-1 rounded-full"
            style={{
              background: S.accentMid,
              border: `1px solid ${S.divider}`,
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: S.textSub,
                letterSpacing: "0.04em",
              }}
            >
              {accuracyLabel}
            </span>
          </div>
        </div>

        {/* RIGHT: Prediction result */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit mb-5"
            style={{
              background: S.accentSoft,
              border: `1px solid ${S.divider}`,
            }}
          >
            <Cpu size={9} color={S.accent} />
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: S.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Hasil Deteksi Edge AI
            </span>
          </div>

          <div className="flex items-center gap-5 mb-5">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                background: S.iconGrad,
                borderRadius: "20px",
                width: "60px",
                height: "60px",
                boxShadow: S.iconShadow,
              }}
            >
              {isLayak
                ? <ShieldCheck size={30} color="#fff" strokeWidth={1.7} />
                : <ShieldX     size={30} color="#fff" strokeWidth={1.7} />
              }
            </div>

            <div>
              <p
                style={{
                  fontSize: "38px",
                  fontWeight: 800,
                  letterSpacing: "-2px",
                  color: S.text,
                  lineHeight: 1,
                }}
              >
                {latestReading.prediction}
              </p>
              {latestReading.food_name && (
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#94a3b8",
                    marginTop: "6px",
                  }}
                >
                  Sampel:{" "}
                  <span style={{ fontWeight: 600, color: S.textSub }}>
                    {latestReading.food_name}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-2 pt-4"
            style={{ borderTop: `1px solid ${S.divider}` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: S.accent,
                boxShadow: `0 0 8px ${S.accent}`,
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>
              Diperbarui pukul
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#273951",
                fontWeight: 600,
                fontFeatureSettings: '"tnum" 1',
                fontFamily: "var(--font-mono)",
              }}
            >
              {new Date(latestReading.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ══ SENSOR CARDS ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 flex-shrink-0">
        <SensorCard id="card-mq3"         label="MQ-3 Alkohol"  value={latestReading.mq3}         icon={<Wind size={13} />}         color="primary"  sublabel="ADC" />
        <SensorCard id="card-mq4"         label="MQ-4 Metana"   value={latestReading.mq4}         icon={<Wind size={13} />}         color="fresh"    sublabel="ADC" />
        <SensorCard id="card-mq135"       label="MQ-135 Udara"  value={latestReading.mq135}       icon={<FlaskConical size={13} />} color="amber"    sublabel="ADC" />
        <SensorCard id="card-tgs2602"     label="TGS-2602 VOC"  value={latestReading.tgs2602}     icon={<FlaskConical size={13} />} color="spoiled"  sublabel="ADC" />
        <SensorCard id="card-temperature" label="Suhu"          value={latestReading.temperature} icon={<Thermometer size={13} />}  color="amber"    unit="°C"  max={50} />
        <SensorCard id="card-humidity"    label="Kelembapan"    value={latestReading.humidity}    icon={<Droplets size={13} />}     color="primary"  unit="%" max={100} />
      </div>

      {/* ══ CHART ══ */}
      <div
        className="rounded-2xl border overflow-hidden flex flex-col flex-1 min-h-0"
        style={{
          background: "#ffffff",
          borderColor: "#e8edf3",
          boxShadow: "0 1px 4px rgba(0,55,112,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(83,58,253,0.12), rgba(83,58,253,0.05))",
                border: "1px solid rgba(83,58,253,0.15)",
                boxShadow: "0 2px 8px rgba(83,58,253,0.08)",
              }}
            >
              <BarChart3 size={16} style={{ color: "#533afd" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0d253d", letterSpacing: "-0.3px" }}>
                Grafik Sensor Gas
              </h3>
              <p style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>
                {chartData.length} titik data · Realtime
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5"
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              borderRadius: "9999px",
              textTransform: "uppercase",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        <div className="px-3 py-3 flex-1 min-h-0">
          <GasChart data={chartData} height="100%" />
        </div>
      </div>
    </div>
  );
}
