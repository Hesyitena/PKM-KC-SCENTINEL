"use client";

import { useSensorStore } from "@/store/sensorStore";
import { useUIStore } from "@/store/uiStore";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, Menu, Radio, WifiOff } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { isConnected, lastUpdatedAt } = useSensorStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header
      id="dashboard-navbar"
      className="flex-shrink-0"
      style={{
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #edf0f5",
        zIndex: 10,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,55,112,0.06)",
      }}
    >
      <div
        className="h-14 flex items-center justify-between"
        style={{ paddingLeft: "20px", paddingRight: "20px" }}
      >
        {/* ── LEFT: hamburger (mobile only) + brand ── */}
        <div className="flex items-center gap-3">
          {/* Hamburger mobile */}
          <button
            id="navbar-hamburger-btn"
            type="button"
            aria-label="Buka menu navigasi"
            onClick={toggleSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
            style={{ color: "#64748d" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f6f9fc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Menu size={17} />
          </button>

          {/* Logo text — hidden on mobile since sidebar already has it */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div
              className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
            >
              <Radio size={12} color="#fff" />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0d253d",
                  letterSpacing: "-0.2px",
                }}
              >
                SCENTINEL
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 300,
                  color: "#94a3b8",
                  letterSpacing: "-0.1px",
                }}
              >
                · Monitoring Pembusukan Makanan
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: last update + connection badge ── */}
        <div className="flex items-center gap-2">
          {/* Last update pill */}
          {lastUpdatedAt && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "#f6f9fc",
                border: "1px solid #e3e8ee",
                color: "#64748d",
                fontSize: "11.5px",
                fontWeight: 300,
                letterSpacing: "-0.1px",
              }}
            >
              <Clock size={10} />
              <span>{formatRelativeTime(lastUpdatedAt)}</span>
            </div>
          )}

          {/* Connection status badge */}
          <div
            id="sse-status-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
            style={
              isConnected
                ? {
                    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                    border: "1px solid #6ee7b7",
                    color: "#059669",
                    fontSize: "11.5px",
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.15)",
                  }
                : {
                    background: "#f6f9fc",
                    border: "1px solid #e3e8ee",
                    color: "#94a3b8",
                    fontSize: "11.5px",
                    fontWeight: 400,
                  }
            }
          >
            {isConnected ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
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
      </div>
    </header>
  );
}
