'use client';

import { SidebarContent } from './SidebarContent';

export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      role="navigation"
      aria-label="Main navigation"
      className="fixed left-0 top-0 h-screen w-60 bg-slate-900 border-r border-slate-800 hidden md:flex md:flex-col"
    >
      <SidebarContent />
    </aside>
  );
}
