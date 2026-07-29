import { ChangePasswordPayload, UpdateProfilePayload } from '../types/auth.types';
import { CreateUserPayload, UpdateUserPayload } from '../types/user.types';

export function toCreateUserPayload(data: {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  role: CreateUserPayload['role'];
  status: CreateUserPayload['status'];
  department?: string;
  specialization?: string;
}) {
  const { fullName, email, username, password, role, status, department, specialization } = data;
  if (!password) {
    throw new Error('Password is required to create a user');
  }
  return {
    fullName,
    email,
    username,
    password,
    role,
    status,
    ...(role === 'PATHOLOGIST' && {
      ...(department !== undefined && { department }),
      ...(specialization !== undefined && { specialization }),
    }),
  };
}

export function toUpdateUserPayload(data: UpdateUserPayload) {
  const { fullName, email, username, role, status, department, specialization } = data;
  return {
    fullName,
    email,
    username,
    role,
    status,
    ...(role === 'PATHOLOGIST' && {
      ...(department !== undefined && { department }),
      ...(specialization !== undefined && { specialization }),
    }),
  };
}

export function toUpdateProfilePayload(data: UpdateProfilePayload) {
  const { fullName, email, username, department, specialization } = data;
  return {
    fullName,
    email,
    username,
    ...(department !== undefined && { department }),
    ...(specialization !== undefined && { specialization }),
  };
}

export function toChangePasswordPayload(data: ChangePasswordPayload) {
  const { currentPassword, newPassword, confirmPassword } = data;
  return { currentPassword, newPassword, confirmPassword };
}

export function buildQueryParams(
  params: Record<string, string | number | undefined>
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined)
  ) as Record<string, string | number>;
}
