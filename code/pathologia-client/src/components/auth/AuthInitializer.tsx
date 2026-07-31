import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (!accessToken) {
        if (isMounted) setIsReady(true);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (!isMounted) return;

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        if (!isMounted) return;

        if (isAxiosError(error)) {
          if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
            return;
          }
          if (error.response?.status === 401) {
            logout();
          }
        }
      } finally {
        if (isMounted) setIsReady(true);
      }
    }

    setIsReady(false);
    validateSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, logout, setUser]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <LoadingSpinner size="lg" label="Initializing session..." />
      </div>
    );
  }

  return <>{children}</>;
};
