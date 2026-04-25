import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './store';
import type { User } from './types';

const user: User = {
  id: 'u-1',
  name: 'Ada',
  email: 'a@b.com',
  role: 'manager',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isHydrated: false });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setUser persists user (not token) to localStorage', () => {
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(user);
    // Tokens live in httpOnly cookies — never in localStorage.
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('setAuth shim still works for backwards compat', () => {
    useAuthStore.getState().setAuth(user);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logout clears the store and removes legacy token key', () => {
    localStorage.setItem('token', 'legacy');
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('hydrate sets isHydrated and restores user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(user));
    useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('hydrate strips a stale legacy token key', () => {
    localStorage.setItem('token', 'persisted-legacy');
    localStorage.setItem('user', JSON.stringify(user));
    useAuthStore.getState().hydrate();
    expect(localStorage.getItem('token')).toBeNull();
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('hydrate handles corrupt JSON by clearing it and treating as logged out', () => {
    localStorage.setItem('user', '{not-json');
    useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
