"use client";

import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { StatusBadge } from "./StatusBadge";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { formatDate } from "@/lib/utils";
import { Thermometer, Droplets, Wind, FlaskConical, Brain, Clock, BarChart3 } from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function LiveMonitoringPanel() {
  const { latestReading, chartData, setConnected, pushChartReading } = useSensorStore();

  const handleReading = (reading: SensorReading) => {
    pushChartReading(reading);
    setConnected(true);
  };

  const handleError = () => {
    setConnected(false);
  };

  useSSE({
    onReading: handleReading,
    onError: handleError,
    enabled: !DEMO_MODE,
  });

  useMockSSE({
    onReading: handleReading,
    enabled: DEMO_MODE,
  });

  if (!latestReading) {
    return (
      <div id="live-panel-empty" className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
          style={{
            background: "linear-gradient(135deg, hsl(227 68% 28% / 0.08), hsl(227 68% 28% / 0.04))",
            border: "1px solid hsl(227 68% 28% / 0.12)",
          }}
        >
          <Wind size={24} className="text-primary/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/60">Menunggu data perangkat...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Pastikan ESP32 menyala dan terhubung ke jaringan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="live-monitoring-panel" className="space-y-4">
      {/* ── AI Detection result card ── */}
      <div
        className="rounded-2xl border p-5 transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(8px)",
          borderColor: "hsl(220 18% 88% / 0.8)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: detection result */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(227 68% 28% / 0.10), hsl(227 68% 28% / 0.05))",
                  border: "1px solid hsl(227 68% 28% / 0.12)",
                }}
              >
                <Brain size={13} className="text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Hasil Deteksi AI
              </p>
            </div>

            <StatusBadge
              prediction={latestReading.prediction}
              confidence={latestReading.confidence}
              size="lg"
            />

            {latestReading.food_name && (
              <p className="text-sm text-muted-foreground">
                Sampel:{" "}
                <span className="text-foreground font-semibold">{latestReading.food_name}</span>
              </p>
            )}
          </div>

          {/* Right: timestamp */}
          <div
            className="flex flex-col items-end gap-1 px-4 py-3 rounded-xl"
            style={{
              background: "hsl(220 20% 96%)",
              border: "1px solid hsl(220 18% 91%)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock size={11} />
              Timestamp
            </div>
            <p className="text-sm font-semibold text-foreground/80 tabular-nums">
              {formatDate(latestReading.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sensor grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <SensorCard
          id="card-mq3"
          label="MQ-3 Alkohol"
          value={latestReading.mq3}
          icon={<Wind size={15} />}
          color="primary"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-mq4"
          label="MQ-4 Metana"
          value={latestReading.mq4}
          icon={<Wind size={15} />}
          color="amber"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-mq135"
          label="MQ-135 Udara"
          value={latestReading.mq135}
          icon={<FlaskConical size={15} />}
          color="default"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-tgs2602"
          label="TGS-2602 VOC"
          value={latestReading.tgs2602}
          icon={<FlaskConical size={15} />}
          color="spoiled"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-temperature"
          label="Suhu"
          value={latestReading.temperature}
          unit="°C"
          icon={<Thermometer size={15} />}
          color="amber"
        />
        <SensorCard
          id="card-humidity"
          label="Kelembapan"
          value={latestReading.humidity}
          unit="%"
          icon={<Droplets size={15} />}
          color="primary"
        />
      </div>

      {/* ── Realtime chart ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(8px)",
          borderColor: "hsl(220 18% 88% / 0.8)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid hsl(220 18% 91%)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(227 68% 28% / 0.10), hsl(227 68% 28% / 0.05))",
                border: "1px solid hsl(227 68% 28% / 0.12)",
              }}
            >
              <BarChart3 size={13} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground/80">
              Grafik Sensor Gas
            </h3>
          </div>
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "linear-gradient(135deg, hsl(227 68% 28% / 0.08), hsl(227 68% 28% / 0.04))",
              border: "1px solid hsl(227 68% 28% / 0.12)",
              color: "hsl(var(--primary))",
            }}
          >
            Realtime
          </span>
        </div>
        <div className="p-5">
          <GasChart data={chartData} height={260} />
        </div>
      </div>
    </div>
  );
}
