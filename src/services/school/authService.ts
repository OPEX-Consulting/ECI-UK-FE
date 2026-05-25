import api from "@/lib/api";
import {
  SchoolSignUpRequest,
  SchoolLoginResponse,
  SchoolUser,
  SchoolJwtPayload,
} from "@/types/auth";

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose: "signup";
}

/**
 * Decode a JWT without verifying the signature.
 * Useful for reading the payload (sub, uid, typ, exp) immediately after login.
 */
export const decodeJwt = (token: string): SchoolJwtPayload | null => {
  try {
    const base64Payload = token.split(".")[1];
    const padded = base64Payload + "=".repeat((4 - (base64Payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as SchoolJwtPayload;
  } catch {
    return null;
  }
};

export const schoolAuthService = {
  /** Register a new school principal. Triggers OTP email. */
  signUp: async (data: SchoolSignUpRequest): Promise<SchoolLoginResponse> => {
    const response = await api.post<SchoolLoginResponse>(
      "/school/auth/signup/email",
      data
    );
    return response.data;
  },

  /**
   * Verify the OTP code sent to the principal's email.
   * On success the API returns an access_token — this is the real auth step.
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<SchoolLoginResponse> => {
    const response = await api.post<SchoolLoginResponse>(
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

  /**
   * Log in with email and password.
   * Stores the access token in localStorage on success.
   */
  login: async (email: string, password: string): Promise<SchoolLoginResponse> => {
    const response = await api.post<SchoolLoginResponse>("/school/auth/login", {
      email,
      password,
    });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }
    return response.data;
  },

  /**
   * Fetch the authenticated school user's profile from the API.
   * Falls back to decoding the JWT if the endpoint isn't available.
   */
  getCurrentSchoolUser: async (): Promise<SchoolUser> => {
    const response = await api.get<{ user: SchoolUser }>("/school/profile");
    return response.data.user;
  },

  /**
   * Accept an invitation with a token and new password.
   */
  acceptInvite: async (data: any): Promise<SchoolLoginResponse> => {
    const response = await api.post<SchoolLoginResponse>(
      "/school/invitations/accept",
      data
    );
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }
    return response.data;
  },
};
