import React from 'react';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { User } from '../../types/auth.types';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!user) return null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User Account"
      description={`Are you sure you want to delete the user account for "${user.fullName}" (@${user.username})? This action cannot be undone.`}
      confirmText="Delete Account"
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
};
