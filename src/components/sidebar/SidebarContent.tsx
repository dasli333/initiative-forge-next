'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { AppHeader } from './AppHeader';
import { CurrentCampaignDisplay } from './CurrentCampaignDisplay';
import { GlobalNav } from './GlobalNav';
import { CampaignNav } from './CampaignNav';
import { UserMenu } from './UserMenu';

export function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, logout } = useAuthStore();
  const { selectedCampaignId, selectedCampaign, clearSelection } = useCampaignStore();

  const handleLogout = useCallback(async () => {
    await logout();
    clearSelection();
    queryClient.clear();
    router.push('/login');
  }, [logout, clearSelection, queryClient, router]);

  return (
    <>
      <AppHeader />
      <CurrentCampaignDisplay campaign={selectedCampaign} isLoading={false} />
      <nav className="flex-1 overflow-y-auto py-4">
        <GlobalNav currentPath={pathname} />
        <CampaignNav selectedCampaignId={selectedCampaignId} currentPath={pathname} />
      </nav>
      {isLoading ? (
        <div className="h-16 bg-slate-800 animate-pulse m-4 rounded" />
      ) : (
        user && <UserMenu user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
