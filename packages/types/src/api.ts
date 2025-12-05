import { z } from 'zod';

// Standard API response envelope matching docs/ARCHITECTURE.md

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  total: z.coerce.number().min(0).default(0),
  totalPages: z.coerce.number().min(0).default(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: Pagination;
}
