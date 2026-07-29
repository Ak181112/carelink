"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authAPI } from "@/services/api";

const TOKEN_KEY = "carelink_token";
const USER_KEY = "carelink_user";
const ROLE_COOKIE = "carelink_role";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const HOME_FOR_ROLE: Record<string, string> = {
  admin: "/admin",
  caretaker: "/caretaker",
  family_member: "/client/dashboard",
};

interface StoredAuth {
  token: string | null;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends StoredAuth {
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

/* ------------------------------------------------------------------------ *
 * localStorage-backed store
 *
 * The session is read during render through useSyncExternalStore instead of
 * being copied into state inside an effect. Syncing in an effect would render
 * once as logged-out and then immediately re-render as logged-in on every
 * mount, which React 19 flags as a cascading render.
 * ------------------------------------------------------------------------ */

const SERVER_AUTH: StoredAuth = { token: null, user: null, loading: true };

const listeners = new Set<() => void>();

let cachedKey: string | null = null;
let cachedAuth: StoredAuth = { token: null, user: null, loading: false };

const notify = () => {
  for (const listener of listeners) listener();
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  // keeps other tabs of the same browser in sync
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

const getSnapshot = (): StoredAuth => {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  const key = `${token ?? ""}|${rawUser ?? ""}`;

  // useSyncExternalStore requires a referentially stable snapshot
  if (key === cachedKey) return cachedAuth;

  let user: User | null = null;
  try {
    user = rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    user = null;
  }

  cachedKey = key;
  cachedAuth = { token, user: token ? user : null, loading: false };

  return cachedAuth;
};

// Used for SSR and the hydration render, so the markup matches on both sides
const getServerSnapshot = (): StoredAuth => SERVER_AUTH;

const writeCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const persistSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // proxy.ts reads both cookies to guard routes before the page renders
  writeCookie(TOKEN_KEY, token);
  writeCookie(ROLE_COOKIE, user.role);

  notify();
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  clearCookie(TOKEN_KEY);
  clearCookie(ROLE_COOKIE);

  notify();
};

/* ------------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, token, loading } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authAPI.login({ email, password });

      persistSession(data.token, data.user);

      router.push(HOME_FOR_ROLE[data.user.role] ?? "/client/dashboard");
    },
    [router],
  );

  const register = useCallback(async (data: RegisterData) => {
    await authAPI.register(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);

    if (!currentToken) return;

    try {
      const data = await authAPI.getMe();
      persistSession(currentToken, data.user);
    } catch {
      clearSession();
      router.push("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
