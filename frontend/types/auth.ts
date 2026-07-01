// SCENTINEL - Auth Types
export type UserRole = "ADMIN" | "VIEWER";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  user_id: number;
  username: string;
  role: UserRole;
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
