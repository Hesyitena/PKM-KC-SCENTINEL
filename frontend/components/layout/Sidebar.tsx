"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Cpu,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useEffect } from "react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/history", icon: History, label: "Riwayat" },
  { href: "/devices", icon: Cpu, label: "Perangkat" },
  { href: "/profile", icon: User, label: "Profil" },
  { href: "/settings", icon: Settings, label: "Pengaturan" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarOpen, closeSidebar } = useUIStore();

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSidebar]);

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-30 lg:hidden animate-fade-in"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        id="dashboard-sidebar"
        className={cn(
          "w-64 flex-shrink-0 flex flex-col h-full relative overflow-hidden",
          /* Mobile: fixed overlay, slide in/out */
          "fixed inset-y-0 left-0 z-40",
          /* Desktop lg+: static in flex layout, always visible */
          "lg:static lg:z-auto lg:translate-x-0",
          "transition-transform duration-300 ease-in-out",
          /* Mobile visibility */
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background:
            "linear-gradient(145deg, hsl(227 68% 18%) 0%, hsl(230 70% 28%) 40%, hsl(220 60% 38%) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 140% 90% at 50% -10%, rgba(255,255,255,0.15) 0%, transparent 65%)",
          }}
        />

        {/* Logo + mobile close button */}
        <div
          className="px-6 py-5 flex-shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-center flex-1">
            <Image
              src="/logoscentinelwithtulisan.jpg"
              alt="SCENTINEL Logo"
              width={400}
              height={120}
              quality={100}
              className="object-contain w-full h-auto"
              style={{
                maxHeight: "80px",
                filter: "grayscale(100%) invert(100%) brightness(200%)",
                mixBlendMode: "screen",
                opacity: 0.92,
              }}
              priority
            />
          </div>

          {/* Close button — mobile only */}
          <button
            id="sidebar-close-btn"
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={closeSidebar}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg ml-2 flex-shrink-0 transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}
          >
            Menu
          </p>

          {navItems.map((item, i) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                  "animate-fade-in"
                )}
                style={{
                  animationDelay: `${i * 50}ms`,
                  ...(isActive
                    ? {
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        fontWeight: 500,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.1)",
                      }
                    : {
                        color: "rgba(255,255,255,0.75)",
                        border: "1px solid transparent",
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.95)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                  }
                }}
              >
                {/* Active stripe on left */}
                {isActive && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                    style={{
                      background: "#ffffff",
                      boxShadow: "2px 0 8px rgba(255,255,255,0.4)",
                    }}
                  />
                )}

                <item.icon size={16} />
                <span style={{ letterSpacing: "-0.1px" }}>{item.label}</span>

                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#ffffff",
                      boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          className="px-3 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* User info */}
          <div
            className="flex items-center gap-3 mb-2 px-3 py-2.5 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "rgba(255,255,255,0.90)", letterSpacing: "-0.1px" }}
              >
                {user?.username}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider mt-0.5"
                style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em" }}
              >
                SCENTINEL
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group"
            style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#ea2261";
              (e.currentTarget as HTMLElement).style.background = "rgba(234,34,97,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
