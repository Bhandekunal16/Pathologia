import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../../utils/validators';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { ChangePasswordPayload } from '../../types/auth.types';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordPayload) => Promise<void>;
  isLoading?: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = async (data: ChangePasswordPayload) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">Change Workspace Password</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Ensure your account remains secure with a strong unique password
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <PasswordInput
          label="Current Password"
          placeholder="••••••••••••"
          error={(errors as any).currentPassword?.message}
          required
          {...register('currentPassword')}
        />

        <PasswordInput
          label="New Password"
          placeholder="At least 8 characters"
          error={(errors as any).newPassword?.message}
          required
          {...register('newPassword')}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Repeat new password"
          error={(errors as any).confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span>Update Password</span>
        </button>
      </div>
    </form>
  );
};
