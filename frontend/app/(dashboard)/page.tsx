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
      {/* ══ Live monitoring panel — fills remaining height ══ */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 py-6">
        <LiveMonitoringPanel />
      </div>
    </div>
  );
}
