"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authAPI } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("carelink_token");
    const storedUser = localStorage.getItem("carelink_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = data;
    localStorage.setItem("carelink_token", newToken);
    localStorage.setItem("carelink_user", JSON.stringify(newUser));
    document.cookie = `carelink_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    setToken(newToken);
    setUser(newUser);

    if (newUser.role === "admin") router.push("/admin");
    else if (newUser.role === "caretaker") router.push("/caretaker");
    else router.push("/client/dashboard");
  };

  const register = async (data: RegisterData) => {
    await authAPI.register(data);
  };

  const logout = () => {
    localStorage.removeItem("carelink_token");
    localStorage.removeItem("carelink_user");
    document.cookie = "carelink_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem("carelink_user", JSON.stringify(data.user));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
