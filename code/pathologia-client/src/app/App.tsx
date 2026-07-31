import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthInitializer } from '../components/auth/AuthInitializer';
import { ThemeInitializer } from '../components/theme/ThemeInitializer';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '12px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            boxShadow: 'var(--shadow-elevated)',
          },
          success: {
            iconTheme: {
              primary: 'var(--toast-success)',
              secondary: 'var(--toast-text)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--toast-error)',
              secondary: 'var(--toast-text)',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
