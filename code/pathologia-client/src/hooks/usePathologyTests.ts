import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pathologyTestsApi } from '../api/pathology-tests.api';
import { useAuthStore } from '../store/authStore';
import {
  CreatePathologyTestPayload,
  PathologyTestFilters,
  UpdatePathologyTestPayload,
} from '../types/pathology-test.types';

export function usePathologyTests(filters?: PathologyTestFilters) {
  const queryClient = useQueryClient();
  const userRole = useAuthStore((state) => state.user?.role);
  const canManageTests = userRole === 'PATHOLOGIST';
  const canViewInactiveTests = userRole === 'PATHOLOGIST';

  const resolvedFilters: PathologyTestFilters = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 10,
    search: filters?.search ?? '',
    category: filters?.category ?? '',
    status: canViewInactiveTests ? filters?.status : 'ACTIVE',
  };

  const testsQuery = useQuery({
    queryKey: ['pathology-tests', resolvedFilters],
    queryFn: () => pathologyTestsApi.getTests(resolvedFilters),
    enabled: !!filters,
  });

  const createTestMutation = useMutation({
    mutationFn: (payload: CreatePathologyTestPayload) =>
      pathologyTestsApi.createTest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathology-tests'] });
      toast.success('Pathology test created successfully');
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePathologyTestPayload }) =>
      pathologyTestsApi.updateTest(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pathology-tests'] });
      queryClient.invalidateQueries({ queryKey: ['pathology-test', variables.id] });
      toast.success('Pathology test updated successfully');
    },
  });

  return {
    testsData: testsQuery.data?.data,
    isLoadingTests: testsQuery.isLoading,
    isFetchingTests: testsQuery.isFetching,
    testsError: testsQuery.error,
    refetchTests: testsQuery.refetch,
    canManageTests,
    canViewInactiveTests,

    createTest: createTestMutation.mutateAsync,
    isCreatingTest: createTestMutation.isPending,

    updateTest: updateTestMutation.mutateAsync,
    isUpdatingTest: updateTestMutation.isPending,
  };
}

export function usePathologyTest(id?: string) {
  return useQuery({
    queryKey: ['pathology-test', id],
    queryFn: () => pathologyTestsApi.getTestById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
