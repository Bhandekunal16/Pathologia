import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { invitesApi, AcceptInvitePayload, CreateInvitePayload } from '../api/invites.api';
import { useAuthStore } from '../store/authStore';

export function useInvites() {
  const sendInviteMutation = useMutation({
    mutationFn: (payload: CreateInvitePayload) => invitesApi.sendInvite(payload),
    onSuccess: (res) => {
      toast.success(res.message || `Invitation sent to ${res.data?.email}`);
    },
  });

  return {
    sendInvite: sendInviteMutation.mutateAsync,
    isSendingInvite: sendInviteMutation.isPending,
  };
}

export function useInviteRegistration(token?: string) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateQuery = useQuery({
    queryKey: ['invite-validate', token],
    queryFn: () => invitesApi.validateInvite(token!),
    enabled: !!token,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (payload: Omit<AcceptInvitePayload, 'token'>) =>
      invitesApi.acceptInvite({ ...payload, token: token! }),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        toast.success(`Welcome to Pathologia, ${res.data.user.fullName}`);
        navigate('/dashboard');
      }
    },
  });

  return {
    inviteDetails: validateQuery.data?.data,
    isValidating: validateQuery.isLoading,
    validationError: validateQuery.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
}
