'use client';

import { useState } from 'react';
import { Menu, Swords } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './SidebarContent';

export function MobileTopBar() {
  const [open, setOpen] = useState(false);

  // Close drawer when user taps a nav link (Next.js Link routes via click).
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) setOpen(false);
  };

  return (
    <header
      data-testid="mobile-top-bar"
      className="md:hidden sticky top-0 z-40 flex items-center gap-3 h-14 px-3 bg-slate-900 border-b border-slate-800"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open navigation"
          data-testid="mobile-nav-trigger"
          className="inline-flex items-center justify-center h-10 w-10 rounded-md text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85%] max-w-[300px] p-0 bg-slate-900 border-slate-800 flex flex-col"
          onClick={handleContentClick}
        >
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2 text-slate-100">
        <Swords className="h-5 w-5 text-emerald-500" />
        <span className="font-semibold">Initiative Forge</span>
      </div>
    </header>
  );
}
