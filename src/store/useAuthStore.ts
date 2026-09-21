import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  setAuth: (isAuth: boolean, user: any) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ isAuthenticated: true, user: data.user, loading: false });
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  setAuth: (isAuth, user) => set({ isAuthenticated: isAuth, user }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ isAuthenticated: false, user: null });
    } catch (e) {
      console.error(e);
    }
  }
}));
