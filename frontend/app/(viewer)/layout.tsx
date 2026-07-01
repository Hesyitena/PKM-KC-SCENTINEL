"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Cpu, Loader2 } from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Berapa lama kita tunggu Zustand persist restore sebelum fallback redirect (ms) */
const HYDRATION_TIMEOUT_MS = 2000;

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, setUser } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Beri waktu untuk Zustand persist me-restore state dari localStorage
    // sebelum kita cek auth. Tanpa ini, token/user bisa null sementara.
    const timer = setTimeout(() => {
      setReady(true);
    }, 120); // cukup untuk satu render cycle Zustand persist
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    // Demo mode: inject viewer dummy user jika belum login
    if (DEMO_MODE && !token) {
      setUser({ id: 2, username: "viewer", role: "VIEWER", created_at: new Date().toISOString() });
      useAuthStore.setState({ token: "demo-token" });
      return;
    }

    // Tidak ada token → login
    if (!token) {
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
      router.replace("/login");
      return;
    }

    // Ada token tapi user belum di-restore → tunggu (akan re-run saat user berubah)
    if (!user) return;

    // Admin tidak boleh di halaman ini
    if (user.role === "ADMIN") {
      router.replace("/");
    }
  }, [ready, token, user, router, setUser]);

  // Belum siap: tampilkan loading kecil daripada blank putih
  if (!ready) {
    return <ViewerLoading />;
  }

  // Tidak ada token → loading sementara redirect ke login
  if (!token) return <ViewerLoading />;

  // User belum restore tapi token ada → loading sebentar
  if (!user) return <ViewerLoading />;

  // Admin tidak boleh di sini
  if (user.role === "ADMIN") return <ViewerLoading />;

  // OK — render halaman viewer fullscreen
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {children}
    </div>
  );
}

function ViewerLoading() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ background: "linear-gradient(160deg, #f0fdf8 0%, #f8fafc 100%)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #533afd 100%)",
            boxShadow: "0 4px 20px rgba(83,58,253,0.30)",
          }}
        >
          <Cpu size={22} color="#ffffff" strokeWidth={1.7} />
        </div>
        <Loader2
          size={20}
          className="animate-spin"
          style={{ color: "#533afd" }}
        />
        <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
          Memuat...
        </p>
      </div>
    </div>
  );
}
