export type UserRole = 'ADMIN' | 'PATHOLOGIST' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface OptionItem {
  label: string;
  value: string;
}
