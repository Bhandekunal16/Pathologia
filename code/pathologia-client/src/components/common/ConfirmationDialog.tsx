import React from 'react';
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconMap = {
    danger: <AlertTriangle className="w-6 h-6 text-danger" />,
    warning: <ShieldAlert className="w-6 h-6 text-warning" />,
    info: <Info className="w-6 h-6 text-info" />,
    success: <CheckCircle className="w-6 h-6 text-success" />,
  };

  const bgMap = {
    danger: 'bg-danger-muted border-danger-border',
    warning: 'bg-warning-muted border-warning-border',
    info: 'bg-info-muted border-info-border',
    success: 'bg-success-muted border-success-border',
  };

  const confirmVariant = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'info' as const,
    success: 'success' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showHeader={false}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn('p-3 rounded-full border shrink-0', bgMap[variant])}>
            {iconMap[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            size="md"
            variant={confirmVariant[variant]}
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
