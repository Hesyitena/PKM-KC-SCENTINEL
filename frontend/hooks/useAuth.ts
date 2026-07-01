"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginRequest } from "@/types/auth";
import api from "@/lib/api";
import { UserRole } from "@/types/auth";

export function useAuth() {
  const { user, token, isLoading, error, login, logout, clearError } = useAuthStore();
  const router = useRouter();

  // Auto-fix: jika token ada tapi role tidak ada (data localStorage lama),
  // fetch /auth/me untuk mendapatkan role yang benar
  useEffect(() => {
    if (token && user && !user.role) {
      api.get("/auth/me").then((res) => {
        const meData = res.data;
        useAuthStore.setState({
          user: {
            ...user,
            role: (meData.role ?? "ADMIN") as UserRole,
          },
        });
      }).catch(() => {
        // Token invalid → logout
        logout();
        router.replace("/login");
      });
    }
  }, [token, user, logout, router]);

  const handleLogin = async (credentials: LoginRequest) => {
    await login(credentials);
    // Redirect based on role immediately after login
    const freshUser = useAuthStore.getState().user;
    if (freshUser?.role === "VIEWER") {
      router.push("/monitor");
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  };
}

export function useRequireAuth() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
    }
  }, [token, user, router]);

  return { user, token };
}
