"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  height?: number;
}

const GAS_LINES = [
  { key: "mq3", name: "MQ-3 (Alkohol)", color: "#22c55e" },
  { key: "mq4", name: "MQ-4 (Metana)", color: "#3b82f6" },
  { key: "mq135", name: "MQ-135 (Udara)", color: "#f59e0b" },
  { key: "tgs2602", name: "TGS-2602 (VOC)", color: "#f43f5e" },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-foreground/80">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function GasChart({ data, height = 280 }: GasChartProps) {
  const chartData = data.map((r) => ({
    ...r,
    time: format(new Date(r.timestamp), "HH:mm:ss"),
  }));

  if (!chartData.length) {
    return (
      <div
        id="gas-chart-empty"
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        Belum ada data sensor untuk ditampilkan
      </div>
    );
  }

  return (
    <div id="gas-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "hsl(215 20% 60%)" }}
          />
          {GAS_LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
