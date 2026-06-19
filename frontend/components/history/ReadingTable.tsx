"use client";

import { SensorReading } from "@/types/reading";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDate, formatConfidence } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

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
    <div
      id="reading-table-container"
      className="overflow-hidden flex flex-col h-full rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid #e8edf3",
        boxShadow: "0 1px 4px rgba(0,55,112,0.06)",
      }}
    >
      <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["Waktu", "Makanan", "MQ-3", "MQ-4", "MQ-135", "TGS-2602", "Suhu", "Lembap", "Hasil", "Confidence"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    style={{ letterSpacing: "0.08em" }}
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
                <td colSpan={10} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(83,58,253,0.06), rgba(83,58,253,0.03))",
                        border: "1px solid rgba(83,58,253,0.10)",
                      }}
                    >
                      <Inbox size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Tidak ada data yang ditemukan</p>
                    <p className="text-xs text-slate-400">Coba ubah filter atau rentang tanggal</p>
                  </div>
                </td>
              </tr>
            ) : (
              readings.map((r, idx) => (
                <tr
                  key={r.id}
                  id={`reading-row-${r.id}`}
                  className="group transition-all duration-150"
                  style={{
                    background: idx % 2 === 0 ? "transparent" : "rgba(248,250,252,0.5)",
                    borderBottom: "1px solid rgba(226,232,240,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      idx % 2 === 0 ? "transparent" : "rgba(248,250,252,0.5)";
                  }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-medium" style={{ fontFeatureSettings: '"tnum" 1' }}>
                    {formatDate(r.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{r.food_name ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.mq3.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.mq4.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.mq135.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.tgs2602.toFixed(1)}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.temperature.toFixed(1)}°C</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.humidity.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge prediction={r.prediction} size="sm" />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-500">
                    {formatConfidence(r.confidence)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: "1px solid #e2e8f0", background: "rgba(248,250,252,0.5)" }}
        >
          <p className="text-xs font-medium text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{offset + 1}</span>–
            <span className="font-semibold text-slate-700">{Math.min(offset + limit, total)}</span> dari{" "}
            <span className="font-semibold text-slate-700">{total}</span> data
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: "#e2e8f0",
                color: "#475569",
                background: "#ffffff",
              }}
              onMouseEnter={(e) => {
                if (offset > 0) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(83,58,253,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "#533afd";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#ffffff";
                (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLElement).style.color = "#475569";
              }}
            >
              <ChevronLeft size={15} />
            </button>

            <span
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(83,58,253,0.08)",
                color: "#533afd",
                border: "1px solid rgba(83,58,253,0.15)",
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(offset + limit)}
              disabled={offset + limit >= total}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: "#e2e8f0",
                color: "#475569",
                background: "#ffffff",
              }}
              onMouseEnter={(e) => {
                if (offset + limit < total) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(83,58,253,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "#533afd";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#ffffff";
                (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLElement).style.color = "#475569";
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
