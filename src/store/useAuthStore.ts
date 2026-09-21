import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        isAuthenticated: !!session, 
        user: session?.user || null, 
        loading: false 
      });

      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          isAuthenticated: !!session, 
          user: session?.user || null 
        });
      });
    } catch {
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ isAuthenticated: false, user: null });
    } catch (e) {
      console.error(e);
    }
  }
}));
