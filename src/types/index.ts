// Common types used across the application

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



