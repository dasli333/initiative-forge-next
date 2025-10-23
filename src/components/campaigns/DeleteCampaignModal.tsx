'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { CampaignViewModel } from '@/types/campaigns';

interface DeleteCampaignModalProps {
  /** Campaign to delete (null = modal closed) */
  campaign: CampaignViewModel | null;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when campaign is successfully deleted */
  onSuccess: () => void;
  /** Function to delete campaign (from useCampaigns hook) */
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Confirmation modal for deleting a campaign
 * Displays warning about deleting associated data
 */
export function DeleteCampaignModal({ campaign, onClose, onSuccess, onDelete }: DeleteCampaignModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!campaign) return;

    setIsDeleting(true);

    try {
      const result = await onDelete(campaign.id);

      if (result.success) {
        onSuccess();
        onClose();
      }
      // Error handling is done in the hook (toast notification)
    } finally {
      setIsDeleting(false);
    }
  };

  const hasData = (campaign?.characterCount ?? 0) > 0 || (campaign?.combatCount ?? 0) > 0;

  return (
    <Dialog open={campaign !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <DialogTitle>Delete Campaign</DialogTitle>
          </div>
          <DialogDescription>
            {hasData ? (
              <>
                This campaign has <span className="font-semibold">{campaign?.characterCount ?? 0} character(s)</span>{' '}
                and <span className="font-semibold">{campaign?.combatCount ?? 0} combat(s)</span>. Deleting it will also
                delete all associated data. This action cannot be undone.
              </>
            ) : (
              'Are you sure you want to delete this campaign? This action cannot be undone.'
            )}
          </DialogDescription>
        </DialogHeader>

        {campaign && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You are about to delete: <span className="font-semibold text-foreground">{campaign.name}</span>
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" data-testid="confirm-delete-campaign" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
