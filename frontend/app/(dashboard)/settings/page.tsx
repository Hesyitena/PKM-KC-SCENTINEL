"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Info,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
  Cpu,
  Wifi,
  BarChart3,
  Database,
  Monitor,
  Activity,
  HardDrive,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSettingsStore, CHART_POINTS_OPTIONS } from "@/store/settingsStore";
import { ReadingStats } from "@/types/reading";
import { MOCK_READING_STATS } from "@/lib/mockData";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13, 37, 61, 0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in"
        style={{
          background: "#ffffff",
          boxShadow: "0 24px 64px rgba(234,34,97,0.15), 0 4px 16px rgba(0,0,0,0.12)",
          border: "1px solid rgba(234,34,97,0.20)",
        }}
      >
        <button
          id="delete-modal-close"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-all"
        >
          <X size={15} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(234,34,97,0.08)", border: "1px solid rgba(234,34,97,0.18)" }}
        >
          <ShieldAlert size={22} style={{ color: "#ea2261" }} />
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-1">
          Hapus Semua Data Pembacaan
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tindakan ini akan <strong className="text-foreground">menghapus permanen</strong> seluruh
          riwayat pembacaan sensor dari database. Data yang dihapus tidak dapat dipulihkan.
        </p>

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

/* ── Toggle switch component ── */
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 flex-shrink-0"
      style={{
        background: checked
          ? "linear-gradient(135deg, #533afd, #4434d4)"
          : "#d1d5db",
        boxShadow: checked
          ? "0 2px 8px rgba(83,58,253,0.30), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "inset 0 1px 3px rgba(0,0,0,0.10)",
      }}
    >
      <span
        className="inline-block h-4.5 w-4.5 rounded-full transition-transform duration-200"
        style={{
          width: "18px",
          height: "18px",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transform: checked ? "translateX(22px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

/* ── Settings card wrapper ── */
function SettingsCard({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
  delay,
}: {
  id: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl p-6 animate-fade-in ${delay ?? ""}`}
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid #e8edf3",
        boxShadow: "0 1px 4px rgba(0,55,112,0.06), 0 8px 24px rgba(0,55,112,0.04)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: iconBg,
            border: `1px solid ${iconColor}22`,
          }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground" style={{ fontSize: "15px", letterSpacing: "-0.2px" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Info grid item ── */
function InfoGridItem({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "rgba(248,250,252,0.8)",
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg,
          border: `1px solid ${iconColor}18`,
        }}
      >
        <Icon size={14} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-sm font-semibold text-foreground mt-0.5 ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [lastDeletedCount, setLastDeletedCount] = useState<number | null>(null);

  const {
    autoRefresh, setAutoRefresh,
    chartAnimation, setChartAnimation,
    chartPoints, setChartPoints,
  } = useSettingsStore();

  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setStats(MOCK_READING_STATS);
      setStatsLoading(false);
      return;
    }
    api.get<ReadingStats>("/readings/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const statsRow = [
    {
      label: "Total Data",
      value: statsLoading ? "…" : stats?.total.toLocaleString("id-ID") ?? "—",
      sub: "pembacaan",
    },
    {
      label: "Data Tertua",
      value: !statsLoading && stats?.oldest_timestamp
        ? format(new Date(stats.oldest_timestamp), "dd MMM", { locale: localeId })
        : statsLoading ? "…" : "—",
      sub: !statsLoading && stats?.oldest_timestamp
        ? format(new Date(stats.oldest_timestamp), "yyyy", { locale: localeId })
        : "",
    },
    {
      label: "Storage",
      value: statsLoading ? "…" : stats ? (stats.storage_bytes / (1024 * 1024)).toFixed(1) : "—",
      sub: "MB",
    },
  ];

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

      <div className="h-full overflow-y-auto scrollbar-hide p-6 lg:p-10 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">

          {/* ─── Header ──────────────────────────────────────── */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Pengaturan</span>
              </h1>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(83,58,253,0.08)",
                  border: "1px solid rgba(83,58,253,0.15)",
                  color: "#533afd",
                }}
              >
                v1.0.0
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              Konfigurasi tampilan, monitoring, dan manajemen data sistem SCENTINEL
            </p>
          </div>

          {/* ─── System Info ─────────────────────────────────── */}
          <SettingsCard
            id="settings-info-card"
            icon={Info}
            iconColor="#533afd"
            iconBg="rgba(83,58,253,0.08)"
            title="Informasi Sistem"
            subtitle="Detail perangkat dan konfigurasi SCENTINEL"
            delay="delay-75"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoGridItem
                icon={Activity}
                iconColor="#533afd"
                iconBg="rgba(83,58,253,0.08)"
                label="Nama Sistem"
                value="SCENTINEL"
                mono
              />
              <InfoGridItem
                icon={Shield}
                iconColor="#059669"
                iconBg="rgba(16,185,129,0.08)"
                label="Status"
                value="Aktif"
              />
              <InfoGridItem
                icon={Cpu}
                iconColor="#d97706"
                iconBg="rgba(245,158,11,0.08)"
                label="Tipe Sensor"
                value="MQ-3, MQ-4, MQ-135, TGS-2602, DHT22"
              />
              <InfoGridItem
                icon={Cpu}
                iconColor="#ea2261"
                iconBg="rgba(234,34,97,0.07)"
                label="Model AI"
                value="Edge Classification (ESP32)"
              />
              <InfoGridItem
                icon={Wifi}
                iconColor="#0ea5e9"
                iconBg="rgba(14,165,233,0.08)"
                label="Komunikasi"
                value="REST API + SSE Realtime"
              />
              <InfoGridItem
                icon={BarChart3}
                iconColor="#8b5cf6"
                iconBg="rgba(139,92,246,0.08)"
                label="Program"
                value="PKM-KC 2026"
              />
            </div>
          </SettingsCard>

          {/* ─── Tampilan & Monitoring ───────────────────────── */}
          <SettingsCard
            id="settings-display-card"
            icon={Monitor}
            iconColor="#0ea5e9"
            iconBg="rgba(14,165,233,0.08)"
            title="Tampilan & Monitoring"
            subtitle="Sesuaikan preferensi tampilan dashboard"
            delay="delay-100"
          >
            <div className="space-y-1">
              {/* Auto-refresh */}
              <div
                className="flex items-center justify-between py-4 px-4 rounded-xl transition-colors duration-150"
                style={{ background: "rgba(248,250,252,0.6)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.12)",
                    }}
                  >
                    <Wifi size={14} style={{ color: "#059669" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-refresh Data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Otomatis memperbarui data sensor secara realtime
                    </p>
                  </div>
                </div>
                <Toggle
                  id="settings-auto-refresh"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                />
              </div>

              {/* Chart animation */}
              <div
                className="flex items-center justify-between py-4 px-4 rounded-xl transition-colors duration-150"
                style={{ background: "transparent" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(83,58,253,0.08)",
                      border: "1px solid rgba(83,58,253,0.12)",
                    }}
                  >
                    <BarChart3 size={14} style={{ color: "#533afd" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Animasi Chart</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Efek animasi pada grafik sensor gas realtime
                    </p>
                  </div>
                </div>
                <Toggle
                  id="settings-chart-animation"
                  checked={chartAnimation}
                  onChange={() => setChartAnimation(!chartAnimation)}
                />
              </div>

              {/* Chart data points */}
              <div
                className="flex items-center justify-between py-4 px-4 rounded-xl transition-colors duration-150"
                style={{ background: "rgba(248,250,252,0.6)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.12)",
                    }}
                  >
                    <Database size={14} style={{ color: "#d97706" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Titik Data Chart</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Jumlah maksimum titik data yang ditampilkan
                    </p>
                  </div>
                </div>
                <select
                  id="settings-chart-points"
                  value={chartPoints}
                  onChange={(e) => setChartPoints(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  style={{
                    background: "#ffffff",
                    borderColor: "#e2e8f0",
                    color: "#0d253d",
                    minWidth: "80px",
                  }}
                >
                  {CHART_POINTS_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </SettingsCard>

          {/* ─── Manajemen Data ──────────────────────────────── */}
          <SettingsCard
            id="settings-data-card"
            icon={HardDrive}
            iconColor="#8b5cf6"
            iconBg="rgba(139,92,246,0.08)"
            title="Manajemen Data"
            subtitle="Ringkasan penyimpanan data sensor"
            delay="delay-150"
          >
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {statsRow.map((item) => (
                  <div
                    key={item.label}
                    className="text-center px-3 py-3 rounded-xl"
                    style={{
                      background: "rgba(248,250,252,0.8)",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p
                      className="text-xl font-bold text-foreground mt-1"
                      style={{ fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.5px" }}
                    >
                      {item.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </SettingsCard>

          {/* ─── API Configuration ───────────────────────────── */}
          <SettingsCard
            id="settings-api-card"
            icon={Settings}
            iconColor="#533afd"
            iconBg="rgba(83,58,253,0.08)"
            title="Konfigurasi API"
            subtitle="Endpoint dan autentikasi perangkat ESP32"
            delay="delay-225"
          >
            <div className="space-y-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(248,250,252,0.8)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                >
                  <Wifi size={14} style={{ color: "#059669" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Endpoint
                  </p>
                  <p className="text-sm font-semibold font-mono text-foreground mt-0.5">
                    POST /api/readings
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(248,250,252,0.8)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(234,34,97,0.07)",
                    border: "1px solid rgba(234,34,97,0.12)",
                  }}
                >
                  <Shield size={14} style={{ color: "#ea2261" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Autentikasi
                  </p>
                  <p className="text-sm font-semibold font-mono text-foreground mt-0.5">
                    X-API-Key: {"<ESP32_API_KEY>"}
                  </p>
                </div>
              </div>

              <div
                className="px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(248,250,252,0.8)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <p className="text-xs text-muted-foreground leading-relaxed">
                  API key dan konfigurasi lanjutan hanya dapat diubah melalui file{" "}
                  <code
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{
                      background: "rgba(83,58,253,0.08)",
                      color: "#533afd",
                      border: "1px solid rgba(83,58,253,0.12)",
                    }}
                  >
                    .env
                  </code>{" "}
                  di server backend.
                </p>
              </div>
            </div>
          </SettingsCard>

          {/* ─── Danger Zone ─────────────────────────────────── */}
          <div
            id="settings-danger-zone"
            className="rounded-2xl p-6 animate-fade-in delay-300"
            style={{
              background: "rgba(234,34,97,0.02)",
              border: "1px solid rgba(234,34,97,0.15)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(234,34,97,0.08)",
                  border: "1px solid rgba(234,34,97,0.15)",
                }}
              >
                <AlertTriangle size={16} style={{ color: "#ea2261" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontSize: "15px", color: "#be185d", letterSpacing: "-0.2px" }}>
                  Danger Zone
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tindakan permanen yang tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-4 p-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.80)",
                border: "1px solid rgba(234,34,97,0.12)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Hapus Semua Data Pembacaan
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mengosongkan tabel{" "}
                  <code className="px-1 py-0.5 rounded text-[11px] font-mono" style={{ background: "rgba(234,34,97,0.06)", color: "#be185d" }}>
                    sensor_readings
                  </code>
                </p>
                {lastDeletedCount !== null && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "#ea2261" }}>
                    Terakhir dihapus: {lastDeletedCount} data
                  </p>
                )}
              </div>
              <button
                id="danger-delete-all-btn"
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #ea2261, #be185d)",
                  boxShadow: "0 2px 8px rgba(234,34,97,0.30)",
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
