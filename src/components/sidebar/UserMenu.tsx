'use client';

import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@supabase/supabase-js';

interface UserMenuProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const truncateEmail = (email: string) => {
    if (email.length > 20) {
      return email.substring(0, 17) + '...';
    }
    return email;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <Avatar className="h-8 w-8">
            {user.user_metadata?.avatar_url && <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || 'User'} />}
            <AvatarFallback className="bg-emerald-500/10 text-emerald-500">{getInitials(user.email || 'U')}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-slate-300 truncate">{truncateEmail(user.email || 'Unknown')}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-slate-200">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
