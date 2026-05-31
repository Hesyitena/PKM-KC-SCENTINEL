import type { Metadata } from "next";
import { LiveMonitoringPanel } from "@/components/dashboard/LiveMonitoringPanel";

export const metadata: Metadata = {
  title: "Dashboard — SCENTINEL",
  description: "Live monitoring sensor gas dan hasil deteksi pembusukan makanan",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Live <span className="gradient-text">Monitoring</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pembacaan sensor realtime dari perangkat ESP32 Edge AI
        </p>
      </div>

      {/* Live monitoring panel (SSE-connected) */}
      <LiveMonitoringPanel />
    </div>
  );
}
