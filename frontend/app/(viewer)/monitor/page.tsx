import type { Metadata } from "next";
import { ViewerMonitoringPage } from "@/components/viewer/ViewerMonitoringPage";

export const metadata: Metadata = {
  title: "Live Monitoring — SCENTINEL",
  description: "Tampilan fullscreen monitoring kualitas makanan berbasis Edge AI",
};

export default function ViewerPage() {
  return <ViewerMonitoringPage />;
}
