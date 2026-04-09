import { GameSummary } from "@/features/games/types";

export interface UserDto {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDetailsDto extends UserDto {
  lastLogin: string | null;
  ownedGamesCount: number;
  reviewsCount: number;
}

export interface CustomListSummary {
  id: number;
  name: string;
  gameCount: number;
}

export interface CustomListDetails {
  id: number;
  name: string;
  games: GameSummary[];
}

export interface ToggleGameInListResponse {
  gameId: number;
  isAddedToList: boolean;
}
