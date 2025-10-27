import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GradientSeparator, SectionHeader, DamageBadge, AttackBadge } from "@/components/library";
import type { LucideIcon } from "lucide-react";

/**
 * Action data structure - compatible with MonsterDataDTO actions
 */
interface Action {
  name: string;
  description: string;
  type: string;
  attackRoll?: {
    type?: "melee" | "ranged";
    bonus: number;
  };
  damage?: Array<{
    average: number;
    formula: string;
    type?: string;
    damageType?: string;
  }>;
  savingThrow?: unknown;
  conditions?: unknown[];
  range?: string;
  uses?: unknown;
}

/**
 * Props for ActionSection component
 */
interface ActionSectionProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Section icon
   */
  icon: LucideIcon;
  /**
   * Array of actions to display
   */
  actions: Action[];
  /**
   * Key prefix for accordion items (to avoid key collisions)
   */
  keyPrefix: string;
}

/**
 * Reusable component for displaying action sections (Actions, Bonus Actions, Reactions)
 * Follows DRY principle by consolidating duplicated code
 */
export function ActionSection({ title, icon, actions, keyPrefix }: ActionSectionProps) {
  // Don't render section if there are no actions
  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <GradientSeparator />
      <section>
        <SectionHeader icon={icon} title={title} />
        <Accordion type="multiple">
          {actions.map((action, index) => (
            <AccordionItem key={`${keyPrefix}-${index}`} value={`${keyPrefix}-${index}`}>
              <AccordionTrigger className="text-base font-semibold text-foreground">{action.name}</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                {action.attackRoll && (
                  <div className="flex items-center gap-2">
                    <AttackBadge bonus={action.attackRoll.bonus} />
                  </div>
                )}
                {action.damage && action.damage.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {action.damage.map((dmg, dmgIndex) => (
                      <DamageBadge key={dmgIndex} average={dmg.average} formula={dmg.formula} type={dmg.type} />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
