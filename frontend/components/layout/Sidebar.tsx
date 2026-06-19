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

  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSidebar]);

  return (
    <>
      {sidebarOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-30 lg:hidden animate-fade-in"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={cn(
          "w-[260px] flex-shrink-0 flex flex-col h-full relative overflow-hidden",
          "fixed inset-y-0 left-0 z-40",
          "lg:static lg:z-auto lg:translate-x-0",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background:
            "linear-gradient(165deg, hsl(227 68% 15%) 0%, hsl(230 72% 24%) 45%, hsl(225 58% 34%) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top ambient glow */}
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(255,255,255,0.12) 0%, transparent 60%)",
          }}
        />

        {/* Bottom ambient glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% 120%, rgba(83,58,253,0.10) 0%, transparent 50%)",
          }}
        />

        {/* Logo + mobile close button */}
        <div
          className="relative px-5 py-5 flex-shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
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
                maxHeight: "72px",
                filter: "grayscale(100%) invert(100%) brightness(200%)",
                mixBlendMode: "screen",
                opacity: 0.92,
              }}
              priority
            />
          </div>

          <button
            id="sidebar-close-btn"
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={closeSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl ml-2 flex-shrink-0 transition-all duration-200"
            style={{
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}
          >
            Navigasi
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
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group relative",
                  "animate-fade-in"
                )}
                style={{
                  animationDelay: `${i * 60}ms`,
                  ...(isActive
                    ? {
                        background: "rgba(255,255,255,0.13)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        color: "#ffffff",
                        fontWeight: 600,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.12)",
                      }
                    : {
                        color: "rgba(255,255,255,0.6)",
                        border: "1px solid transparent",
                        fontWeight: 500,
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.95)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
                      boxShadow: "2px 0 12px rgba(255,255,255,0.3)",
                    }}
                  />
                )}

                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <item.icon size={15} />
                </span>

                <span style={{ letterSpacing: "-0.1px" }}>{item.label}</span>

                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full animate-breathe"
                    style={{
                      background: "#ffffff",
                      boxShadow: "0 0 8px rgba(255,255,255,0.5)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          className="relative px-3 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center gap-3 mb-2.5 px-3 py-3 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "rgba(255,255,255,0.92)", letterSpacing: "-0.1px" }}
              >
                {user?.username}
              </p>
              <p
                className="text-[10px] font-medium uppercase tracking-wider mt-0.5"
                style={{ color: "rgba(255,255,255,0.40)", letterSpacing: "0.1em" }}
              >
                Operator
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group"
            style={{
              color: "rgba(255,255,255,0.50)",
              fontSize: "13px",
              fontWeight: 500,
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
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
