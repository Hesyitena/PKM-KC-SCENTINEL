"use client";

import { ReactNode, useState } from "react";
import { Info } from "lucide-react";
import { SensorInfoModal } from "./SensorInfoModal";

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
    "MQ-135 sensitif terhadap berbagai gas berbahaya termasuk NH₃, NO₂, alkohol, dan benzena. Indikator kualitas udara umum di sekitar sampel makanan.",
  "card-tgs2602":
    "TGS-2602 mendeteksi VOC (Volatile Organic Compounds) seperti H₂S dan amonia — senyawa khas yang dihasilkan oleh daging busuk dan ikan basi.",
  "card-temperature":
    "Suhu lingkungan dalam derajat Celsius. Suhu hangat (20–40°C) mempercepat pertumbuhan bakteri dan proses pembusukan makanan secara signifikan.",
  "card-humidity":
    "Kelembapan relatif udara (%). Kelembapan tinggi (>70%) mendukung pertumbuhan jamur dan bakteri, sehingga mempercepat proses pembusukan makanan.",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const tipText = tooltip ?? SENSOR_TOOLTIPS[id];

  return (
    <>
      <div
        id={id}
        className="relative cursor-default transition-all duration-200"
        style={{
          background: "#ffffff",
          border: `1px solid ${isHovered ? cfg.accentLight : "#e3e8ee"}`,
          borderRadius: "12px",
          padding: "12px 14px",
          boxShadow: isHovered
            ? "rgba(0,55,112,0.08) 0 4px 14px, rgba(0,55,112,0.04) 0 1px 3px"
            : "rgba(0,55,112,0.06) 0 1px 3px",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent line — visible on hover */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-200"
          style={{
            background: cfg.accent,
            borderRadius: "12px 12px 0 0",
            opacity: isHovered ? 1 : 0,
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
            {/* Info button — click to open modal */}
            {tipText && (
              <button
                id={`${id}-info-btn`}
                type="button"
                aria-label={`Info ${label}`}
                className="flex items-center justify-center w-5 h-5 rounded transition-all duration-200"
                style={{
                  color: isHovered ? cfg.accent : "transparent",
                  background: isHovered ? cfg.iconBg : "transparent",
                  opacity: isHovered ? 1 : 0,
                  pointerEvents: isHovered ? "auto" : "none",
                  transform: isHovered ? "scale(1)" : "scale(0.8)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
              >
                <Info size={12} />
              </button>
            )}

            {icon && (
              <div
                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
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

      {/* Info Modal */}
      {tipText && (
        <SensorInfoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sensorLabel={label}
          sensorDescription={tipText}
          accentColor={cfg.accent}
          iconBg={cfg.iconBg}
        />
      )}
    </>
  );
}
