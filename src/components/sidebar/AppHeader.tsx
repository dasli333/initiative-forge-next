'use client';

import Link from 'next/link';
import { Swords } from 'lucide-react';

export function AppHeader() {
  return (
    <Link
      href="/campaigns"
      className="flex items-center gap-3 px-4 py-6 text-slate-100 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Swords className="h-6 w-6 text-emerald-500" />
      <span className="text-lg font-semibold">Initiative Forge</span>
    </Link>
  );
}
