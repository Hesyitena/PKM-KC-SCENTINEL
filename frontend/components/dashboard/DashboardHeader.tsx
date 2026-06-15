"use client";

import { useSensorStore } from "@/store/sensorStore";
import { Activity, Zap } from "lucide-react";

export function DashboardHeader() {
  const { isConnected } = useSensorStore();

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 animate-fade-in"
      style={{
        borderBottom: "1px solid #f0f4f8",
        background: "linear-gradient(to right, rgba(255,255,255,0.95), rgba(249,250,255,0.95))",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Title + subtitle */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
            boxShadow: "0 4px 12px rgba(83,58,253,0.30)",
          }}
        >
          <Activity size={16} color="#fff" />
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

      {/* Right: Connection status + date */}
      <div className="flex items-center gap-2.5">
        {/* Connection pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
          style={
            isConnected
              ? {
                  background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                  border: "1px solid #a7f3d0",
                  boxShadow: "0 2px 8px rgba(16,185,129,0.15)",
                }
              : {
                  background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                  border: "1px solid #fed7aa",
                }
          }
        >
          {isConnected ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", letterSpacing: "0.02em" }}>
                Terhubung
              </span>
            </>
          ) : (
            <>
              <Zap size={10} color="#c2410c" />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#c2410c", letterSpacing: "0.02em" }}>
                Menunggu...
              </span>
            </>
          )}
        </div>

        {/* Date chip */}
        <div
          className="hidden sm:flex items-center px-3 py-1.5 rounded-full"
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
    </div>
  );
}
