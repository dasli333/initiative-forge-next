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
    <div className={`flex-1 flex gap-6 overflow-hidden ${className}`}>
      {/* LEFT PANEL (capped at 360px) */}
      <div className="w-[30%] min-w-[280px] max-w-[360px] border-r overflow-hidden">
        {leftPanel}
      </div>

      {/* RIGHT PANEL (70%) */}
      <div className="flex-1 overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
