import api from "@/lib/api";
import { LoginRequest, LoginResponse, CurrentUser } from "@/types/auth";

/**
 * Log in and persist the access token so all subsequent
 * api calls (via the request interceptor) are authenticated.
 */
export const adminLogin = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/admin/auth/login", data);
  const { access_token } = response.data;

  localStorage.setItem("token", access_token);
  return response.data;
};

/** Fetch the currently authenticated user's profile. */
export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<CurrentUser>("/admin/auth/me");
  return response.data;
};

/** Clear session and log out. */
export const adminLogout = (): void => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
