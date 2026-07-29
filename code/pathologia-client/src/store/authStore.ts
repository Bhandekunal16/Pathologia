import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const STORAGE_KEY_USER = 'pathologist_friend_user';
const STORAGE_KEY_ACCESS = 'pathologist_friend_access_token';
const STORAGE_KEY_REFRESH = 'pathologist_friend_refresh_token';

function isValidMongoId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_ACCESS);
  localStorage.removeItem(STORAGE_KEY_REFRESH);
}

function getInitialSession(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'isAuthenticated'> {
  const user = readStoredUser();
  const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
  const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);

  // Drop sessions left over from the old in-browser mock API (e.g. user-admin-1)
  if (user && !isValidMongoId(user.id)) {
    clearStoredSession();
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
  };
}

const initialSession = getInitialSession();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialSession,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);

    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    clearStoredSession();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
