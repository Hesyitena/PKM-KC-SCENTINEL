"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSensorStore } from "@/store/sensorStore";

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Format a sensor reading row as CSV columns */
function readingToCSVRow(r: Record<string, unknown>): string {
  return [
    r.timestamp,
    r.mq3,
    r.mq4,
    r.mq135,
    r.tgs2602,
    r.temperature,
    r.humidity,
    r.prediction,
    r.confidence != null ? ((r.confidence as number) * 100).toFixed(1) + "%" : "",
  ]
    .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { chartData } = useSensorStore();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      if (DEMO_MODE) {
        /* ── Demo mode: generate CSV from in-memory chart data ── */
        const headers = [
          "Waktu",
          "MQ-3",
          "MQ-4",
          "MQ-135",
          "TGS-2602",
          "Suhu (°C)",
          "Kelembapan (%)",
          "Hasil",
          "Confidence",
        ].join(",");

        const rows = chartData.map((r) =>
          readingToCSVRow(r as unknown as Record<string, unknown>)
        );
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scentinel_demo_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data demo berhasil diekspor!", {
          description: `${chartData.length} baris data diunduh.`,
        });
      } else {
        /* ── Production mode: fetch from API ── */
        const params: Record<string, string | number> = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const res = await api.get("/readings/export", {
          params,
          responseType: "blob",
        });

        const blob = new Blob([res.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scentinel_readings_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data berhasil diekspor!");
      }
    } catch {
      toast.error("Gagal mengekspor data. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }, [startDate, endDate, chartData]);

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      style={{
        background: "rgba(83,58,253,0.08)",
        color: "#533afd",
        border: "1px solid rgba(83,58,253,0.2)",
        fontSize: "13px",
        fontWeight: 400,
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          (e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.14)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(83,58,253,0.15)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {isExporting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      Export CSV
    </button>
  );
}
