export interface GameSummary {
  id: number;
  name: string;
  genreName: string;
  price: number | null;
  releaseDate: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
  refreshToken: string;
}
