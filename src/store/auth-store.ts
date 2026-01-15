import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { Session } from '../types';
import { repos } from '../services/container';

// Platform-specific storage adapter
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          const value = window.localStorage.getItem(key);
          return Promise.resolve(value);
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // Use AsyncStorage for native platforms
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }
};

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  hasInitialized: boolean;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      hasInitialized: false,
      setSession: (session) => {
        set({ session });
        // Don't persist session - always require login
        // Session is only kept in memory during app session
      },
      clearSession: () => {
        set({ session: null });
        // Clear storage (platform-agnostic)
        getStorage().removeItem('auth-storage').catch((error) => {
          // On web, this should not fail, but continue anyway
          if (Platform.OS !== 'web') {
            console.warn('Error clearing storage:', error);
          }
        });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (initialized: boolean) => set({ hasInitialized: initialized }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage()),
      // Only persist hasInitialized, not session
      partialize: (state) => ({
        session: null, // Never persist session - always require fresh login
        hasInitialized: state.hasInitialized,
      }),
      // Clear session on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.session = null; // Always clear session on restore
        }
      },
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  
  const logout = async () => {
    try {
      // Call repository logout to clear AsyncStorage
      await repos.authRepo.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear session from Zustand store
      store.clearSession();
    }
  };
  
  return {
    user: store.session?.user ?? null,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: !!store.session,
    setSession: store.setSession,
    logout,
    setLoading: store.setLoading,
  };
};
