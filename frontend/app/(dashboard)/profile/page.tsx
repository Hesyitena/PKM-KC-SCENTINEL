"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { User, Shield, Lock, Loader2 } from "lucide-react";

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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Profil</span> Pengguna
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informasi akun dan pengaturan keamanan
        </p>
      </div>

      {/* User info card */}
      <div id="profile-info-card" className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold uppercase">
            {user?.username?.slice(0, 2) ?? "??"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.username}</h2>
            <p className="text-sm text-muted-foreground">
              {user?.created_at ? `Bergabung: ${formatDate(user.created_at)}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Username</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <User size={14} className="text-primary" />
              {user?.username}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Role</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield size={14} className="text-primary" />
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div id="change-password-card" className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-primary" />
          <h3 className="font-semibold">Ubah Password</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: "current_password", label: "Password Saat Ini", field: "current_password" },
            { id: "new_password", label: "Password Baru", field: "new_password" },
            { id: "confirm_password", label: "Konfirmasi Password Baru", field: "confirm_password" },
          ].map(({ id, label, field }) => (
            <div key={field} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-medium text-foreground/80">
                {label}
              </label>
              <input
                id={id}
                type="password"
                placeholder="••••••••"
                {...register(field as keyof ChangePasswordForm)}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              {errors[field as keyof ChangePasswordForm] && (
                <p className="text-xs text-destructive">
                  {errors[field as keyof ChangePasswordForm]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            id="change-password-btn"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all duration-200"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
}
