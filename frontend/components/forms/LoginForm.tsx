"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-bold text-slate-700 ml-1">
          Username
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors duration-300">
            <User size={18} />
          </div>
          <input
            id="username"
            type="text"
            placeholder="Masukkan username"
            autoComplete="username"
            {...register("username")}
            className="
              w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/70
              text-slate-800 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal
              focus:bg-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10
              transition-all duration-300 hover:border-slate-300
            "
          />
        </div>
        {errors.username && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1.5 ml-1">
            <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">
          Password
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors duration-300">
            <Lock size={18} />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className="
              w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/70
              text-slate-800 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal
              focus:bg-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10
              transition-all duration-300 hover:border-slate-300
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1.5 ml-1">
            <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          id="login-submit-btn"
          className="
            relative w-full py-4 px-6 rounded-2xl font-bold text-white text-[15px]
            disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden
            transition-all duration-300 flex items-center justify-center gap-2.5
            group hover:-translate-y-0.5 active:translate-y-0.5
          "
          style={{
            background: isLoading
              ? "hsl(227 68% 35%)"
              : "linear-gradient(135deg, hsl(227 68% 32%), hsl(227 80% 48%))",
            boxShadow: isLoading
              ? "none"
              : "0 10px 25px -5px hsl(227 68% 28% / 0.4), 0 4px 10px -3px hsl(227 68% 28% / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              Masuk ke Dashboard
              <LogIn size={18} className="opacity-80 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
