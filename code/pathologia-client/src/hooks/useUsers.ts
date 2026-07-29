import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '../store/authStore';
import { UserStatus } from '../types/common.types';
import {
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
  UserFilters,
} from '../types/user.types';

export function useUsers(filters?: UserFilters) {
  const queryClient = useQueryClient();
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'ADMIN';

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getUsers(filters || { page: 1, limit: 10, search: '', role: '', status: '' }),
    enabled: !!filters,
  });

  const dashboardStatsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => usersApi.getDashboardStats(),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('User created successfully');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('User updated successfully');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('User deleted successfully');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`User status changed to ${variables.status}`);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) =>
      usersApi.resetPassword(id, payload),
    onSuccess: (res, variables) => {
      if (res.data?.temporaryPassword) {
        toast.success(`Temporary Password: ${res.data.temporaryPassword}`, { duration: 8000 });
      } else if (variables.payload.sendTemporaryPassword) {
        toast.success('Temporary password sent to user email');
      } else {
        toast.success('Password reset link sent successfully');
      }
    },
  });

  return {
    usersData: usersQuery.data?.data,
    isLoadingUsers: usersQuery.isLoading,
    isFetchingUsers: usersQuery.isFetching,
    usersError: usersQuery.error,
    refetchUsers: usersQuery.refetch,

    dashboardStats: dashboardStatsQuery.data?.data,
    isLoadingStats: dashboardStatsQuery.isLoading,
    statsError: dashboardStatsQuery.error,
    isAdmin,

    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,

    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    deleteUser: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
