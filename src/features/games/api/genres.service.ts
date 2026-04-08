import { api } from "@/api/axiosInstance";
import { Genre } from "../types";

export const genresService = {
  getGenres: async (): Promise<Genre[]> => {
    const response = await api.get<Genre[]>("/genres");
    return response.data;
  },

  createGenre: async (
    name: string,
  ): Promise<{ id: number; message: string }> => {
    const response = await api.post<{ id: number; message: string }>(
      "/genres",
      { name },
    );
    return response.data;
  },
};
