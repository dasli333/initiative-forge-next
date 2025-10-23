'use client';

interface CampaignMetadataProps {
  createdAt: string;
}

/**
 * Campaign metadata component
 * Displays campaign creation date in a readable format
 */
export function CampaignMetadata({ createdAt }: CampaignMetadataProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return <p className="text-sm text-muted-foreground">Created on {formattedDate}</p>;
}
