"use client";

import { useEffect, useState } from "react";
import { authService, type LoginPayload, type RegisterPayload, type UpdateProfilePayload } from "@/services/auth.service";
import type { AppUser } from "@/types/domain";

const USER_STORAGE_KEY = "datn_user";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, [user, isHydrated]);

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.register(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(payload);
      setUser(response.user);
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update profile failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, isHydrated, register, login, logout, updateProfile };
}
