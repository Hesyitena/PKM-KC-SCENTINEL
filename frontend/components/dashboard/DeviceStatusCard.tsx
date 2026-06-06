"use client";

import { Device } from "@/types/device";
import { formatRelativeTime } from "@/lib/utils";
import { Cpu, Wifi, WifiOff, Clock, Tag, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceStatusCardProps {
  device: Device;
}

export function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const isOnline = device.status === "ONLINE";

  return (
    <div
      id={`device-card-${device.id}`}
      className="relative rounded-2xl border transition-all duration-300 overflow-hidden group hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(8px)",
        borderColor: isOnline ? "hsl(142 72% 85%)" : "hsl(220 18% 88%)",
        boxShadow: isOnline
          ? "0 2px 8px rgba(16,185,129,0.10), 0 1px 3px rgba(0,0,0,0.05)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Status accent stripe at top */}
      <div
        className={cn("absolute top-0 inset-x-0 h-0.5")}
        style={{
          background: isOnline
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : "hsl(220 18% 88%)",
        }}
      />

      <div className="p-5 pt-5.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
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
              <Cpu size={18} />
            </div>

            {/* Name & serial */}
            <div>
              <h3 className="font-semibold text-sm text-foreground">{device.device_name}</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {device.serial_number}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border"
            style={
              isOnline
                ? {
                    background: "linear-gradient(135deg, hsl(142 72% 95%), hsl(142 60% 92%))",
                    borderColor: "hsl(142 72% 82%)",
                    color: "#059669",
                    boxShadow: "0 1px 4px rgba(16,185,129,0.12)",
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
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                ONLINE
              </>
            ) : (
              <>
                <WifiOff size={10} />
                OFFLINE
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60 mb-3" />

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag size={12} className="flex-shrink-0" />
            <span>
              Firmware:{" "}
              <span className="text-foreground/80 font-medium font-mono">
                {device.firmware_version ?? "—"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} className="flex-shrink-0" />
            <span>
              {device.last_seen
                ? `Terakhir aktif: ${formatRelativeTime(device.last_seen)}`
                : "Belum pernah aktif"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
