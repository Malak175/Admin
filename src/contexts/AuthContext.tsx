import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/services/api/tokenStorage";
import { AUTH_EXPIRED_EVENT } from "@/services/api/axiosInstance";
import { loginAdmin } from "@/services/admin/authService";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: "1",
  email: "admin@tabeebak.com",
  name: "Admin User",
  role: "admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("admin_user");
    clearAdminToken();
  }, []);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("admin_user");
    const storedToken = getAdminToken();
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken && !storedUser) {
      setUser(DEFAULT_USER);
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (!email || !password) {
        return false;
      }

      const result = await loginAdmin(email, password);
      const newUser: User = {
        id: result.userData?.id ?? DEFAULT_USER.id,
        email: result.userData?.email ?? email,
        name: result.userData?.name ?? DEFAULT_USER.name,
        role:
          result.userData?.role === "manager" || result.userData?.role === "user"
            ? result.userData.role
            : "admin",
        avatar: result.userData?.avatar,
      };

      setUser(newUser);
      setToken(result.token);
      localStorage.setItem("admin_user", JSON.stringify(newUser));
      setAdminToken(result.token);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
