"use client";

// SCENTINEL - Sensor Info Modal
// Pop-up window yang muncul saat tombol ⓘ diklik pada SensorCard

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface SensorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorLabel: string;
  sensorDescription: string;
  accentColor: string;
  iconBg: string;
}

export function SensorInfoModal({
  isOpen,
  onClose,
  sensorLabel,
  sensorDescription,
  accentColor,
  iconBg,
}: SensorInfoModalProps) {
  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // Ensure we only access document.body after hydration (Next.js SSR safe)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const modal = (
    /* Backdrop */
    <div
      id="sensor-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(13,37,61,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        id="sensor-info-modal-panel"
        className="relative w-full max-w-sm animate-fade-in-scale"
        style={{
          background: "#ffffff",
          border: "1px solid #e3e8ee",
          borderRadius: "16px",
          boxShadow:
            "rgba(0,55,112,0.12) 0 8px 40px, rgba(0,55,112,0.06) 0 2px 8px",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        {/* Colored accent top bar */}
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}88 100%)`,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center px-5 py-4"
          style={{ borderBottom: "1px solid #f0f4f8" }}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: iconBg }}
            >
              <Info size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#64748d",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                Info Sensor
              </p>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#0d253d",
                  letterSpacing: "-0.2px",
                  lineHeight: 1.2,
                }}
              >
                {sensorLabel}
              </h2>
            </div>
          </div>
        </div>

        {/* Description body */}
        <div className="px-5 py-4">
          <p
            style={{
              fontSize: "14px",
              fontWeight: 300,
              color: "#273951",
              lineHeight: 1.65,
              letterSpacing: "-0.1px",
            }}
          >
            {sensorDescription}
          </p>
        </div>

        {/* Footer: dismiss button */}
        <div
          className="px-5 pb-5"
        >
          <button
            id="sensor-info-modal-dismiss-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: iconBg,
              color: accentColor,
              border: `1px solid ${accentColor}33`,
              fontSize: "13px",
              fontWeight: 400,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${accentColor}18`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = iconBg;
            }}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
