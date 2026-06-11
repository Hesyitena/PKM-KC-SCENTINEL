"use client";

import { useSensorStore } from "@/store/sensorStore";
import { useUIStore } from "@/store/uiStore";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, Activity, Menu, WifiOff } from "lucide-react";

export function Navbar() {
  const { isConnected, lastUpdatedAt } = useSensorStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header
      id="dashboard-navbar"
      className="h-14 flex items-center justify-between flex-shrink-0"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        paddingLeft: "24px",
        paddingRight: "24px",
        boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
        zIndex: 10,
      }}
    >
      {/* Left: hamburger (mobile) + brand context */}
      <div className="flex items-center gap-2.5">
        {/* Hamburger — visible only on mobile */}
        <button
          id="navbar-hamburger-btn"
          type="button"
          aria-label="Buka menu navigasi"
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
          style={{ color: "#64748d", background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Menu size={18} />
        </button>

        <Activity size={13} style={{ color: "#64748d" }} />
        <span
          className="hidden sm:block text-sm"
          style={{ color: "#64748d", fontWeight: 300, letterSpacing: "-0.1px" }}
        >
          SCENTINEL · Monitoring Pembusukan Makanan
        </span>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-2.5">
        {/* Last update */}
        {lastUpdatedAt && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "#f6f9fc",
              border: "1px solid #e3e8ee",
              color: "#64748d",
              fontWeight: 300,
              fontSize: "12px",
            }}
          >
            <Clock size={11} />
            <span>Update: {formatRelativeTime(lastUpdatedAt)}</span>
          </div>
        )}

        {/* SSE / connection status */}
        <div
          id="sse-status-indicator"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-400"
          style={
            isConnected
              ? {
                  background: "#ecfdf5",
                  border: "1px solid #6ee7b7",
                  color: "#047857",
                  fontSize: "12px",
                  fontWeight: 400,
                }
              : {
                  background: "#f6f9fc",
                  border: "1px solid #e3e8ee",
                  color: "#64748d",
                  fontSize: "12px",
                  fontWeight: 400,
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
              <WifiOff size={11} />
              Offline
            </>
          )}
        </div>
      </div>
    </header>
  );
}
