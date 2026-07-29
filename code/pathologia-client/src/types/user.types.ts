import { UserRole, UserStatus } from './common.types';
import { User } from './auth.types';

export interface CreateUserPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  specialization?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  specialization?: string;
}

export interface ResetPasswordPayload {
  sendTemporaryPassword: boolean;
}

export interface ResetPasswordResponse {
  temporaryPassword?: string;
}

export interface UserFilters {
  page: number;
  limit: number;
  search: string;
  role: string;
  status: string;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'user_management' | 'profile_update' | 'security' | 'system' | 'login';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentActivities: RecentActivity[];
}
