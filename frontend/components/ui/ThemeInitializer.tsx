"use client";

// Applies saved theme class to <html> on mount (prevents FOUC)
import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeInitializer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
