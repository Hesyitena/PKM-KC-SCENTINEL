import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login — SCENTINEL",
  description: "Masuk ke dashboard monitoring SCENTINEL",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-background relative overflow-hidden">
      {/* ── Left panel: decorative brand side ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative items-center justify-center overflow-hidden">
        {/* Rich gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(145deg, hsl(227 68% 18%) 0%, hsl(230 70% 28%) 40%, hsl(220 60% 38%) 100%)",
          }}
        />

        {/* Decorative blobs */}
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20 animate-glow"
          style={{ background: "radial-gradient(circle, hsl(230 80% 70%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full opacity-15 animate-glow delay-300"
          style={{ background: "radial-gradient(circle, hsl(220 80% 75%), transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent 70%)" }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 animate-fade-in">
          <div className="mb-8 animate-float">
            <Image
              src="/horizontal-remove-bg.png"
              alt="SCENTINEL"
              width={800}
              height={200}
              quality={100}
              className="object-contain brightness-0 invert w-full max-w-[280px] h-auto mx-auto"
              priority
            />
          </div>

          <p className="text-white/75 text-lg font-light leading-relaxed max-w-sm animate-fade-in delay-150">
            Sistem monitoring kualitas makanan berbasis sensor gas dan kecerdasan buatan.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in delay-225">
            {["Portable Device", "Gas Sensor Array", "Real-time Monitoring", "AI Classification"].map((f) => (
              <span
                key={f}
                className="text-xs font-medium text-white/70 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Bottom attribution */}
          <p className="text-white/40 text-xs mt-12 animate-fade-in delay-300">
            PKM-KC 2026 | Team SCENTINEL
          </p>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-slate-50/50 backdrop-blur-2xl">
        {/* Subtle background accent */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.12] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(227 68% 28%), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.08] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(227 68% 28%), transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-[420px] animate-fade-in-scale">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image
              src="/horizontal-remove-bg.png"
              alt="SCENTINEL Logo"
              width={600}
              height={150}
              quality={100}
              className="object-contain w-full max-w-[200px] h-auto mx-auto"
              priority
            />
          </div>

          {/* Form card */}
          <div
            className="rounded-[2rem] p-10 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.06), 0 10px 25px -4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            {/* Glossy top edge */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight">
                Selamat datang
              </h1>
              <p className="text-[15px] text-slate-500 mt-2 font-medium leading-relaxed">
                Masuk ke dashboard SCENTINEL untuk melanjutkan.
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Footer */}
          <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-400 mt-8 tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure Access Portal
          </p>
        </div>
      </div>
    </main>
  );
}
