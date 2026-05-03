import type { ReactNode } from 'react';

interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
}

/**
 * Standard split-view layout: fixed-width left panel | flex right panel
 * Used across NPCs, Locations, Quests, and other entity views
 */
export function SplitLayout({ leftPanel, rightPanel, className = '' }: SplitLayoutProps) {
  return (
    <div className={`flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden ${className}`}>
      <div className="w-full md:w-[30%] md:min-w-[280px] md:max-w-[360px] border-b md:border-b-0 md:border-r overflow-hidden">
        {leftPanel}
      </div>

      <div className="flex-1 overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
