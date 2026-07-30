import apiClient from './axios';
import { ApiResponse, PaginatedData } from '../types/common.types';
import {
  CreateTestBookingPayload,
  SendBookingOtpPayload,
  SendBookingOtpResult,
  TestBooking,
  TestBookingFilters,
  UpdateTestBookingPayload,
  UpdateBloodTestTrackingPayload,
  UploadBloodTestReportPayload,
} from '../types/test-booking.types';
import { buildQueryParams } from '../utils/apiPayloads';
import {
  BackendTestBooking,
  mapTestBookingFromApi,
} from '../utils/testBookingMapper';

function mapPaginatedBookings(
  data: PaginatedData<BackendTestBooking>,
): PaginatedData<TestBooking> {
  return {
    ...data,
    items: data.items.map(mapTestBookingFromApi),
  };
}

export const testBookingsApi = {
  sendOtp: async (
    payload: SendBookingOtpPayload,
  ): Promise<ApiResponse<SendBookingOtpResult>> => {
    const res = await apiClient.post<ApiResponse<SendBookingOtpResult>>(
      '/test-bookings/otp/send',
      payload,
    );
    return res.data;
  },

  createBooking: async (
    payload: CreateTestBookingPayload,
  ): Promise<ApiResponse<TestBooking>> => {
    const res = await apiClient.post<ApiResponse<BackendTestBooking>>(
      '/test-bookings',
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapTestBookingFromApi(res.data.data) : undefined,
    };
  },

  getBookings: async (
    filters: TestBookingFilters,
  ): Promise<ApiResponse<PaginatedData<TestBooking>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedData<BackendTestBooking>>>(
      '/test-bookings',
      {
        params: buildQueryParams({
          page: filters.page,
          limit: filters.limit,
          status: filters.status,
        }),
      },
    );
    return {
      ...res.data,
      data: res.data.data ? mapPaginatedBookings(res.data.data) : undefined,
    };
  },

  cancelBooking: async (id: string): Promise<ApiResponse<TestBooking>> => {
    const res = await apiClient.patch<ApiResponse<BackendTestBooking>>(
      `/test-bookings/${id}/cancel`,
    );
    return {
      ...res.data,
      data: res.data.data ? mapTestBookingFromApi(res.data.data) : undefined,
    };
  },

  updateBooking: async (
    id: string,
    payload: UpdateTestBookingPayload,
  ): Promise<ApiResponse<TestBooking>> => {
    const res = await apiClient.patch<ApiResponse<BackendTestBooking>>(
      `/test-bookings/${id}`,
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapTestBookingFromApi(res.data.data) : undefined,
    };
  },

  updateBloodTestTracking: async (
    bookingId: string,
    testItemId: string,
    payload: UpdateBloodTestTrackingPayload,
  ): Promise<ApiResponse<TestBooking>> => {
    const res = await apiClient.patch<ApiResponse<BackendTestBooking>>(
      `/test-bookings/${bookingId}/tests/${testItemId}/tracking`,
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapTestBookingFromApi(res.data.data) : undefined,
    };
  },

  uploadBloodTestReport: async (
    bookingId: string,
    testItemId: string,
    payload: UploadBloodTestReportPayload,
  ): Promise<ApiResponse<TestBooking>> => {
    const res = await apiClient.post<ApiResponse<BackendTestBooking>>(
      `/test-bookings/${bookingId}/tests/${testItemId}/report`,
      payload,
    );
    return {
      ...res.data,
      data: res.data.data ? mapTestBookingFromApi(res.data.data) : undefined,
    };
  },

  downloadBloodTestReport: async (
    bookingId: string,
    testItemId: string,
  ): Promise<Blob> => {
    const res = await apiClient.get(
      `/test-bookings/${bookingId}/tests/${testItemId}/report`,
      { responseType: 'blob' },
    );
    return res.data;
  },
};
