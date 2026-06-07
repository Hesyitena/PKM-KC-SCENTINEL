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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <aside
      id="dashboard-sidebar"
      className="w-64 flex-shrink-0 flex flex-col h-full relative overflow-hidden"
      style={{
        /* Stripe brand-dark-900 — the signature dark navy */
        background: "linear-gradient(180deg, #1c1e54 0%, #16183f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Stripe-style indigo top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(83,58,253,0.20) 0%, transparent 65%)",
        }}
      />

      {/* Logo */}
      <div
        className="px-6 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-center">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
           style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
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
                "animate-fade-in",
              )}
              style={{
                animationDelay: `${i * 50}ms`,
                /* Active: indigo tint (Stripe primary subdued) */
                ...(isActive ? {
                  background: "rgba(83,58,253,0.18)",
                  border: "1px solid rgba(83,58,253,0.25)",
                  color: "#ffffff",
                  fontWeight: 500,
                } : {
                  color: "rgba(255,255,255,0.42)",
                  border: "1px solid transparent",
                }),
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.82)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.42)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              {/* Indigo active stripe on left */}
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                  style={{ background: "#533afd" }}
                />
              )}

              <item.icon size={16} />
              <span style={{ letterSpacing: "-0.1px" }}>{item.label}</span>

              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(83,58,253,0.8)" }}
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
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Avatar — Stripe primary */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #533afd, #4434d4)",
              boxShadow: "0 2px 8px rgba(83,58,253,0.35)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.90)", letterSpacing: "-0.1px" }}>
              {user?.username}
            </p>
            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em" }}>
              SCENTINEL
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group"
          style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#ea2261";
            (e.currentTarget as HTMLElement).style.background = "rgba(234,34,97,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
