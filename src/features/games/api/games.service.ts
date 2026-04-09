import { api } from "@/api/axiosInstance";
import { PagedList, PagedResponse } from "@/types";
import {
  GameSummary,
  GameDetails,
  GetGamesParams,
  CreateGamePayload,
  Review,
  ReviewPayload,
  ToggleLikeResponse,
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
    cursor?: number,
    pageSize: number = 20,
  ): Promise<PagedResponse<GameSummary>> => {
    const response = await api.get<PagedResponse<GameSummary>>(
      "/games/my-games",
      {
        params: { cursor, pageSize },
      },
    );
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

  // --- Likes ---
  toggleLike: async (gameId: number): Promise<ToggleLikeResponse> => {
    const response = await api.post<ToggleLikeResponse>(
      `/games/${gameId}/like`,
    );
    return response.data;
  },

  // --- Reviews ---
  getReviews: async (
    gameId: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PagedList<Review>> => {
    const response = await api.get<PagedList<Review>>(
      `/games/${gameId}/reviews/`,
      {
        params: { page, pageSize },
      },
    );
    return response.data;
  },

  addReview: async (
    gameId: number,
    payload: ReviewPayload,
  ): Promise<{ reviewId: number }> => {
    const response = await api.post<{ reviewId: number }>(
      `/games/${gameId}/reviews/`,
      payload,
    );
    return response.data;
  },

  updateReview: async (
    reviewId: number,
    payload: ReviewPayload,
  ): Promise<void> => {
    await api.put(`/games/reviews/${reviewId}`, payload);
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/games/reviews/${reviewId}`);
  },
};
