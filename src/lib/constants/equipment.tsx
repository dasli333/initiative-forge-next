import {
    Sword,
    Shield,
    Hammer,
    Package,
    Crosshair,
    CircleDot,
    Hexagon,
    Box,
    Music,
    Dna,
    Archive,
    Tent,
    Zap,
    Briefcase,
    Layers,
    LucideIcon,
    ShoppingBag
} from 'lucide-react';

export interface CategoryItem {
    id: string;
    label: string;
    color: string;
}

export interface EquipmentGroup {
    label: string;
    icon: LucideIcon;
    items: CategoryItem[];
}

/**
 * Equipment categories grouped by type with visual metadata (icons, colors)
 * Colors are distinct for each category to aid visual identification
 */
export const EQUIPMENT_GROUPS: EquipmentGroup[] = [
    {
        label: 'Weapons',
        icon: Sword,
        items: [
            {
                id: 'weapons',
                label: 'All Weapons',
                color: 'bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-300'
            },
            {
                id: 'simple-melee-weapons',
                label: 'Simple Melee Weapons',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
            },
            {
                id: 'simple-ranged-weapons',
                label: 'Simple Ranged Weapons',
                color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
            },
            {
                id: 'martial-melee-weapons',
                label: 'Martial Melee Weapons',
                color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            },
            {
                id: 'martial-ranged-weapons',
                label: 'Martial Ranged Weapons',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            },
        ],
    },
    {
        label: 'Armor',
        icon: Shield,
        items: [
            {
                id: 'armor',
                label: 'All Armor',
                color: 'bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-300'
            },
            {
                id: 'light-armor',
                label: 'Light Armor',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            },
            {
                id: 'medium-armor',
                label: 'Medium Armor',
                color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            },
            {
                id: 'heavy-armor',
                label: 'Heavy Armor',
                color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            },
            {
                id: 'shields',
                label: 'Shields',
                color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
            },
        ],
    },
    {
        label: 'Tools',
        icon: Hammer,
        items: [
            {
                id: 'tools',
                label: 'All Tools',
                color: 'bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-300'
            },
            {
                id: 'artisans-tools',
                label: "Artisan's Tools",
                color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            },
            {
                id: 'gaming-sets',
                label: 'Gaming Sets',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
            },
            {
                id: 'musical-instruments',
                label: 'Musical Instruments',
                color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800'
            },
            {
                id: 'kits',
                label: 'Kits',
                color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800'
            },
        ],
    },
    {
        label: 'Other',
        icon: Package,
        items: [
            {
                id: 'adventuring-gear',
                label: 'Adventuring Gear',
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
            },
            {
                id: 'ammunition',
                label: 'Ammunition',
                color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
            },
            {
                id: 'equipment-packs',
                label: 'Equipment Packs',
                color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300 border-lime-200 dark:border-lime-800'
            },
        ],
    },
] as const;

export interface ResolvedCategoryInfo {
    label: string;
    groupIcon: LucideIcon;
    color: string;
}

/**
 * Resolve the best display category for an item
 * Prioritizes specific categories defined in our groups over generic ones
 */
export function resolveCategoryInfo(categories: Array<{ id: string; name: string }>): ResolvedCategoryInfo {
    if (!categories || categories.length === 0) {
        return { label: 'Item', groupIcon: Box, color: 'bg-stone-100 text-stone-700' };
    }

    // Create a map for fast lookup of our known categories
    // We want to prioritize them in the order they appear in our groups (Top to bottom, but we are looking for specific matches)
    // Actually, we should check each valid category from our list against the item's categories

    for (const group of EQUIPMENT_GROUPS) {
        for (const item of group.items) {
            // Skip the "All X" categories to prefer specific ones, unless that's all there is
            if (item.id === 'weapons' || item.id === 'armor' || item.id === 'tools') continue;

            if (categories.some(c => c.id === item.id)) {
                return {
                    label: item.label,
                    groupIcon: group.icon,
                    color: item.color
                };
            }
        }
    }

    // Fallback: If no specific match, try the generic main categories
    for (const group of EQUIPMENT_GROUPS) {
        for (const item of group.items) {
            if (categories.some(c => c.id === item.id)) {
                return {
                    label: item.label,
                    groupIcon: group.icon,
                    color: item.color
                };
            }
        }
    }

    // Final fallback
    return {
        label: categories[0].name,
        groupIcon: packageIconForName(categories[0].name),
        color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
    };
}

function packageIconForName(name: string): LucideIcon {
    // Simple heuristic if needed, or just return default
    return Box;
}
