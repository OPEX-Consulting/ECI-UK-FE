import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, HARDCODED_USERS } from "@/types/incident";
import {
  getCurrentUser,
  setCurrentUser as storeUser,
  setToken,
} from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import { adminLogin } from "@/services/auth";
import { LoginRequest } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (
    data: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const adminLoginMutation = useMutation({
    mutationFn: adminLogin,
  });

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = HARDCODED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!foundUser) {
      return { success: false, error: "Invalid email address. Access denied." };
    }

    // For MVP, any password works for hardcoded users
    if (password.length < 1) {
      return { success: false, error: "Please enter a password." };
    }

    setUser(foundUser);
    storeUser(foundUser);
    return { success: true };
  };

  const loginAdmin = async (
    data: LoginRequest,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await adminLoginMutation.mutateAsync(data);

      // Store token
      setToken(response.access_token);

      // For now, let's find the admin user from hardcoded users or create a default one
      const adminUser = HARDCODED_USERS.find((u) => u.role === "admin") || {
        id: "user-admin",
        email: data.email,
        name: "Admin User",
        role: "admin" as const,
      };

      setUser(adminUser);
      storeUser(adminUser);

      return { success: true };
    } catch (error: any) {
      console.error("Admin login error:", error);
      const errorMessage =
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      return {
        success: false,
        error:
          typeof errorMessage === "string"
            ? errorMessage
            : "Check your email and password",
      };
    }
  };

  const logout = () => {
    setUser(null);
    storeUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, loginAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
