// Store Zustand pour l'authentification

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, UserRole } from '@/types';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (role: UserRole, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,

      login: async (role: UserRole, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              session: {
                isAuthenticated: true,
                role,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
              },
              isLoading: false,
            });
            return true;
          } else {
            set({ error: data.message || 'Erreur de connexion', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Erreur de connexion', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ session: null, error: null });
        // Appeler l'API de déconnexion
        fetch('/api/auth/logout', { method: 'POST' });
      },

      checkSession: () => {
        const { session } = get();
        if (session && session.expiresAt && session.expiresAt < Date.now()) {
          set({ session: null });
        }
      },
    }),
    {
      name: 'skali-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
