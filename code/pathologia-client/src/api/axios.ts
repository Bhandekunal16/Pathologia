import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { env } from '../config/env';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function isCanceledRequest(error: AxiosError): boolean {
  return (
    error.code === 'ERR_CANCELED' ||
    error.message === 'canceled' ||
    error.message === 'Request aborted'
  );
}

function shouldAttemptTokenRefresh(url?: string): boolean {
  if (!url) return false;
  return !url.includes('/auth/login') && !url.includes('/auth/me') && !url.includes('/auth/refresh');
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    if (isCanceledRequest(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      shouldAttemptTokenRefresh(originalRequest.url)
    ) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please sign in again.');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please sign in again.');
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${env.apiBaseUrl}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        if (user) {
          useAuthStore.getState().setUser(user);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        if (!isCanceledRequest(refreshErr as AxiosError)) {
          toast.error('Session expired. Please sign in again.');
        }
        return Promise.reject(refreshErr);
      }
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || 'An unexpected error occurred';
    const validationErrors = error.response?.data?.errors;
    const isSilentAuthCheck = originalRequest.url?.includes('/auth/me');

    if (status === 400) {
      const detail = validationErrors?.length ? validationErrors.join(', ') : message;
      toast.error(detail || 'Invalid request input');
    } else if (status === 401 && !isSilentAuthCheck) {
      toast.error(message || 'Invalid credentials');
    } else if (status === 403) {
      toast.error(message || 'You do not have permission to perform this action');
    } else if (status === 404) {
      toast.error(message || 'Requested resource not found');
    } else if (status === 409) {
      toast.error(message || 'Conflict: Data already exists');
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (status && status >= 500) {
      toast.error(message || 'Internal server error. Please try again.');
    } else if (!error.response && !isCanceledRequest(error)) {
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
