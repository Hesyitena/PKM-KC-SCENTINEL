import type { Metadata } from "next";
import { LiveMonitoringPanel } from "@/components/dashboard/LiveMonitoringPanel";
import { Cpu, Zap, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — SCENTINEL",
  description: "Live monitoring sensor gas dan hasil deteksi pembusukan makanan",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ══ Page Header — premium gradient band ══ */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{
          background: "linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #fafbff 100%)",
          borderBottom: "1px solid #edf0f7",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Title + subtitle */}
          <div className="flex items-center gap-4">
            {/* Icon block */}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                boxShadow: "0 4px 14px rgba(83,58,253,0.3)",
              }}
            >
              <FlaskConical size={18} color="#fff" />
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 400,
                    letterSpacing: "-0.3px",
                    color: "#0d253d",
                    lineHeight: 1.15,
                  }}
                >
                  Live{" "}
                  <span
                    style={{
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #533afd, #4434d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Sensor Monitoring
                  </span>
                </h1>
                {/* Live badge inline */}
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#059669",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Realtime
                </span>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  fontWeight: 300,
                  color: "#64748d",
                  marginTop: "3px",
                  letterSpacing: "-0.05px",
                }}
              >
                Pembacaan sensor gas dari perangkat{" "}
                <span style={{ fontWeight: 500, color: "#273951" }}>ESP32 Edge AI</span>
                {" "}— inferensi AI di-edge secara langsung
              </p>
            </div>
          </div>

          {/* Right: device chips */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                color: "#4434d4",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              <Cpu size={11} />
              ESP32
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#059669",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              <Zap size={11} />
              Edge AI
            </div>
          </div>
        </div>
      </div>

      {/* ══ Live monitoring panel — fills remaining height ══ */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
        <LiveMonitoringPanel />
      </div>
    </div>
  );
}
