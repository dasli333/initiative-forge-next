import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Supported languages for monster names and other localized content
 */
export type Language = "en" | "pl";

interface LanguageStore {
  // State - selected language for displaying monster names
  selectedLanguage: Language;

  // Actions
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

/**
 * Global store for managing the selected display language
 * Used primarily in Monsters Library for switching between EN/PL names
 *
 * Design decisions:
 * - Stores only language preference ('en' or 'pl')
 * - Persists to localStorage for cross-session consistency
 * - Provides both direct setter and toggle for convenience
 *
 * Uses localStorage persistence to sync state across different React islands in Astro
 * Important: This store is only used on the client side, not during SSR
 */
export const useLanguageStore = create<LanguageStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state - default to English
        selectedLanguage: "en",

        // Actions
        setLanguage: (language) => set({ selectedLanguage: language }, false, "setLanguage"),

        toggleLanguage: () =>
          set(
            (state) => ({
              selectedLanguage: state.selectedLanguage === "en" ? "pl" : "en",
            }),
            false,
            "toggleLanguage"
          ),
      }),
      {
        name: "language-storage", // name for localStorage key
      }
    ),
    {
      name: "language-store",
    }
  )
);
