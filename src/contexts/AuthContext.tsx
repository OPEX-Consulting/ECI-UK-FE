// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { User, HARDCODED_USERS } from "@/types/incident";
import {
  getCurrentUser as getStoredUser,
  setCurrentUser as storeUser,
  setToken,
} from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import { adminLogin, getCurrentUser } from "@/services/authService";
import { LoginRequest, CurrentUser } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  adminUser: CurrentUser | null;
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

const ADMIN_ROLES: CurrentUser["role"][] = [
  "super_admin",
  "platform_admin",
  "content_contributor",
  "principal",
  "officer",
  "staff",
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restore = async () => {
      const storedUser = getStoredUser();
      const token = localStorage.getItem("token");

      if (storedUser) {
        setUser(storedUser);
      }

      // If there is a token and the stored user is an admin role,
      // re-fetch the real profile so `adminUser` survives a page reload.
      if (token && storedUser?.role === "admin") {
        try {
          const profile = await getCurrentUser();
          setAdminUser(profile);
          console.log("[Auth] Current admin user:", profile);
        } catch {
          // Token expired / invalid — wipe the session
          localStorage.removeItem("token");
          storeUser(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    restore();
  }, []);

  const adminLoginMutation = useMutation({ mutationFn: adminLogin });

  // ── Hardcoded (non-admin) login ──────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = HARDCODED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!foundUser)
      return { success: false, error: "Invalid email address. Access denied." };
    if (password.length < 1)
      return { success: false, error: "Please enter a password." };

    setUser(foundUser);
    storeUser(foundUser);
    return { success: true };
  };

  // ── Admin login ──────────────────────────────────────────────────────────
  const loginAdmin = async (
    data: LoginRequest,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Get token
      const response = await adminLoginMutation.mutateAsync(data);
      setToken(response.access_token);

      // 2. Fetch real profile (token is now in localStorage, interceptor picks it up)
      const profile = await getCurrentUser();
      setAdminUser(profile);
      console.log("[Auth] Logged in admin user:", profile);

      // 3. Populate generic user slot (AdminProtectedRoute checks role === "admin")
      const genericUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: "admin",
      };
      setUser(genericUser);
      storeUser(genericUser);

      // 4. Redirect
      if (ADMIN_ROLES.includes(profile.role)) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: unknown } };
      };
      const detail = axiosError.response?.data?.detail;
      const errorMessage =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? ((detail[0] as { msg?: string })?.msg ?? "Login failed.")
            : "Login failed. Please check your credentials.";
      return { success: false, error: errorMessage };
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setAdminUser(null);
    storeUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, adminUser, isLoading, login, loginAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
