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
  Wind,
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

  return (
    <aside
      id="dashboard-sidebar"
      className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center">
          <Image 
            src="/logoscentinelwithtulisan.jpg" 
            alt="SCENTINEL Logo" 
            width={800} 
            height={320} 
            quality={100}
            className="object-contain w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon size={18} />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold uppercase">
            {user?.username?.slice(0, 2) ?? "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
