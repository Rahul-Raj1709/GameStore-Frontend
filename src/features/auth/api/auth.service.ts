import { api } from "@/api/axiosInstance";
import { AuthResponse, LoginCredentials } from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
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
};
