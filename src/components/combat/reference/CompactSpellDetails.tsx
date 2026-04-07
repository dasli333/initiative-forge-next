import { Badge } from "@/components/ui/badge";
import { DamageBadge } from "@/components/library";
import type { SpellDataDTO } from "@/types";

interface CompactSpellDetailsProps {
  data: SpellDataDTO;
}

function formatSpellLevel(level: number, isCantrip: boolean): string {
  if (isCantrip || level === 0) return "Cantrip";
  const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
  return `${level}${suffixes[level]} Level`;
}

function formatComponents(components: SpellDataDTO["components"]): string[] {
  const result: string[] = [];
  if (components.verbal) result.push("V");
  if (components.somatic) result.push("S");
  if (components.material) result.push("M");
  return result;
}

export function CompactSpellDetails({ data }: CompactSpellDetailsProps) {
  const components = formatComponents(data.components);

  return (
    <div className="space-y-3 text-xs">
      {/* Basic Info */}
      <div className="space-y-1">
        <div>
          <span className="text-emerald-500/90 font-medium">Level:</span>{" "}
          {formatSpellLevel(data.level, data.isCantrip)}
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">School:</span> {data.school}
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">Casting Time:</span>{" "}
          {data.castingTime.time}
          {data.castingTime.isRitual && " (Ritual)"}
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">Range:</span> {data.range}
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">Duration:</span>{" "}
          {data.duration.durationType}
          {data.duration.concentration && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
              Concentration
            </Badge>
          )}
        </div>
        <div>
          <span className="text-emerald-500/90 font-medium">Components:</span>{" "}
          {components.join(", ")}
          {data.components.material && data.components.materialDescription && (
            <span className="text-muted-foreground"> ({data.components.materialDescription})</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{data.description}</p>
      </div>

      {/* Attack/Save */}
      {(data.attackType || data.savingThrow) && (
        <div className="space-y-1">
          {data.attackType && (
            <div>
              <span className="text-emerald-500/90 font-medium">Attack Type:</span> {data.attackType}
            </div>
          )}
          {data.savingThrow && (
            <>
              <div>
                <span className="text-emerald-500/90 font-medium">Save:</span>{" "}
                {data.savingThrow.ability}
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">On Success:</span>{" "}
                <span className="text-muted-foreground">{data.savingThrow.success}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Damage */}
      {data.damage && data.damage.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.damage.map((dmg, i) => (
            <DamageBadge key={i} average={dmg.average} formula={dmg.formula} type={dmg.damageType} />
          ))}
        </div>
      )}

      {/* Higher Levels */}
      {data.higherLevels && (
        <div>
          <span className="text-emerald-500/90 font-medium">At Higher Levels:</span>{" "}
          <span className="text-muted-foreground">{data.higherLevels}</span>
        </div>
      )}

      {/* Classes */}
      {data.classes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.classes.map((cls, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
              {cls}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
