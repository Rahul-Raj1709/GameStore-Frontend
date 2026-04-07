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

// Updated to match your backend's PagedList.cs
export interface PagedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

export enum Roles {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Customer = "Customer",
}
