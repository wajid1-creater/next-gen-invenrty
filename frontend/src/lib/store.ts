'use client';
import { create } from 'zustand';
import type { User } from './types';

const USER_KEY = 'user';

interface AuthStore {
  user: User | null;
  /** True once we've read persisted auth from localStorage. Guards SSR flash. */
  isHydrated: boolean;
  /** Persist the user (not the token — tokens live in httpOnly cookies). */
  setUser: (user: User) => void;
  /**
   * @deprecated Tokens now live in httpOnly cookies. Pages should call setUser instead.
   * Kept as a thin shim so we don't have to touch every login/register page in lockstep.
   */
  setAuth: (user: User, _token?: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  setAuth: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
      // Clean up the legacy token key from earlier versions.
      localStorage.removeItem('token');
    }
    set({ user: null });
  },
  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true });
      return;
    }
    try {
      // Drop any legacy token left in localStorage from prior versions.
      localStorage.removeItem('token');
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        set({ user: JSON.parse(userStr) as User, isHydrated: true });
        return;
      }
    } catch {
      localStorage.removeItem(USER_KEY);
    }
    set({ isHydrated: true });
  },
}));
