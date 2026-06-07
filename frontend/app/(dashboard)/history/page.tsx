"use client";

import { useState, useCallback } from "react";

import { ReadingTable } from "@/components/history/ReadingTable";
import { DateFilter } from "@/components/history/DateFilter";
import { ExportButton } from "@/components/history/ExportButton";
import { useReadingHistory } from "@/hooks/useReadings";
import { ReadingHistoryParams } from "@/types/reading";
import { Loader2, AlertCircle } from "lucide-react";

const DEFAULT_PARAMS: ReadingHistoryParams = {
  limit: 20,
  offset: 0,
};

export default function HistoryPage() {
  const [params, setParams] = useState<ReadingHistoryParams>(DEFAULT_PARAMS);
  const { data, isLoading, error } = useReadingHistory(params);

  const handleFilterChange = useCallback((changes: Partial<ReadingHistoryParams>) => {
    setParams((prev) => ({ ...prev, ...changes, offset: 0 }));
  }, []);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const handlePageChange = useCallback((offset: number) => {
    setParams((prev) => ({ ...prev, offset }));
  }, []);

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Riwayat <span className="gradient-text">Pengujian</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histori seluruh pembacaan sensor dan hasil deteksi AI
          </p>
        </div>
        <ExportButton
          startDate={params.start_date}
          endDate={params.end_date}
        />
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <DateFilter params={params} onChange={handleFilterChange} onReset={handleReset} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div id="history-loading" className="flex items-center justify-center py-12 gap-2 text-muted-foreground flex-shrink-0">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div id="history-error" className="glass-card p-6 flex items-center gap-3 text-destructive border-destructive/30 flex-shrink-0">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Table — fills remaining height, scroll only inside */}
      {data && !isLoading && (
        <div className="flex-1 min-h-0">
          <ReadingTable
            readings={data.items}
            total={data.total}
            limit={data.limit}
            offset={data.offset}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
