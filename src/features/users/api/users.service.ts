import { api } from "@/api/axiosInstance";
import {
  UserDto,
  UserDetailsDto,
  CustomListSummary,
  CustomListDetails,
  ToggleGameInListResponse,
} from "../types";
import { GameSummary } from "@/features/games/types";
import { PagedList } from "@/types";

export const usersService = {
  getAdmins: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PagedList<UserDto>> => {
    const response = await api.get<PagedList<UserDto>>("/users/admin/admins", {
      params: { page, pageSize },
    });
    return response.data;
  },

  getPendingAdmins: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PagedList<UserDto>> => {
    const response = await api.get<PagedList<UserDto>>("/users/admin/pending", {
      params: { page, pageSize },
    });
    return response.data;
  },

  getUserDetails: async (id: number): Promise<UserDetailsDto> => {
    const response = await api.get(`/users/admin/${id}`);
    return response.data;
  },

  updateProfile: async (data: { name: string }): Promise<void> => {
    await api.put("/users/me", data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.put("/users/me/password", data);
  },

  getCurrentUserProfile: async (): Promise<UserDetailsDto> => {
    const response = await api.get<UserDetailsDto>("/users/me");
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

  getLikedGames: async (): Promise<GameSummary[]> => {
    const response = await api.get<GameSummary[]>("/users/me/likes");
    return response.data;
  },

  // --- Custom Lists Methods ---
  getCustomLists: async (): Promise<CustomListSummary[]> => {
    const response = await api.get<CustomListSummary[]>("/users/me/lists");
    return response.data;
  },

  createCustomList: async (name: string): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/users/me/lists", {
      name,
    });
    return response.data;
  },

  getCustomListById: async (listId: number): Promise<CustomListDetails> => {
    const response = await api.get<CustomListDetails>(
      `/users/me/lists/${listId}`,
    );
    return response.data;
  },

  deleteCustomList: async (listId: number): Promise<void> => {
    await api.delete(`/users/me/lists/${listId}`);
  },

  toggleGameInList: async (
    listId: number,
    gameId: number,
  ): Promise<ToggleGameInListResponse> => {
    const response = await api.post<ToggleGameInListResponse>(
      `/users/me/lists/${listId}/games/${gameId}`,
    );
    return response.data;
  },
};
