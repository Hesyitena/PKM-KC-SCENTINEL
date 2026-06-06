import type { Metadata } from "next";
import { LiveMonitoringPanel } from "@/components/dashboard/LiveMonitoringPanel";
import { Activity, Cpu, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — SCENTINEL",
  description: "Live monitoring sensor gas dan hasil deteksi pembusukan makanan",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(227 68% 28% / 0.12), hsl(227 68% 28% / 0.06))",
                border: "1px solid hsl(227 68% 28% / 0.15)",
              }}
            >
              <Activity size={14} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Live Monitoring
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sensor{" "}
            <span className="gradient-text">Realtime</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pembacaan sensor dari perangkat{" "}
            <span className="font-medium text-foreground/70">ESP32 Edge AI</span>
          </p>
        </div>

        {/* Quick stats chips */}
        <div className="hidden sm:flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(227 68% 28% / 0.08), hsl(227 68% 28% / 0.04))",
              border: "1px solid hsl(227 68% 28% / 0.12)",
              color: "hsl(var(--primary))",
            }}
          >
            <Cpu size={12} />
            ESP32
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(142 72% 29% / 0.08), hsl(142 72% 29% / 0.04))",
              border: "1px solid hsl(142 72% 29% / 0.15)",
              color: "#059669",
            }}
          >
            <Zap size={12} />
            AI Detection
          </div>
        </div>
      </div>

      {/* Live monitoring panel (SSE-connected) */}
      <LiveMonitoringPanel />
    </div>
  );
}
