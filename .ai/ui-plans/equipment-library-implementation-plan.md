# Equipment Library Module Implementation

## Overview
Implement an Equipment Library module similar to Spells Library (`src/components/spells/`). The module provides a master-detail view for browsing D&D 5e equipment with filtering, search, and detailed information display. Additionally, create reusable HoverCard components for weapon properties, weapon mastery properties, and conditions.

## Architecture

### Component Hierarchy
```
EquipmentLibraryView (Main Container)
├── Left Panel (30% width)
│   ├── EquipmentHeader (Fixed filters)
│   │   ├── SearchBar (reuse existing)
│   │   ├── CategoryFilter (dropdown)
│   │   └── Reset Filters Button
│   └── EquipmentList (Infinite scroll)
│       └── EquipmentListItem (Individual row)
└── Right Panel (70% width)
    ├── Equipment Header (Name, badges)
    └── EquipmentDetails (Scrollable)
        ├── Basic Info Section (always)
        ├── Armor Section (conditional)
        ├── Weapon Section (conditional)
        ├── Tool Section (conditional)
        ├── Container Section (conditional)
        ├── Ammunition Section (conditional)
        └── Description Section (conditional)
```

### Reusable Hover Components (shared)
```
src/components/shared/
├── PropertyHoverCard.tsx      # Generic hover for reference data
├── WeaponPropertyBadge.tsx    # Badge + hover for weapon properties
├── MasteryPropertyBadge.tsx   # Badge + hover for mastery properties
└── ConditionHoverBadge.tsx    # Badge + hover for conditions (refactor existing)
```

---

## Phase 1: Shared Hover Components

### 1. `src/components/shared/PropertyHoverCard.tsx`
Generic HoverCard wrapper for reference data with bilingual support.

**Props:**
```typescript
interface PropertyHoverCardProps {
  name: { en: string; pl: string };
  description: string;
  children: React.ReactNode; // Trigger element
  side?: "top" | "right" | "bottom" | "left";
}
```

**Features:**
- Uses `HoverCard` from `@/components/ui/hover-card`
- `openDelay={200}` for quick response
- Displays both EN and PL names (EN primary, PL secondary)
- Description with `whitespace-pre-line`
- Uses `useLanguageStore` for primary language display

### 2. `src/components/shared/WeaponPropertyBadge.tsx`
Badge displaying weapon property with hover tooltip.

**Props:**
```typescript
interface WeaponPropertyBadgeProps {
  propertyId: string;
  propertyName: string; // From equipment data
}
```

**Features:**
- Fetches full property data via `useWeaponProperties()` hook
- Displays property name as Badge
- Hover shows full description with both language names
- Graceful fallback if property not found

### 3. `src/components/shared/MasteryPropertyBadge.tsx`
Badge displaying weapon mastery property with hover tooltip.

**Props:**
```typescript
interface MasteryPropertyBadgeProps {
  masteryId: string;
  masteryName: string;
}
```

**Features:**
- Same pattern as WeaponPropertyBadge
- Uses `useWeaponMasteryProperties()` hook
- Different badge color (purple variant)

### 4. Refactor `src/components/combat/initiative/ConditionBadge.tsx`
Extract reusable hover logic into shared component.

---

## Phase 2: Equipment Library Components

### 1. `src/components/equipment/EquipmentLibraryView.tsx`
Main container component managing state and layout.

**State:**
- `searchQuery` + `debouncedSearchQuery` (300ms debounce)
- `category: string | null` - Selected category filter
- `selectedEquipmentId: string | null`

**Layout:**
- Same split pattern as SpellsLibraryView (30/70)
- Left panel: min-w-[500px] w-[30%]
- Right panel: w-[70%]

### 2. `src/components/equipment/EquipmentHeader.tsx`
Header with search, filters, and title.

**Props:**
```typescript
interface EquipmentHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  onResetFilters: () => void;
}
```

### 3. `src/components/equipment/CategoryFilter.tsx`
Dropdown for equipment category filtering.

**Categories (from equipment_categories):**
- "All Categories" → `null`
- Weapon (Simple Melee, Simple Ranged, Martial Melee, Martial Ranged)
- Armor (Light Armor, Medium Armor, Heavy Armor, Shield)
- Tools (Artisan's Tools, Gaming Sets, Musical Instruments)
- Adventuring Gear
- Ammunition
- Equipment Packs

### 4. `src/components/equipment/EquipmentList.tsx`
Infinite scroll list of equipment items.

**Props:**
```typescript
interface EquipmentListProps {
  equipment: EquipmentDTO[];
  selectedEquipmentId: string | null;
  isLoading: boolean;
  isError: boolean;
  onEquipmentClick: (id: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  refetch?: () => void;
}
```

### 5. `src/components/equipment/EquipmentListItem.tsx`
Individual equipment row with metadata badges.

**Display:**
```
┌─────────────────────────────────────┐
│ Longsword (equipment name)          │
│ [Weapon] [Martial Melee] [15 gp]    │
└─────────────────────────────────────┘
```

**Badges:**
- Primary category (color-coded)
- Cost (if exists)
- Weight (if exists)

### 6. `src/components/equipment/EquipmentDetails.tsx`
Comprehensive details panel with conditional sections.

**Sections:**

**Basic Info (always):**
- Name (bilingual)
- Categories
- Cost
- Weight

**Armor Section** (if `armor_class` exists):
- AC (base + dex bonus info)
- Don/Doff time
- Stealth disadvantage indicator
- Strength minimum requirement

**Weapon Section** (if `damage` exists):
- Damage (formula + type) using DamageBadge
- Two-handed damage (if versatile)
- Range (normal/long)
- Throw range (if thrown)
- Properties list with WeaponPropertyBadge hover
- Mastery with MasteryPropertyBadge hover
- Required ammunition

**Tool Section** (if `ability` or `craft` or `utilize` exists):
- Associated ability
- Craftable items
- Utilize actions with DC

**Container Section** (if `contents` exists):
- List of contained items with quantities

**Ammunition Section** (if `quantity` exists):
- Quantity per bundle
- Storage container

**Description Section** (if `description` exists):
- Full description text

---

## Phase 3: Routing & Integration

### 1. Create route `src/app/(dashboard)/equipment/page.tsx`
Simple page rendering EquipmentLibraryView.

### 2. Add navigation link
Add "Equipment" link to sidebar/navigation (check existing nav structure).

---

## Files to Create

**Shared Components:**
- `src/components/shared/PropertyHoverCard.tsx`
- `src/components/shared/WeaponPropertyBadge.tsx`
- `src/components/shared/MasteryPropertyBadge.tsx`

**Equipment Library:**
- `src/components/equipment/EquipmentLibraryView.tsx`
- `src/components/equipment/EquipmentHeader.tsx`
- `src/components/equipment/CategoryFilter.tsx`
- `src/components/equipment/EquipmentList.tsx`
- `src/components/equipment/EquipmentListItem.tsx`
- `src/components/equipment/EquipmentDetails.tsx`
- `src/components/equipment/index.ts` (barrel export)

**Route:**
- `src/app/(dashboard)/equipment/page.tsx`

## Files to Modify

- `src/hooks/useEquipment.ts` - Add `useInfiniteEquipment()` for pagination
- Navigation component (to add Equipment link)

## Existing Files to Reference

- `src/components/spells/SpellsLibraryView.tsx` - Main pattern
- `src/components/spells/SpellDetails.tsx` - Conditional sections
- `src/components/library/` - Shared library components
- `src/hooks/useSpells.ts` - Infinite query pattern
- `src/components/combat/initiative/ConditionBadge.tsx` - Hover pattern

---

## Design Decisions

- **Category filter**: Flat list (simple dropdown with all categories)
- **Color scheme**: Same emerald accent as Spells library for consistency
- **Navigation**: Same level as Spells (global library section)
