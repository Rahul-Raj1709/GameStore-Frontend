import { api } from "@/api/axiosInstance";
import { UserDto, UserDetailsDto } from "../types";

export const usersService = {
  getAdmins: async (): Promise<UserDto[]> => {
    const response = await api.get("/users/admin/admins");
    return response.data;
  },

  getPendingAdmins: async (): Promise<UserDto[]> => {
    const response = await api.get("/users/admin/pending");
    return response.data;
  },

  getUserDetails: async (id: number): Promise<UserDetailsDto> => {
    const response = await api.get(`/users/admin/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: number, isActive: boolean): Promise<void> => {
    await api.put(`/users/admin/${id}/status`, isActive, {
      headers: { "Content-Type": "application/json" },
    });
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/admin/${id}`);
  },
};
