export interface ApiError {
  code: string;
  description: string;
}

export interface Result<T = void> {
  isSuccess: boolean;
  isFailure: boolean;
  error: ApiError;
  value: T;
}

// Offset-based pagination
export interface PagedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

// Cursor-based pagination
export interface PagedResponse<T> {
  data: T[];
  nextCursor: number | null;
}

export enum Roles {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Customer = "Customer",
}
