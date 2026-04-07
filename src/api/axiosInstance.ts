import axios from "axios";

export const api = axios.create({
  // Matches your .NET WebApi localhost port
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:64039/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
