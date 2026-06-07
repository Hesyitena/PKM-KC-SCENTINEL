"use client";

import { ReactNode } from "react";

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

/* ── Stripe-adapted color tokens per sensor type ── */
const colorConfig = {
  default: {
    accent: "#64748d",       /* stripe ink-mute */
    accentLight: "#e3e8ee",  /* stripe hairline */
    value: "#273951",        /* stripe ink-secondary */
    iconBg: "#f6f9fc",
    iconColor: "#64748d",
  },
  primary: {
    accent: "#533afd",       /* stripe primary */
    accentLight: "#b9b9f9",  /* stripe primary-subdued */
    value: "#4434d4",        /* stripe primary-deep */
    iconBg: "#eef2ff",
    iconColor: "#533afd",
  },
  fresh: {
    accent: "#10b981",
    accentLight: "#a7f3d0",
    value: "#047857",
    iconBg: "#ecfdf5",
    iconColor: "#10b981",
  },
  spoiled: {
    accent: "#ea2261",       /* stripe ruby */
    accentLight: "#fecdd3",
    value: "#be123c",
    iconBg: "#fff1f2",
    iconColor: "#ea2261",
  },
  amber: {
    accent: "#f59e0b",
    accentLight: "#fde68a",
    value: "#92400e",
    iconBg: "#fffbeb",
    iconColor: "#f59e0b",
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
  const effectiveMax = max ?? Math.max(numVal * 1.5, 1);
  const barPct = Math.min(100, Math.max(2, (numVal / effectiveMax) * 100));

  return (
    <div
      id={id}
      className="group relative cursor-default transition-all duration-200 hover:-translate-y-0.5"
      style={{
        /* Stripe card-feature-light */
        background: "#ffffff",
        border: "1px solid #e3e8ee",
        borderRadius: "12px",  /* rounded.lg = 12px */
        padding: "12px 14px",
        boxShadow: "rgba(0,55,112,0.06) 0 1px 3px",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `rgba(0,55,112,0.08) 0 4px 14px, rgba(0,55,112,0.04) 0 1px 3px`;
        (e.currentTarget as HTMLElement).style.borderColor = cfg.accentLight;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "rgba(0,55,112,0.06) 0 1px 3px";
        (e.currentTarget as HTMLElement).style.borderColor = "#e3e8ee";
      }}
    >
      {/* Top accent line — Stripe-style, visible on hover */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: cfg.accent,
          borderRadius: "12px 12px 0 0",
        }}
      />

      {/* Label + Icon row */}
      <div className="flex items-center justify-between mb-2">
        <p
          className="uppercase"
          style={{
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: "0.1px",
            color: "#64748d",  /* stripe ink-mute */
          }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded"
            style={{
              background: cfg.iconBg,
              color: cfg.iconColor,
              borderRadius: "6px",  /* rounded.sm */
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value — Stripe body-tabular style (tnum + tight tracking) */}
      <div className="flex items-baseline gap-1 mb-2.5">
        <span
          style={{
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.42px",
            fontFeatureSettings: '"tnum" 1, "ss01" 1',
            color: cfg.value,
          }}
        >
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span style={{ fontSize: "12px", fontWeight: 300, color: "#64748d" }}>
            {unit}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="w-full overflow-hidden"
          style={{ height: "3px", background: "#f0f4f8", borderRadius: "9999px" }}
        >
          <div
            style={{
              height: "100%",
              width: `${barPct}%`,
              background: cfg.accent,
              borderRadius: "9999px",
              transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
              opacity: 0.85,
            }}
          />
        </div>
        {sublabel && (
          <p
            className="mt-1 uppercase"
            style={{ fontSize: "10px", fontWeight: 400, color: "#a8c3de", letterSpacing: "0.1px" }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
