'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useCampaignStore } from '@/stores/campaignStore';
import { AppHeader } from './AppHeader';
import { CurrentCampaignDisplay } from './CurrentCampaignDisplay';
import { GlobalNav } from './GlobalNav';
import { CampaignNav } from './CampaignNav';
import { UserMenu } from './UserMenu';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, signOut } = useAuth();
  const { selectedCampaignId, selectedCampaign, clearSelection } = useCampaignStore();

  // Handle logout with full cleanup
  const handleLogout = useCallback(async () => {
    // 1. Logout from Supabase (clears session)
    await signOut();

    // 2. Clear campaign selection (both in-memory and localStorage)
    clearSelection();

    // 3. Clear React Query cache (removes all cached user data)
    queryClient.clear();

    // 4. Redirect to login
    router.push('/login');
  }, [signOut, clearSelection, queryClient, router]);

  return (
    <aside
      data-testid="sidebar"
      role="navigation"
      aria-label="Main navigation"
      className="fixed left-0 top-0 h-screen w-60 bg-slate-900 border-r border-slate-800 flex flex-col"
    >
      {/* Top Section */}
      <AppHeader />

      {/* Current Campaign Display */}
      <CurrentCampaignDisplay campaign={selectedCampaign} isLoading={false} />

      {/* Navigation - flex-1 for spacing */}
      <nav className="flex-1 overflow-y-auto py-4">
        <GlobalNav currentPath={pathname} />
        <CampaignNav selectedCampaignId={selectedCampaignId} currentPath={pathname} />
      </nav>

      {/* Bottom Section - User Menu */}
      {loading ? (
        <div className="h-16 bg-slate-800 animate-pulse m-4 rounded" />
      ) : (
        user && <UserMenu user={user} onLogout={handleLogout} />
      )}
    </aside>
  );
}
