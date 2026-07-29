import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, LogIn, Activity } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { Input } from '../../components/forms/Input';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types/auth.types';

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    login(data);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pathologist<span className="text-teal-600">Friend</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
          Sign in to access your clinical pathology workspace & lab analytics
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username or Email"
          placeholder="Enter your username or email"
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          error={errors.identifier?.message}
          required
          {...register('identifier')}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-md hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {isLoggingIn ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Workspace</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
