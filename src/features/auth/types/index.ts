export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string; // <-- Changed from passwordHash
}
