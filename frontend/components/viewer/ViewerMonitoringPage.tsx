"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { SENSOR_COLOR_CONFIG } from "@/components/dashboard/SensorCard";
import { toast } from "sonner";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Cpu,
  LogOut,
  Radio,
  WifiOff,
  CalendarDays,
} from "lucide-react";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/* Card elevation — same token as SensorCard / chart panel on the dashboard */
const CARD_SHADOW =
  "0 1px 4px rgba(0,55,112,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)";
const HAIRLINE = "#e8edf3";

/* Header pill — the login page's feature-pill treatment, for use on navy */
const PILL: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.85)",
  fontSize: "12px",
  fontWeight: 500,
};

/* Brand navy — same ramp as the admin sidebar and the login hero panel,
   turned horizontal because here it carries a bar instead of a column. */
const NAVY =
  "linear-gradient(100deg, hsl(227 68% 15%) 0%, hsl(230 72% 24%) 55%, hsl(225 58% 34%) 100%)";

/* Grid pattern overlay — lifted from the login panel */
const GRID_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function ViewerMonitoringPage() {
  const { logout } = useAuth();
  const { latestReading, isConnected, setConnected, pushChartReading } =
    useSensorStore();

  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

    if (
      prevPredictionRef.current !== null &&
      prevPredictionRef.current !== reading.prediction
    ) {
      if (reading.prediction === "TIDAK LAYAK") {
        toast.error("Peringatan: Kualitas Menurun!", {
          description: "Deteksi AI: TIDAK LAYAK — segera periksa sampel.",
          duration: 5000,
        });
      } else {
        toast.success("Status kembali normal", {
          description: "Deteksi AI: LAYAK — kualitas sampel baik.",
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
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <ViewerSkeleton />
      </div>
    );
  }

  const isLayak = latestReading.prediction === "LAYAK";

  /* Status palette — same values as the dashboard status card */
  const S = {
    bgGrad: isLayak
      ? "linear-gradient(135deg, #f0fdf8 0%, #ffffff 60%)"
      : "linear-gradient(135deg, #fff5f5 0%, #ffffff 60%)",
    border: isLayak ? "#a7f3d0" : "#fecdd3",
    text: isLayak ? "#065f46" : "#9f1239",
    accent: isLayak ? "#10b981" : "#ea2261",
    accentSoft: isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.09)",
    divider: isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
    shadow: isLayak
      ? "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.10)"
      : "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(234,34,97,0.10), 0 0 0 1px rgba(234,34,97,0.10)",
    iconGrad: isLayak
      ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
      : "linear-gradient(135deg, #f87171 0%, #ea2261 100%)",
    iconShadow: isLayak
      ? "0 8px 24px rgba(16,185,129,0.40)"
      : "0 8px 24px rgba(234,34,97,0.35)",
  };

  const sensorTape: {
    id: string;
    label: string;
    value: number;
    unit?: string;
    max?: number;
    icon: ReactNode;
    color: keyof typeof SENSOR_COLOR_CONFIG;
  }[] = [
    { id: "card-mq3", label: "MQ-3 Alkohol", value: latestReading.mq3, icon: <Wind size={24} />, color: "primary" },
    { id: "card-mq4", label: "MQ-4 Metana", value: latestReading.mq4, icon: <Wind size={24} />, color: "fresh" },
    { id: "card-mq135", label: "MQ-135 Udara", value: latestReading.mq135, icon: <FlaskConical size={24} />, color: "amber" },
    { id: "card-tgs2602", label: "TGS-2602 VOC", value: latestReading.tgs2602, icon: <FlaskConical size={24} />, color: "spoiled" },
    { id: "card-temperature", label: "Suhu", value: latestReading.temperature, unit: "°C", max: 50, icon: <Thermometer size={24} />, color: "amber" },
    { id: "card-humidity", label: "Kelembapan", value: latestReading.humidity, unit: "%", max: 100, icon: <Droplets size={24} />, color: "primary" },
  ];

  return (
    <div
      id="viewer-monitoring-page"
      className="flex flex-col w-full h-full overflow-hidden"
    >
      {/* ── Header — carries the brand navy the sidebar carries on admin pages ── */}
      <header
        id="viewer-header"
        className="relative flex-shrink-0 flex items-center justify-between gap-4 px-5 h-16 overflow-hidden"
        style={{
          background: NAVY,
          boxShadow: "0 4px 20px -4px rgba(0,55,112,0.25)",
          zIndex: 10,
        }}
      >
        {/* Grid texture + top glow — same treatment as the login panel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: GRID_PATTERN }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 200% at 20% -40%, rgba(255,255,255,0.14) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex items-center gap-3 min-w-0">
          {/* PENS logo + name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-center rounded-lg bg-white p-1">
              <Image src="/Logo_PENS.png" alt="Logo PENS" width={30} height={30} priority />
            </div>
            <span
              className="hidden sm:block"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.2px",
                lineHeight: 1.3,
              }}
            >
              Politeknik Elektronika Negeri Surabaya
            </span>
          </div>

          <div className="hidden sm:block h-6 w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />

          {/* SCENTINEL mark + page title */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md"
              style={{
                background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                boxShadow: "0 2px 10px rgba(83,58,253,0.55)",
              }}
            >
              <Radio size={12} color="#fff" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="hidden md:block flex-shrink-0"
                style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.2px" }}
              >
                SCENTINEL
              </span>
              <span
                className="hidden md:block flex-shrink-0"
                style={{ fontSize: "12.5px", fontWeight: 300, color: "rgba(255,255,255,0.35)" }}
              >
                ·
              </span>
              <h1
                id="viewer-page-title"
                className="truncate"
                style={{ fontSize: "13px", fontWeight: 600, color: "#b9b9f9", letterSpacing: "-0.2px" }}
              >
                Live Monitoring
              </h1>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 flex-shrink-0">
          {time && (
            <>
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={PILL}
              >
                <CalendarDays size={10} style={{ color: "#94a3b8" }} />
                <span>
                  {time.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ ...PILL, fontFamily: "var(--font-mono)", fontFeatureSettings: '"tnum" 1' }}
              >
                {time
                  .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  .replace(/\./g, ":")}{" "}
                WIB
              </div>
            </>
          )}

          {/* Connection badge — same component language as the navbar */}
          <div
            id="sse-status-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
            style={
              isConnected
                ? {
                    background: "rgba(16,185,129,0.18)",
                    border: "1px solid rgba(110,231,183,0.45)",
                    color: "#6ee7b7",
                    fontSize: "11.5px",
                    fontWeight: 600,
                  }
                : {
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "11.5px",
                    fontWeight: 500,
                  }
            }
          >
            {isConnected ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live
              </>
            ) : (
              <>
                <WifiOff size={11} />
                Offline
              </>
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/55 hover:text-white hover:bg-rose-500/25 transition-colors duration-200"
            title="Keluar"
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-6 py-4 lg:py-5 gap-4">

        {/* ── Hero: verdict is the thesis of this screen ── */}
        <div
          key={latestReading.prediction}
          className="flex-shrink-0 relative overflow-hidden animate-slide-up"
          style={{
            background: S.bgGrad,
            border: `1px solid ${S.border}`,
            borderRadius: "22px",
            boxShadow: S.shadow,
          }}
        >
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-8 py-8 lg:py-12">
            <SentinelRing isLayak={isLayak} accent={S.accent} iconGrad={S.iconGrad} iconShadow={S.iconShadow} />

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Badge row — same pills as the dashboard status card */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit"
                  style={{ background: S.accentSoft, border: `1px solid ${S.divider}` }}
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

                {latestReading.is_syncing && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit animate-pulse"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "#8b5cf6",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      SD CARD SYNC
                    </span>
                  </div>
                )}
              </div>

              {/* Giant verdict — dashboard's type treatment, kiosk scale */}
              <p
                style={{
                  fontSize: "clamp(52px, 7.5vw, 112px)",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                  color: S.text,
                }}
              >
                {latestReading.prediction}
              </p>

              {/* Footer line — mirrors "Diperbarui pukul" on the dashboard */}
              <div
                className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-4 w-full"
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
                {latestReading.confidence !== undefined && (
                  <>
                    <span style={{ color: "#cbd5e1" }}>·</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: S.text }}>
                      {(latestReading.confidence * 100).toFixed(1)}% keyakinan
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Data tape: glanceable sensor readout, filling remaining screen ── */}
        <div
          className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-0"
          style={{ gridAutoRows: "1fr" }}
        >
          {sensorTape.map((s) => (
            <DataChip key={s.id} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Signature element: the "sentinel" — concentric rings breathing outward
 * from the verdict icon, standing in for the device continuously sensing
 * the air. Doubles as a state-change cue since it remounts (and re-plays)
 * whenever the prediction flips.
 */
function SentinelRing({
  isLayak,
  accent,
  iconGrad,
  iconShadow,
}: {
  isLayak: boolean;
  accent: string;
  iconGrad: string;
  iconShadow: string;
}) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 160, height: 160 }}>
      <div className="absolute inset-0 rounded-full animate-breathe" style={{ border: `1px solid ${accent}`, opacity: 0.16 }} />
      <div className="absolute inset-8 rounded-full animate-breathe delay-300" style={{ border: `1px solid ${accent}`, opacity: 0.26 }} />
      <div
        className="relative flex items-center justify-center"
        style={{ width: 104, height: 104, borderRadius: 32, background: iconGrad, boxShadow: iconShadow }}
      >
        {isLayak
          ? <ShieldCheck size={46} color="#fff" strokeWidth={1.7} />
          : <ShieldX size={46} color="#fff" strokeWidth={1.7} />
        }
      </div>
    </div>
  );
}

/* ── Sensor readout — SensorCard's visual language, scaled for across-the-room reading ── */
function DataChip({
  id,
  label,
  value,
  unit,
  max,
  icon,
  color,
}: {
  id: string;
  label: string;
  value: number;
  unit?: string;
  max?: number;
  icon: ReactNode;
  color: keyof typeof SENSOR_COLOR_CONFIG;
}) {
  const cfg = SENSOR_COLOR_CONFIG[color];
  // Same bar math as SensorCard: fall back to a 1.5× headroom scale for raw ADC.
  const effectiveMax = max ?? Math.max(value * 1.5, 1);
  const barPct = Math.min(1, Math.max(0.02, value / effectiveMax));

  return (
    <div
      id={id}
      className="relative flex flex-col items-center justify-center gap-3 h-full overflow-hidden px-4 py-5"
      style={{
        background: "#ffffff",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: "16px",
        boxShadow: CARD_SHADOW,
      }}
    >
      {/* Top gradient accent — same detail as SensorCard */}
      <div
        className="absolute top-0 inset-x-0"
        style={{
          height: "2px",
          background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
          opacity: 0.5,
        }}
      />

      <div
        className="flex items-center justify-center flex-shrink-0 rounded-2xl"
        style={{ width: 52, height: 52, background: cfg.iconBg, color: cfg.iconColor }}
      >
        {icon}
      </div>

      <div className="min-w-0 text-center">
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94a3b8" }}>
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(26px, 3vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-1px",
            lineHeight: 1.15,
            fontFeatureSettings: '"tnum" 1',
            color: cfg.value,
          }}
        >
          {value.toFixed(1)}
          {unit && (
            <span style={{ fontSize: "0.45em", fontWeight: 500, marginLeft: "3px", color: cfg.accent, opacity: 0.75 }}>
              {unit}
            </span>
          )}
        </p>
      </div>

      {/* Progress track — same token as SensorCard */}
      <div
        className="w-full max-w-[180px]"
        style={{ height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "9999px", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100%",
            width: `${barPct * 100}%`,
            background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
            borderRadius: "9999px",
            transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Skeleton for initial loading state ── */
function ViewerSkeleton() {
  return (
    <div className="flex flex-col w-full h-full p-5 gap-4">
      <div className="h-16 skeleton flex-shrink-0" />
      <div className="h-56 skeleton flex-shrink-0" style={{ borderRadius: "22px" }} />
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ gridAutoRows: "1fr" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-full" style={{ borderRadius: "16px" }} />
        ))}
      </div>
    </div>
  );
}
