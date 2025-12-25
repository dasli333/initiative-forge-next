import { Badge } from "@/components/ui/badge";
import { Clock, Info, Sparkles, Swords, Target, Zap } from "lucide-react";
import { GradientSeparator, SectionHeader, SurfaceContainer, PillGroup, DamageBadge } from "@/components/library";
import type { SpellDataDTO } from "@/types";

/**
 * Props for SpellDetails component
 */
interface SpellDetailsProps {
  /**
   * Spell data to display
   */
  data: SpellDataDTO;
}

/**
 * Helper function to format spell level for display
 */
function formatSpellLevel(level: number, isCantrip: boolean): string {
  if (isCantrip || level === 0) {
    return "Cantrip";
  }

  const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
  return `${level}${suffixes[level]} Level`;
}

/**
 * Helper function to format component badges (V, S, M)
 */
function formatComponents(components: SpellDataDTO["components"]): string[] {
  const result: string[] = [];
  if (components.verbal) result.push("V");
  if (components.somatic) result.push("S");
  if (components.material) result.push("M");
  return result;
}

/**
 * Comprehensive spell details component displaying all spell information
 * Used inside the right panel when a spell is selected
 *
 * Sections:
 * - Basic Info (Level, School, Casting Time, Range, Duration)
 * - Components (V, S, M with material description)
 * - Description
 * - Attack/Save Info (conditional)
 * - Damage/Healing (conditional)
 * - Higher Levels (conditional)
 * - Available Classes
 *
 * @param data - Full spell data from API
 */
export function SpellDetails({ data }: SpellDetailsProps) {
  const components = formatComponents(data.components);

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <section className="max-w-[600px]">
        <SectionHeader icon={Info} title="Basic Info" />
        <SurfaceContainer>
          <div className="grid grid-cols-2 gap-8 text-sm">
            {/* Column 1: Level, School, Casting Time */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">Level:</span>{" "}
                <span className="text-foreground font-medium">{formatSpellLevel(data.level, data.isCantrip)}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">School:</span>{" "}
                <span className="text-foreground font-medium">{data.school}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Casting Time:</span>{" "}
                <span className="text-foreground font-medium">
                  {data.castingTime.time}
                  {data.castingTime.isRitual && " (Ritual)"}
                </span>
              </div>
            </div>

            {/* Column 2: Range, Duration */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">Range:</span>{" "}
                <span className="text-foreground font-medium">{data.range}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Duration:</span>{" "}
                <span className="text-foreground font-medium">
                  {data.duration.durationType}
                  {data.duration.concentration && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Concentration
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          </div>
        </SurfaceContainer>
      </section>

      <GradientSeparator />

      {/* Components Section */}
      <section className="max-w-[600px]">
        <SectionHeader icon={Sparkles} title="Components" />
        <SurfaceContainer className="space-y-3 text-sm">
          <PillGroup label="Required:" items={components} variant="info" />
          {data.components.material && data.components.materialDescription && (
            <div>
              <span className="text-emerald-500/90 font-medium">Materials:</span>{" "}
              <span className="text-muted-foreground">{data.components.materialDescription}</span>
            </div>
          )}
        </SurfaceContainer>
      </section>

      <GradientSeparator />

      {/* Description Section */}
      <section>
        <SectionHeader icon={Clock} title="Description" />
        <SurfaceContainer>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{data.description}</p>
        </SurfaceContainer>
      </section>

      {/* Attack/Save Info (conditional) */}
      {(data.attackType || data.savingThrow) && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Target} title="Attack / Save" />
            <SurfaceContainer className="space-y-2 text-sm">
              {data.attackType && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Attack Type:</span>{" "}
                  <span className="text-foreground font-medium">{data.attackType}</span>
                </div>
              )}
              {data.savingThrow && (
                <>
                  <div>
                    <span className="text-emerald-500/90 font-medium">Saving Throw:</span>{" "}
                    <span className="text-foreground font-medium">{data.savingThrow.ability}</span>
                  </div>
                  <div>
                    <span className="text-emerald-500/90 font-medium">On Success:</span>{" "}
                    <span className="text-muted-foreground">{data.savingThrow.success}</span>
                  </div>
                </>
              )}
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Damage/Healing (conditional) */}
      {data.damage && data.damage.length > 0 && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Swords} title="Damage / Healing" />
            <div className="flex flex-wrap gap-2">
              {data.damage.map((dmg, index) => (
                <DamageBadge key={index} average={dmg.average} formula={dmg.formula} type={dmg.damageType} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Higher Levels (conditional) */}
      {data.higherLevels && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Zap} title="At Higher Levels" />
            <SurfaceContainer>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.higherLevels}</p>
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Available Classes */}
      {data.classes.length > 0 && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Sparkles} title="Available Classes" />
            <div className="flex flex-wrap gap-2">
              {data.classes.map((className, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                  {className}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
