"use client";

import { ReactNode, useState } from "react";
import { Info } from "lucide-react";

interface SensorCardProps {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: "default" | "primary" | "fresh" | "spoiled" | "amber";
  sublabel?: string;
  max?: number;
  tooltip?: string;
}

/* ── Sensor tooltip descriptions ── */
export const SENSOR_TOOLTIPS: Record<string, string> = {
  "card-mq3":
    "MQ-3 mendeteksi gas alkohol (etanol). Kadar tinggi mengindikasikan proses fermentasi atau pembusukan awal pada makanan.",
  "card-mq4":
    "MQ-4 mendeteksi gas metana (CH₄). Gas metana dihasilkan oleh bakteri anaerob saat makanan membusuk dalam kondisi tanpa oksigen.",
  "card-mq135":
    "MQ-135 sensitif terhadap berbagai gas berbahaya termasuk NH₃, NO₂, alkohol, dan benzena. Indikator kualitas udara umum di sekitar sampel.",
  "card-tgs2602":
    "TGS-2602 mendeteksi VOC (Volatile Organic Compounds) seperti H₂S dan amonia — bau khas daging busuk dan ikan basi.",
  "card-temperature":
    "Suhu lingkungan dalam derajat Celsius. Suhu hangat (20–40°C) mempercepat pertumbuhan bakteri dan proses pembusukan makanan.",
  "card-humidity":
    "Kelembapan relatif udara (%). Kelembapan tinggi (>70%) mendukung pertumbuhan jamur dan mempercepat pembusukan.",
};

/* ── Stripe-adapted color tokens per sensor type ── */
const colorConfig = {
  default: {
    accent: "#64748d",
    accentLight: "#e3e8ee",
    value: "#273951",
    iconBg: "#f6f9fc",
    iconColor: "#64748d",
  },
  primary: {
    accent: "#533afd",
    accentLight: "#b9b9f9",
    value: "#4434d4",
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
    accent: "#ea2261",
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
  tooltip,
}: SensorCardProps) {
  const cfg = colorConfig[color];
  const numVal = typeof value === "number" ? value : parseFloat(value as string) || 0;
  const effectiveMax = max ?? Math.max(numVal * 1.5, 1);
  const barPct = Math.min(100, Math.max(2, (numVal / effectiveMax) * 100));
  const [showTip, setShowTip] = useState(false);

  // Use prop tooltip or fallback to built-in map
  const tipText = tooltip ?? SENSOR_TOOLTIPS[id];

  return (
    <div
      id={id}
      className="group relative cursor-default transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "#ffffff",
        border: "1px solid #e3e8ee",
        borderRadius: "12px",
        padding: "12px 14px",
        boxShadow: "rgba(0,55,112,0.06) 0 1px 3px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `rgba(0,55,112,0.08) 0 4px 14px, rgba(0,55,112,0.04) 0 1px 3px`;
        (e.currentTarget as HTMLElement).style.borderColor = cfg.accentLight;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "rgba(0,55,112,0.06) 0 1px 3px";
        (e.currentTarget as HTMLElement).style.borderColor = "#e3e8ee";
      }}
    >
      {/* Top accent line — visible on hover */}
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
            color: "#64748d",
          }}
        >
          {label}
        </p>
        <div className="flex items-center gap-1">
          {/* Info tooltip trigger */}
          {tipText && (
            <div className="relative">
              <button
                id={`${id}-info-btn`}
                type="button"
                aria-label={`Info ${label}`}
                className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: "#a8c3de" }}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                onFocus={() => setShowTip(true)}
                onBlur={() => setShowTip(false)}
              >
                <Info size={11} />
              </button>

              {/* Tooltip popup */}
              {showTip && (
                <div
                  id={`${id}-tooltip`}
                  role="tooltip"
                  className="absolute z-50 bottom-full right-0 mb-2 animate-fade-in-scale"
                  style={{
                    width: "220px",
                    background: "#0d253d",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: "11px",
                    fontWeight: 300,
                    lineHeight: 1.5,
                    padding: "8px 10px",
                    borderRadius: "8px",
                    boxShadow: "rgba(0,55,112,0.2) 0 8px 24px",
                    pointerEvents: "none",
                  }}
                >
                  {tipText}
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-5px",
                      right: "10px",
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid #0d253d",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {icon && (
            <div
              className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded"
              style={{
                background: cfg.iconBg,
                color: cfg.iconColor,
                borderRadius: "6px",
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Value */}
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
