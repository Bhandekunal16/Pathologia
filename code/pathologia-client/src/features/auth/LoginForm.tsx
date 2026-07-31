import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, LogIn, Activity } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { Input } from '../../components/forms/Input';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/ui/Button';
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
    <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border/80">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl accent-glass mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Path<span className="text-accent">ologia</span>
        </h2>
        <p className="mt-1 text-xs text-foreground-muted max-w-xs leading-relaxed">
          Sign in to access your clinical pathology workspace & lab analytics
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username or Email"
          placeholder="Enter your username or email"
          leftIcon={<User className="w-4 h-4 text-foreground-subtle" />}
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

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoggingIn}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Workspace</span>
        </Button>
      </form>
    </div>
  );
};
