import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 4200,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/users': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/pathology-tests': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/test-bookings': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/invites': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/audit-logs': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
