import type { Metadata } from "next";
import { Settings, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Pengaturan — SCENTINEL",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Pengaturan</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi sistem SCENTINEL
        </p>
      </div>

      {/* System info */}
      <div id="settings-info-card" className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Info size={16} className="text-primary" />
          <h3 className="font-semibold">Informasi Sistem</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: "Nama Sistem", value: "SCENTINEL v1.0.0" },
            { label: "Tipe Sensor", value: "MQ-3, MQ-4, MQ-135, TGS-2602, DHT22" },
            { label: "Model AI", value: "Edge Classification (ESP32 Lokal)" },
            { label: "Komunikasi", value: "REST API + SSE Realtime" },
            { label: "Program", value: "PKM-KC 2026" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={16} className="text-primary" />
          <h3 className="font-semibold">Konfigurasi API</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pengaturan API key ESP32 dan konfigurasi lanjutan hanya dapat diubah 
          melalui file <code className="px-1.5 py-0.5 bg-muted rounded text-primary text-xs">.env</code> di server backend.
        </p>
      </div>
    </div>
  );
}
