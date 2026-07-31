import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateClinicalProfileSchema, updateProfileSchema } from '../../utils/validators';
import { Input } from '../../components/forms/Input';
import { Avatar } from '../../components/common/Avatar';
import { User, UpdateProfilePayload } from '../../types/auth.types';
import { toUpdateProfilePayload } from '../../utils/apiPayloads';

const ADMIN_DEPARTMENT = 'IT';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: UpdateProfilePayload) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  isLoading = false,
}) => {
  const isAdmin = user.role === 'ADMIN';
  const isPathologist = user.role === 'PATHOLOGIST';
  const showClinicalFields = isAdmin || isPathologist;
  const schema = showClinicalFields ? updateClinicalProfileSchema : updateProfileSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfilePayload>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || '',
      department: isAdmin ? ADMIN_DEPARTMENT : user.department || '',
      specialization: user.specialization || '',
    },
  });

  const handleFormSubmit = (data: UpdateProfilePayload) => {
    if (!showClinicalFields) {
      onSubmit(toUpdateProfilePayload(data));
      return;
    }

    if (isAdmin) {
      onSubmit({ ...toUpdateProfilePayload(data), department: ADMIN_DEPARTMENT });
      return;
    }

    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-6"
    >
      <div className="border-b border-border-subtle pb-4">
        <h3 className="text-base font-bold text-foreground">
          {showClinicalFields ? 'Personal & Clinical Information' : 'Personal Information'}
        </h3>
        <p className="text-xs text-foreground-muted mt-0.5">
          {isAdmin
            ? 'Update your account details. Department is fixed for administrators.'
            : isPathologist
              ? 'Update your account details and clinical practice information'
              : 'Update your account name, email, and username'}
        </p>
      </div>

      <div className="flex items-center space-x-4 p-4 bg-surface-sunken/80 rounded-xl border border-border-subtle">
        <Avatar name={user.fullName} size="xl" />
        <div>
          <h4 className="text-sm font-bold text-foreground">{user.fullName}</h4>
          <p className="text-xs text-foreground-muted">{user.email}</p>
          <span className="inline-block mt-1 text-[11px] font-semibold text-accent bg-accent-subtle border border-accent-muted px-2.5 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Username"
          error={errors.username?.message}
          required
          {...register('username')}
        />

        {isAdmin && (
          <Input
            label="Department"
            value={ADMIN_DEPARTMENT}
            disabled
            readOnly
            helperText="Fixed department for administrator accounts"
          />
        )}

        {isPathologist && (
          <>
            <Input
              label="Department"
              placeholder="e.g. Anatomic Pathology"
              error={errors.department?.message}
              {...register('department')}
            />

            <Input
              label="Clinical Specialization"
              placeholder="e.g. Hematopathology"
              error={errors.specialization?.message}
              {...register('specialization')}
            />
          </>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border-subtle">
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="btn-primary"
        >
          {isLoading && (
            <span className="spinner-on-accent" />
          )}
          <span>Update Profile</span>
        </button>
      </div>
    </form>
  );
};
