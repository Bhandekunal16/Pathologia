import apiClient from './axios';
import { auditApi } from './audit.api';
import { mapAuditLogToRecentActivity } from '../utils/auditMapper';
import { ApiResponse, PaginatedData, UserStatus } from '../types/common.types';
import { User } from '../types/auth.types';
import {
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  UserFilters,
  DashboardStats,
} from '../types/user.types';
import {
  buildQueryParams,
  toCreateUserPayload,
  toUpdateUserPayload,
} from '../utils/apiPayloads';
import { BackendUser, mapUserFromApi } from '../utils/userMapper';

function mapPaginatedUsers(data: PaginatedData<BackendUser>): PaginatedData<User> {
  return {
    ...data,
    items: data.items.map(mapUserFromApi),
  };
}

async function fetchUserCount(status?: UserStatus): Promise<number> {
  const res = await apiClient.get<ApiResponse<PaginatedData<BackendUser>>>('/users', {
    params: buildQueryParams({ page: 1, limit: 1, status }),
  });
  return res.data.data?.total ?? 0;
}

export const usersApi = {
  getUsers: async (filters: UserFilters): Promise<ApiResponse<PaginatedData<User>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedData<BackendUser>>>('/users', {
      params: buildQueryParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      }),
    });
    return {
      ...res.data,
      data: res.data.data ? mapPaginatedUsers(res.data.data) : undefined,
    };
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<BackendUser>>(`/users/${id}`);
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  createUser: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<BackendUser>>('/users', toCreateUserPayload(payload));
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<BackendUser>>(
      `/users/${id}`,
      toUpdateUserPayload(payload)
    );
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const res = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return res.data;
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<BackendUser>>(`/users/${id}/status`, { status });
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  resetPassword: async (
    id: string,
    payload: ResetPasswordPayload
  ): Promise<ApiResponse<ResetPasswordResponse>> => {
    const res = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
      `/users/${id}/reset-password`,
      payload
    );
    return res.data;
  },

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const [totalUsers, activeUsers, inactiveUsers, recentAuditRes] = await Promise.all([
      fetchUserCount(),
      fetchUserCount('ACTIVE'),
      fetchUserCount('INACTIVE'),
      auditApi.getRecentAuditLogs(5),
    ]);

    return {
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentActivities: (recentAuditRes.data ?? []).map(mapAuditLogToRecentActivity),
      },
    };
  },
};
