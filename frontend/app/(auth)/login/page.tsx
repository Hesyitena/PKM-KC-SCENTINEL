import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login — SCENTINEL",
  description: "Masuk ke dashboard monitoring SCENTINEL",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card */}
        <div className="glass-card p-8 shadow-2xl animate-fade-in">
          {/* Logo / Brand */}
          <div className="text-center mb-8 flex items-center justify-center">
            <Image 
              src="/horizontal-remove-bg.png" 
              alt="SCENTINEL Logo" 
              width={600} 
              height={200} 
              className="object-contain w-full h-auto"
              priority
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Masuk Akun
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <LoginForm />

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            PKM-KC 2026 · SCENTINEL Team
          </p>
        </div>
      </div>
    </main>
  );
}
