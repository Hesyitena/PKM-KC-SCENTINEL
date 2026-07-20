"use client";

import { useDevices } from "@/hooks/useDevices";
import { formatRelativeTime } from "@/lib/utils";
import {
  Cpu,
  WifiOff,
  Radio,
  Terminal,
  Globe,
  KeyRound,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE = "/api";

// Info baris helper
function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "font-mono text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

// Code block helper
function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="rounded-xl p-4 text-xs overflow-x-auto leading-relaxed"
      style={{
        background: "#0d1117",
        color: "#c9d1d9",
        border: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {children}
    </pre>
  );
}

export default function DevicesPage() {
  const { devices, isLoading, error, refetch } = useDevices();
  const device = devices[0] ?? null;
  const isOnline = device?.status === "ONLINE";

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6 lg:p-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Perangkat</span> ESP32
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Status koneksi dan informasi alat SCENTINEL
            </p>
          </div>
          <button
            id="device-refresh-btn"
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:bg-muted transition-all"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div id="devices-loading" className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data perangkat...</span>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div id="devices-error" className="glass-card p-6 flex items-center gap-3 text-destructive">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
            <button onClick={refetch} className="ml-auto text-xs underline">Coba lagi</button>
          </div>
        )}

        {/* === Status Card === */}
        {!isLoading && !error && (
          <>
            <div
              id="device-status-card"
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${isOnline ? "hsl(142 72% 85%)" : "hsl(220 18% 88%)"}`,
                boxShadow: isOnline
                  ? "0 4px 16px rgba(16,185,129,0.12)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Top accent stripe */}
              <div
                className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
                style={{
                  background: isOnline
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "hsl(220 18% 88%)",
                }}
              />

              <div className="flex items-start justify-between gap-4 pt-1">
                {/* Left: icon + name */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0"
                    style={
                      isOnline
                        ? {
                            background: "linear-gradient(135deg, hsl(142 72% 95%), hsl(142 60% 90%))",
                            borderColor: "hsl(142 72% 82%)",
                            color: "#10b981",
                          }
                        : {
                            background: "hsl(220 20% 95%)",
                            borderColor: "hsl(220 18% 88%)",
                            color: "hsl(220 14% 60%)",
                          }
                    }
                  >
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-foreground">
                      {device?.device_name ?? "SCENTINEL Unit 1"}
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {device?.serial_number ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Right: status badge */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0"
                  style={
                    isOnline
                      ? {
                          background: "linear-gradient(135deg, hsl(142 72% 95%), hsl(142 60% 92%))",
                          borderColor: "hsl(142 72% 82%)",
                          color: "#059669",
                          boxShadow: "0 1px 4px rgba(16,185,129,0.16)",
                        }
                      : {
                          background: "hsl(220 20% 95%)",
                          borderColor: "hsl(220 18% 88%)",
                          color: "hsl(220 14% 55%)",
                        }
                  }
                >
                  {isOnline ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      ONLINE
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} />
                      OFFLINE
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 my-4" />

              {/* Detail rows */}
              <div className="space-y-0">
                <InfoRow
                  label="Firmware"
                  value={device?.firmware_version ?? "—"}
                  mono
                />
                <InfoRow
                  label="Terakhir aktif"
                  value={
                    device?.last_seen
                      ? formatRelativeTime(device.last_seen)
                      : "Belum pernah aktif"
                  }
                />
                <InfoRow
                  label="Status koneksi"
                  value={
                    <span className={isOnline ? "text-emerald-600" : "text-muted-foreground"}>
                      {isOnline ? "Terhubung & mengirim data" : "Tidak terhubung"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* === API Connection Info === */}
            <div id="device-api-info-card" className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <h3 className="font-semibold">Konfigurasi Koneksi ESP32</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Program ESP32 dengan informasi berikut agar alat dapat mengirim data ke dashboard.
              </p>

              <div className="space-y-4">
                {/* Endpoint */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Radio size={12} />
                    Endpoint Pengiriman Data
                  </div>
                  <CodeBlock>{`POST ${API_BASE}/readings/`}</CodeBlock>
                </div>

                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <KeyRound size={12} />
                    Header Autentikasi
                  </div>
                  <CodeBlock>{`X-API-Key: <isi dengan ESP32_API_KEY dari .env backend>`}</CodeBlock>
                </div>

                {/* Payload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Terminal size={12} />
                    Format JSON Payload
                  </div>
                  <CodeBlock>{`{
  "device_id": 1,
  "mq3": 134.5,
  "mq4": 198.2,
  "mq135": 312.7,
  "tgs2602": 87.4,
  "temperature": 28.3,
  "humidity": 67.1,
  "prediction": "LAYAK",   // atau "TIDAK LAYAK"
  "confidence": 0.9412
}`}</CodeBlock>
                </div>
              </div>
            </div>

            {/* === Quick Check === */}
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Info size={16} className="text-primary" />
                <h3 className="font-semibold">Uji Koneksi via cURL</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Gunakan command ini di terminal untuk menguji apakah backend menerima data sebelum ESP32 dirakit.
              </p>
              <CodeBlock>{`curl -X POST http://localhost:8000/api/readings/ \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: <ESP32_API_KEY>" \\
  -d '{
    "device_id": 1,
    "mq3": 150.0, "mq4": 50.0,
    "mq135": 70.0, "tgs2602": 40.0,
    "temperature": 30.5, "humidity": 75.0,
    "prediction": "LAYAK", "confidence": 0.98
  }'`}</CodeBlock>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
