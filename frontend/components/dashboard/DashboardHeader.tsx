"use client";

import { useSensorStore } from "@/store/sensorStore";
import { Activity, Thermometer, Droplets, ShieldCheck, ShieldX } from "lucide-react";

export function DashboardHeader() {
  const { latestReading } = useSensorStore();

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isLayak = latestReading?.prediction === "LAYAK";

  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 animate-fade-in relative"
      style={{
        background: "linear-gradient(to right, rgba(255,255,255,0.98), rgba(248,250,255,0.98))",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 5%, rgba(83,58,253,0.10) 35%, rgba(16,185,129,0.10) 65%, transparent 95%)",
        }}
      />

      {/* Left: Title + icon */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 animate-glow-pulse"
          style={{
            background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
            boxShadow: "0 4px 16px rgba(83,58,253,0.30), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <Activity size={17} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#0d253d",
              letterSpacing: "-0.4px",
              lineHeight: 1.2,
            }}
          >
            Live Monitoring
          </h1>
          <p style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8", marginTop: "1px" }}>
            Deteksi pembusukan makanan secara realtime
          </p>
        </div>
      </div>

      {/* Center: Quick sensor stats (visible on md+) */}
      {latestReading && (
        <div className="hidden md:flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <Thermometer size={12} style={{ color: "#d97706" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#b45309",
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {latestReading.temperature.toFixed(1)}°C
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(83,58,253,0.05)",
              border: "1px solid rgba(83,58,253,0.12)",
            }}
          >
            <Droplets size={12} style={{ color: "#533afd" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#4434d4",
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {latestReading.humidity.toFixed(1)}%
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: isLayak ? "rgba(16,185,129,0.06)" : "rgba(234,34,97,0.06)",
              border: `1px solid ${isLayak ? "rgba(16,185,129,0.18)" : "rgba(234,34,97,0.18)"}`,
            }}
          >
            {isLayak ? (
              <ShieldCheck size={12} style={{ color: "#059669" }} />
            ) : (
              <ShieldX size={12} style={{ color: "#ea2261" }} />
            )}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: isLayak ? "#065f46" : "#9f1239",
                letterSpacing: "0.02em",
              }}
            >
              {latestReading.prediction}
            </span>
          </div>
        </div>
      )}

      {/* Right: Date */}
      <div
        className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full"
        style={{
          background: "#f8fafc",
          border: "1px solid #e8edf3",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#475569",
            letterSpacing: "-0.1px",
          }}
        >
          {today}
        </p>
      </div>
    </div>
  );
}
