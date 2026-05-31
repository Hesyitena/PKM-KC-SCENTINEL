"use client";

import { useSensorStore } from "@/store/sensorStore";
import { formatRelativeTime } from "@/lib/utils";
import { Wifi, WifiOff, Clock } from "lucide-react";

export function Navbar() {
  const { isConnected, lastUpdatedAt } = useSensorStore();

  return (
    <header
      id="dashboard-navbar"
      className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0"
    >
      {/* Left: Page context */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground hidden sm:block">
          PKM-KC 2026 · Sistem Monitoring Pembusukan Makanan
        </div>
      </div>

      {/* Right: SSE status + last update */}
      <div className="flex items-center gap-4">
        {lastUpdatedAt && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={13} />
            <span>Update: {formatRelativeTime(lastUpdatedAt)}</span>
          </div>
        )}

        <div
          id="sse-status-indicator"
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-300 ${
            isConnected
              ? "text-fresh-500 bg-fresh-500/10 border-fresh-500/30"
              : "text-muted-foreground bg-muted border-border"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi size={12} className="live-indicator" />
              <span className="live-indicator">Live</span>
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
