"use client";

import { Device } from "@/types/device";
import { formatRelativeTime } from "@/lib/utils";
import { Cpu, Wifi, WifiOff, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceStatusCardProps {
  device: Device;
}

export function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const isOnline = device.status === "ONLINE";

  return (
    <div
      id={`device-card-${device.id}`}
      className={cn(
        "glass-card p-5 border transition-all duration-300",
        isOnline ? "border-fresh-500/25" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              isOnline
                ? "bg-fresh-500/10 border-fresh-500/30 text-fresh-500"
                : "bg-muted border-border text-muted-foreground"
            )}
          >
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{device.device_name}</h3>
            <p className="text-xs text-muted-foreground">{device.serial_number}</p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
            isOnline
              ? "text-fresh-500 bg-fresh-500/10 border-fresh-500/30"
              : "text-muted-foreground bg-muted border-border"
          )}
        >
          {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          {device.status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Tag size={13} />
          <span>Firmware: {device.firmware_version ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} />
          <span>
            {device.last_seen
              ? `Terakhir aktif: ${formatRelativeTime(device.last_seen)}`
              : "Belum pernah aktif"}
          </span>
        </div>
      </div>
    </div>
  );
}
