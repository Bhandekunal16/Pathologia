import apiClient from './axios';
import { ApiResponse } from '../types/common.types';
import {
  LoginCredentials,
  LoginResponseData,
  RefreshTokenResponseData,
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/auth.types';
import {
  toChangePasswordPayload,
  toUpdateProfilePayload,
} from '../utils/apiPayloads';
import { BackendUser, mapUserFromApi } from '../utils/userMapper';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: BackendUser }>>(
      '/auth/login',
      credentials
    );
    return {
      ...res.data,
      data: {
        accessToken: res.data.data!.accessToken,
        refreshToken: res.data.data!.refreshToken,
        user: mapUserFromApi(res.data.data!.user),
      },
    };
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponseData>> => {
    const res = await apiClient.post<ApiResponse<RefreshTokenResponseData>>('/auth/refresh', {
      refreshToken,
    });
    return res.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const res = await apiClient.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<BackendUser>>('/auth/me');
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<BackendUser>>('/users/profile');
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<BackendUser>>(
      '/users/profile',
      toUpdateProfilePayload(payload)
    );
    return {
      ...res.data,
      data: res.data.data ? mapUserFromApi(res.data.data) : undefined,
    };
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse> => {
    const res = await apiClient.patch<ApiResponse>(
      '/users/change-password',
      toChangePasswordPayload(payload)
    );
    return res.data;
  },
};
