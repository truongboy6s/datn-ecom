import { apiClient } from "@/lib/api";
import { axiosClient } from "@/lib/axios-client";
import type { AppUser, AuthResponse } from "@/types/domain";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
  adminSecret?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string | null;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await apiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return res.data; // Now returns { user: ... } without token
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const res = await axiosClient.patch("/auth/me", payload);
    return res.data.data as { user: AppUser };
  }
};
