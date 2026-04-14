import api from "@/lib/api";
import { LoginRequest, LoginResponse } from "../types/auth";

export const adminLogin = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/admin/auth/login", data);
  console.log("Admin login response:", response.data);
  return response.data;
  
};
