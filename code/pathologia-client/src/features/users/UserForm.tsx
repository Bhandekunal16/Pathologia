import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema } from '../../utils/validators';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { UserRole, UserStatus } from '../../types/common.types';
import { User } from '../../types/auth.types';

export interface UserFormData {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  specialization?: string;
}

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  onCancel,
}) => {
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      username: initialData?.username || '',
      password: '',
      role: (initialData?.role as UserRole) || 'PATHOLOGIST',
      status: (initialData?.status as UserStatus) || 'ACTIVE',
      department: initialData?.department || '',
      specialization: initialData?.specialization || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">
          {isEdit ? 'Edit User Credentials & Role' : 'Create New User Account'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isEdit
            ? 'Update user role, department, and account details'
            : 'Fill in user information to provision a new pathologist or admin account'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Jane Doe"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. j.doe@pathologia.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Username"
          placeholder="e.g. jdoe"
          error={errors.username?.message}
          required
          {...register('username')}
        />

        {!isEdit && (
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            required
            {...register('password')}
          />
        )}

        <Select
          label="Role"
          options={[
            { label: 'Pathologist (Clinical User)', value: 'PATHOLOGIST' },
            { label: 'Admin (Full Management)', value: 'ADMIN' },
            { label: 'User (Standard Access)', value: 'USER' },
          ]}
          error={errors.role?.message}
          required
          {...register('role')}
        />

        <Select
          label="Status"
          options={[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive (Deactivated)', value: 'INACTIVE' },
          ]}
          error={errors.status?.message}
          required
          {...register('status')}
        />

        <Input
          label="Department"
          placeholder="e.g. Surgical Pathology"
          error={errors.department?.message}
          {...register('department')}
        />

        <Input
          label="Specialization"
          placeholder="e.g. Cytopathology & Dermatopathology"
          error={errors.specialization?.message}
          {...register('specialization')}
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span>{isEdit ? 'Save Changes' : 'Create User'}</span>
        </button>
      </div>
    </form>
  );
};
