import { api } from "@/api/axiosInstance";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
} from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      credentials,
    );
    return response.data;
  },

  refreshToken: async (
    token: string,
    refreshToken: string,
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh", {
      token,
      refreshToken,
    });
    return response.data;
  },

  forgotPassword: async (
    credentials: ForgotPasswordCredentials,
  ): Promise<{ resetToken: string }> => {
    const response = await api.post<{ resetToken: string }>(
      "/auth/forgot-password",
      credentials,
    );
    return response.data;
  },

  resetPassword: async (
    credentials: ResetPasswordCredentials,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      credentials,
    );
    return response.data;
  },
};
