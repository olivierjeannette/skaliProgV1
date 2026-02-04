// Store Zustand pour l'authentification
// IMPORTANT: La session est gérée uniquement via cookie httpOnly côté serveur
// Ce store gère seulement l'état UI de l'authentification

import { create } from 'zustand';
import type { Session, UserRole } from '@/types';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (role: UserRole, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isLoading: true,
  error: null,

  login: async (role: UserRole, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password }),
        credentials: 'include', // Important pour les cookies
      });

      const data = await response.json();

      if (data.success) {
        set({
          session: {
            isAuthenticated: true,
            role,
            expiresAt: data.session?.expiresAt || Date.now() + 24 * 60 * 60 * 1000,
          },
          isLoading: false,
        });
        return true;
      } else {
        set({ error: data.message || 'Erreur de connexion', isLoading: false });
        return false;
      }
    } catch {
      set({ error: 'Erreur de connexion', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
    set({ session: null, error: null, isLoading: false });
  },

  checkSession: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          set({
            session: data.session,
            isLoading: false,
          });
          return;
        }
      }

      // Pas de session valide
      set({ session: null, isLoading: false });
    } catch {
      set({ session: null, isLoading: false });
    }
  },
}));
