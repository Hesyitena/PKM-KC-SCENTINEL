"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { User, Lock, Loader2, Calendar, Shield } from "lucide-react";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Min 6 karakter"),
    new_password: z.string().min(6, "Min 6 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Password baru tidak cocok",
    path: ["confirm_password"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success("Password berhasil diubah!");
      reset();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Gagal mengubah password";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6 lg:p-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Profil</span> Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informasi akun dan pengaturan keamanan
          </p>
        </div>

        {/* User info card */}
        <div
          id="profile-info-card"
          className="rounded-2xl p-6 animate-fade-in delay-75"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid #e8edf3",
            boxShadow: "0 1px 4px rgba(0,55,112,0.06), 0 8px 24px rgba(0,55,112,0.04)",
          }}
        >
          <div className="flex items-center gap-5">
            {/* Premium avatar with glow ring */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white uppercase relative z-10"
                style={{
                  background: "linear-gradient(135deg, #533afd 0%, #4434d4 60%, #2e2b8c 100%)",
                  boxShadow: "0 8px 24px rgba(83,58,253,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {initials}
              </div>
              {/* Glow ring */}
              <div
                className="absolute -inset-1 rounded-2xl -z-0 animate-breathe"
                style={{
                  background: "linear-gradient(135deg, rgba(83,58,253,0.20), rgba(83,58,253,0.05))",
                  filter: "blur(8px)",
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {user?.username}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {user?.created_at ? `Bergabung ${formatDate(user.created_at)}` : ""}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.18)",
                  }}
                >
                  <Shield size={10} style={{ color: "#059669" }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#065f46", letterSpacing: "0.04em" }}>
                    AKTIF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f1f5f9" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    background: "rgba(83,58,253,0.08)",
                    border: "1px solid rgba(83,58,253,0.12)",
                  }}
                >
                  <User size={14} style={{ color: "#533afd" }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Username
                  </p>
                  <p className="text-sm font-semibold text-foreground">{user?.username}</p>
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
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                >
                  <Shield size={14} style={{ color: "#059669" }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm font-semibold text-foreground">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div
          id="change-password-card"
          className="rounded-2xl p-6 animate-fade-in delay-150"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid #e8edf3",
            boxShadow: "0 1px 4px rgba(0,55,112,0.06), 0 8px 24px rgba(0,55,112,0.04)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(83,58,253,0.10), rgba(83,58,253,0.05))",
                border: "1px solid rgba(83,58,253,0.15)",
              }}
            >
              <Lock size={16} style={{ color: "#533afd" }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Ubah Password</h3>
              <p className="text-xs text-muted-foreground">Perbarui kata sandi untuk keamanan akun</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { id: "current_password", label: "Password Saat Ini", field: "current_password" as keyof ChangePasswordForm },
              { id: "new_password", label: "Password Baru", field: "new_password" as keyof ChangePasswordForm },
              { id: "confirm_password", label: "Konfirmasi Password Baru", field: "confirm_password" as keyof ChangePasswordForm },
            ].map(({ id, label, field }) => (
              <div key={field} className="space-y-2">
                <label htmlFor={id} className="text-sm font-semibold text-foreground/80">
                  {label}
                </label>
                <input
                  id={id}
                  type="password"
                  placeholder="••••••••"
                  {...register(field)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm transition-all duration-200"
                  style={{ borderColor: errors[field] ? "#f87171" : "#e2e8f0" }}
                />
                {errors[field] && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="pt-2">
              <button
                type="submit"
                id="change-password-btn"
                disabled={isSubmitting}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 hover:-translate-y-0.5"
                style={{
                  background: isSubmitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #533afd, #4434d4)",
                  boxShadow: isSubmitting
                    ? "none"
                    : "0 4px 14px rgba(83,58,253,0.30)",
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Simpan Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
