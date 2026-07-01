"use client";

import { useRef } from "react";
import { useSSE } from "@/lib/useSSE";
import { useMockSSE } from "@/lib/useMockSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { toast } from "sonner";
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  ShieldX,
  Cpu,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function LiveMonitoringPanel() {
  const { latestReading, chartData, setConnected, pushChartReading } =
    useSensorStore();

  const prevPredictionRef = useRef<string | null>(null);
  const wasConnectedRef = useRef<boolean>(false);

  const handleReading = (reading: SensorReading, isLive = true) => {
    pushChartReading(reading);

    if (isLive) {
      setConnected(true);

      if (!wasConnectedRef.current) {
        wasConnectedRef.current = true;
        toast.success("Perangkat ESP32 terhubung", {
          description: "Live stream aktif — data sedang masuk.",
          duration: 3000,
        });
      }
    }

    if (prevPredictionRef.current !== null && prevPredictionRef.current !== reading.prediction) {
      if (reading.prediction === "TIDAK LAYAK") {
        toast.error("Peringatan: Kualitas Menurun!", {
          description: "Deteksi AI: TIDAK LAYAK — segera periksa sampel.",
          duration: 5000,
        });
      } else {
        toast.success("Status kembali normal", {
          description: "Deteksi AI: LAYAK — kualitas sampel baik.",
          duration: 4000,
        });
      }
    }
    prevPredictionRef.current = reading.prediction;
  };

  const handleError = () => {
    setConnected(false);
    if (wasConnectedRef.current) {
      wasConnectedRef.current = false;
      toast.warning("Koneksi terputus", {
        description: "Mencoba menghubungkan kembali ke perangkat...",
        duration: 4000,
      });
    }
  };

  useSSE({ onReading: handleReading, onError: handleError, enabled: !DEMO_MODE });
  useMockSSE({ onReading: handleReading, enabled: DEMO_MODE });

  if (!latestReading) {
    return <DashboardSkeleton />;
  }

  const isLayak = latestReading.prediction === "LAYAK";

  const S = {
    bgGrad: isLayak
      ? "linear-gradient(135deg, #f0fdf8 0%, #ffffff 60%)"
      : "linear-gradient(135deg, #fff5f5 0%, #ffffff 60%)",
    border: isLayak ? "#a7f3d0" : "#fecdd3",
    text: isLayak ? "#065f46" : "#9f1239",
    textSub: isLayak ? "#047857" : "#be123c",
    accent: isLayak ? "#10b981" : "#ea2261",
    accentSoft: isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.09)",
    shadow: isLayak
      ? "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.10)"
      : "0 1px 3px rgba(0,55,112,0.06), 0 8px 32px rgba(234,34,97,0.10), 0 0 0 1px rgba(234,34,97,0.10)",
    iconGrad: isLayak
      ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
      : "linear-gradient(135deg, #f87171 0%, #ea2261 100%)",
    iconShadow: isLayak
      ? "0 8px 24px rgba(16,185,129,0.40)"
      : "0 8px 24px rgba(234,34,97,0.35)",
    divider: isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
  };

  return (
    <div id="live-monitoring-panel" className="flex flex-col gap-4 h-full min-h-0">

      {/* ══ STATUS CARD — Prediction (left) + Sensor Grid 3x2 (right) ══ */}
      <div
        className="flex-shrink-0 flex flex-col lg:flex-row items-stretch overflow-hidden animate-slide-up"
        style={{
          background: S.bgGrad,
          border: `1px solid ${S.border}`,
          borderRadius: "22px",
          boxShadow: S.shadow,
        }}
      >
        {/* LEFT: Prediction result */}
        <div
          className="flex-1 flex flex-col justify-center px-6 md:px-8 py-6 lg:pr-6 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: S.divider, minWidth: "260px" }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit"
              style={{
                background: S.accentSoft,
                border: `1px solid ${S.divider}`,
              }}
            >
              <Cpu size={9} color={S.accent} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: S.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Hasil Deteksi Edge AI
              </span>
            </div>
            
            {latestReading.is_syncing && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit animate-pulse"
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#8b5cf6",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  SD CARD SYNC
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 mb-5">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                background: S.iconGrad,
                borderRadius: "20px",
                width: "60px",
                height: "60px",
                boxShadow: S.iconShadow,
              }}
            >
              {isLayak
                ? <ShieldCheck size={30} color="#fff" strokeWidth={1.7} />
                : <ShieldX     size={30} color="#fff" strokeWidth={1.7} />
              }
            </div>

            <div>
              <p
                style={{
                  fontSize: "38px",
                  fontWeight: 800,
                  letterSpacing: "-2px",
                  color: S.text,
                  lineHeight: 1,
                }}
              >
                {latestReading.prediction}
              </p>
              {latestReading.food_name && (
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#94a3b8",
                    marginTop: "6px",
                  }}
                >
                  Sampel:{" "}
                  <span style={{ fontWeight: 600, color: S.textSub }}>
                    {latestReading.food_name}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-2 pt-4"
            style={{ borderTop: `1px solid ${S.divider}` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: S.accent,
                boxShadow: `0 0 8px ${S.accent}`,
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>
              Diperbarui pukul
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#273951",
                fontWeight: 600,
                fontFeatureSettings: '"tnum" 1',
                fontFamily: "var(--font-mono)",
              }}
            >
              {new Date(latestReading.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* RIGHT: 3x2 Sensor Grid */}
        <div className="flex-shrink-0 p-4 lg:w-[55%] xl:w-[58%]">
          <div className="grid grid-cols-3 grid-rows-2 gap-3 h-full">
            <SensorCard id="card-mq3"         label="MQ-3 Alkohol"  value={latestReading.mq3}         icon={<Wind size={13} />}         color="primary"  sublabel="ADC" />
            <SensorCard id="card-mq4"         label="MQ-4 Metana"   value={latestReading.mq4}         icon={<Wind size={13} />}         color="fresh"    sublabel="ADC" />
            <SensorCard id="card-mq135"       label="MQ-135 Udara"  value={latestReading.mq135}       icon={<FlaskConical size={13} />} color="amber"    sublabel="ADC" />
            <SensorCard id="card-tgs2602"     label="TGS-2602 VOC"  value={latestReading.tgs2602}     icon={<FlaskConical size={13} />} color="spoiled"  sublabel="ADC" />
            <SensorCard id="card-temperature" label="Suhu"          value={latestReading.temperature} icon={<Thermometer size={13} />}  color="amber"    unit="°C"  max={50} />
            <SensorCard id="card-humidity"    label="Kelembapan"    value={latestReading.humidity}    icon={<Droplets size={13} />}     color="primary"  unit="%" max={100} />
          </div>
        </div>
      </div>

      {/* ══ CHART ══ */}
      <div
        className="rounded-2xl border overflow-hidden flex flex-col flex-1 min-h-0"
        style={{
          background: "#ffffff",
          borderColor: "#e8edf3",
          boxShadow: "0 1px 4px rgba(0,55,112,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(83,58,253,0.12), rgba(83,58,253,0.05))",
                border: "1px solid rgba(83,58,253,0.15)",
                boxShadow: "0 2px 8px rgba(83,58,253,0.08)",
              }}
            >
              <BarChart3 size={16} style={{ color: "#533afd" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0d253d", letterSpacing: "-0.3px" }}>
                Grafik Sensor Gas
              </h3>
              <p style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8" }}>
                {chartData.length} titik data · Realtime
              </p>
            </div>
          </div>


        </div>

        <div className="px-3 py-3 flex-1 min-h-0">
          <GasChart data={chartData} height="100%" />
        </div>
      </div>
    </div>
  );
}
