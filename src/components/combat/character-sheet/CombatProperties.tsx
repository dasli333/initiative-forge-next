// Display combat properties like resistances, immunities, and gear

import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldBan, Activity, Package } from "lucide-react";

interface CombatPropertiesProps {
  damageVulnerabilities?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  gear?: string[];
}

export function CombatProperties({
  damageVulnerabilities,
  damageResistances,
  damageImmunities,
  conditionImmunities,
  gear,
}: CombatPropertiesProps) {
  // Don't render if no properties are available
  const hasAnyProperty =
    (damageVulnerabilities && damageVulnerabilities.length > 0) ||
    (damageResistances && damageResistances.length > 0) ||
    (damageImmunities && damageImmunities.length > 0) ||
    (conditionImmunities && conditionImmunities.length > 0) ||
    (gear && gear.length > 0);

  if (!hasAnyProperty) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Damage Vulnerabilities */}
      {damageVulnerabilities && damageVulnerabilities.length > 0 && (
        <PropertyGroup icon={ShieldAlert} label="Vulnerabilities" items={damageVulnerabilities} variant="destructive" />
      )}

      {/* Damage Resistances */}
      {damageResistances && damageResistances.length > 0 && (
        <PropertyGroup icon={Shield} label="Resistances" items={damageResistances} variant="secondary" />
      )}

      {/* Damage Immunities */}
      {damageImmunities && damageImmunities.length > 0 && (
        <PropertyGroup icon={ShieldBan} label="Damage Immunities" items={damageImmunities} variant="outline" />
      )}

      {/* Condition Immunities */}
      {conditionImmunities && conditionImmunities.length > 0 && (
        <PropertyGroup icon={Activity} label="Condition Immunities" items={conditionImmunities} variant="outline" />
      )}

      {/* Gear */}
      {gear && gear.length > 0 && <PropertyGroup icon={Package} label="Gear" items={gear} variant="default" />}
    </div>
  );
}

interface PropertyGroupProps {
  icon: React.ElementType;
  label: string;
  items: string[];
  variant: "default" | "secondary" | "destructive" | "outline";
}

function PropertyGroup({ icon: Icon, label, items, variant }: PropertyGroupProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <Badge key={index} variant={variant} className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
