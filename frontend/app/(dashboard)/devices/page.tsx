"use client";

import { DeviceStatusCard } from "@/components/dashboard/DeviceStatusCard";
import { useDevices } from "@/hooks/useDevices";
import { Loader2, AlertCircle, Cpu } from "lucide-react";

export default function DevicesPage() {
  const { devices, isLoading, error, refetch } = useDevices();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Perangkat</span> ESP32
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar perangkat IoT yang terdaftar dalam sistem
          </p>
        </div>
        {/* Count badge */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2">
          <Cpu size={16} className="text-primary" />
          <span>{devices.length} Perangkat</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div id="devices-loading" className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat perangkat...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div id="devices-error" className="glass-card p-6 flex items-center gap-3 text-destructive border-destructive/30">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
          <button
            onClick={refetch}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Device grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.length === 0 ? (
            <div id="devices-empty" className="col-span-full glass-card p-12 text-center text-muted-foreground">
              <Cpu size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada perangkat terdaftar</p>
              <p className="text-xs mt-1">Tambahkan perangkat ESP32 melalui API atau hubungi admin</p>
            </div>
          ) : (
            devices.map((device) => (
              <DeviceStatusCard key={device.id} device={device} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
