'use client';

import { useState, useEffect } from 'react';

export function useActiveRulesSection() {
  const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);

  // Scroll to hash on mount (for search result navigation)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // Small delay to let content render
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Observe subsections for active highlighting
  useEffect(() => {
    const elements = document.querySelectorAll('[data-subsection-id]');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-subsection-id');
            if (id) setActiveSubsectionId(id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return { activeSubsectionId };
}
