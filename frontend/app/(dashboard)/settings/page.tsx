"use client";

import { useState } from "react";
import { Settings, Info, Trash2, AlertTriangle, X, Loader2, ShieldAlert } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function DeleteAllModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (count: number) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const REQUIRED = "HAPUS SEMUA DATA";

  const handleDelete = async () => {
    if (confirmText !== REQUIRED) return;
    setIsDeleting(true);
    try {
      if (DEMO_MODE) {
        // Demo mode: simulasikan success
        await new Promise((r) => setTimeout(r, 1200));
        onSuccess(247);
        return;
      }
      const res = await api.delete<{ deleted: number; message: string }>("/readings/all");
      onSuccess(res.data.deleted);
    } catch {
      toast.error("Gagal menghapus data. Coba lagi.");
      setIsDeleting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13, 37, 61, 0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in"
        style={{
          background: "#ffffff",
          boxShadow: "0 24px 64px rgba(234,34,97,0.15), 0 4px 16px rgba(0,0,0,0.12)",
          border: "1px solid rgba(234,34,97,0.20)",
        }}
      >
        {/* Close button */}
        <button
          id="delete-modal-close"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-all"
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(234,34,97,0.08)", border: "1px solid rgba(234,34,97,0.18)" }}
        >
          <ShieldAlert size={22} style={{ color: "#ea2261" }} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Hapus Semua Data Pembacaan
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tindakan ini akan <strong className="text-foreground">menghapus permanen</strong> seluruh
          riwayat pembacaan sensor dari database. Data yang dihapus tidak dapat dipulihkan.
        </p>

        {/* Warning list */}
        <div
          className="rounded-xl p-4 mb-5 space-y-2"
          style={{ background: "rgba(234,34,97,0.04)", border: "1px solid rgba(234,34,97,0.14)" }}
        >
          {[
            "Seluruh riwayat pembacaan sensor akan hilang",
            "Grafik realtime akan direset",
            "Data CSV yang belum diexport tidak bisa dikembalikan",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs" style={{ color: "#be185d" }}>
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Confirmation input */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-medium text-muted-foreground">
            Ketik <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">{REQUIRED}</code> untuk konfirmasi
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={REQUIRED}
            disabled={isDeleting}
            className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: confirmText === REQUIRED ? "#ea2261" : "hsl(220 18% 88%)",
              background: "hsl(220 25% 97%)",
              color: "#0d253d",
              boxShadow: confirmText === REQUIRED ? "0 0 0 3px rgba(234,34,97,0.10)" : "none",
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            id="delete-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-all"
          >
            Batal
          </button>
          <button
            id="delete-modal-confirm"
            onClick={handleDelete}
            disabled={confirmText !== REQUIRED || isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: confirmText === REQUIRED && !isDeleting
                ? "linear-gradient(135deg, #ea2261, #be185d)"
                : "hsl(220 14% 82%)",
              cursor: confirmText !== REQUIRED || isDeleting ? "not-allowed" : "pointer",
              boxShadow: confirmText === REQUIRED && !isDeleting
                ? "0 4px 12px rgba(234,34,97,0.35)"
                : "none",
            }}
          >
            {isDeleting ? (
              <><Loader2 size={15} className="animate-spin" /> Menghapus...</>
            ) : (
              <><Trash2 size={15} /> Hapus Sekarang</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [lastDeletedCount, setLastDeletedCount] = useState<number | null>(null);

  const handleDeleteSuccess = (count: number) => {
    setLastDeletedCount(count);
    setShowModal(false);
    toast.success(`${count} data pembacaan berhasil dihapus.`, {
      description: "Database sensor readings telah dikosongkan.",
      duration: 5000,
    });
  };

  return (
    <>
      {showModal && (
        <DeleteAllModal
          onClose={() => setShowModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Wrapper */}
      <div className="h-full overflow-y-auto scrollbar-hide p-6 lg:p-10 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Pengaturan</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Konfigurasi sistem SCENTINEL
            </p>
          </div>

          {/* System info */}
          <div id="settings-info-card" className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Info size={16} className="text-primary" />
              <h3 className="font-semibold">Informasi Sistem</h3>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Nama Sistem", value: "SCENTINEL v1.0.0" },
                { label: "Tipe Sensor", value: "MQ-3, MQ-4, MQ-135, TGS-2602, DHT22" },
                { label: "Model AI", value: "Edge Classification (ESP32 Lokal)" },
                { label: "Komunikasi", value: "REST API + SSE Realtime" },
                { label: "Program", value: "PKM-KC 2026" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API config */}
          <div className="glass-card p-6 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-primary" />
              <h3 className="font-semibold">Konfigurasi API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Pengaturan API key ESP32 dan konfigurasi lanjutan hanya dapat diubah
              melalui file{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-primary text-xs">.env</code>{" "}
              di server backend.
            </p>
          </div>

          {/* ─── Danger Zone ─────────────────────────────────────── */}
          <div
            id="settings-danger-zone"
            className="rounded-2xl p-6"
            style={{
              background: "rgba(234,34,97,0.03)",
              border: "1px solid rgba(234,34,97,0.20)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} style={{ color: "#ea2261" }} />
              <h3 className="font-semibold" style={{ color: "#be185d" }}>
                Danger Zone
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Tindakan di bawah ini bersifat <strong>permanen</strong> dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-between gap-4 py-4 border-t border-red-100">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Hapus Semua Data Pembacaan
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mengosongkan seluruh tabel <code className="px-1 py-0.5 bg-muted rounded text-xs">sensor_readings</code> dari database.
                </p>
                {lastDeletedCount !== null && (
                  <p className="text-xs mt-1.5" style={{ color: "#ea2261" }}>
                    ✓ Terakhir dihapus: {lastDeletedCount} data
                  </p>
                )}
              </div>
              <button
                id="danger-delete-all-btn"
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #ea2261, #be185d)",
                  boxShadow: "0 2px 8px rgba(234,34,97,0.30)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(234,34,97,0.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(234,34,97,0.30)";
                }}
              >
                <Trash2 size={14} />
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
