"use client";

import { ReadingHistoryParams, PredictionLabel } from "@/types/reading";
import { Search, RotateCcw } from "lucide-react";

interface DateFilterProps {
  params: ReadingHistoryParams;
  onChange: (params: Partial<ReadingHistoryParams>) => void;
  onReset: () => void;
}

export function DateFilter({ params, onChange, onReset }: DateFilterProps) {
  return (
    <div
      id="date-filter-panel"
      className="glass-card p-4 flex flex-wrap items-end gap-3"
    >
      {/* Date range */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Dari Tanggal
        </label>
        <input
          id="filter-start-date"
          type="datetime-local"
          value={params.start_date?.slice(0, 16) ?? ""}
          onChange={(e) => onChange({ start_date: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Sampai Tanggal
        </label>
        <input
          id="filter-end-date"
          type="datetime-local"
          value={params.end_date?.slice(0, 16) ?? ""}
          onChange={(e) => onChange({ end_date: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      {/* Prediction filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Hasil Deteksi
        </label>
        <select
          id="filter-prediction"
          value={params.prediction ?? ""}
          onChange={(e) =>
            onChange({ prediction: (e.target.value as PredictionLabel) || undefined })
          }
          className="px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="">Semua</option>
          <option value="LAYAK">LAYAK</option>
          <option value="TIDAK LAYAK">TIDAK LAYAK</option>
        </select>
      </div>

      {/* Food name search */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Nama Makanan
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="filter-food-name"
            type="text"
            placeholder="Cari makanan..."
            value={params.food_name ?? ""}
            onChange={(e) => onChange({ food_name: e.target.value || undefined })}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Reset button */}
      <button
        id="filter-reset-btn"
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border hover:bg-muted transition-all"
      >
        <RotateCcw size={14} />
        Reset
      </button>
    </div>
  );
}
