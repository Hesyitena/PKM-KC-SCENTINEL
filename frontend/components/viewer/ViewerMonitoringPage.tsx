"use client";

import { useRef, useState, useEffect } from "react";
import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { GasChart } from "@/components/dashboard/GasChart";
import { toast } from "sonner";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Cpu,
  BarChart3,
  Wifi,
  LogOut,
} from "lucide-react";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function ViewerMonitoringPage() {
  const { logout } = useAuth();
  const { latestReading, chartData, setConnected, pushChartReading } =
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

  const S = {
    // Status card colors
    predBg: isLayak
      ? "linear-gradient(135deg, #f0fdf8 0%, #ecfdf5 100%)"
      : "linear-gradient(135deg, #fff5f5 0%, #fff1f2 100%)",
    predBorder: isLayak ? "#a7f3d0" : "#fecdd3",
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
      ? "0 8px 32px rgba(16,185,129,0.45)"
      : "0 8px 32px rgba(234,34,97,0.40)",
    divider: isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
    // Full page background
    pageBg: isLayak
      ? "linear-gradient(160deg, #f0fdf8 0%, #f8fafc 40%, #f0fdf4 100%)"
      : "linear-gradient(160deg, #fff5f5 0%, #f8fafc 40%, #fff1f2 100%)",
  };

  return (
    <div
      id="viewer-monitoring-page"
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: S.pageBg }}
    >
      {/* ── Top bar ── */}
      <header
        id="viewer-header"
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-6">
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
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#0d253d", letterSpacing: "-0.4px" }}>
                SCENTINEL
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.05em" }}>
                Live Food Quality Monitor
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

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
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#0d253d", lineHeight: "1.2" }}>
                Politeknik Elektronika<br />Negeri Surabaya
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Clock */}
          {time && (
            <div className="hidden md:flex flex-col items-end mr-2 text-right">
              <p className="text-[12px] font-bold text-slate-700">
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-wide">
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\./g, ":")} WIB
              </p>
            </div>
          )}

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            <Wifi size={12} color="#059669" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857" }}>
              LIVE
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
            title="Keluar"
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-5 gap-4">

        {/* ── Status + Sensor Grid (top section) ── */}
        <div
          className="flex-shrink-0 flex flex-col lg:flex-row items-stretch overflow-hidden"
          style={{
            background: S.predBg,
            border: `1px solid ${S.predBorder}`,
            borderRadius: "24px",
            boxShadow: S.shadow,
          }}
        >
          {/* LEFT: Big prediction display */}
          <div
            className="flex flex-col justify-center px-8 py-6 lg:pr-8"
            style={{
              borderBottom: `1px solid ${S.divider}`,
              borderRight: "none",
              minWidth: "280px",
            }}
          >
            {/* AI badge */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: S.accentSoft,
                  border: `1px solid ${S.divider}`,
                }}
              >
                <Cpu size={10} color={S.accent} />
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: S.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}>
                  Hasil Deteksi Edge AI
                </span>
              </div>

              {latestReading.is_syncing && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse"
                  style={{
                    background: "rgba(139,92,246,0.10)",
                    border: "1px solid rgba(139,92,246,0.20)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#8b5cf6",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}>
                    SD SYNC
                  </span>
                </div>
              )}
            </div>

            {/* Big icon + prediction text */}
            <div className="flex items-center gap-6 mb-6">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  background: S.iconGrad,
                  borderRadius: "24px",
                  width: "80px",
                  height: "80px",
                  boxShadow: S.iconShadow,
                }}
              >
                {isLayak
                  ? <ShieldCheck size={40} color="#fff" strokeWidth={1.5} />
                  : <ShieldX size={40} color="#fff" strokeWidth={1.5} />
                }
              </div>

              <div>
                <p style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  letterSpacing: "-2.5px",
                  color: S.predText,
                  lineHeight: 1,
                  textShadow: `0 2px 16px ${S.accentSoft}`,
                }}>
                  {latestReading.prediction}
                </p>
                {latestReading.food_name && (
                  <p style={{ fontSize: "14px", fontWeight: 400, color: "#94a3b8", marginTop: "8px" }}>
                    Sampel:{" "}
                    <span style={{ fontWeight: 600, color: S.predSub }}>
                      {latestReading.food_name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Confidence + timestamp */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: `1px solid ${S.divider}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: S.accent,
                    boxShadow: `0 0 8px ${S.accent}`,
                    animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                  }}
                />
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
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
                  style={{
                    background: S.accentSoft,
                    border: `1px solid ${S.divider}`,
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: S.predText }}>
                    {(latestReading.confidence * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>keyakinan</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: 3x2 Sensor Grid */}
          <div
            className="flex-1 p-4"
            style={{ borderLeft: `1px solid ${S.divider}` }}
          >
            <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full">
              <SensorCard id="card-mq3"         label="MQ-3 Alkohol"  value={latestReading.mq3}         icon={<Wind size={13} />}         color="primary"  sublabel="ADC" />
              <SensorCard id="card-mq4"         label="MQ-4 Metana"   value={latestReading.mq4}         icon={<Wind size={13} />}         color="fresh"    sublabel="ADC" />
              <SensorCard id="card-mq135"       label="MQ-135 Udara"  value={latestReading.mq135}       icon={<FlaskConical size={13} />} color="amber"    sublabel="ADC" />
              <SensorCard id="card-tgs2602"     label="TGS-2602 VOC"  value={latestReading.tgs2602}     icon={<FlaskConical size={13} />} color="spoiled"  sublabel="ADC" />
              <SensorCard id="card-temperature" label="Suhu"          value={latestReading.temperature} icon={<Thermometer size={13} />}  color="amber"    unit="°C" max={50} />
              <SensorCard id="card-humidity"    label="Kelembapan"    value={latestReading.humidity}    icon={<Droplets size={13} />}     color="primary"  unit="%" max={100} />
            </div>
          </div>
        </div>

        {/* ── Chart (bottom, fills remaining height) ── */}
        <div
          className="rounded-2xl border flex flex-col flex-1 min-h-0 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
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
                <h1 style={{ fontSize: "14px", fontWeight: 600, color: "#0d253d", letterSpacing: "-0.3px" }}>
                  Grafik Sensor Gas
                </h1>
                <p style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>
                  {chartData.length} titik data · Realtime
                </p>
              </div>
            </div>
          </div>

          <div className="px-3 py-3 flex-1 min-h-0">
            <GasChart data={chartData} height="100%" />
          </div>
        </div>
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
      {/* Chart skeleton */}
      <div className="flex-1 rounded-2xl bg-slate-100" />
    </div>
  );
}
