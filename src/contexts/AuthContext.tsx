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
  role: string;
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
  role: "Admin",
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
    let nextToken: string | null = storedToken;
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser?.role === "Admin") {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("admin_user");
          clearAdminToken();
          nextToken = null;
        }
      } catch {
        localStorage.removeItem("admin_user");
        clearAdminToken();
        nextToken = null;
      }
    } else if (storedToken) {
      setUser(DEFAULT_USER);
    }
    if (nextToken) {
      setToken(nextToken);
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
      const userData = result.userData;
      if (!userData || userData.role !== "Admin") {
        return false;
      }
      const newUser: User = {
        id: userData.id ?? DEFAULT_USER.id,
        email: userData.email ?? email,
        name: userData.name ?? DEFAULT_USER.name,
        role: userData.role,
        avatar: userData.avatar,
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
        isAuthenticated: !!user && !!token && user.role === "Admin",
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
