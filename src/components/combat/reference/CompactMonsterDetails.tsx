import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getChallengeRatingColor } from "@/lib/constants/monsters";
import type { MonsterDataDTO } from "@/types";

interface CompactMonsterDetailsProps {
  data: MonsterDataDTO;
}

const ABILITY_LABELS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function CompactMonsterDetails({ data }: CompactMonsterDetailsProps) {
  const abilities = [
    data.abilityScores.strength,
    data.abilityScores.dexterity,
    data.abilityScores.constitution,
    data.abilityScores.intelligence,
    data.abilityScores.wisdom,
    data.abilityScores.charisma,
  ];

  return (
    <div className="space-y-3 text-xs">
      {/* Core Stats */}
      <div className="space-y-1">
        <div>
          <span className="text-emerald-500/90 font-medium">AC:</span> {data.armorClass}
          <span className="mx-2">|</span>
          <span className="text-emerald-500/90 font-medium">HP:</span> {data.hitPoints.average}{" "}
          <span className="text-muted-foreground">({data.hitPoints.formula})</span>
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">CR:</span>{" "}
          <Badge className={cn("text-[10px] px-1 py-0 shadow-sm border", getChallengeRatingColor(data.challengeRating.rating))}>
            {data.challengeRating.rating}
          </Badge>
          <span className="text-muted-foreground ml-1">({data.challengeRating.experiencePoints} XP)</span>
        </div>
        {data.speed?.length > 0 && (
          <div>
            <span className="text-emerald-500/90 font-medium">Speed:</span>{" "}
            {data.speed.join(", ")}
          </div>
        )}
      </div>

      {/* Ability Scores */}
      <div className="grid grid-cols-6 gap-1 text-center">
        {ABILITY_LABELS.map((label, i) => (
          <div key={label} className="bg-muted/40 rounded px-1 py-0.5">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="font-medium">{abilities[i].score}</div>
            <div className="text-[10px] text-muted-foreground">{formatModifier(abilities[i].modifier)}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Skills:</span>{" "}
          <span className="text-muted-foreground">{data.skills.join(", ")}</span>
        </div>
      )}

      {/* Senses & Languages */}
      {data.senses?.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Senses:</span>{" "}
          <span className="text-muted-foreground">{data.senses.join(", ")}</span>
        </div>
      )}
      {data.languages?.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Languages:</span>{" "}
          <span className="text-muted-foreground">{data.languages.join(", ")}</span>
        </div>
      )}

      {/* Resistances & Immunities */}
      {data.damageResistances && data.damageResistances.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Resistances:</span>{" "}
          <span className="text-muted-foreground">{data.damageResistances.join(", ")}</span>
        </div>
      )}
      {data.damageImmunities && data.damageImmunities.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Immunities:</span>{" "}
          <span className="text-muted-foreground">{data.damageImmunities.join(", ")}</span>
        </div>
      )}
      {data.conditionImmunities && data.conditionImmunities.length > 0 && (
        <div>
          <span className="text-emerald-500/90 font-medium">Condition Immunities:</span>{" "}
          <span className="text-muted-foreground">{data.conditionImmunities.join(", ")}</span>
        </div>
      )}

      {/* Traits */}
      {data.traits?.length > 0 && (
        <div className="space-y-1">
          <span className="text-emerald-500/90 font-medium">Traits</span>
          {data.traits.map((trait, i) => (
            <div key={i}>
              <span className="font-medium">{trait.name}.</span>{" "}
              <span className="text-muted-foreground">{trait.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {data.actions?.length > 0 && (
        <div className="space-y-1">
          <span className="text-emerald-500/90 font-medium">Actions</span>
          {data.actions.map((action, i) => (
            <div key={i}>
              <span className="font-medium">{action.name}.</span>{" "}
              <span className="text-muted-foreground">{action.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bonus Actions */}
      {data.bonusActions && data.bonusActions.length > 0 && (
        <div className="space-y-1">
          <span className="text-emerald-500/90 font-medium">Bonus Actions</span>
          {data.bonusActions.map((action, i) => (
            <div key={i}>
              <span className="font-medium">{action.name}.</span>{" "}
              <span className="text-muted-foreground">{action.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {data.reactions && data.reactions.length > 0 && (
        <div className="space-y-1">
          <span className="text-emerald-500/90 font-medium">Reactions</span>
          {data.reactions.map((action, i) => (
            <div key={i}>
              <span className="font-medium">{action.name}.</span>{" "}
              <span className="text-muted-foreground">{action.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
