import React from 'react';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { User } from '../../types/auth.types';

interface ActivateUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const ActivateUserModal: React.FC<ActivateUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!user) return null;

  const isActivating = user.status === 'INACTIVE';

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isActivating ? 'Activate User Account' : 'Deactivate User Account'}
      description={
        isActivating
          ? `Are you sure you want to activate "${user.fullName}"? The user will immediately regain workspace access.`
          : `Are you sure you want to deactivate "${user.fullName}"? The user will be logged out and blocked from signing in.`
      }
      confirmText={isActivating ? 'Activate Account' : 'Deactivate Account'}
      cancelText="Cancel"
      variant={isActivating ? 'success' : 'warning'}
      isLoading={isLoading}
    />
  );
};
