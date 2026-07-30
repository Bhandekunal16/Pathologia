import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';
import { useAuthStore } from '../store/authStore';
import { AuditLogFilters } from '../types/audit.types';

export function useAuditLogs(filters?: AuditLogFilters) {
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';

  const auditLogsQuery = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () =>
      auditApi.getAuditLogs(
        filters || { page: 1, limit: 10, search: '', action: '' }
      ),
    enabled: isAdmin && !!filters,
  });

  const recentAuditLogsQuery = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => auditApi.getRecentAuditLogs(5),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  return {
    auditLogsData: auditLogsQuery.data?.data,
    isLoadingAuditLogs: auditLogsQuery.isLoading,
    isFetchingAuditLogs: auditLogsQuery.isFetching,
    auditLogsError: auditLogsQuery.error,
    refetchAuditLogs: auditLogsQuery.refetch,

    recentAuditLogs: recentAuditLogsQuery.data?.data ?? [],
    isLoadingRecentAuditLogs: recentAuditLogsQuery.isLoading,
  };
}

export function useAuditLog(id?: string) {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditApi.getAuditLogById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
