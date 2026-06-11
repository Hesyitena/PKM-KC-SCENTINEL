"use client";

import { useRef } from "react";
import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  Clock,
  BarChart3,
  ShieldCheck,
  ShieldX,
  Cpu,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/* ── Stripe-inspired SVG Confidence Arc ── */
function ConfidenceArc({ value, isLayak }: { value: number; isLayak: boolean }) {
  const R = 36;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - value);
  /* Stripe uses primary indigo for positive, ruby for negative */
  const trackColor  = isLayak ? "#ecfdf5" : "#fff1f2";
  const strokeColor = isLayak ? "#10b981" : "#ea2261"; /* emerald / stripe-ruby */

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
      <circle cx="44" cy="44" r={R} stroke={trackColor} strokeWidth="7" />
      <circle
        cx="44" cy="44" r={R}
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

export function LiveMonitoringPanel() {
  const { latestReading, chartData, setConnected, pushChartReading } =
    useSensorStore();

  // Track previous prediction to fire toast only on change
  const prevPredictionRef = useRef<string | null>(null);
  const wasConnectedRef = useRef<boolean>(false);

  const handleReading = (reading: SensorReading) => {
    pushChartReading(reading);
    setConnected(true);

    // Toast: reconnect
    if (!wasConnectedRef.current) {
      wasConnectedRef.current = true;
      toast.success("Perangkat ESP32 terhubung", {
        description: "Live stream aktif — data sedang masuk.",
        duration: 3000,
      });
    }

    // Toast: prediction change
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

  /* ── Loading skeleton state ── */
  if (!latestReading) {
    return <DashboardSkeleton />;
  }

  const isLayak = latestReading.prediction === "LAYAK";
  const conf    = latestReading.confidence ?? 0;
  const confPct = (conf * 100).toFixed(1);

  /* Stripe semantic: emerald for positive, ruby for negative */
  const S = {
    bg:     isLayak ? "#ecfdf5"    : "#fff1f2",
    border: isLayak ? "#6ee7b7"    : "#fecdd3",
    text:   isLayak ? "#047857"    : "#be123c",
    accent: isLayak ? "#10b981"    : "#ea2261",   /* emerald / stripe-ruby */
    shadow: isLayak
      ? "rgba(0,55,112,0.06) 0 1px 3px, rgba(16,185,129,0.10) 0 8px 24px"
      : "rgba(0,55,112,0.06) 0 1px 3px, rgba(234,34,97,0.10) 0 8px 24px",
  };

  return (
    <div id="live-monitoring-panel" className="flex flex-col gap-3 h-full min-h-0">

      {/* ══ STATUS CARD ══ */}
      <div
        className="flex-shrink-0 flex overflow-hidden"
        style={{
          background: "#ffffff",
          border: `1px solid ${S.border}`,
          borderRadius: "14px",
          boxShadow: S.shadow,
        }}
      >
        {/* ── Zone 1: AI Prediction ── */}
        <div
          className="flex items-center gap-5 px-8 py-5 flex-1"
          style={{
            background: `linear-gradient(135deg, ${S.bg} 0%, #ffffff 100%)`,
            borderRight: `1px solid ${S.border}`,
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${S.accent} 0%, ${S.accent}cc 100%)`,
              borderRadius: "14px",
              width: "56px",
              height: "56px",
              boxShadow: `0 6px 20px ${S.accent}40`,
            }}
          >
            {isLayak
              ? <ShieldCheck size={28} color="#fff" strokeWidth={1.8} />
              : <ShieldX     size={28} color="#fff" strokeWidth={1.8} />
            }
          </div>

          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mb-1.5"
              style={{
                background: `${S.accent}18`,
                border: `1px solid ${S.accent}30`,
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 600, color: S.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Hasil Deteksi AI
              </span>
            </div>
            <p style={{
              fontSize: "30px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              color: S.text,
              lineHeight: 1.0,
            }}>
              {latestReading.prediction}
            </p>
          </div>
        </div>

        {/* ── Zone 2: Confidence gauge ── */}
        <div
          className="flex items-center gap-5 px-8 py-5 flex-1"
          style={{ background: "#ffffff" }}
        >
          <div className="relative flex-shrink-0" style={{ transform: "scale(1.15)", transformOrigin: "center left" }}>
            <ConfidenceArc value={conf} isLayak={isLayak} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                fontFeatureSettings: '"tnum" 1',
                color: S.text,
                lineHeight: 1,
              }}>
                {Math.round(conf * 100)}%
              </span>
            </div>
          </div>
          <div className="ml-2">
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
              Confidence Level
            </p>
            <p style={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              fontFeatureSettings: '"tnum" 1',
              color: "#0d253d",
              lineHeight: 1,
            }}>
              {confPct}
              <span style={{ fontSize: "14px", color: "#94a3b8", marginLeft: "2px", fontWeight: 400 }}>%</span>
            </p>
          </div>
        </div>
      </div>

      {/* ══ SENSOR CARDS ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 flex-shrink-0">
        <SensorCard id="card-mq3"         label="MQ-3 Alkohol"  value={latestReading.mq3}         icon={<Wind size={12} />}         color="primary"  sublabel="ADC" />
        <SensorCard id="card-mq4"         label="MQ-4 Metana"   value={latestReading.mq4}         icon={<Wind size={12} />}         color="fresh"    sublabel="ADC" />
        <SensorCard id="card-mq135"       label="MQ-135 Udara"  value={latestReading.mq135}       icon={<FlaskConical size={12} />} color="amber"    sublabel="ADC" />
        <SensorCard id="card-tgs2602"     label="TGS-2602 VOC"  value={latestReading.tgs2602}     icon={<FlaskConical size={12} />} color="spoiled"  sublabel="ADC" />
        <SensorCard id="card-temperature" label="Suhu"          value={latestReading.temperature} icon={<Thermometer size={12} />}  color="amber"    unit="°C"  max={50} />
        <SensorCard id="card-humidity"    label="Kelembapan"    value={latestReading.humidity}    icon={<Droplets size={12} />}     color="primary"  unit="%"   max={100} />
      </div>

      {/* ══ CHART — Stripe card-dashboard-mockup style ══ */}
      <div
        className="rounded-xl border overflow-hidden flex flex-col flex-1 min-h-0"
        style={{
          background: "#ffffff",
          borderColor: "#e3e8ee",
          boxShadow: "rgba(0,55,112,0.06) 0 1px 3px, rgba(0,55,112,0.04) 0 4px 16px",
          borderRadius: "12px",
        }}
      >
        {/* Chart header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #e3e8ee" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{ background: "rgba(83,58,253,0.07)", border: "1px solid rgba(83,58,253,0.12)", borderRadius: "8px" }}
            >
              <BarChart3 size={14} style={{ color: "#533afd" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 400, color: "#0d253d", letterSpacing: "-0.22px" }}>
                Grafik Sensor Gas
              </h3>
              <p style={{ fontSize: "11px", fontWeight: 300, color: "#64748d" }}>ADC readings over time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stripe body-tabular for count */}
            <span style={{
              fontSize: "12px",
              fontWeight: 300,
              color: "#64748d",
              fontFeatureSettings: '"tnum" 1',
              letterSpacing: "-0.42px",
            }}>
              {chartData.length} data poin
            </span>
            {/* Stripe pill-tag-soft — emerald for Live */}
            <div
              className="flex items-center gap-1.5 px-3 py-1"
              style={{
                background: "#ecfdf5",
                border: "1px solid #6ee7b7",
                color: "#047857",
                fontSize: "10px",
                fontWeight: 400,
                letterSpacing: "0.1px",
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
        </div>

        {/* Chart body */}
        <div className="px-3 py-2 flex-1 min-h-0">
          <GasChart data={chartData} height="100%" />
        </div>
      </div>
    </div>
  );
}
