// SCENTINEL - Dashboard Settings Zustand Store (persisted)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const CHART_POINTS_OPTIONS = [30, 60, 120] as const;

interface SettingsState {
  autoRefresh: boolean;
  chartAnimation: boolean;
  chartPoints: number;
  setAutoRefresh: (value: boolean) => void;
  setChartAnimation: (value: boolean) => void;
  setChartPoints: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoRefresh: true,
      chartAnimation: true,
      chartPoints: 60,

      setAutoRefresh: (value) => set({ autoRefresh: value }),
      setChartAnimation: (value) => set({ chartAnimation: value }),
      setChartPoints: (value) => set({ chartPoints: value }),
    }),
    {
      name: "scentinel-settings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any)
      ),
    }
  )
);
