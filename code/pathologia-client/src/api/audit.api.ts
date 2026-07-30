import apiClient from './axios';
import { ApiResponse, PaginatedData } from '../types/common.types';
import { AuditLog, AuditLogFilters } from '../types/audit.types';
import { buildQueryParams } from '../utils/apiPayloads';

export const auditApi = {
  getAuditLogs: async (
    filters: AuditLogFilters
  ): Promise<ApiResponse<PaginatedData<AuditLog>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedData<AuditLog>>>('/audit-logs', {
      params: buildQueryParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        action: filters.action,
      }),
    });
    return res.data;
  },

  getRecentAuditLogs: async (limit = 5): Promise<ApiResponse<AuditLog[]>> => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs/recent', {
      params: { limit },
    });
    return res.data;
  },

  getAuditLogById: async (id: string): Promise<ApiResponse<AuditLog>> => {
    const res = await apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data;
  },
};
