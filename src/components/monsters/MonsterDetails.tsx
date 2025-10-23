import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Dumbbell, Sparkles, Swords, Zap, Shield } from "lucide-react";
import {
  GradientSeparator,
  SectionHeader,
  SurfaceContainer,
  PillGroup,
  DamageBadge,
  AttackBadge,
} from "@/components/library";
import { formatModifier } from "@/lib/utils/library";
import type { MonsterDataDTO } from "@/types";

/**
 * Props for MonsterDetails component
 */
interface MonsterDetailsProps {
  /**
   * Monster data to display
   */
  data: MonsterDataDTO;
}

/**
 * Comprehensive monster details component displaying all monster statistics
 * Used inside the MonsterSlideover
 *
 * Sections:
 * - Basic Info (Size, Type, Alignment, AC, HP, Speed)
 * - Ability Scores Table (STR, DEX, CON, INT, WIS, CHA)
 * - Skills, Senses, Languages
 * - Traits (Accordion)
 * - Actions (Accordion)
 * - Bonus Actions (Accordion - conditional)
 * - Reactions (Accordion - conditional)
 *
 * @param data - Full monster data from API
 */
export function MonsterDetails({ data }: MonsterDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <section className="max-w-[600px]">
        <SectionHeader icon={Info} title="Basic Info" />
        <SurfaceContainer>
          <div className="grid grid-cols-2 gap-8 text-sm">
            {/* Column 1: Type, Size, Alignment */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">Type:</span>{" "}
                <span className="text-foreground font-medium">{data.type}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Size:</span>{" "}
                <span className="text-foreground font-medium">{data.size}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Alignment:</span>{" "}
                <span className="text-foreground font-medium">{data.alignment}</span>
              </div>
            </div>

            {/* Column 2: HP, AC, Speed */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">HP:</span>{" "}
                <span className="text-foreground font-medium">
                  {data.hitPoints.average} ({data.hitPoints.formula})
                </span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">AC:</span>{" "}
                <span className="text-foreground font-medium">{data.armorClass}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Speed:</span>{" "}
                <span className="text-foreground font-medium">{data.speed.join(", ")}</span>
              </div>
            </div>
          </div>
        </SurfaceContainer>
      </section>

      <GradientSeparator />

      {/* Ability Scores Table */}
      <section className="max-w-[600px]">
        <SectionHeader icon={Dumbbell} title="Ability Scores" />
        <div className="rounded-lg overflow-hidden border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-center font-semibold">STR</TableHead>
                <TableHead className="text-center font-semibold">DEX</TableHead>
                <TableHead className="text-center font-semibold">CON</TableHead>
                <TableHead className="text-center font-semibold">INT</TableHead>
                <TableHead className="text-center font-semibold">WIS</TableHead>
                <TableHead className="text-center font-semibold">CHA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.strength.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.strength.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.strength.modifier)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.dexterity.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.dexterity.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.dexterity.modifier)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.constitution.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.constitution.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.constitution.modifier)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.intelligence.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.intelligence.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.intelligence.modifier)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.wisdom.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.wisdom.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.wisdom.modifier)})
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">{data.abilityScores.charisma.score}</div>
                  <span
                    className={`text-xs font-medium ${
                      data.abilityScores.charisma.modifier >= 0 ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    ({formatModifier(data.abilityScores.charisma.modifier)})
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <GradientSeparator />

      {/* Skills, Senses, Languages */}
      <SurfaceContainer className="space-y-3 text-sm">
        <PillGroup label="Skills:" items={data.skills} />
        <PillGroup label="Senses:" items={data.senses} />
        <PillGroup label="Languages:" items={data.languages} />
        <PillGroup label="Damage Vulnerabilities:" items={data.damageVulnerabilities} variant="danger" />
        <PillGroup label="Damage Resistances:" items={data.damageResistances} variant="info" />
        <PillGroup label="Damage Immunities:" items={data.damageImmunities} variant="success" />
        <PillGroup label="Condition Immunities:" items={data.conditionImmunities} variant="purple" />
      </SurfaceContainer>

      {/* Traits Accordion */}
      {data.traits.length > 0 && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Sparkles} title="Traits" />
            <Accordion type="multiple">
              {data.traits.map((trait, index) => (
                <AccordionItem key={`trait-${index}`} value={`trait-${index}`}>
                  <AccordionTrigger className="text-base font-semibold text-foreground">{trait.name}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {trait.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </>
      )}

      {/* Actions Accordion */}
      {data.actions.length > 0 && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Swords} title="Actions" />
            <Accordion type="multiple">
              {data.actions.map((action, index) => (
                <AccordionItem key={`action-${index}`} value={`action-${index}`}>
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
      )}

      {/* Bonus Actions Accordion (conditional) */}
      {data.bonusActions.length > 0 && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Zap} title="Bonus Actions" />
            <Accordion type="multiple">
              {data.bonusActions.map((action, index) => (
                <AccordionItem key={`bonus-${index}`} value={`bonus-${index}`}>
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
      )}

      {/* Reactions Accordion (conditional) */}
      {data.reactions.length > 0 && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={Shield} title="Reactions" />
            <Accordion type="multiple">
              {data.reactions.map((action, index) => (
                <AccordionItem key={`reaction-${index}`} value={`reaction-${index}`}>
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
      )}
    </div>
  );
}
