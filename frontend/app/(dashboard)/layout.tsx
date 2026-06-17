"use client";

import { useEffect, useState } from "react";
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Demo mode: inject user dummy agar token tidak null
    if (DEMO_MODE && !token) {
      setUser({ id: 1, username: "demo", created_at: new Date().toISOString() });
      // Simulasikan token agar guard di bawah tidak redirect
      useAuthStore.setState({ token: "demo-token" });
      return;
    }
    
    if (!DEMO_MODE && !token) {
      // Clear cookie just in case there's a desync between cookie and localStorage
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
      router.replace("/login");
    }
  }, [token, router, setUser, isHydrated]);

  // Prevent rendering anything until client hydration is complete
  if (!isHydrated) return null;
  
  if (!DEMO_MODE && !token) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar handles mobile (fixed overlay) and desktop (static) internally */}
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

