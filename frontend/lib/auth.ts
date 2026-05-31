// SCENTINEL - Auth utilities (client-side)
import { TokenResponse, User } from "@/types/auth";

export const TOKEN_KEY = "access_token";
export const USER_KEY = "scentinel_user";

export function saveAuth(data: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  // Simpan juga di cookies untuk dibaca middleware Next.js
  document.cookie = `${TOKEN_KEY}=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;
  
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: data.user_id,
      username: data.username,
      role: data.role,
    })
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Hapus dari cookies juga
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
