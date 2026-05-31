"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginRequest } from "@/types/auth";

export function useAuth() {
  const { user, token, isLoading, error, login, logout, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (credentials: LoginRequest) => {
    await login(credentials);
    router.push("/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAdmin,
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
