import { api } from "@/api/axiosInstance";
import { PagedList } from "@/types";
import {
  GameSummary,
  GameDetails,
  GetGamesParams,
  CreateGamePayload,
  CursorPagedGames,
} from "../types";

export const gamesService = {
  getGames: async (params: GetGamesParams): Promise<PagedList<GameSummary>> => {
    const response = await api.get<PagedList<GameSummary>>("/games", {
      params,
    });
    return response.data;
  },

  getGameById: async (id: number): Promise<GameDetails> => {
    const response = await api.get<GameDetails>(`/games/${id}`);
    return response.data;
  },

  getMyGames: async (
    cursor?: string,
    pageSize: number = 20,
  ): Promise<CursorPagedGames> => {
    const response = await api.get<CursorPagedGames>("/games/my-games", {
      params: { cursor, pageSize },
    });
    return response.data;
  },

  createGame: async (payload: CreateGamePayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/games", payload);
    return response.data;
  },

  updateGame: async (id: number, payload: CreateGamePayload): Promise<void> => {
    await api.put(`/games/${id}`, payload);
  },

  deleteGame: async (id: number): Promise<void> => {
    await api.delete(`/games/${id}`);
  },
};
