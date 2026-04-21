import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/services/authService";
import { CurrentUser, Permission, ROLE_PERMISSIONS } from "@/types/auth";

interface UseCurrentUserReturn {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  refetch: () => Promise<void>;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Current user here: ", user);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    // No token → skip the network call, just mark as done
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user";
      setError(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Check whether the current user's role grants a specific permission.
   * Returns false when no user is loaded.
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const allowedRoles = ROLE_PERMISSIONS[permission] ?? [];
      return allowedRoles.includes(user.role);
    },
    [user],
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user && user.status === "active",
    error,
    hasPermission,
    refetch: fetchUser,
  };
};
