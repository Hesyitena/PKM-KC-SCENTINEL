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
} from "lucide-react";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SHADOW = "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.06)";

export function ViewerMonitoringPage() {
  const { logout } = useAuth();
  const { latestReading, setConnected, pushChartReading } = useSensorStore();

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

  const S = {
    // Status card colors
    predBg: isLayak
      ? "linear-gradient(160deg, #f3fdf9 0%, #fafcfb 60%)"
      : "linear-gradient(160deg, #fef4f4 0%, #fbfafa 60%)",
    predBorder: isLayak ? "#d8f3e6" : "#f8dde1",
    predText: isLayak ? "#065f46" : "#9f1239",
    predSub: isLayak ? "#047857" : "#be123c",
    accent: isLayak ? "#10b981" : "#ea2261",
    accentSoft: isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.09)",
    shadow: isLayak
      ? "0 2px 8px rgba(0,0,0,0.04), 0 16px 48px rgba(16,185,129,0.14), 0 0 0 1px rgba(16,185,129,0.12)"
      : "0 2px 8px rgba(0,0,0,0.04), 0 16px 48px rgba(234,34,97,0.12), 0 0 0 1px rgba(234,34,97,0.12)",
    iconGrad: isLayak
      ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
      : "linear-gradient(135deg, #f87171 0%, #ea2261 100%)",
    iconShadow: isLayak
      ? "0 8px 24px rgba(16,185,129,0.30)"
      : "0 8px 24px rgba(234,34,97,0.28)",
    divider: isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
    // Full page background — quiet status tint, not a loud gradient
    pageBg: isLayak
      ? "linear-gradient(160deg, #f6fdfa 0%, #fafbfc 100%)"
      : "linear-gradient(160deg, #fdf7f7 0%, #fafbfc 100%)",
  };

  const sensorTape: {
    id: string;
    label: string;
    value: number;
    unit?: string;
    icon: ReactNode;
    color: keyof typeof SENSOR_COLOR_CONFIG;
  }[] = [
    { id: "card-mq3", label: "MQ-3 Alkohol", value: latestReading.mq3, icon: <Wind size={26} />, color: "primary" },
    { id: "card-mq4", label: "MQ-4 Metana", value: latestReading.mq4, icon: <Wind size={26} />, color: "fresh" },
    { id: "card-mq135", label: "MQ-135 Udara", value: latestReading.mq135, icon: <FlaskConical size={26} />, color: "amber" },
    { id: "card-tgs2602", label: "TGS-2602 VOC", value: latestReading.tgs2602, icon: <FlaskConical size={26} />, color: "spoiled" },
    { id: "card-temperature", label: "Suhu", value: latestReading.temperature, unit: "°C", icon: <Thermometer size={26} />, color: "amber" },
    { id: "card-humidity", label: "Kelembapan", value: latestReading.humidity, unit: "%", icon: <Droplets size={26} />, color: "primary" },
  ];

  return (
    <div
      id="viewer-monitoring-page"
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: S.pageBg }}
    >
      <header
        id="viewer-header"
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: SHADOW,
        }}
      >
        <div className="flex items-center gap-8">
          {/* Scentinel Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              <Image
                src="/logo-scentinel.png"
                alt="SCENTINEL Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.2px" }}>
                SCENTINEL
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.05em" }}>
                Live Food Quality Monitor
              </p>
            </div>
          </div>

          {/* PENS Logo */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              <Image
                src="/Logo_PENS.png"
                alt="PENS Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#0f172a", lineHeight: "1.3" }}>
                Politeknik Elektronika<br />Negeri Surabaya
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Real-time Clock */}
          {time && (
            <div className="hidden md:flex flex-col items-end mr-1 text-right">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#334155", letterSpacing: "-0.1px" }}>
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.04em", marginTop: "2px" }}>
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\./g, ":")} WIB
              </p>
            </div>
          )}

          {/* Live indicator — quiet, hero card carries the main energy */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
            />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em" }}>
              LIVE
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
            title="Keluar"
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-6 py-4 gap-4">

        {/* ── Hero: verdict is the thesis of this screen ── */}
        <div
          key={latestReading.prediction}
          className="flex-shrink-0 relative overflow-hidden animate-fade-in-scale"
          style={{
            background: S.predBg,
            border: `1px solid ${S.predBorder}`,
            borderRadius: "28px",
            boxShadow: S.shadow,
          }}
        >
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-8 py-9 lg:py-12">
            <SentinelRing isLayak={isLayak} accent={S.accent} iconGrad={S.iconGrad} iconShadow={S.iconShadow} />

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* AI badge row */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: S.accentSoft, border: `1px solid ${S.divider}` }}
                >
                  <Cpu size={10} color={S.accent} />
                  <span style={{ fontSize: "9px", fontWeight: 700, color: S.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Hasil Deteksi Edge AI
                  </span>
                </div>

                {latestReading.is_syncing && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse"
                    style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.20)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#8b5cf6", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      SD SYNC
                    </span>
                  </div>
                )}
              </div>

              {/* Giant verdict — readable from across the room */}
              <p
                style={{
                  fontFamily: "var(--font-grotesk)",
                  fontSize: "clamp(56px, 8vw, 128px)",
                  fontWeight: 800,
                  letterSpacing: "-4px",
                  lineHeight: 0.95,
                  color: S.predText,
                  textShadow: `0 4px 28px ${S.accentSoft}`,
                }}
              >
                {latestReading.prediction}
              </p>

              {/* Confidence + timestamp */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: S.accent, boxShadow: `0 0 8px ${S.accent}`, animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                  />
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Diperbarui{" "}
                    <span style={{ fontWeight: 600, color: "#273951", fontFamily: "var(--font-mono)" }}>
                      {new Date(latestReading.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </span>
                </div>

                {latestReading.confidence !== undefined && (
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: S.accentSoft, border: `1px solid ${S.divider}` }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: S.predText }}>
                      {(latestReading.confidence * 100).toFixed(1)}%
                    </span>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>keyakinan</span>
                  </div>
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
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 176, height: 176 }}>
      <div className="absolute inset-0 rounded-full animate-breathe" style={{ border: `2px solid ${accent}`, opacity: 0.14 }} />
      <div className="absolute inset-5 rounded-full animate-breathe delay-300" style={{ border: `2px solid ${accent}`, opacity: 0.22 }} />
      <div className="absolute inset-10 rounded-full animate-breathe delay-500" style={{ border: `2px solid ${accent}`, opacity: 0.32 }} />
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: 108, height: 108, background: iconGrad, boxShadow: iconShadow }}
      >
        {isLayak
          ? <ShieldCheck size={50} color="#fff" strokeWidth={1.5} />
          : <ShieldX size={50} color="#fff" strokeWidth={1.5} />
        }
      </div>
    </div>
  );
}

/* ── Compact glanceable sensor readout for the data tape ── */
function DataChip({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  icon: ReactNode;
  color: keyof typeof SENSOR_COLOR_CONFIG;
}) {
  const cfg = SENSOR_COLOR_CONFIG[color];
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl h-full"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid #e8edf3",
        boxShadow: "0 1px 4px rgba(0,55,112,0.05)",
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-2xl"
        style={{ width: 56, height: 56, background: cfg.iconBg, color: cfg.iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0 text-center">
        <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94a3b8" }}>
          {label}
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "34px", fontWeight: 700, letterSpacing: "-0.5px", color: cfg.value }}>
          {value.toFixed(1)}
          {unit && <span style={{ fontSize: "16px", fontWeight: 500, marginLeft: "2px", opacity: 0.7 }}>{unit}</span>}
        </p>
      </div>
    </div>
  );
}

/* ── Skeleton for initial loading state ── */
function ViewerSkeleton() {
  return (
    <div className="flex flex-col w-full h-full p-5 gap-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 rounded-xl bg-slate-100 flex-shrink-0" />
      {/* Status card skeleton */}
      <div className="h-48 rounded-2xl bg-slate-100 flex-shrink-0" />
      {/* Data tape skeleton */}
      <div className="flex-1 rounded-2xl bg-slate-100" />
    </div>
  );
}
