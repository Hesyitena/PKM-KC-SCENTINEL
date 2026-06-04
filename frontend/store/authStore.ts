// SCENTINEL - Auth Zustand Store
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, LoginRequest, TokenResponse } from "@/types/auth";
import api from "@/lib/api";
import { saveAuth, clearAuth } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<TokenResponse>("/auth/login", credentials);
          const data = response.data;
          saveAuth(data);
          set({
            token: data.access_token,
            user: {
              id: data.user_id,
              username: data.username,
              role: data.role,
              created_at: new Date().toISOString(),
            },
            isLoading: false,
          });
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Login gagal. Periksa username dan password.";
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: () => {
        clearAuth();
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: "scentinel-auth",
      storage: createJSONStorage(() => typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
