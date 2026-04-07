export interface GameSummary {
  id: number;
  name: string;
  genre: string;
  price: number | null;
  releaseDate: string;
}

// 1. New Game Details Interface
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

// 2. Updated API Params for filtering and sorting
export interface GetGamesParams {
  page?: number;
  pageSize?: number;
  search?: string; // Updated from searchTerm based on your URL
  genreId?: number;
  sortBy?: string;
  desc?: boolean;
}
