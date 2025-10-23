'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CreateCampaignModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when campaign is successfully created */
  onSuccess: () => void;
  /** Function to create campaign (from useCampaigns hook) */
  onCreate: (name: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Modal dialog for creating a new campaign
 * Includes form validation and error handling
 */
export function CreateCampaignModal({ isOpen, onClose, onSuccess, onCreate }: CreateCampaignModalProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    // Validation
    if (!trimmedName) {
      setError('Campaign name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Campaign name must be less than 100 characters');
      return;
    }

    setIsCreating(true);

    try {
      const result = await onCreate(trimmedName);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to create campaign');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Enter a name for your new campaign. You can change it later.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                data-testid="campaign-name-input"
                placeholder="Enter campaign name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
                aria-describedby={error ? 'name-error' : undefined}
              />
              {error && (
                <p id="name-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" data-testid="confirm-create-campaign" className="bg-emerald-600 hover:bg-emerald-700" disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
