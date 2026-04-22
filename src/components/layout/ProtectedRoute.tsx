import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminRole, Permission } from "@/types/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ProtectedRouteProps {
  /** Only users with one of these roles may enter. Optional — omit to allow any authenticated user. */
  allowedRoles?: AdminRole[];
  /** Only users who have ALL of these permissions may enter. Optional. */
  requiredPermissions?: Permission[];
  /** Where to send an authenticated user who fails the role/permission check. Defaults to "/unauthorised". */
  unauthorisedRedirect?: string;
  /** Where to send unauthenticated users. Defaults to "/login". */
  loginRedirect?: string;
  /** Custom loading UI. */
  loadingFallback?: React.ReactNode;
}

/**
 * Wraps React Router's <Outlet /> with authentication + role/permission guards.
 *
 * Usage examples
 * ──────────────
 * // Any authenticated, active user
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 *
 * // Only super_admin or platform_admin
 * <Route element={<ProtectedRoute allowedRoles={["super_admin", "platform_admin"]} />}>
 *   <Route path="/admins" element={<ManageAdmins />} />
 * </Route>
 *
 * // Anyone with the "view_audit_log" permission
 * <Route element={<ProtectedRoute requiredPermissions={["view_audit_log"]} />}>
 *   <Route path="/audit" element={<AuditLog />} />
 * </Route>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermissions,
  unauthorisedRedirect = "/unauthorised",
  loginRedirect = "/login",
  loadingFallback = <LoadingSpinner />,
}) => {
  const { user, isLoading, isAuthenticated, hasPermission } = useCurrentUser();

  if (isLoading) return <>{loadingFallback}</>;

  // ── 1. Not logged in ───────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect} replace />;
  }

  // ── 2. Account not active (invited / suspended) ────────────────────────────
  if (user && user.status !== "active") {
    return <Navigate to="/account-pending" replace />;
  }

  // ── 3. Role check ──────────────────────────────────────────────────────────
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={unauthorisedRedirect} replace />;
  }

  // ── 4. Permission check ────────────────────────────────────────────────────
  if (requiredPermissions) {
    const allGranted = requiredPermissions.every((p) => hasPermission(p));
    if (!allGranted) {
      return <Navigate to={unauthorisedRedirect} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

// ── Minimal loading spinner (replace with your design system's component) ─────
const LoadingSpinner: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    }}
  >
    <span>Loading…</span>
  </div>
);
