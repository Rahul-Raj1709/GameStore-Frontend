import { api } from "@/api/axiosInstance";
import { PagedList } from "@/types";
import {
  GameSummary,
  GameDetails,
  GetGamesParams,
  CreateGamePayload,
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

  createGame: async (payload: CreateGamePayload): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/games", payload);
    return response.data;
  },
};
