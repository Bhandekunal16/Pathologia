import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { testBookingsApi } from '../api/test-bookings.api';
import {
  CreateTestBookingPayload,
  SendBookingOtpPayload,
  TestBookingFilters,
  UpdateTestBookingPayload,
  UpdateBloodTestTrackingPayload,
  UploadBloodTestReportPayload,
} from '../types/test-booking.types';

export function useTestBookings(filters?: TestBookingFilters) {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['test-bookings', filters],
    queryFn: () => testBookingsApi.getBookings(filters ?? {}),
    enabled: !!filters,
  });

  const sendOtpMutation = useMutation({
    mutationFn: (payload: SendBookingOtpPayload) => testBookingsApi.sendOtp(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'OTP sent to patient email');
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateTestBookingPayload) =>
      testBookingsApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-bookings'] });
      toast.success('Test booking confirmed successfully');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => testBookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-bookings'] });
      toast.success('Booking cancelled successfully');
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTestBookingPayload }) =>
      testBookingsApi.updateBooking(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-bookings'] });
      toast.success('Booking updated successfully');
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({
      bookingId,
      testItemId,
      payload,
    }: {
      bookingId: string;
      testItemId: string;
      payload: UpdateBloodTestTrackingPayload;
    }) => testBookingsApi.updateBloodTestTracking(bookingId, testItemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-bookings'] });
      toast.success('Blood test status updated');
    },
  });

  const uploadReportMutation = useMutation({
    mutationFn: ({
      bookingId,
      testItemId,
      payload,
    }: {
      bookingId: string;
      testItemId: string;
      payload: UploadBloodTestReportPayload;
    }) => testBookingsApi.uploadBloodTestReport(bookingId, testItemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-bookings'] });
      toast.success('Report uploaded successfully');
    },
  });

  return {
    bookingsData: bookingsQuery.data?.data,
    isLoadingBookings: bookingsQuery.isLoading,
    refetchBookings: bookingsQuery.refetch,

    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,

    createBooking: createBookingMutation.mutateAsync,
    isCreatingBooking: createBookingMutation.isPending,

    cancelBooking: cancelBookingMutation.mutateAsync,
    isCancellingBooking: cancelBookingMutation.isPending,

    updateBooking: updateBookingMutation.mutateAsync,
    isUpdatingBooking: updateBookingMutation.isPending,

    updateBloodTestTracking: updateTrackingMutation.mutateAsync,
    isUpdatingTracking: updateTrackingMutation.isPending,

    uploadBloodTestReport: uploadReportMutation.mutateAsync,
    isUploadingReport: uploadReportMutation.isPending,
  };
}
