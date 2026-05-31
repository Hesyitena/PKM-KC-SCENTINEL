"use client";

import { cn } from "@/lib/utils";
import { PredictionLabel } from "@/types/reading";
import { CheckCircle2, XCircle } from "lucide-react";

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
        "inline-flex items-center gap-2 rounded-full font-bold border",
        isLayak
          ? "text-fresh-500 bg-fresh-500/10 border-fresh-500/30"
          : "text-spoiled-500 bg-spoiled-500/10 border-spoiled-500/30",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3.5 py-1.5 text-sm",
        size === "lg" && "px-5 py-2.5 text-base"
      )}
    >
      {isLayak ? (
        <CheckCircle2 size={size === "lg" ? 20 : size === "md" ? 16 : 14} />
      ) : (
        <XCircle size={size === "lg" ? 20 : size === "md" ? 16 : 14} />
      )}
      {prediction}
      {confidence !== undefined && (
        <span className="opacity-70">
          · {(confidence * 100).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
