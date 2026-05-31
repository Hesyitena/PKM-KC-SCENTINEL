"use client";


import { useSSE } from "@/lib/useSSE";
import { useSensorStore } from "@/store/sensorStore";
import { SensorReading } from "@/types/reading";
import { StatusBadge } from "./StatusBadge";
import { SensorCard } from "./SensorCard";
import { GasChart } from "./GasChart";
import { formatDate } from "@/lib/utils";
import { Thermometer, Droplets, Wind, FlaskConical } from "lucide-react";

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
    enabled: true,
  });

  if (!latestReading) {
    return (
      <div id="live-panel-empty" className="glass-card p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Menunggu data dari perangkat ESP32...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Pastikan perangkat menyala dan terhubung ke jaringan.
        </p>
      </div>
    );
  }

  return (
    <div id="live-monitoring-panel" className="space-y-4">
      {/* Prediction status */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Hasil Deteksi AI
          </p>
          <StatusBadge
            prediction={latestReading.prediction}
            confidence={latestReading.confidence}
            size="lg"
          />
          {latestReading.food_name && (
            <p className="text-sm text-muted-foreground mt-2">
              Sampel: <span className="text-foreground font-medium">{latestReading.food_name}</span>
            </p>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Timestamp</p>
          <p className="text-foreground text-sm font-medium mt-1">
            {formatDate(latestReading.timestamp)}
          </p>
        </div>
      </div>

      {/* Sensor grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SensorCard
          id="card-mq3"
          label="MQ-3 Alkohol"
          value={latestReading.mq3}
          icon={<Wind size={16} />}
          color="primary"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-mq4"
          label="MQ-4 Metana"
          value={latestReading.mq4}
          icon={<Wind size={16} />}
          color="amber"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-mq135"
          label="MQ-135 Udara"
          value={latestReading.mq135}
          icon={<FlaskConical size={16} />}
          color="default"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-tgs2602"
          label="TGS-2602 VOC"
          value={latestReading.tgs2602}
          icon={<FlaskConical size={16} />}
          color="spoiled"
          sublabel="ADC Value"
        />
        <SensorCard
          id="card-temperature"
          label="Suhu"
          value={latestReading.temperature}
          unit="°C"
          icon={<Thermometer size={16} />}
          color="amber"
        />
        <SensorCard
          id="card-humidity"
          label="Kelembapan"
          value={latestReading.humidity}
          unit="%"
          icon={<Droplets size={16} />}
          color="primary"
        />
      </div>

      {/* Realtime chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
          Grafik Sensor Gas (Realtime)
        </h3>
        <GasChart data={chartData} height={260} />
      </div>
    </div>
  );
}
