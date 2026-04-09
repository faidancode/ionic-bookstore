export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta: PaginationMeta;
  error: any;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// --- Auth ---
export type UserRole = 'Administrator' | 'User';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<CurrentUser, 'accessToken' | 'refreshToken'>;
  accessToken: string;
  refreshToken: string;
}
