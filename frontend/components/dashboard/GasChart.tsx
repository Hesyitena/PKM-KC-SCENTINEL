"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SensorReading } from "@/types/reading";
import { format } from "date-fns";

interface GasChartProps {
  data: SensorReading[];
  height?: number | string;
}

const GAS_LINES = [
  { key: "mq3",     name: "MQ-3 Alkohol",  color: "#6366f1", gradientId: "gradMq3"    },
  { key: "mq4",     name: "MQ-4 Metana",   color: "#10b981", gradientId: "gradMq4"    },
  { key: "mq135",   name: "MQ-135 Udara",  color: "#f59e0b", gradientId: "gradMq135"  },
  { key: "tgs2602", name: "TGS VOC",       color: "#f43f5e", gradientId: "gradTgs"    },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl p-4 text-xs shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(99,102,241,0.12)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 40px -8px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        minWidth: "180px",
      }}
    >
      <p
        className="font-bold text-slate-500 mb-3 pb-2 text-[11px] uppercase tracking-widest"
        style={{ borderBottom: "1px solid hsl(220 18% 91%)" }}
      >
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}60` }}
              />
              <span className="text-slate-500 font-medium">{entry.name}</span>
            </div>
            <span className="font-bold tabular-nums" style={{ color: entry.color }}>
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 pt-2 pb-1">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-3 h-[3px] rounded-full inline-block"
            style={{ background: entry.color }}
          />
          <span className="text-[11px] font-semibold text-slate-500">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function GasChart({ data, height = 300 }: GasChartProps) {
  const chartData = data.map((r) => ({
    ...r,
    time: format(new Date(r.timestamp), "HH:mm:ss"),
  }));

  if (!chartData.length) {
    return (
      <div
        id="gas-chart-empty"
        className="flex flex-col items-center justify-center gap-3 text-slate-400"
        style={{ height }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(227 68% 28% / 0.06), hsl(227 68% 28% / 0.03))",
            border: "1px solid hsl(227 68% 28% / 0.10)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-sm font-medium">Belum ada data sensor</p>
        <p className="text-xs text-slate-400/70">Data akan muncul saat perangkat terhubung</p>
      </div>
    );
  }

  return (
    <div id="gas-chart" style={{ height }} className="w-full">
      {/* SVG gradient defs */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          {GAS_LINES.map((line) => (
            <linearGradient key={line.gradientId} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={line.color} stopOpacity={0.20} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {GAS_LINES.map((line) => (
              <linearGradient key={line.gradientId} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={line.color} stopOpacity={0.22} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="hsl(220 18% 92%)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "hsl(220 18% 88%)",
              strokeWidth: 1.5,
              strokeDasharray: "4 4",
            }}
          />
          <Legend content={<CustomLegend />} />

          {GAS_LINES.map((line) => (
            <Area
              key={line.key}
              type="monotoneX"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              fill={`url(#${line.gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "#fff",
                fill: line.color,
                style: { filter: `drop-shadow(0 0 6px ${line.color}80)` },
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
