import { Badge } from "@/components/ui/badge";
import type { MonsterDTO } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/languageStore";

/**
 * Props for MonsterListItem component
 */
interface MonsterListItemProps {
  /**
   * Monster data to display
   */
  monster: MonsterDTO;
  /**
   * Whether this item is currently selected
   */
  isSelected: boolean;
  /**
   * Callback fired when item is clicked
   */
  onClick: (monsterId: string) => void;
}

/**
 * Compact list item component for displaying a single monster
 * Shows name, CR badge, type and size as secondary info
 *
 * @param monster - Monster data from API
 * @param isSelected - Whether this item is currently selected
 * @param onClick - Handler for item click
 */
export function MonsterListItem({ monster, isSelected, onClick }: MonsterListItemProps) {
  const { id, data } = monster;

  // Get selected language from store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const displayName = data.name[selectedLanguage];

  const handleClick = () => {
    onClick(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support keyboard navigation (Enter and Space)
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(id);
    }
  };

  return (
    <div
      className={cn(
        "py-3 px-4 cursor-pointer transition-all duration-200 border-b border-border",
        "hover:bg-muted/70 hover:border-l-2 hover:border-l-emerald-500/50",
        isSelected && "bg-emerald-500/5 border-l-4 border-l-emerald-500"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${displayName}`}
      aria-selected={isSelected}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium truncate">{displayName}</h3>
        <div className="flex items-center gap-1">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 flex-shrink-0 text-xs shadow-sm">
            CR {data.challengeRating.rating}
          </Badge>
          <span className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{data.type}</span>
          <span className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{data.size}</span>
        </div>
      </div>
    </div>
  );
}
