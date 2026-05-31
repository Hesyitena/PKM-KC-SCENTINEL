"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Login berhasil! Selamat datang.");
    } catch {
      toast.error("Login gagal. Periksa username dan password.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Username */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-foreground/80">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="admin"
          autoComplete="username"
          {...register("username")}
          className="
            w-full px-4 py-3 rounded-lg bg-muted border border-border
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200
          "
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground/80">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="
              w-full px-4 py-3 pr-12 rounded-lg bg-muted border border-border
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-all duration-200
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        id="login-submit-btn"
        className="
          w-full py-3 px-6 rounded-lg font-semibold text-primary-foreground
          bg-primary hover:bg-primary/90
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center justify-center gap-2
          shadow-lg shadow-primary/20
        "
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Memverifikasi...
          </>
        ) : (
          <>
            <Zap size={18} />
            Masuk ke Dashboard
          </>
        )}
      </button>
    </form>
  );
}
