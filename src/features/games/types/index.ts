export interface GameSummary {
  id: number;
  name: string;
  genre: string;
  price: number | null;
  releaseDate: string;
  imageUrl?: string | null; // Added to support images on the catalog cards
}

export interface GameDetails {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  genreId: number;
  genre: string;
  price: number | null;
  releaseDate: string;
  addedAt: string;
  totalLikes: number;
  ownerName: string;
}

export interface GetGamesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genreId?: number;
  sortBy?: string;
  desc?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CreateGamePayload {
  name: string;
  description: string;
  imageUrl: string | null;
  genreId: number;
  price: number | null;
  releaseDate: string; // Format: YYYY-MM-DD
}

export interface ToggleLikeResponse {
  gameId: number;
  isLiked: boolean;
}

export interface Review {
  id: number;
  gameId: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}
