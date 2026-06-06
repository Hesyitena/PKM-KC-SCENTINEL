"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SensorCardProps {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  color?: "default" | "primary" | "fresh" | "spoiled" | "amber";
  sublabel?: string;
}

const colorConfig = {
  default: {
    icon: "text-slate-500",
    value: "text-slate-700",
    iconBg: "bg-slate-100 border-slate-200",
    border: "border-slate-200/80",
    accent: "#64748b",
    glow: "rgba(100,116,139,0.08)",
  },
  primary: {
    icon: "text-indigo-500",
    value: "text-indigo-700",
    iconBg: "bg-indigo-50 border-indigo-200",
    border: "border-indigo-200/60",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.08)",
  },
  fresh: {
    icon: "text-emerald-500",
    value: "text-emerald-700",
    iconBg: "bg-emerald-50 border-emerald-200",
    border: "border-emerald-200/60",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.08)",
  },
  spoiled: {
    icon: "text-rose-500",
    value: "text-rose-700",
    iconBg: "bg-rose-50 border-rose-200",
    border: "border-rose-200/60",
    accent: "#f43f5e",
    glow: "rgba(244,63,94,0.08)",
  },
  amber: {
    icon: "text-amber-500",
    value: "text-amber-700",
    iconBg: "bg-amber-50 border-amber-200",
    border: "border-amber-200/60",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.08)",
  },
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp size={11} className="text-emerald-500" />;
  if (trend === "down") return <TrendingDown size={11} className="text-rose-500" />;
  return <Minus size={11} className="text-muted-foreground" />;
};

export function SensorCard({
  id,
  label,
  value,
  unit,
  icon,
  color = "default",
  sublabel,
  trend,
}: SensorCardProps) {
  const cfg = colorConfig[color];

  return (
    <div
      id={id}
      className={cn(
        "relative rounded-2xl p-5 border transition-all duration-300 group cursor-default overflow-hidden",
        "hover:-translate-y-0.5",
        cfg.border,
      )}
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`,
        backdropFilter: "blur(8px)",
        boxShadow: `0 1px 4px rgba(0,0,0,0.05), 0 4px 16px ${cfg.glow}`,
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: cfg.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              cfg.iconBg,
              cfg.icon,
              "transition-transform duration-200 group-hover:scale-105",
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <span className={cn("text-2xl font-bold tabular-nums tracking-tight", cfg.value)}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground mb-0.5 font-medium">{unit}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {sublabel && (
          <p className="text-[11px] text-muted-foreground/70">{sublabel}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 ml-auto">
            <TrendIcon trend={trend} />
          </div>
        )}
      </div>
    </div>
  );
}
