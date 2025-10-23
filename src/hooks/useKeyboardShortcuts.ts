// Hook for global keyboard shortcuts

import { useEffect } from "react";

/**
 * Hook to register global keyboard shortcuts
 * Automatically ignores shortcuts when focus is in input/textarea
 * @param handlers Map of key -> handler function
 */
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignoruj jeśli użytkownik jest w input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlers]);
}
