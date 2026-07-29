import { User } from '../types/auth.types';

const ADMIN_DEPARTMENT = 'IT';

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: User['role'];
  status: User['status'];
  lastLoginAt?: string;
  department?: string;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapUserFromApi(user: BackendUser): User {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    lastLogin: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    department: user.role === 'ADMIN' ? ADMIN_DEPARTMENT : user.department,
    specialization: user.role === 'PATHOLOGIST' ? user.specialization : undefined,
  };
}
