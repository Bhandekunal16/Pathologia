import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, User, UserPlus } from 'lucide-react';
import { Input } from '../components/forms/Input';
import { PasswordInput } from '../components/forms/PasswordInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useInviteRegistration } from '../hooks/useInvites';
import { acceptInviteSchema } from '../utils/validators';
import { formatDate } from '../utils/formatters';

interface RegisterFormData {
  fullName: string;
  username: string;
  password: string;
}

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? undefined;

  const {
    inviteDetails,
    isValidating,
    validationError,
    register: registerUser,
    isRegistering,
  } = useInviteRegistration(token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!token) return;
    await registerUser(data);
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80 text-center">
        <h2 className="text-lg font-bold text-slate-900">Invalid invitation link</h2>
        <p className="mt-2 text-xs text-slate-500">
          Please use the registration link from your invitation email.
        </p>
        <Link to="/login" className="inline-block mt-4 text-xs font-bold text-teal-700 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80 flex justify-center">
        <LoadingSpinner size="lg" label="Validating invitation..." />
      </div>
    );
  }

  if (validationError || !inviteDetails) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80 text-center">
        <h2 className="text-lg font-bold text-slate-900">Invitation unavailable</h2>
        <p className="mt-2 text-xs text-slate-500">
          This invite link is invalid, expired, or has already been used.
        </p>
        <Link to="/login" className="inline-block mt-4 text-xs font-bold text-teal-700 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Complete Registration
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
          {inviteDetails.inviterName
            ? `${inviteDetails.inviterName} invited you to join Pathologia.`
            : 'You have been invited to join Pathologia.'}
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Email</span>
          <span className="font-semibold text-slate-800">{inviteDetails.email}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Expires</span>
          <span className="font-semibold text-slate-800">{formatDate(inviteDetails.expiresAt)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        <Input
          label="Username"
          placeholder="Choose a username"
          error={errors.username?.message}
          required
          {...register('username')}
        />

        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {isRegistering ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create User Account</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};
