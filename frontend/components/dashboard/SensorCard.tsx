"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: "default" | "primary" | "fresh" | "spoiled" | "amber";
  sublabel?: string;
  max?: number;
}

const colorConfig = {
  default: {
    icon: "text-slate-500",
    iconBg: "bg-slate-100 border-slate-200",
    value: "text-slate-800",
    bar: "#64748b",
    barFrom: "#94a3b8",
    shadow: "rgba(100,116,139,0.12)",
    glow: "rgba(100,116,139,0.05)",
    border: "#e2e8f0",
  },
  primary: {
    icon: "text-indigo-500",
    iconBg: "bg-indigo-50 border-indigo-100",
    value: "text-indigo-700",
    bar: "#6366f1",
    barFrom: "#818cf8",
    shadow: "rgba(99,102,241,0.18)",
    glow: "rgba(99,102,241,0.05)",
    border: "#c7d2fe",
  },
  fresh: {
    icon: "text-emerald-500",
    iconBg: "bg-emerald-50 border-emerald-100",
    value: "text-emerald-700",
    bar: "#10b981",
    barFrom: "#34d399",
    shadow: "rgba(16,185,129,0.18)",
    glow: "rgba(16,185,129,0.05)",
    border: "#a7f3d0",
  },
  spoiled: {
    icon: "text-rose-500",
    iconBg: "bg-rose-50 border-rose-100",
    value: "text-rose-700",
    bar: "#f43f5e",
    barFrom: "#fb7185",
    shadow: "rgba(244,63,94,0.18)",
    glow: "rgba(244,63,94,0.05)",
    border: "#fecdd3",
  },
  amber: {
    icon: "text-amber-500",
    iconBg: "bg-amber-50 border-amber-100",
    value: "text-amber-700",
    bar: "#f59e0b",
    barFrom: "#fcd34d",
    shadow: "rgba(245,158,11,0.18)",
    glow: "rgba(245,158,11,0.05)",
    border: "#fde68a",
  },
};

export function SensorCard({
  id,
  label,
  value,
  unit,
  icon,
  color = "default",
  sublabel,
  max,
}: SensorCardProps) {
  const cfg = colorConfig[color];
  const numVal = typeof value === "number" ? value : parseFloat(value as string) || 0;

  // Auto-determine max if not provided — use a soft cap at 150% of the current value
  // so the bar always has meaningful fill even for small values
  const effectiveMax = max ?? Math.max(numVal * 1.5, 1);
  const barPct = Math.min(100, Math.max(2, (numVal / effectiveMax) * 100));

  return (
    <div
      id={id}
      className="relative rounded-2xl p-4 border transition-all duration-300 group cursor-default overflow-hidden hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderColor: cfg.border,
        boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 6px 20px ${cfg.glow}`,
      }}
    >
      {/* Hover top accent */}
      <div
        className="absolute top-0 inset-x-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.bar})` }}
      />

      {/* Subtle corner glow */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cfg.bar}20, transparent 70%)` }}
      />

      {/* Icon + Label */}
      <div className="flex items-center justify-between mb-3.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-xl flex items-center justify-center border flex-shrink-0",
              "transition-all duration-200 group-hover:scale-110 group-hover:shadow-md",
              cfg.iconBg,
              cfg.icon
            )}
            style={{
              boxShadow: `0 0 0 0px ${cfg.bar}00`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3.5">
        <span className={cn("text-[26px] font-black tabular-nums leading-none tracking-tight", cfg.value)}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="text-xs text-slate-400 font-semibold">{unit}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barPct}%`,
              background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.bar})`,
              boxShadow: `0 0 8px ${cfg.bar}50`,
            }}
          />
        </div>
        {sublabel && (
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
