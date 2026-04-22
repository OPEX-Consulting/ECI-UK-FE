import axios from "axios";

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
      localStorage.removeItem("token");
      // Redirect to login without importing the router (avoids circular deps)
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
