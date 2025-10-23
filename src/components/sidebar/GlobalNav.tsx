'use client';

import { Folder, BookOpen, Sparkles } from 'lucide-react';
import { NavItem } from './NavItem';

interface GlobalNavProps {
  currentPath: string;
}

export function GlobalNav({ currentPath }: GlobalNavProps) {
  return (
    <div className="space-y-1">
      <h2 className="px-4 text-xs uppercase text-slate-500 mb-2 font-semibold tracking-wider">Global</h2>
      <ul role="list" className="space-y-1">
        <NavItem icon={Folder} label="My Campaigns" href="/campaigns" isActive={currentPath === '/campaigns'} />
        <NavItem
          icon={BookOpen}
          label="Monsters Library"
          href="/monsters"
          isActive={currentPath === '/monsters' || currentPath.startsWith('/monsters/')}
        />
        <NavItem
          icon={Sparkles}
          label="Spells Library"
          href="/spells"
          isActive={currentPath === '/spells' || currentPath.startsWith('/spells/')}
        />
      </ul>
    </div>
  );
}
