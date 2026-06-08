import axios from "axios";
import { toHumanReadableError } from "./errorMessages";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("BASE_URL: ", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token to every outgoing request automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
// Handles 401 Unauthorised globally: clears stale tokens and redirects to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const currentPath = window.location.pathname;

      // Don't redirect on login or signup/auth attempts — let the caller handle the error
      const isAuthAttempt =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/signup") ||
        requestUrl.includes("/auth/verify") ||
        requestUrl.includes("/auth/resend");

      // Don't redirect when the user is in the onboarding flow — a 401 from
      // an admin-only endpoint (e.g. /admin/school-types) should NOT log out
      // the school user; the component will handle the error gracefully.
      const isOnboardingPage = currentPath.startsWith("/onboarding");

      // If the request targets an admin endpoint but the user is NOT on an
      // admin page, it's a cross-context call (e.g. school user fetching admin
      // data) — skip the redirect and let the caller handle the error.
      const isAdminEndpoint = requestUrl.includes("/admin/");
      const isAdminPage = currentPath.startsWith("/admin");
      const isCrossContextCall = isAdminEndpoint && !isAdminPage;

      if (!isAuthAttempt && !isOnboardingPage && !isCrossContextCall) {
        localStorage.removeItem("token");
        localStorage.removeItem("regtech_current_user");
        window.location.href = isAdminPage ? "/admin/login" : "/login";
      }
    }
    error.humanMessage = toHumanReadableError(error);
    return Promise.reject(error);
  },
);

export default api;
