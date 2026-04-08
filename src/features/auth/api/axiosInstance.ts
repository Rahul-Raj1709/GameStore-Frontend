import axios from "axios";
import { authService } from "@/features/auth/api/auth.service";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attach the access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor: Handle 401s and Refresh Tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already happening, queue this request until it finishes
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem("token");
      const currentRefreshToken = localStorage.getItem("refreshToken");

      if (currentToken && currentRefreshToken) {
        try {
          // Call the refresh endpoint (ensure this matches your .NET route)
          const result = await authService.refreshToken(
            currentToken,
            currentRefreshToken,
          );

          // ✅ FIX: Check result directly since it's the AuthResponse object
          if (result && result.token) {
            const { token, refreshToken, ...userData } = result;

            // Update storage
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem(
              "user",
              JSON.stringify({ token, refreshToken, ...userData }),
            );

            // Process queued requests with the new token
            processQueue(null, token);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed (e.g., refresh token expired or revoked)
          processQueue(refreshError, null);

          // Force a hard logout
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  },
);
