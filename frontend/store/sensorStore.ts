// SCENTINEL - Sensor Data Zustand Store
// Manages live readings from SSE and history data
import { create } from "zustand";
import { SensorReading, ReadingLatest } from "@/types/reading";

const MAX_CHART_POINTS = 60; // keep last 60 points for realtime chart

interface SensorState {
  // Latest reading from SSE or API
  latestReading: ReadingLatest | null;

  // Realtime chart data (capped list)
  chartData: SensorReading[];

  // SSE connection status
  isConnected: boolean;

  // Last update timestamp
  lastUpdatedAt: string | null;

  // Actions
  setLatestReading: (reading: ReadingLatest) => void;
  pushChartReading: (reading: SensorReading) => void;
  setConnected: (status: boolean) => void;
  resetStore: () => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latestReading: null,
  chartData: [],
  isConnected: false,
  lastUpdatedAt: null,

  setLatestReading: (reading) =>
    set({
      latestReading: reading,
      lastUpdatedAt: reading.timestamp,
    }),

  pushChartReading: (reading) =>
    set((state) => ({
      chartData: [...state.chartData.slice(-MAX_CHART_POINTS + 1), reading],
      latestReading: state.latestReading
        ? { ...state.latestReading, ...reading }
        : (reading as ReadingLatest),
      lastUpdatedAt: reading.timestamp,
    })),

  setConnected: (status) => set({ isConnected: status }),

  resetStore: () =>
    set({
      latestReading: null,
      chartData: [],
      isConnected: false,
      lastUpdatedAt: null,
    }),
}));
