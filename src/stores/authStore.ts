import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import type { UserViewModel } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  user: UserViewModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: UserViewModel | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts Supabase User to UserViewModel
 */
function toUserViewModel(user: User | null): UserViewModel | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
  };
}

/**
 * Clears authentication-related state from storage
 * Removes all user-specific data while preserving UI preferences
 */
function clearAuthState() {
  try {
    // List of localStorage keys to preserve (UI preferences, not user data)
    const keysToPreserve = [
      "language-storage", // User language preference (safe to keep)
    ];

    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);

    // Remove all keys except those in the preserve list
    allKeys.forEach((key) => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Explicitly clear known user-specific stores (defense in depth)
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("campaign-storage");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      login: async (email, password) => {
        const supabase = getSupabaseClient();

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error };
          }

          get().setUser(toUserViewModel(data.user));
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      register: async (email, password) => {
        const supabase = getSupabaseClient();

        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            return { error };
          }

          // Don't set user immediately after registration
          // User needs to verify email first
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      logout: async () => {
        const supabase = getSupabaseClient();

        try {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.error("Logout error:", signOutError);
          }

          // Clear user state
          get().setUser(null);

          // Clear persisted auth state from localStorage
          clearAuthState();

          // Note: Navigation should be handled by the calling component
          // This allows components to use navigate() for View Transitions
        } catch (error) {
          console.error("Logout error:", error);
          // Even on error, clear local state for security
          get().setUser(null);
          clearAuthState();
        }
      },

      checkAuth: async () => {
        const supabase = getSupabaseClient();

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          get().setUser(toUserViewModel(user));
        } catch (error) {
          console.error("Check auth error:", error);
          get().setUser(null);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================================================
// AUTH STATE CHANGE LISTENER
// ============================================================================

// Initialize auth state listener (call this once in your app)
export const initAuthListener = () => {
  const supabase = getSupabaseClient();

  supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    useAuthStore.getState().setUser(toUserViewModel(session?.user ?? null));
  });
};
