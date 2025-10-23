// Display all abilities with mixed rendering: clickable buttons for rollable abilities, cards for descriptive ones

import type { MonsterTrait, MonsterAction, LegendaryActions } from "@/lib/schemas/monster.schema";
import type { ActionDTO } from "@/types";
import {
  isRollableMonsterAction,
  isRollableTrait,
  convertMonsterActionToActionDTO,
  convertMonsterTraitToActionDTO,
} from "./utils";
import { ActionButton } from "./ActionButton";
import { BookOpen, Swords, Zap, Shield, Crown } from "lucide-react";

interface DescriptiveAbilitiesProps {
  traits?: MonsterTrait[];
  actions?: MonsterAction[];
  bonusActions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: LegendaryActions;
  onActionClick: (action: ActionDTO) => void;
}

export function DescriptiveAbilities({
  traits,
  actions,
  bonusActions,
  reactions,
  legendaryActions,
  onActionClick,
}: DescriptiveAbilitiesProps) {
  // Check if we have any abilities to show
  const hasAny =
    (traits && traits.length > 0) ||
    (actions && actions.length > 0) ||
    (bonusActions && bonusActions.length > 0) ||
    (reactions && reactions.length > 0) ||
    (legendaryActions && legendaryActions.actions && legendaryActions.actions.length > 0);

  if (!hasAny) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Traits */}
      {traits && traits.length > 0 && (
        <AbilityGroup icon={BookOpen} label="Traits">
          {traits.map((trait, index) =>
            isRollableTrait(trait) ? (
              <ActionButton key={index} action={convertMonsterTraitToActionDTO(trait)} onClick={onActionClick} />
            ) : (
              <AbilityCard key={index} name={trait.name} description={trait.description} />
            )
          )}
        </AbilityGroup>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <AbilityGroup icon={Swords} label="Actions">
          {actions.map((action, index) =>
            isRollableMonsterAction(action) ? (
              <ActionButton
                key={index}
                action={convertMonsterActionToActionDTO(action, "action")}
                onClick={onActionClick}
              />
            ) : (
              <AbilityCard key={index} name={action.name} description={action.description} />
            )
          )}
        </AbilityGroup>
      )}

      {/* Bonus Actions */}
      {bonusActions && bonusActions.length > 0 && (
        <AbilityGroup icon={Zap} label="Bonus Actions">
          {bonusActions.map((action, index) =>
            isRollableMonsterAction(action) ? (
              <ActionButton
                key={index}
                action={convertMonsterActionToActionDTO(action, "bonus_action")}
                onClick={onActionClick}
              />
            ) : (
              <AbilityCard key={index} name={action.name} description={action.description} />
            )
          )}
        </AbilityGroup>
      )}

      {/* Reactions */}
      {reactions && reactions.length > 0 && (
        <AbilityGroup icon={Shield} label="Reactions">
          {reactions.map((action, index) =>
            isRollableMonsterAction(action) ? (
              <ActionButton
                key={index}
                action={convertMonsterActionToActionDTO(action, "reaction")}
                onClick={onActionClick}
              />
            ) : (
              <AbilityCard key={index} name={action.name} description={action.description} />
            )
          )}
        </AbilityGroup>
      )}

      {/* Legendary Actions */}
      {legendaryActions && legendaryActions.actions && legendaryActions.actions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Crown className="h-3.5 w-3.5" />
            <span>Legendary Actions</span>
          </div>
          {legendaryActions.usageDescription && (
            <p className="text-xs text-muted-foreground italic pl-5">{legendaryActions.usageDescription}</p>
          )}
          <div className="space-y-2 pl-5">
            {legendaryActions.actions.map((action, index) =>
              isRollableMonsterAction(action) ? (
                <ActionButton
                  key={index}
                  action={convertMonsterActionToActionDTO(action, "legendary_action")}
                  onClick={onActionClick}
                />
              ) : (
                <AbilityCard key={index} name={action.name} description={action.description} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AbilityGroupProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function AbilityGroup({ icon: Icon, label, children }: AbilityGroupProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="space-y-2 pl-5">{children}</div>
    </div>
  );
}

interface AbilityCardProps {
  name: string;
  description: string;
}

function AbilityCard({ name, description }: AbilityCardProps) {
  return (
    <div className="rounded-md border bg-card p-3 space-y-1">
      <h4 className="text-sm font-semibold">{name}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
