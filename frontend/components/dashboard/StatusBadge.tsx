"use client";

import { cn } from "@/lib/utils";
import { PredictionLabel } from "@/types/reading";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  prediction: PredictionLabel;
  confidence?: number;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ prediction, confidence, size = "md" }: StatusBadgeProps) {
  const isLayak = prediction === "LAYAK";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-bold border transition-all duration-300",
        isLayak
          ? "text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
          : "text-rose-600 bg-gradient-to-r from-rose-50 to-red-50 border-rose-200",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3.5 py-1.5 text-sm",
        size === "lg" && "px-5 py-2.5 text-base"
      )}
      style={{
        boxShadow: isLayak
          ? "0 2px 8px rgba(16,185,129,0.15)"
          : "0 2px 8px rgba(244,63,94,0.15)",
      }}
    >
      {isLayak ? (
        <CheckCircle2 size={size === "lg" ? 20 : size === "md" ? 16 : 14} />
      ) : (
        <XCircle size={size === "lg" ? 20 : size === "md" ? 16 : 14} />
      )}
      <span>{prediction}</span>
      {confidence !== undefined && (
        <span
          className={cn(
            "font-medium px-2 py-0.5 rounded-full text-xs",
            isLayak ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}
        >
          {(confidence * 100).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
