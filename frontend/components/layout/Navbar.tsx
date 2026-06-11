"use client";

import { useSensorStore } from "@/store/sensorStore";
import { useThemeStore } from "@/store/themeStore";
import { useUIStore } from "@/store/uiStore";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, Activity, Sun, Moon, Menu } from "lucide-react";

export function Navbar() {
  const { isConnected, lastUpdatedAt } = useSensorStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleSidebar } = useUIStore();

  const isDark = theme === "dark";

  return (
    <header
      id="dashboard-navbar"
      className="h-14 flex items-center justify-between flex-shrink-0"
      style={{
        background: isDark
          ? "rgba(15, 20, 40, 0.92)"
          : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.04)",
        paddingLeft: "24px",
        paddingRight: "24px",
        boxShadow: isDark
          ? "0 4px 20px -2px rgba(0,0,0,0.15)"
          : "0 4px 20px -2px rgba(0,0,0,0.03)",
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
          style={{
            color: isDark ? "rgba(255,255,255,0.65)" : "#64748d",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Menu size={18} />
        </button>

        <Activity size={13} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748d" }} />
        <span
          className="hidden sm:block text-sm"
          style={{
            color: isDark ? "rgba(255,255,255,0.55)" : "#64748d",
            fontWeight: 300,
            letterSpacing: "-0.1px",
          }}
        >
          SCENTINEL · Monitoring Pembusukan Makanan
        </span>
      </div>

      {/* Right: status indicators + theme toggle */}
      <div className="flex items-center gap-2.5">
        {/* Last update */}
        {lastUpdatedAt && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "#f6f9fc",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e3e8ee",
              color: isDark ? "rgba(255,255,255,0.5)" : "#64748d",
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
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f6f9fc",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e3e8ee",
                  color: isDark ? "rgba(255,255,255,0.5)" : "#64748d",
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
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: isDark ? "rgba(255,255,255,0.3)" : "#cbd5e1" }} />
              </span>
              Offline
            </>
          )}
        </div>

        {/* Dark / Light mode toggle */}
        <button
          id="navbar-theme-toggle-btn"
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
          style={{
            color: isDark ? "rgba(255,255,255,0.65)" : "#64748d",
            background: isDark ? "rgba(255,255,255,0.06)" : "#f6f9fc",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e3e8ee",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark
              ? "rgba(255,255,255,0.12)"
              : "#e8edf5";
            (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark
              ? "rgba(255,255,255,0.06)"
              : "#f6f9fc";
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
