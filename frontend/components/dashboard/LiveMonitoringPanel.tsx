"use client";

import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { StatusBadge } from "./StatusBadge";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { formatDate } from "@/lib/utils";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  Brain,
  Clock,
  BarChart3,
  Wifi,
  Utensils,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function LiveMonitoringPanel() {
  const { latestReading, chartData, setConnected, pushChartReading } = useSensorStore();

  const handleReading = (reading: SensorReading) => {
    pushChartReading(reading);
    setConnected(true);
  };

  const handleError = () => setConnected(false);

  useSSE({ onReading: handleReading, onError: handleError, enabled: !DEMO_MODE });
  useMockSSE({ onReading: handleReading, enabled: DEMO_MODE });

  if (!latestReading) {
    return (
      <div
        id="live-panel-empty"
        className="flex flex-col items-center justify-center py-28 gap-5 rounded-2xl border"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderColor: "hsl(220 18% 92%)",
        }}
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse"
          style={{
            background: "linear-gradient(135deg, hsl(227 68% 28% / 0.08), hsl(227 68% 28% / 0.03))",
            border: "1px solid hsl(227 68% 28% / 0.12)",
          }}
        >
          <Wifi size={26} className="text-primary/40" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-semibold text-slate-600">Menunggu data perangkat...</p>
          <p className="text-xs text-slate-400">Pastikan ESP32 menyala dan terhubung ke jaringan.</p>
        </div>
      </div>
    );
  }

  const isLayak = latestReading.prediction === "LAYAK";

  return (
    <div id="live-monitoring-panel" className="space-y-4">

      {/* ── Top row: AI Detection + Timestamp ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* AI Detection — takes 2 columns */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.98)",
            borderColor: isLayak ? "#bbf7d0" : "#fecdd3",
            boxShadow: isLayak
              ? "0 1px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(16,185,129,0.07)"
              : "0 1px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(244,63,94,0.07)",
          }}
        >
          {/* Colored left stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r"
            style={{
              background: isLayak
                ? "linear-gradient(180deg, #10b981, #34d399)"
                : "linear-gradient(180deg, #f43f5e, #fb7185)",
            }}
          />

          <div className="pl-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(227 68% 28% / 0.10), hsl(227 68% 28% / 0.04))",
                    border: "1px solid hsl(227 68% 28% / 0.10)",
                  }}
                >
                  <Brain size={13} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Hasil Deteksi AI
                </span>
              </div>

              <StatusBadge
                prediction={latestReading.prediction}
                confidence={latestReading.confidence}
                size="lg"
              />

              {latestReading.food_name && (
                <div className="flex items-center gap-2">
                  <Utensils size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">Sampel:</span>
                  <span className="text-xs text-slate-700 font-bold">{latestReading.food_name}</span>
                </div>
              )}
            </div>

            {/* Confidence ring / visual */}
            {latestReading.confidence !== undefined && (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${isLayak ? "#10b981" : "#f43f5e"} ${latestReading.confidence * 360}deg, #f1f5f9 0deg)`,
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <span className={`text-sm font-black ${isLayak ? "text-emerald-600" : "text-rose-600"}`}>
                      {(latestReading.confidence * 100).toFixed(0)}
                      <span className="text-[9px] font-bold">%</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Akurasi</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp card — takes 1 column */}
        <div
          className="rounded-2xl border p-5 flex flex-col justify-between"
          style={{
            background: "rgba(255,255,255,0.98)",
            borderColor: "hsl(220 18% 92%)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(227 68% 28% / 0.10), hsl(227 68% 28% / 0.04))",
                border: "1px solid hsl(227 68% 28% / 0.10)",
              }}
            >
              <Clock size={13} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Timestamp
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 tabular-nums leading-tight">
              {formatDate(latestReading.timestamp)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Pembacaan terakhir</p>
          </div>
        </div>
      </div>

      {/* ── Sensor cards grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <SensorCard
          id="card-mq3"
          label="MQ-3 Alkohol"
          value={latestReading.mq3}
          icon={<Wind size={13} />}
          color="primary"
          sublabel="ADC"
        />
        <SensorCard
          id="card-mq4"
          label="MQ-4 Metana"
          value={latestReading.mq4}
          icon={<Wind size={13} />}
          color="fresh"
          sublabel="ADC"
        />
        <SensorCard
          id="card-mq135"
          label="MQ-135 Udara"
          value={latestReading.mq135}
          icon={<FlaskConical size={13} />}
          color="amber"
          sublabel="ADC"
        />
        <SensorCard
          id="card-tgs2602"
          label="TGS-2602 VOC"
          value={latestReading.tgs2602}
          icon={<FlaskConical size={13} />}
          color="spoiled"
          sublabel="ADC"
        />
        <SensorCard
          id="card-temperature"
          label="Suhu"
          value={latestReading.temperature}
          unit="°C"
          icon={<Thermometer size={13} />}
          color="amber"
          max={50}
        />
        <SensorCard
          id="card-humidity"
          label="Kelembapan"
          value={latestReading.humidity}
          unit="%"
          icon={<Droplets size={13} />}
          color="primary"
          max={100}
        />
      </div>

      {/* ── Chart section ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.98)",
          borderColor: "hsl(220 18% 91%)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(99,102,241,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid hsl(220 18% 94%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(227 68% 28% / 0.10), hsl(227 68% 28% / 0.04))",
                border: "1px solid hsl(227 68% 28% / 0.10)",
              }}
            >
              <BarChart3 size={15} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight">Grafik Sensor Gas</h3>
              <p className="text-[11px] text-slate-400 font-medium">ADC readings over time</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-400 font-semibold tabular-nums">
              {chartData.length} poin
            </span>
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center w-2.5 h-2.5">
                <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-50" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, hsl(142 60% 95%), hsl(142 60% 92%))",
                  border: "1px solid hsl(142 60% 85%)",
                  color: "hsl(142 70% 30%)",
                }}
              >
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Chart body */}
        <div className="px-4 py-5">
          <GasChart data={chartData} height={300} />
        </div>
      </div>
    </div>
  );
}
