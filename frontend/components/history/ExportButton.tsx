"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
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
    } catch {
      toast.error("Gagal mengekspor data. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }, [startDate, endDate]);

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      disabled={isExporting}
      className="
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        bg-primary/10 text-primary border border-primary/30
        hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
      "
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      Export CSV
    </button>
  );
}
