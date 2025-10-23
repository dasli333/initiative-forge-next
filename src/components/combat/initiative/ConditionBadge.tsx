// Badge displaying active condition with tooltip and remove button

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react";
import type { ActiveConditionDTO, ConditionDTO } from "@/types";
import { formatConditionDescription } from "@/lib/format-description";
import { useLanguageStore } from "@/stores/languageStore";

interface ConditionBadgeProps {
  condition: ActiveConditionDTO;
  fullCondition: ConditionDTO;
  onRemove: (conditionId: string) => void;
}

export function ConditionBadge({ condition, fullCondition, onRemove }: ConditionBadgeProps) {
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="group relative gap-1 pr-5">
            <span className="truncate max-w-[80px]">
              {fullCondition.name[selectedLanguage]}
              {condition.duration_in_rounds !== null && ` ${condition.duration_in_rounds}`}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 h-full w-5 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(condition.condition_id);
              }}
              aria-label={`Remove ${fullCondition.name[selectedLanguage]} condition`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{fullCondition.name[selectedLanguage]}</p>
            <div className="text-sm text-muted-foreground">{formatConditionDescription(fullCondition.description)}</div>
            {condition.duration_in_rounds && (
              <p className="text-xs text-muted-foreground">Duration: {condition.duration_in_rounds} rounds</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
