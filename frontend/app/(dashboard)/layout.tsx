"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Demo mode: inject user dummy agar token tidak null
    if (DEMO_MODE && !token) {
      setUser({ id: 1, username: "demo", created_at: new Date().toISOString() });
      // Simulasikan token agar guard di bawah tidak redirect
      useAuthStore.setState({ token: "demo-token" });
      return;
    }
    if (!DEMO_MODE && !token) {
      router.replace("/login");
    }
  }, [token, router, setUser]);

  if (!DEMO_MODE && !token) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main
          id="dashboard-main"
          className="flex-1 overflow-hidden h-full animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
