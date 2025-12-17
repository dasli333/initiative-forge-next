'use client';

import { Badge } from '@/components/ui/badge';
import {
  Info,
  Shield,
  Swords,
  Wrench,
  Package,
  Target,
  FileText,
} from 'lucide-react';
import {
  GradientSeparator,
  SectionHeader,
  SurfaceContainer,
  DamageBadge,
} from '@/components/library';
import { WeaponPropertyBadge } from '@/components/shared/WeaponPropertyBadge';
import { MasteryPropertyBadge } from '@/components/shared/MasteryPropertyBadge';
import type { EquipmentDataDTO } from '@/types';

interface EquipmentDetailsProps {
  /** Equipment data to display */
  data: EquipmentDataDTO;
}

/**
 * Format cost for display (e.g., "15 gp", "5 sp")
 */
function formatCost(cost?: { quantity: number; unit: string }): string {
  if (!cost) return 'N/A';
  return `${cost.quantity} ${cost.unit}`;
}

/**
 * Format weight for display (e.g., "3 lb")
 */
function formatWeight(weight?: number): string {
  if (weight === undefined || weight === null) return 'N/A';
  return `${weight} lb`;
}

/**
 * Format armor class for display
 */
function formatArmorClass(ac?: { base: number; dex_bonus: boolean; max_bonus?: number }): string {
  if (!ac) return 'N/A';
  let result = `${ac.base}`;
  if (ac.dex_bonus) {
    if (ac.max_bonus !== undefined) {
      result += ` + DEX (max ${ac.max_bonus})`;
    } else {
      result += ' + DEX';
    }
  }
  return result;
}

/**
 * Format range for display
 */
function formatRange(range?: { normal: number; long?: number }): string {
  if (!range) return 'N/A';
  if (range.long) {
    return `${range.normal}/${range.long} ft`;
  }
  return `${range.normal} ft`;
}

/**
 * Comprehensive equipment details component displaying all equipment information
 * Used inside the right panel when equipment is selected
 *
 * Sections (conditional based on equipment type):
 * - Basic Info (always): Categories, Cost, Weight
 * - Armor Section (if armor_class): AC, don/doff time, stealth disadvantage
 * - Weapon Section (if damage): Damage, range, properties, mastery
 * - Tool Section (if ability/craft/utilize): Associated abilities and actions
 * - Container Section (if contents): Contained items
 * - Ammunition Section (if quantity): Bundle quantity, storage
 * - Description (if exists)
 */
export function EquipmentDetails({ data }: EquipmentDetailsProps) {
  const hasArmorSection = data.armor_class !== undefined;
  const hasWeaponSection = data.damage !== undefined;
  const hasToolSection =
    data.ability !== undefined || (data.craft && data.craft.length > 0) || (data.utilize && data.utilize.length > 0);
  const hasContainerSection = data.contents && data.contents.length > 0;
  const hasAmmunitionSection = data.quantity !== undefined;
  const hasDescription = data.description && data.description.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Basic Info Section (always shown) */}
      <section className="max-w-[600px]">
        <SectionHeader icon={Info} title="Basic Info" />
        <SurfaceContainer>
          <div className="grid grid-cols-2 gap-8 text-sm">
            {/* Column 1: Categories */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">Categories:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.equipment_categories.map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="text-xs">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Cost, Weight */}
            <div className="space-y-2">
              <div>
                <span className="text-emerald-500/90 font-medium">Cost:</span>{' '}
                <span className="text-foreground font-medium">{formatCost(data.cost)}</span>
              </div>
              <div>
                <span className="text-emerald-500/90 font-medium">Weight:</span>{' '}
                <span className="text-foreground font-medium">{formatWeight(data.weight)}</span>
              </div>
            </div>
          </div>
        </SurfaceContainer>
      </section>

      {/* Armor Section */}
      {hasArmorSection && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Shield} title="Armor" />
            <SurfaceContainer className="space-y-2 text-sm">
              <div>
                <span className="text-emerald-500/90 font-medium">Armor Class:</span>{' '}
                <span className="text-foreground font-medium">{formatArmorClass(data.armor_class)}</span>
              </div>
              {data.don_time && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Don Time:</span>{' '}
                  <span className="text-foreground font-medium">{data.don_time}</span>
                </div>
              )}
              {data.doff_time && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Doff Time:</span>{' '}
                  <span className="text-foreground font-medium">{data.doff_time}</span>
                </div>
              )}
              {data.stealth_disadvantage && (
                <div>
                  <Badge variant="destructive" className="text-xs">
                    Stealth Disadvantage
                  </Badge>
                </div>
              )}
              {data.str_minimum !== undefined && data.str_minimum > 0 && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Strength Required:</span>{' '}
                  <span className="text-foreground font-medium">{data.str_minimum}</span>
                </div>
              )}
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Weapon Section */}
      {hasWeaponSection && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Swords} title="Weapon" />
            <SurfaceContainer className="space-y-3 text-sm">
              {/* Damage */}
              <div>
                <span className="text-emerald-500/90 font-medium">Damage:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.damage && (
                    <DamageBadge formula={data.damage.formula} type={data.damage.damageType} />
                  )}
                </div>
              </div>

              {/* Two-handed damage (versatile weapons) */}
              {data.two_handed_damage && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Two-Handed:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <DamageBadge formula={data.two_handed_damage.formula} type={data.two_handed_damage.damageType} />
                  </div>
                </div>
              )}

              {/* Range */}
              {data.range && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Range:</span>{' '}
                  <span className="text-foreground font-medium">{formatRange(data.range)}</span>
                </div>
              )}

              {/* Throw Range */}
              {data.throw_range && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Throw Range:</span>{' '}
                  <span className="text-foreground font-medium">
                    {data.throw_range.normal}/{data.throw_range.long} ft
                  </span>
                </div>
              )}

              {/* Weapon Properties with hover */}
              {data.properties && data.properties.length > 0 && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Properties:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.properties.map((prop) => (
                      <WeaponPropertyBadge key={prop.id} propertyId={prop.id} propertyName={prop.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mastery with hover */}
              {data.mastery && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Mastery:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <MasteryPropertyBadge masteryId={data.mastery.id} masteryName={data.mastery.name} />
                  </div>
                </div>
              )}

              {/* Ammunition */}
              {data.ammunition && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Ammunition:</span>{' '}
                  <span className="text-foreground font-medium">{data.ammunition.name}</span>
                </div>
              )}
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Tool Section */}
      {hasToolSection && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Wrench} title="Tool" />
            <SurfaceContainer className="space-y-3 text-sm">
              {data.ability && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Associated Ability:</span>{' '}
                  <span className="text-foreground font-medium">{data.ability.name}</span>
                </div>
              )}

              {data.craft && data.craft.length > 0 && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Can Craft:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.craft.map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-xs">
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.utilize && data.utilize.length > 0 && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Utilize Actions:</span>
                  <div className="space-y-2 mt-1">
                    {data.utilize.map((action, index) => (
                      <div key={index} className="bg-muted/30 rounded p-2">
                        <div className="font-medium text-foreground">{action.name}</div>
                        <div className="text-xs text-muted-foreground">
                          DC {action.dc.dc_value} {action.dc.dc_type.name} ({action.dc.success_type})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Container Section */}
      {hasContainerSection && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Package} title="Contents" />
            <SurfaceContainer>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {data.contents!.map((content, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted/30 rounded px-2 py-1">
                    <span className="text-foreground">{content.item.name}</span>
                    <span className="text-muted-foreground text-xs">x{content.quantity}</span>
                  </div>
                ))}
              </div>
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Ammunition Section */}
      {hasAmmunitionSection && (
        <>
          <GradientSeparator />
          <section className="max-w-[600px]">
            <SectionHeader icon={Target} title="Ammunition" />
            <SurfaceContainer className="space-y-2 text-sm">
              <div>
                <span className="text-emerald-500/90 font-medium">Quantity per Bundle:</span>{' '}
                <span className="text-foreground font-medium">{data.quantity}</span>
              </div>
              {data.storage && (
                <div>
                  <span className="text-emerald-500/90 font-medium">Storage:</span>{' '}
                  <span className="text-foreground font-medium">{data.storage.name}</span>
                </div>
              )}
            </SurfaceContainer>
          </section>
        </>
      )}

      {/* Description Section */}
      {hasDescription && (
        <>
          <GradientSeparator />
          <section>
            <SectionHeader icon={FileText} title="Description" />
            <SurfaceContainer>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {data.description}
              </p>
            </SurfaceContainer>
          </section>
        </>
      )}
    </div>
  );
}
