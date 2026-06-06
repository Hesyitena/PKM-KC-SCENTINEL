"use client";

import { useSensorStore } from "@/store/sensorStore";
import { formatRelativeTime } from "@/lib/utils";
import { Wifi, WifiOff, Clock, Activity } from "lucide-react";

export function Navbar() {
  const { isConnected, lastUpdatedAt } = useSensorStore();

  return (
    <header
      id="dashboard-navbar"
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid hsl(220 18% 88% / 0.8)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: context info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-muted-foreground/60" />
          <span className="text-sm text-muted-foreground hidden sm:block font-medium">
            SCENTINEL · Monitoring Pembusukan Makanan
          </span>
        </div>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-3">
        {/* Last update */}
        {lastUpdatedAt && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1.5 rounded-lg"
            style={{ background: "hsl(220 20% 94%)" }}>
            <Clock size={12} />
            <span>Update: {formatRelativeTime(lastUpdatedAt)}</span>
          </div>
        )}

        {/* SSE status */}
        <div
          id="sse-status-indicator"
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-500 ${isConnected
              ? "text-emerald-600"
              : "text-muted-foreground"
            }`}
          style={
            isConnected
              ? {
                background: "linear-gradient(135deg, hsl(142 72% 95%), hsl(142 60% 92%))",
                border: "1px solid hsl(142 72% 85%)",
                boxShadow: "0 1px 4px hsl(142 72% 29% / 0.12)",
              }
              : {
                background: "hsl(220 20% 94%)",
                border: "1px solid hsl(220 18% 88%)",
              }
          }
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
            </>
          ) : (
            <>
              <WifiOff size={12} />
              Offline
            </>
          )}
        </div>
      </div>
    </header>
  );
}
