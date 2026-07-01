import type { Metadata } from "next";
import { LiveMonitoringPanel } from "@/components/dashboard/LiveMonitoringPanel";

export const metadata: Metadata = {
  title: "Dashboard — SCENTINEL",
  description: "Live monitoring sensor gas dan hasil deteksi pembusukan makanan",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden px-4 lg:px-6 py-4 lg:py-5 h-full">
      <LiveMonitoringPanel />
    </div>
  );
}
