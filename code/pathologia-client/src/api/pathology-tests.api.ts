import apiClient from './axios';
import { ApiResponse, PaginatedData } from '../types/common.types';
import { PathologyTest, PathologyTestFilters, CreatePathologyTestPayload, UpdatePathologyTestPayload } from '../types/pathology-test.types';
import { buildQueryParams } from '../utils/apiPayloads';
import {
  BackendPathologyTest,
  mapPathologyTestFromApi,
} from '../utils/pathologyTestMapper';

function mapPaginatedTests(
  data: PaginatedData<BackendPathologyTest>,
): PaginatedData<PathologyTest> {
  return {
    ...data,
    items: data.items.map(mapPathologyTestFromApi),
  };
}

export const pathologyTestsApi = {
  getTests: async (
    filters: PathologyTestFilters,
  ): Promise<ApiResponse<PaginatedData<PathologyTest>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedData<BackendPathologyTest>>>(
      '/pathology-tests',
      {
        params: buildQueryParams({
          page: filters.page,
          limit: filters.limit,
          search: filters.search,
          category: filters.category,
          status: filters.status,
        }),
      },
    );
    return {
      ...res.data,
      data: res.data.data ? mapPaginatedTests(res.data.data) : undefined,
    };
  },

  getTestById: async (id: string): Promise<ApiResponse<PathologyTest>> => {
    const res = await apiClient.get<ApiResponse<BackendPathologyTest>>(
      `/pathology-tests/${id}`,
    );
    return {
      ...res.data,
      data: res.data.data ? mapPathologyTestFromApi(res.data.data) : undefined,
    };
  },

  createTest: async (
    payload: CreatePathologyTestPayload,
  ): Promise<ApiResponse<PathologyTest>> => {
    const res = await apiClient.post<ApiResponse<BackendPathologyTest>>(
      '/pathology-tests',
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapPathologyTestFromApi(res.data.data) : undefined,
    };
  },

  updateTest: async (
    id: string,
    payload: UpdatePathologyTestPayload,
  ): Promise<ApiResponse<PathologyTest>> => {
    const res = await apiClient.patch<ApiResponse<BackendPathologyTest>>(
      `/pathology-tests/${id}`,
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapPathologyTestFromApi(res.data.data) : undefined,
    };
  },
};
