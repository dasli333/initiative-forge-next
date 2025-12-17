'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useLanguageStore, type Language } from '@/stores/languageStore';
import { formatConditionDescription } from '@/lib/format-description';

interface PropertyHoverCardProps {
  /** Bilingual name */
  name: { en: string; pl: string };
  /** Property description */
  description: string;
  /** Trigger element */
  children: React.ReactNode;
  /** Position of the hover card */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Additional class for content */
  className?: string;
}

/**
 * Helper to get the opposite language for secondary display
 */
function getOtherLanguage(lang: Language): Language {
  return lang === 'en' ? 'pl' : 'en';
}

/**
 * Generic HoverCard wrapper for reference data with bilingual support.
 * Displays property name (primary + secondary language) and formatted description.
 * Used for weapon properties, mastery properties, and conditions.
 */
export function PropertyHoverCard({
  name,
  description,
  children,
  side = 'top',
  className,
}: PropertyHoverCardProps) {
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const otherLanguage = getOtherLanguage(selectedLanguage);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} className={className}>
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{name[selectedLanguage]}</p>
            <p className="text-xs text-muted-foreground">{name[otherLanguage]}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatConditionDescription(description)}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
