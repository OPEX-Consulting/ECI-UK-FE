// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/incident";
import {
  getCurrentUser as getStoredUser,
  setCurrentUser as storeUser,
  setToken,
} from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import { adminLogin, getCurrentUser } from "@/services/authService";
import { LoginRequest, CurrentUser, SchoolUser } from "@/types/auth";
import {
  schoolAuthService,
  decodeJwt,
} from "@/services/school/authService";

interface AuthContextType {
  user: User | null;
  adminUser: CurrentUser | null;
  schoolUser: SchoolUser | null;
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
  const [schoolUser, setSchoolUser] = useState<SchoolUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restore = async () => {
      const storedUser = getStoredUser();
      const token = localStorage.getItem("token");

      if (storedUser) {
        setUser(storedUser);
      }

      if (token) {
        if (storedUser?.role === "admin") {
          // ── Restore admin session ──────────────────────────────────────────
          try {
            const profile = await getCurrentUser();
            setAdminUser(profile);
          } catch {
            // Token expired / invalid — wipe the admin session
            localStorage.removeItem("token");
            storeUser(null);
            setUser(null);
          }
        } else if (storedUser && storedUser.role !== "admin") {
          // ── Restore school user session ────────────────────────────────────
          try {
            const profile = await schoolAuthService.getCurrentSchoolUser();
            setSchoolUser(profile);
            // Sync the generic user slot in case it drifted
            const refreshed: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as User["role"],
            };
            setUser(refreshed);
            storeUser(refreshed);
          } catch {
            // Token expired / invalid — wipe the school session
            localStorage.removeItem("token");
            storeUser(null);
            setUser(null);
            setSchoolUser(null);
          }
        }
      }

      setIsLoading(false);
    };

    restore();
  }, []);

  const adminLoginMutation = useMutation({ mutationFn: adminLogin });

  // ── School login (real API) ──────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await schoolAuthService.login(email, password);

      // Decode the JWT to get the user's uid/email before fetching the profile
      const payload = decodeJwt(response.access_token);

      // Fetch the real profile so we have name + role
      let profile: SchoolUser;
      try {
        profile = await schoolAuthService.getCurrentSchoolUser();
      } catch {
        // Fallback: build a minimal profile from the JWT payload if /me fails
        profile = {
          id: payload?.uid ?? crypto.randomUUID(),
          email: payload?.sub ?? email,
          name: email.split("@")[0],
          role: "staff",
          stage: response.stage,
        };
      }

      setSchoolUser(profile);

      // Populate generic user slot (routing logic reads this)
      const genericUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as User["role"],
      };
      setUser(genericUser);
      storeUser(genericUser);

      return { success: true };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: unknown }; status?: number };
      };
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data?.detail;

      let errorMessage: string;
      if (status === 401 || status === 403) {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = (detail[0] as { msg?: string })?.msg ?? "Login failed.";
      } else {
        errorMessage = "Login failed. Please check your credentials.";
      }

      return { success: false, error: errorMessage };
    }
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
        response?: { data?: { detail?: unknown }; status?: number };
      };
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data?.detail;

      let errorMessage: string;
      if (status === 401 || status === 403) {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = (detail[0] as { msg?: string })?.msg ?? "Login failed.";
      } else {
        errorMessage = "Login failed. Please check your credentials.";
      }

      return { success: false, error: errorMessage };
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setAdminUser(null);
    setSchoolUser(null);
    storeUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, adminUser, schoolUser, isLoading, login, loginAdmin, logout }}
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
