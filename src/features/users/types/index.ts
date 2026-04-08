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
