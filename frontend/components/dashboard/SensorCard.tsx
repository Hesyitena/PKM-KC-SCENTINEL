"use client";

import { ReactNode, useState } from "react";
import { CircleAlert } from "lucide-react";
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

/* ── Color tokens per sensor type ── */
export const SENSOR_COLOR_CONFIG = {
  default: {
    accent: "#64748d",
    accentSoft: "rgba(100,116,141,0.10)",
    accentBorder: "rgba(100,116,141,0.20)",
    value: "#273951",
    iconBg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
    iconColor: "#64748d",
    barFrom: "#94a3b8",
    barTo: "#64748d",
    glow: "rgba(100,116,141,0.15)",
  },
  primary: {
    accent: "#533afd",
    accentSoft: "rgba(83,58,253,0.08)",
    accentBorder: "rgba(83,58,253,0.18)",
    value: "#4434d4",
    iconBg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    iconColor: "#533afd",
    barFrom: "#818cf8",
    barTo: "#533afd",
    glow: "rgba(83,58,253,0.18)",
  },
  fresh: {
    accent: "#10b981",
    accentSoft: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.20)",
    value: "#047857",
    iconBg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    iconColor: "#059669",
    barFrom: "#34d399",
    barTo: "#10b981",
    glow: "rgba(16,185,129,0.18)",
  },
  spoiled: {
    accent: "#ea2261",
    accentSoft: "rgba(234,34,97,0.07)",
    accentBorder: "rgba(234,34,97,0.18)",
    value: "#be123c",
    iconBg: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    iconColor: "#ea2261",
    barFrom: "#f87171",
    barTo: "#ea2261",
    glow: "rgba(234,34,97,0.18)",
  },
  amber: {
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.20)",
    value: "#b45309",
    iconBg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    iconColor: "#d97706",
    barFrom: "#fcd34d",
    barTo: "#f59e0b",
    glow: "rgba(245,158,11,0.18)",
  },
};

/* ── Tiny arc gauge SVG ── */
function MiniArc({ pct, color, glow }: { pct: number; color: string; glow: string }) {
  const r = 18;
  const C = 2 * Math.PI * r;
  const arc = C * 0.75; // 270° sweep
  const offset = arc * (1 - pct);
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <circle
        cx={22} cy={22} r={r}
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="4"
        strokeDasharray={`${arc} ${C - arc}`}
        strokeDashoffset={-C * 0.125}
        strokeLinecap="round"
      />
      <circle
        cx={22} cy={22} r={r}
        stroke={`url(#arc-${color.replace("#", "")})`}
        strokeWidth="4"
        strokeDasharray={`${arc} ${C - arc}`}
        strokeDashoffset={-C * 0.125 + offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
          filter: `drop-shadow(0 0 4px ${glow})`,
        }}
      />
      <defs>
        <linearGradient id={`arc-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
    </svg>
  );
}

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
  const cfg = SENSOR_COLOR_CONFIG[color];
  const numVal = typeof value === "number" ? value : parseFloat(value as string) || 0;
  const effectiveMax = max ?? Math.max(numVal * 1.5, 1);
  const barPct = Math.min(1, Math.max(0.02, numVal / effectiveMax));
  const [modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const tipText = tooltip ?? SENSOR_TOOLTIPS[id];
  const displayValue = typeof value === "number" ? value.toFixed(1) : value;

  return (
    <>
      <div
        id={id}
        className="relative overflow-hidden cursor-default"
        style={{
          background: isHovered
            ? `linear-gradient(145deg, #ffffff 0%, ${cfg.accentSoft} 100%)`
            : "#ffffff",
          border: `1px solid ${isHovered ? cfg.accentBorder : "#e8edf3"}`,
          borderRadius: "16px",
          padding: "16px",
          boxShadow: isHovered
            ? `0 12px 32px ${cfg.glow}, 0 2px 8px rgba(0,55,112,0.06)`
            : "0 1px 4px rgba(0,55,112,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)",
          transform: isHovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
          transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle top gradient accent */}
        <div
          className="absolute top-0 inset-x-0"
          style={{
            height: "2px",
            background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
            opacity: isHovered ? 1 : 0.3,
            transition: "opacity 0.25s ease",
          }}
        />

        {/* Background glow blob */}
        <div
          className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: cfg.accentSoft,
            filter: "blur(16px)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Top row: Label + Mini Arc */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2 pt-0.5">
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#94a3b8",
                lineHeight: 1.4,
              }}
            >
              {label}
            </p>
            {sublabel && (
              <p
                style={{
                  fontSize: "8.5px",
                  fontWeight: 600,
                  color: cfg.accent,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                  opacity: 0.65,
                }}
              >
                {sublabel}
              </p>
            )}
          </div>

          {/* Mini arc gauge replacing icon */}
          <div className="relative flex-shrink-0">
            <MiniArc pct={barPct} color={cfg.barTo} glow={cfg.glow} />
            {icon && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: cfg.iconColor }}
              >
                <div style={{ transform: "scale(1.1)" }}>{icon}</div>
              </div>
            )}
          </div>
        </div>

        {/* Value display */}
        <div className="flex items-baseline gap-1 mb-3">
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-1px",
              fontFeatureSettings: '"tnum" 1, "ss01" 1',
              color: cfg.value,
              transition: "color 0.25s ease",
            }}
          >
            {displayValue}
          </span>
          {unit && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: cfg.accent,
                opacity: 0.75,
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Progress track */}
        <div
          style={{
            height: "6px",
            background: "rgba(0,0,0,0.05)",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barPct * 100}%`,
              background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
              borderRadius: "9999px",
              transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: isHovered ? `0 0 6px ${cfg.glow}` : "none",
            }}
          />
        </div>

        {/* Info button — always visible, bottom-right tucked below the progress bar */}
        {tipText && (
          <button
            id={`${id}-info-btn`}
            type="button"
            aria-label={`Info ${label}`}
            className="absolute right-3 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              bottom: "8px",
              color: cfg.iconColor,
              background: cfg.accentSoft,
              border: `1px solid ${cfg.accentBorder}`,
              zIndex: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = cfg.accentBorder;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = cfg.accentSoft;
            }}
          >
            <CircleAlert size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Info Modal */}
      {tipText && (
        <SensorInfoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sensorLabel={label}
          sensorDescription={tipText}
          accentColor={cfg.accent}
          iconBg={cfg.accentSoft}
        />
      )}
    </>
  );
}
