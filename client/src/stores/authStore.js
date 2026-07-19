import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = '/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Initialize auth state
      init: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();

          if (data.success) {
            set({ user: data.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Login
      login: async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error.message);
        }

        set({ user: data.data.user, token: data.data.token, isAuthenticated: true });
        return data.data.user;
      },

      // Register
      register: async (email, password, name) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error.message);
        }

        set({ user: data.data.user, token: data.data.token, isAuthenticated: true });
        return data.data.user;
      },

      // Logout
      logout: async () => {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Update profile
      updateProfile: async (updates) => {
        const token = get().token;
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify(updates)
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error.message);
        }

        set({ user: data.data });
        return data.data;
      }
    }),
    {
      name: 'prism-auth',
      partialize: (state) => ({ token: state.token })
    }
  )
);

export default useAuthStore;
