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
        background: "linear-gradient(180deg, hsl(227 68% 22%) 0%, hsl(230 65% 18%) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Subtle inner glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <div
        className="p-6 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-center">
          <Image
            src="/logoscentinelwithtulisan.jpg"
            alt="SCENTINEL Logo"
            width={400}
            height={120}
            quality={100}
            className="object-contain w-full h-auto opacity-95"
            style={{ 
              maxHeight: "84px",
              filter: "grayscale(100%) invert(100%) brightness(200%)",
              mixBlendMode: "screen" 
            }}
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-3">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                "animate-fade-in",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Active background */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                />
              )}

              {/* Icon */}
              <span
                className={cn(
                  "relative z-10 transition-transform duration-200",
                  isActive
                    ? "text-white"
                    : "text-white/45 group-hover:text-white/80",
                )}
                style={isActive ? {} : {}}
              >
                <item.icon
                  size={17}
                  className={
                    isActive
                      ? ""
                      : "group-hover:scale-105 transition-transform duration-200"
                  }
                />
              </span>

              {/* Label */}
              <span
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  isActive ? "text-white font-semibold" : "text-white/45 group-hover:text-white/80"
                )}
              >
                {item.label}
              </span>

              {/* Active indicator pip */}
              {isActive && (
                <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="p-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* User info */}
        <div className="flex items-center gap-3 mb-2 px-2 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))",
              border: "1px solid rgba(255,255,255,0.20)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.username}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group mt-1"
        >
          <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
