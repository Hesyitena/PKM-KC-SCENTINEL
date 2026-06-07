"use client";

import { SensorReading } from "@/types/reading";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDate, formatConfidence } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReadingTableProps {
  readings: SensorReading[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function ReadingTable({
  readings,
  total,
  limit,
  offset,
  onPageChange,
}: ReadingTableProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div id="reading-table-container" className="glass-card overflow-hidden flex flex-col h-full">
      {/* Table — scrollable area */}
      <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Waktu", "Makanan", "MQ-3", "MQ-4", "MQ-135", "TGS-2602", "Suhu", "Lembap", "Hasil", "Keyakinan"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {readings.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-muted-foreground text-sm">
                  Tidak ada data yang ditemukan
                </td>
              </tr>
            ) : (
              readings.map((r) => (
                <tr
                  key={r.id}
                  id={`reading-row-${r.id}`}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(r.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.food_name ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.mq3.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.mq4.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.mq135.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.tgs2602.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.temperature.toFixed(1)}°C</td>
                  <td className="px-4 py-3 tabular-nums">{r.humidity.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge prediction={r.prediction} size="sm" />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatConfidence(r.confidence)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Menampilkan {offset + 1}–{Math.min(offset + limit, total)} dari {total} data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(offset + limit)}
              disabled={offset + limit >= total}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
