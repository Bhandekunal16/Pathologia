import React from 'react';
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
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
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    warning: <ShieldAlert className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-sky-600" />,
    success: <CheckCircle className="w-6 h-6 text-emerald-600" />,
  };

  const bgMap = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-sky-50 border-sky-100',
    success: 'bg-emerald-50 border-emerald-100',
  };

  const buttonMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
    info: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showHeader={false}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn('p-3 rounded-full border shrink-0', bgMap[variant])}>
            {iconMap[variant]}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center space-x-2',
              buttonMap[variant]
            )}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
