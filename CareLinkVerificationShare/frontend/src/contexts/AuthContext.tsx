"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { User } from "@/types";
import { authAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

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

/* ============================================================
   CONTEXT
============================================================ */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* ============================================================
   PROVIDER
============================================================ */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();

  /* ==========================================================
     INITIALIZE AUTH STATE
  ========================================================== */

  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem(
          "carelink_token"
        );

      const storedUser =
        localStorage.getItem(
          "carelink_user"
        );

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          setUser(parsedUser);
        } catch (parseError) {
          console.error(
            "Invalid stored CareLink+ user data:",
            parseError
          );

          localStorage.removeItem(
            "carelink_user"
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to initialize authentication:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================================================
     LOGIN
  ========================================================== */

  const login = async (
    email: string,
    password: string
  ) => {
    const data =
      await authAPI.login({
        email,
        password,
      });

    const {
      token: newToken,
      user: newUser,
    } = data;

    /* --------------------------------------------------------
       Persist authentication
    --------------------------------------------------------- */

    localStorage.setItem(
      "carelink_token",
      newToken
    );

    localStorage.setItem(
      "carelink_user",
      JSON.stringify(newUser)
    );

    /* --------------------------------------------------------
       Cookie for middleware/server checks
    --------------------------------------------------------- */

    document.cookie =
      `carelink_token=${newToken}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;

    /* --------------------------------------------------------
       Update React state
    --------------------------------------------------------- */

    setToken(newToken);
    setUser(newUser);

    /* --------------------------------------------------------
       Role-based redirect
    --------------------------------------------------------- */

    if (newUser.role === "admin") {
      router.push("/admin");
    } else if (
      newUser.role === "caretaker"
    ) {
      router.push("/caretaker");
    } else {
      router.push(
        "/client/dashboard"
      );
    }
  };

  /* ==========================================================
     REGISTER
  ========================================================== */

  const register = async (
    data: RegisterData
  ) => {
    await authAPI.register(data);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = () => {
    localStorage.removeItem(
      "carelink_token"
    );

    localStorage.removeItem(
      "carelink_user"
    );

    document.cookie =
      "carelink_token=; path=/; max-age=0";

    setToken(null);
    setUser(null);

    router.push("/login");
  };

  /* ==========================================================
     REFRESH CURRENT USER
  ========================================================== */

  const refreshUser = async () => {
    try {
      const data =
        await authAPI.getMe();

      if (!data?.user) {
        throw new Error(
          "Authenticated user was not returned by the server."
        );
      }

      /* ------------------------------------------------------
         Update React state
      ------------------------------------------------------- */

      setUser(data.user);

      /* ------------------------------------------------------
         Keep localStorage synchronized
      ------------------------------------------------------- */

      localStorage.setItem(
        "carelink_user",
        JSON.stringify(data.user)
      );
    } catch (error) {
      console.error(
        "Failed to refresh authenticated user:",
        error
      );

      logout();
    }
  };

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
  };

  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}