"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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

const colorMap = {
  default: "text-foreground border-border",
  primary: "text-primary border-primary/30",
  fresh: "text-fresh-500 border-fresh-500/30",
  spoiled: "text-spoiled-500 border-spoiled-500/30",
  amber: "text-amber-400 border-amber-400/30",
};

export function SensorCard({
  id,
  label,
  value,
  unit,
  icon,
  color = "default",
  sublabel,
}: SensorCardProps) {
  return (
    <div
      id={id}
      className={cn(
        "glass-card p-5 flex flex-col gap-3 hover:border-opacity-60 transition-all duration-200",
        "border",
        colorMap[color].split(" ")[1] // border class
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={cn("text-muted-foreground", colorMap[color].split(" ")[0])}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <span className={cn("sensor-value", colorMap[color].split(" ")[0])}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}
