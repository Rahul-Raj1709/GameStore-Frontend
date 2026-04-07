import { api } from "@/api/axiosInstance";
import { PagedList } from "@/types";
import { GameSummary, GameDetails, GetGamesParams } from "../types";

export const gamesService = {
  getGames: async (params: GetGamesParams): Promise<PagedList<GameSummary>> => {
    const response = await api.get<PagedList<GameSummary>>("/games", {
      params,
    });
    return response.data;
  },

  // New method for fetching single game details
  getGameById: async (id: number): Promise<GameDetails> => {
    const response = await api.get<GameDetails>(`/games/${id}`);
    return response.data;
  },
};
