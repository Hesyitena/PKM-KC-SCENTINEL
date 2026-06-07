import type { Metadata } from "next";
import { LiveMonitoringPanel } from "@/components/dashboard/LiveMonitoringPanel";
import { Activity, Cpu, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — SCENTINEL",
  description: "Live monitoring sensor gas dan hasil deteksi pembusukan makanan",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full px-6 pt-5 pb-4 gap-3 overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(83,58,253,0.08)",
              border: "1px solid rgba(83,58,253,0.15)",
              borderRadius: "8px",
            }}
          >
            <Activity size={14} style={{ color: "#533afd" }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 300,
                  letterSpacing: "-0.22px",
                  color: "#0d253d",
                  lineHeight: 1.1,
                }}
              >
                Sensor{" "}
                <span className="gradient-text" style={{ fontWeight: 500 }}>Realtime</span>
              </h1>
              <span
                className="hidden sm:inline"
                style={{ fontSize: "11px", fontWeight: 400, color: "#64748d", letterSpacing: "0.1px", textTransform: "uppercase" }}
              >
                · Live Monitoring
              </span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 300, color: "#64748d", marginTop: "2px" }}>
              Pembacaan sensor dari perangkat{" "}
              <span style={{ fontWeight: 400, color: "#273951" }}>ESP32 Edge AI</span>
            </p>
          </div>
        </div>

        {/* Stripe pill-tag-soft chips */}
        <div className="hidden sm:flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background: "#b9b9f9",
              color: "#4434d4",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.1px",
              textTransform: "uppercase",
              borderRadius: "9999px",
            }}
          >
            <Cpu size={10} />
            ESP32
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background: "#a7f3d0",
              color: "#047857",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: "0.1px",
              textTransform: "uppercase",
              borderRadius: "9999px",
            }}
          >
            <Zap size={10} />
            AI Detection
          </div>
        </div>
      </div>

      {/* Live monitoring panel — fills remaining height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <LiveMonitoringPanel />
      </div>
    </div>
  );
}
