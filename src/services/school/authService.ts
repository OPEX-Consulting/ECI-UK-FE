import api from "@/lib/api";
import { SchoolSignUpRequest, LoginResponse } from "@/types/auth";

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose: "signup";
}

export const schoolAuthService = {
  /** Register a new school principal. Triggers OTP email. */
  signUp: async (data: SchoolSignUpRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      "/school/auth/signup/email",
      data
    );
    return response.data;
  },

  /**
   * Verify the OTP code sent to the principal's email.
   * On success the API returns an access_token — this is the real auth step.
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      "/school/auth/verify-otp",
      data
    );
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }
    return response.data;
  },

  /** Resend the OTP code for the given email and purpose. */
  resendOtp: async (data: ResendOtpRequest): Promise<void> => {
    await api.post("/school/auth/resend-otp", data);
  },

  /** Log in with email and password (used for school login page). */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/school/auth/login", {
      email,
      password,
    });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }
    return response.data;
  },
};
