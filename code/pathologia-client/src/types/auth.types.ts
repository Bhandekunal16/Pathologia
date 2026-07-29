import { UserRole, UserStatus } from './common.types';

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  department?: string;
  specialization?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  username?: string;
  department?: string;
  specialization?: string;
}
