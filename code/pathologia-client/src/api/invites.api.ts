import apiClient from './axios';
import { ApiResponse } from '../types/common.types';
import { LoginResponseData } from '../types/auth.types';
import { BackendUser, mapUserFromApi } from '../utils/userMapper';

export interface CreateInvitePayload {
  email: string;
}

export interface CreateInviteResponse {
  email: string;
  expiresAt: string;
  message: string;
}

export interface ValidateInviteResponse {
  email: string;
  expiresAt: string;
  inviterName?: string;
}

export interface AcceptInvitePayload {
  token: string;
  fullName: string;
  username: string;
  password: string;
}

export const invitesApi = {
  sendInvite: async (
    payload: CreateInvitePayload,
  ): Promise<ApiResponse<CreateInviteResponse>> => {
    const res = await apiClient.post<ApiResponse<CreateInviteResponse>>('/invites', payload);
    return res.data;
  },

  validateInvite: async (token: string): Promise<ApiResponse<ValidateInviteResponse>> => {
    const res = await apiClient.get<ApiResponse<ValidateInviteResponse>>('/invites/validate', {
      params: { token },
    });
    return res.data;
  },

  acceptInvite: async (
    payload: AcceptInvitePayload,
  ): Promise<ApiResponse<LoginResponseData>> => {
    const res = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string; user: BackendUser }>
    >('/invites/accept', payload);
    return {
      ...res.data,
      data: res.data.data
        ? {
            accessToken: res.data.data.accessToken,
            refreshToken: res.data.data.refreshToken,
            user: mapUserFromApi(res.data.data.user),
          }
        : undefined,
    };
  },
};
