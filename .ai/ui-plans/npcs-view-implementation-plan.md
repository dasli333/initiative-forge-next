# Plan implementacji widoku NPCs

## 1. Przegląd

Widok NPCs zapewnia kompleksowe narzędzie do zarządzania postaciami niezależnymi (NPCs) w kampanii RPG z systemem dual-tab (Story + Combat). Głównym celem jest umożliwienie Mistrzowi Gry tworzenia NPCs z bogatymi informacjami fabularnymi w zakładce Story oraz opcjonalnymi statystykami walki w zakładce Combat. Widok oferuje grid NPC cards z filtrowaniem (faction, location, status), rich text editor z @mentions, upload obrazów z kompresją WebP, zarządzanie relacjami między NPCs oraz możliwość użycia NPC w module combat.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/campaigns/[id]/npcs`

Dynamiczny parametr `[id]` reprezentuje identyfikator kampanii (campaign ID).

## 3. Struktura komponentów

```
NPCsView (główny widok, src/app/(dashboard)/campaigns/[id]/npcs/page.tsx)
├── NPCsHeader
│   ├── Breadcrumb (shadcn)
│   ├── H1: "NPCs"
│   ├── Filters (inline)
│   │   ├── FactionMultiSelect (multi-select dropdown)
│   │   ├── LocationSelect (select dropdown)
│   │   └── StatusSelect (alive/dead/unknown)
│   └── AddNPCButton (Dialog trigger, emerald button)
├── NPCGrid (3 kolumny na 1280px+, 2 na 1024px)
│   └── NPCCard[]
│       ├── NPCImage (square, 200px)
│       ├── NPCName (H3)
│       ├── RoleBadge (Quest Giver/Tavernkeeper/Villain/etc)
│       ├── FactionBadge (jeśli assigned)
│       ├── LocationBadge (jeśli assigned)
│       ├── StatusIndicator (alive: emerald dot, dead: red X, unknown: gray ?)
│       ├── CombatReadyBadge (jeśli has combat stats)
│       └── Click → open NPC detail slideover
├── NPCsEmptyState (gdy brak NPCs)
│   ├── EmptyStateMessage: "No NPCs yet"
│   └── AddNPCButton
└── NPCDetailSlideover (Shadcn Sheet, from right, width 600px)
    ├── SlideoverHeader
    │   ├── NPCName (H2)
    │   ├── EditButton
    │   └── CloseButton
    ├── Tabs (Shadcn Tabs): [Story] [Combat] [Relationships]
    │   ├── StoryTab
    │   │   ├── NPCImage
    │   │   ├── RoleInput (edytowalny)
    │   │   ├── FactionSelect (autocomplete)
    │   │   ├── CurrentLocationSelect (autocomplete)
    │   │   ├── StatusRadio (alive/dead/unknown)
    │   │   ├── BiographyEditor (Tiptap Rich Text z @mentions)
    │   │   ├── PersonalityEditor (Tiptap Rich Text)
    │   │   └── BacklinksSection ("Mentioned In" lista)
    │   ├── CombatTab
    │   │   ├── NoCombatStatsState (jeśli brak stats)
    │   │   │   └── AddCombatStatsButton
    │   │   └── CombatStatsForm (jeśli są stats)
    │   │       ├── BasicStatsInputs (HP Max, AC, Speed - inline editable)
    │   │       ├── AbilityScoresGrid (STR/DEX/CON/INT/WIS/CHA)
    │   │       ├── ActionsList (podobnie jak Player Characters)
    │   │       │   ├── ActionItem[]
    │   │       │   └── ActionBuilder (Name, Type, Attack Bonus, Reach/Range, Damage Dice, Damage Bonus, Damage Type)
    │   │       ├── UseInCombatButton → otwiera combat wizard z NPC preselected
    │   │       └── RemoveCombatStatsButton (destructive)
    │   └── RelationshipsTab
    │       ├── RelationshipsList
    │       │   └── RelationshipItem[]
    │       │       ├── NPCAvatar + Name
    │       │       ├── RelationshipTypeInput (brother/enemy/friend)
    │       │       ├── DescriptionInput (optional)
    │       │       └── StrengthSlider (0-100)
    │       └── AddRelationshipButton
└── NPCFormDialog (Full Screen lub Large Dialog)
    ├── MultiStepForm (React Hook Form + Zod)
    │   ├── Step 1: Basic Info
    │   │   ├── NameInput (required)
    │   │   ├── RoleInput
    │   │   ├── FactionSelect (autocomplete)
    │   │   ├── CurrentLocationSelect (autocomplete)
    │   │   ├── StatusRadio (alive/dead/unknown)
    │   │   └── ImageUpload (drag & drop zone, max 5 MB)
    │   ├── Step 2: Story
    │   │   ├── BiographyEditor (Tiptap Rich Text z @mentions)
    │   │   └── PersonalityEditor (Tiptap Rich Text)
    │   └── Step 3: Combat (optional)
    │       ├── AddCombatStatsCheckbox ("Add Combat Stats")
    │       └── CombatStatsForm (enabled gdy checkbox zaznaczony)
    │           ├── BasicStatsInputs (HP Max, AC, Speed)
    │           ├── AbilityScoresGrid (STR/DEX/CON/INT/WIS/CHA)
    │           └── ActionsList
    └── DialogFooter
        ├── BackButton (jeśli nie step 1)
        ├── NextButton (jeśli nie last step)
        ├── CancelButton
        └── SubmitButton ("Create NPC" / "Save Changes", jeśli last step)
```

## 4. Szczegóły komponentów

### 4.1. NPCsView (główny widok)

**Opis:** Root komponent widoku, odpowiada za orchestrację wszystkich pozostałych komponentów oraz zarządzanie wysokopoziomowym stanem widoku (filtry, wybrana NPC, otwarte dialogi).

**Główne elementy:**
- Kontener typu "flex flex-col h-full"
- NPCsHeader jako pierwsza sekcja z filtrami inline
- NPCGrid zajmujący pozostałą przestrzeń (flex-1) lub NPCsEmptyState (jeśli brak NPCs)
- NPCDetailSlideover renderowany warunkowo (Shadcn Sheet component)
- NPCFormDialog renderowany warunkowo

**Obsługiwane zdarzenia:**
- `onNPCSelect(npcId: string)` - obsługa wyboru NPC z gridu → otwarcie slideover
- `onOpenCreateDialog()` - otwarcie dialogu tworzenia nowego NPC
- `onOpenEditDialog(npcId: string)` - otwarcie dialogu edycji NPC
- `onCloseDialog()` - zamknięcie dialogu/slideover
- `onFilterChange(filters: NPCFilters)` - aktualizacja filtrów (faction, location, status)

**Warunki walidacji:**
- Sprawdzenie czy użytkownik ma dostęp do kampanii (campaign ID z URL)
- Walidacja czy campaign ID jest poprawnym UUID
- Obsługa stanu ładowania przy pobieraniu listy NPCs

**Typy:**
- `NPC` - główny typ reprezentujący NPC z bazy danych
- `CreateNPCCommand` - typ dla tworzenia nowego NPC
- `UpdateNPCCommand` - typ dla aktualizacji NPC
- `NPCFilters` - typ dla filtrów (faction_id, location_id, status)

**Propsy:**
- `params: { id: string }` - parametr z Next.js App Router (campaign ID)

### 4.2. NPCsHeader

**Opis:** Nagłówek widoku zawierający breadcrumb, tytuł, filtry inline i przycisk dodawania NPC.

**Główne elementy:**
- Breadcrumb (shadcn) z linkami: "My Campaigns" → "[Campaign Name]" → "NPCs"
- H1 z tekstem "NPCs"
- Filtry inline:
  - FactionMultiSelect (multi-select dropdown, wyświetla badges wybranych frakcji)
  - LocationSelect (single select dropdown)
  - StatusSelect (alive/dead/unknown, single select)
- Button z ikoną "+" i tekstem "Add NPC" (variant: emerald)

**Obsługiwane zdarzenia:**
- `onClick` na AddNPCButton - trigger dialog tworzenia NPC
- `onChange` na filtrach - aktualizacja filtrów → refetch NPCs z nowymi parametrami query

**Warunki walidacji:**
- Brak specyficznych warunków walidacji

**Typy:**
- `NPCFilters` - typ filtrów
- `Faction` - typ frakcji (dla FactionMultiSelect)
- `Location` - typ lokacji (dla LocationSelect)

**Propsy:**
```typescript
interface NPCsHeaderProps {
  campaignName: string;
  campaignId: string;
  filters: NPCFilters;
  onFiltersChange: (filters: NPCFilters) => void;
  onAddNPCClick: () => void;
}
```

### 4.3. NPCGrid

**Opis:** Grid wyświetlający karty NPCs z responsywnym layoutem (3 kolumny na dużych ekranach, 2 na średnich).

**Główne elementy:**
- Grid layout: `grid grid-cols-2 lg:grid-cols-3 gap-6`
- NPCCard[] dla każdego NPC
- Skeleton loading state podczas pobierania danych

**Obsługiwane zdarzenia:**
- `onClick(npcId: string)` - wybór NPC → otwarcie slideover

**Warunki walidacji:**
- Filtrowanie NPCs na podstawie aktywnych filtrów (faction_id, location_id, status)

**Typy:**
- `NPC` - podstawowy typ NPC
- `NPCCardViewModel` - rozszerzony typ z dodatkowymi danymi:
  ```typescript
  interface NPCCardViewModel {
    npc: NPC;
    hasCombatStats: boolean;
    factionName?: string;
    locationName?: string;
  }
  ```

**Propsy:**
```typescript
interface NPCGridProps {
  npcs: NPC[];
  onNPCSelect: (npcId: string) => void;
  isLoading: boolean;
}
```

### 4.4. NPCCard

**Opis:** Karta reprezentująca pojedynczego NPC w gridzie, wyświetla obraz, nazwę, rolę, przypisania i status.

**Główne elementy:**
- Image (jeśli image_url istnieje) - square, wysokość 200px, object-fit: cover
- Nazwa NPC (H3, truncate dla długich nazw)
- RoleBadge (kolorowy badge z ikoną, np. "Quest Giver", "Tavernkeeper")
- FactionBadge (jeśli faction_id assigned, pokazuje nazwę frakcji)
- LocationBadge (jeśli current_location_id assigned, pokazuje nazwę lokacji)
- StatusIndicator:
  - alive: emerald dot (zielona kropka)
  - dead: red X (czerwony krzyżyk)
  - unknown: gray ? (szary znak zapytania)
- CombatReadyBadge (jeśli has combat stats, badge "Combat Ready" z ikoną miecza)
- Hover effect dla interaktywności (border highlight, scale up slightly)

**Obsługiwane zdarzenia:**
- `onClick` - wybór NPC → wywołanie onNPCSelect(npcId)

**Warunki walidacji:**
- Brak specyficznych warunków

**Typy:**
- `NPCCardViewModel` (jak wyżej)

**Propsy:**
```typescript
interface NPCCardProps {
  npc: NPCCardViewModel;
  onClick: (npcId: string) => void;
}
```

### 4.5. NPCDetailSlideover

**Opis:** Slideover panel (Shadcn Sheet) otwierający się z prawej strony (width 600px) z trzema zakładkami: Story, Combat, Relationships.

**Główne elementy:**
- Sheet (shadcn) z side="right" i width 600px
- SlideoverHeader:
  - H2 z nazwą NPC
  - EditButton (otwiera NPCFormDialog w trybie edit)
  - CloseButton
- Tabs (shadcn Tabs) z trzema zakładkami:
  - StoryTab
  - CombatTab
  - RelationshipsTab

**Obsługiwane zdarzenia:**
- `onClose()` - zamknięcie slideover
- `onEdit(npcId: string)` - otwarcie dialogu edycji
- `onTabChange(tab: string)` - zmiana aktywnej zakładki

**Warunki walidacji:**
- Sprawdzenie czy npcId jest poprawnym UUID
- Obsługa stanu ładowania podczas pobierania szczegółów NPC (z combat stats i relationships jeśli `include` parameters)

**Typy:**
- `NPCDetailsViewModel` - rozszerzony typ z dodatkowymi danymi:
  ```typescript
  interface NPCDetailsViewModel {
    npc: NPC;
    combatStats: NPCCombatStats | null;
    relationships: NPCRelationshipViewModel[];
    backlinks: BacklinkItem[];
    factionName?: string;
    locationName?: string;
  }

  interface NPCRelationshipViewModel {
    relationship: NPCRelationship;
    otherNpcName: string;
    otherNpcImageUrl?: string;
  }
  ```

**Propsy:**
```typescript
interface NPCDetailSlideoverProps {
  npcId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (npcId: string) => void;
}
```

### 4.6. StoryTab

**Opis:** Zakładka Story w slideover, wyświetla i pozwala edytować informacje fabularne NPC.

**Główne elementy:**
- NPCImage (jeśli image_url istnieje) - wysokość 300px, object-fit: cover
- RoleInput - inline editable input (click → edit, blur → auto-save)
- FactionSelect - autocomplete dropdown z listą frakcji kampanii
- CurrentLocationSelect - autocomplete dropdown z listą lokacji kampanii
- StatusRadio - radio buttons: alive/dead/unknown
- BiographyEditor - Tiptap Rich Text editor z @mentions
- PersonalityEditor - Tiptap Rich Text editor
- BacklinksSection - lista miejsc gdzie NPC jest @mentioned
  - BacklinkItem[] (typ źródła, nazwa, link)

**Obsługiwane zdarzenia:**
- `onRoleChange(newRole: string)` - inline edit roli z auto-save
- `onFactionChange(factionId: string | null)` - zmiana przypisanej frakcji
- `onLocationChange(locationId: string | null)` - zmiana aktualnej lokacji
- `onStatusChange(status: 'alive' | 'dead' | 'unknown')` - zmiana statusu
- `onBiographyChange(biographyJson: Json)` - auto-save biography on blur
- `onPersonalityChange(personalityJson: Json)` - auto-save personality on blur
- `onImageUpload(file: File)` - upload i kompresja obrazu

**Warunki walidacji:**
- Role: opcjonalne, max 100 znaków
- Faction: opcjonalne, musi być poprawnym UUID istniejącej frakcji
- Location: opcjonalne, musi być poprawnym UUID istniejącej lokacji
- Status: required, musi być jednym z: alive/dead/unknown
- Biography: opcjonalne, valid Tiptap JSON
- Personality: opcjonalne, valid Tiptap JSON
- Image: opcjonalne, max 5 MB, typy: image/jpeg, image/png, image/webp

**Typy:**
- `NPCDetailsViewModel` (jak wyżej)
- `BacklinkItem`:
  ```typescript
  interface BacklinkItem {
    source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item';
    source_id: string;
    source_name: string;
    source_field: string;
  }
  ```

**Propsy:**
```typescript
interface StoryTabProps {
  npcDetails: NPCDetailsViewModel;
  onUpdate: (command: UpdateNPCCommand) => Promise<void>;
  onImageUpdate: (imageUrl: string) => Promise<void>;
}
```

### 4.7. CombatTab

**Opis:** Zakładka Combat w slideover, wyświetla statystyki walki NPC (opcjonalne) lub przycisk dodania combat stats.

**Główne elementy:**
- **NoCombatStatsState** (jeśli brak stats):
  - Message: "No combat stats yet"
  - AddCombatStatsButton (emerald variant)
- **CombatStatsForm** (jeśli są stats):
  - BasicStatsInputs (HP Max, AC, Speed) - inline editable z auto-save
  - AbilityScoresGrid - 6 inputów dla atrybutów (STR/DEX/CON/INT/WIS/CHA)
  - ActionsList - lista akcji NPC:
    - ActionItem[] (Name, Type, Attack Bonus, Damage)
    - ActionBuilder - formularz dodawania nowej akcji (podobnie jak w Player Characters)
  - UseInCombatButton (emerald variant) - przekierowuje do combat wizard z NPC preselected
  - RemoveCombatStatsButton (destructive variant) - usunięcie combat stats z confirm dialog

**Obsługiwane zdarzenia:**
- `onAddCombatStats()` - utworzenie pustych combat stats dla NPC
- `onUpdateCombatStats(command: UpsertNPCCombatStatsCommand)` - aktualizacja combat stats (auto-save on blur)
- `onRemoveCombatStats()` - usunięcie combat stats (z confirm dialog)
- `onUseInCombat()` - przekierowanie do `/combats/new` z query param `?npcId=...` (preselect w combat wizard)
- `onAddAction(action: Action)` - dodanie nowej akcji do actions_json
- `onUpdateAction(index: number, action: Action)` - aktualizacja akcji
- `onDeleteAction(index: number)` - usunięcie akcji

**Warunki walidacji:**
- **BasicStats:**
  - HP Max: required, number > 0, max 999
  - AC: required, number >= 0, max 30
  - Speed: required, number >= 0, max 999
- **Ability Scores:**
  - Każdy atrybut: required, number 1-30
- **Action:**
  - Name: required, min 1, max 100 znaków
  - Type: required, enum (melee_weapon_attack, ranged_weapon_attack, spell_attack, other)
  - Attack Bonus: opcjonalne, number -10 to +20
  - Reach/Range: opcjonalne, string max 50 znaków
  - Damage Dice: opcjonalne, string format "XdY" (np. "2d6")
  - Damage Bonus: opcjonalne, number -10 to +20
  - Damage Type: opcjonalne, string max 50 znaków

**Typy:**
- `NPCCombatStats` - typ combat stats
- `UpsertNPCCombatStatsCommand` - command do create/update combat stats
- `Action` - typ akcji (podobnie jak w Player Characters):
  ```typescript
  interface Action {
    name: string;
    type: 'melee_weapon_attack' | 'ranged_weapon_attack' | 'spell_attack' | 'other';
    attack_bonus?: number;
    reach?: string;
    range?: string;
    damage_dice?: string;
    damage_bonus?: number;
    damage_type?: string;
    description?: string;
  }
  ```

**Propsy:**
```typescript
interface CombatTabProps {
  npcId: string;
  combatStats: NPCCombatStats | null;
  onAddCombatStats: () => Promise<void>;
  onUpdateCombatStats: (command: UpsertNPCCombatStatsCommand) => Promise<void>;
  onRemoveCombatStats: () => Promise<void>;
}
```

### 4.8. RelationshipsTab

**Opis:** Zakładka Relationships w slideover, wyświetla i pozwala zarządzać relacjami między NPCs.

**Główne elementy:**
- RelationshipsList:
  - RelationshipItem[] dla każdej relacji:
    - Avatar + Name drugiego NPC (kliknięcie → otwiera slideover tego NPC)
    - RelationshipTypeInput - free text input (np. "brother", "enemy", "friend")
    - DescriptionInput - optional textarea (opis relacji)
    - StrengthSlider - slider 0-100 (siła relacji)
    - DeleteButton - usunięcie relacji
  - EmptyState jeśli brak relacji: "No relationships yet"
- AddRelationshipButton - otwiera dialog wyboru NPC i dodania relacji

**Obsługiwane zdarzenia:**
- `onAddRelationship(npcId2: string, relationshipType: string, description?: string, strength?: number)` - utworzenie nowej relacji
- `onUpdateRelationship(relationshipId: string, command: UpdateNPCRelationshipCommand)` - aktualizacja relacji (auto-save on blur)
- `onDeleteRelationship(relationshipId: string)` - usunięcie relacji (z confirm dialog)
- `onNavigateToNPC(npcId: string)` - nawigacja do karty drugiego NPC (otwiera slideover)

**Warunki walidacji:**
- **Relationship:**
  - npc_id_2: required, musi być poprawnym UUID innego NPC (nie tego samego)
  - relationship_type: required, string min 1, max 100 znaków
  - description: opcjonalne, string max 500 znaków
  - strength: opcjonalne, number 0-100, default 50
- **Validation:** nie można dodać relacji do samego siebie (npc_id_1 !== npc_id_2)

**Typy:**
- `NPCRelationship` - typ relacji
- `CreateNPCRelationshipCommand` - command do utworzenia relacji
- `UpdateNPCRelationshipCommand` - command do aktualizacji relacji
- `NPCRelationshipViewModel` (jak wyżej w NPCDetailsViewModel)

**Propsy:**
```typescript
interface RelationshipsTabProps {
  npcId: string;
  relationships: NPCRelationshipViewModel[];
  onAddRelationship: (command: CreateNPCRelationshipCommand) => Promise<void>;
  onUpdateRelationship: (relationshipId: string, command: UpdateNPCRelationshipCommand) => Promise<void>;
  onDeleteRelationship: (relationshipId: string) => Promise<void>;
  onNavigateToNPC: (npcId: string) => void;
}
```

### 4.9. NPCFormDialog

**Opis:** Full screen lub large dialog do tworzenia i edycji NPCs. Multi-step form z progresywnym disclosure dla combat stats.

**Główne elementy:**
- Dialog (shadcn) full screen lub large (width 900px)
- MultiStepForm (React Hook Form + Zod) z trzema krokami:
  - **Step 1: Basic Info**
    - NameInput (required)
    - RoleInput (opcjonalne)
    - FactionSelect (autocomplete, opcjonalne)
    - CurrentLocationSelect (autocomplete, opcjonalne)
    - StatusRadio (alive/dead/unknown, default: alive)
    - ImageUpload (drag & drop zone z preview)
  - **Step 2: Story**
    - BiographyEditor (Tiptap Rich Text z @mentions)
    - PersonalityEditor (Tiptap Rich Text)
  - **Step 3: Combat (optional)**
    - AddCombatStatsCheckbox ("Add Combat Stats")
    - CombatStatsForm (disabled do czasu zaznaczenia checkbox):
      - BasicStatsInputs (HP Max, AC, Speed)
      - AbilityScoresGrid (STR/DEX/CON/INT/WIS/CHA)
      - ActionsList z ActionBuilder
- DialogFooter:
  - BackButton (jeśli nie step 1)
  - NextButton (jeśli nie last step) lub SubmitButton (jeśli last step)
  - CancelButton

**Obsługiwane zdarzenia:**
- `onNext()` - przejście do następnego kroku
- `onBack()` - powrót do poprzedniego kroku
- `onSubmit(data: CreateNPCCommand | UpdateNPCCommand)` - submit formularza
- `onCancel()` - zamknięcie dialogu bez zapisywania
- `onImageDrop(file: File)` - upload obrazu z drag & drop
- `onCombatStatsCheckboxChange(checked: boolean)` - enable/disable combat stats form

**Warunki walidacji:**
- **Step 1 (Basic Info):**
  - Name: required, min 1 znak, max 255 znaków, trim whitespace
  - Role: opcjonalne, max 100 znaków
  - Faction: opcjonalne, musi być poprawnym UUID istniejącej frakcji
  - Location: opcjonalne, musi być poprawnym UUID istniejącej lokacji
  - Status: required, musi być jednym z: alive/dead/unknown
  - Image: opcjonalne, max 5 MB, typy: image/jpeg, image/png, image/webp
- **Step 2 (Story):**
  - Biography: opcjonalne, valid Tiptap JSON
  - Personality: opcjonalne, valid Tiptap JSON
- **Step 3 (Combat):**
  - Jeśli AddCombatStatsCheckbox zaznaczony:
    - Walidacja jak w CombatTab (HP Max, AC, Speed, Ability Scores, Actions)
  - Jeśli nie zaznaczony: skip walidacji combat stats

**Typy:**
- `CreateNPCCommand` - dane do tworzenia NPC
- `UpdateNPCCommand` - dane do aktualizacji NPC
- `NPCFormData` - typ formularza:
  ```typescript
  interface NPCFormData {
    // Step 1
    name: string;
    role?: string | null;
    faction_id?: string | null;
    current_location_id?: string | null;
    status: 'alive' | 'dead' | 'unknown';
    image_url?: string | null;

    // Step 2
    biography_json?: Json | null;
    personality_json?: Json | null;

    // Step 3
    addCombatStats: boolean;
    combatStats?: {
      hp_max: number;
      armor_class: number;
      speed: number;
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
      actions_json?: Json | null;
    } | null;
  }
  ```

**Propsy:**
```typescript
interface NPCFormDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: UpdateNPCCommand; // dla edit mode
  onClose: () => void;
  onSubmit: (data: CreateNPCCommand | UpdateNPCCommand) => Promise<void>;
}
```

### 4.10. ActionBuilder (reusable component)

**Opis:** Formularz do dodawania/edycji akcji NPC (reusable, podobny jak w Player Characters).

**Główne elementy:**
- NameInput (required)
- TypeSelect (melee_weapon_attack, ranged_weapon_attack, spell_attack, other)
- AttackBonusInput (opcjonalne, number)
- ReachInput (opcjonalne, dla melee) lub RangeInput (opcjonalne, dla ranged)
- DamageDiceInput (opcjonalne, string format "XdY")
- DamageBonusInput (opcjonalne, number)
- DamageTypeInput (opcjonalne, string)
- DescriptionTextarea (opcjonalne)
- SaveButton + CancelButton

**Obsługiwane zdarzenia:**
- `onSave(action: Action)` - zapis akcji
- `onCancel()` - anulowanie

**Warunki walidacji:**
- Name: required, min 1, max 100 znaków
- Type: required, enum
- Attack Bonus: opcjonalne, number -10 to +20
- Reach/Range: opcjonalne, string max 50 znaków
- Damage Dice: opcjonalne, string format "XdY" (regex validation)
- Damage Bonus: opcjonalne, number -10 to +20
- Damage Type: opcjonalne, string max 50 znaków
- Description: opcjonalne, string max 500 znaków

**Typy:**
- `Action` (jak wyżej)

**Propsy:**
```typescript
interface ActionBuilderProps {
  action?: Action; // dla edit mode
  onSave: (action: Action) => void;
  onCancel: () => void;
}
```

### 4.11. RichTextEditor (Tiptap z @mentions)

**Opis:** Rich text editor oparty na Tiptap z custom extension dla @mentions do linkowania encji kampanii (reusable component).

**Główne elementy:**
- EditorContent (Tiptap) z toolbar
- Toolbar z przyciskami formatowania (bold, italic, headings, lists, etc.)
- @Mentions dropdown z autocomplete przy wpisaniu "@"
- Character counter (opcjonalnie)

**Obsługiwane zdarzenia:**
- `onChange(json: Json)` - update content on change
- `onBlur()` - trigger auto-save on blur
- `onMentionSearch(query: string)` - fuzzy search encji kampanii
- `onMentionSelect(entity: MentionEntity)` - wstawienie mention do editora

**Warunki walidacji:**
- Valid Tiptap JSON structure
- Mentions muszą wskazywać na istniejące encje (validation server-side)

**Typy:**
- `MentionEntity`:
  ```typescript
  interface MentionEntity {
    id: string;
    label: string;
    entityType: 'npc' | 'location' | 'quest' | 'faction' | 'story_arc' | 'story_item' | 'session';
  }
  ```
- `TiptapContent` (Json type dla biography_json/personality_json)

**Propsy:**
```typescript
interface RichTextEditorProps {
  value: Json | null;
  onChange: (value: Json) => void;
  onBlur?: () => void;
  placeholder?: string;
  campaignId: string; // dla pobierania encji do @mentions
}
```

### 4.12. ImageUpload (reusable component)

**Opis:** Komponent do uploadu obrazów z drag & drop, preview i kompresją do WebP (reusable).

**Główne elementy:**
- Drag & drop zone z visual feedback (border highlight on drag over)
- File input (hidden) z button trigger
- Preview wybranego obrazu
- Progress indicator podczas uploadu i kompresji
- Delete button dla usunięcia obrazu

**Obsługiwane zdarzenia:**
- `onDrop(files: FileList)` - upload pliku przez drag & drop
- `onChange(event: ChangeEvent<HTMLInputElement>)` - upload pliku przez file input
- `onDelete()` - usunięcie wybranego obrazu

**Warunki walidacji:**
- Max 5 MB per plik
- Dozwolone typy: image/jpeg, image/png, image/webp
- Client-side kompresja do WebP przed uploadem do Supabase Storage
- Walidacja wymiarów obrazu (min 100x100px, max 4000x4000px)

**Typy:**
- `ImageUploadState`:
  ```typescript
  interface ImageUploadState {
    file: File | null;
    previewUrl: string | null;
    isUploading: boolean;
    progress: number;
    error: string | null;
  }
  ```

**Propsy:**
```typescript
interface ImageUploadProps {
  value?: string | null; // current image URL
  onChange: (imageUrl: string | null) => void;
  maxSizeMB?: number; // default 5
}
```

## 5. Typy

### 5.1. Entity Types (z database.ts)

```typescript
// Główny typ NPC z bazy danych
export type NPC = Tables<'npcs'>;

// Struktura z database.ts
interface NPCRow {
  id: string; // uuid, primary key
  campaign_id: string; // uuid, foreign key
  name: string; // varchar(255)
  role: string | null; // varchar(100)
  biography_json: Json | null; // jsonb (Tiptap rich text)
  personality_json: Json | null; // jsonb (Tiptap rich text)
  image_url: string | null; // text
  faction_id: string | null; // uuid, foreign key
  current_location_id: string | null; // uuid, foreign key
  status: 'alive' | 'dead' | 'unknown'; // enum
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// Typ combat stats
export type NPCCombatStats = Tables<'npc_combat_stats'>;

interface NPCCombatStatsRow {
  npc_id: string; // uuid, primary key (1:1 with npcs)
  hp_max: number; // integer
  armor_class: number; // integer
  speed: number; // integer
  strength: number; // integer
  dexterity: number; // integer
  constitution: number; // integer
  intelligence: number; // integer
  wisdom: number; // integer
  charisma: number; // integer
  actions_json: Json | null; // jsonb (array of actions)
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// Typ relacji
export type NPCRelationship = Tables<'npc_relationships'>;

interface NPCRelationshipRow {
  id: string; // uuid, primary key
  npc_id_1: string; // uuid, foreign key
  npc_id_2: string; // uuid, foreign key
  relationship_type: string; // text (free text: brother, enemy, friend, etc.)
  description: string | null; // text
  strength: number; // integer 0-100
  created_at: string; // timestamp
  updated_at: string; // timestamp
}
```

### 5.2. Command Models

```typescript
// Tworzenie nowego NPC
export interface CreateNPCCommand {
  name: string; // required, min 1, max 255
  role?: string | null; // opcjonalne, max 100
  biography_json?: Json | null; // opcjonalne
  personality_json?: Json | null; // opcjonalne
  image_url?: string | null; // opcjonalne
  faction_id?: string | null; // opcjonalne
  current_location_id?: string | null; // opcjonalne
  status?: 'alive' | 'dead' | 'unknown'; // default: alive
}

// Aktualizacja istniejącego NPC (partial update)
export interface UpdateNPCCommand {
  name?: string;
  role?: string | null;
  biography_json?: Json | null;
  personality_json?: Json | null;
  image_url?: string | null;
  faction_id?: string | null;
  current_location_id?: string | null;
  status?: 'alive' | 'dead' | 'unknown';
}

// Upsert combat stats (create or update)
export interface UpsertNPCCombatStatsCommand {
  hp_max: number; // required, > 0, max 999
  armor_class: number; // required, >= 0, max 30
  speed: number; // required, >= 0, max 999
  strength: number; // required, 1-30
  dexterity: number; // required, 1-30
  constitution: number; // required, 1-30
  intelligence: number; // required, 1-30
  wisdom: number; // required, 1-30
  charisma: number; // required, 1-30
  actions_json?: Json | null; // opcjonalne, array of actions
}

// Tworzenie relacji
export interface CreateNPCRelationshipCommand {
  npc_id_1: string; // required, uuid
  npc_id_2: string; // required, uuid (musi być różny od npc_id_1)
  relationship_type: string; // required, min 1, max 100
  description?: string | null; // opcjonalne, max 500
  strength?: number; // opcjonalne, 0-100, default 50
}

// Aktualizacja relacji (partial update)
export interface UpdateNPCRelationshipCommand {
  relationship_type?: string;
  description?: string | null;
  strength?: number;
}
```

### 5.3. Filter Types

```typescript
export interface NPCFilters {
  faction_id?: string | null; // filtrowanie po frakcji (null = bez frakcji)
  current_location_id?: string | null; // filtrowanie po lokacji (null = bez lokacji)
  status?: 'alive' | 'dead' | 'unknown'; // filtrowanie po statusie
}
```

### 5.4. View Models

```typescript
// Rozszerzony typ dla karty NPC w gridzie
interface NPCCardViewModel {
  npc: NPC;
  hasCombatStats: boolean; // czy NPC ma combat stats
  factionName?: string; // nazwa frakcji (jeśli assigned)
  locationName?: string; // nazwa lokacji (jeśli assigned)
}

// Rozszerzony typ dla szczegółów NPC w slideover
interface NPCDetailsViewModel {
  npc: NPC;
  combatStats: NPCCombatStats | null; // null jeśli brak combat stats
  relationships: NPCRelationshipViewModel[]; // lista relacji
  backlinks: BacklinkItem[]; // miejsca gdzie NPC jest @mentioned
  factionName?: string;
  locationName?: string;
}

// Rozszerzony typ dla relacji NPC
interface NPCRelationshipViewModel {
  relationship: NPCRelationship;
  otherNpcName: string; // nazwa drugiego NPC
  otherNpcImageUrl?: string; // obraz drugiego NPC (jeśli istnieje)
}

// Typ dla backlinks
interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item';
  source_id: string;
  source_name: string;
  source_field: string; // np. "biography_json"
}

// Typ dla akcji
interface Action {
  name: string; // required
  type: 'melee_weapon_attack' | 'ranged_weapon_attack' | 'spell_attack' | 'other'; // required
  attack_bonus?: number; // opcjonalne, -10 to +20
  reach?: string; // opcjonalne, dla melee (np. "5 ft")
  range?: string; // opcjonalne, dla ranged (np. "30/120 ft")
  damage_dice?: string; // opcjonalne, format "XdY" (np. "2d6")
  damage_bonus?: number; // opcjonalne, -10 to +20
  damage_type?: string; // opcjonalne (np. "slashing", "fire")
  description?: string; // opcjonalne, max 500 znaków
}

// Typ dla mention entity w rich text editorze
interface MentionEntity {
  id: string;
  label: string;
  entityType: 'npc' | 'location' | 'quest' | 'faction' | 'story_arc' | 'story_item' | 'session';
}
```

### 5.5. Form Data Types

```typescript
// Typ danych formularza multi-step (React Hook Form)
interface NPCFormData {
  // Step 1: Basic Info
  name: string;
  role?: string | null;
  faction_id?: string | null;
  current_location_id?: string | null;
  status: 'alive' | 'dead' | 'unknown';
  image_url?: string | null;

  // Step 2: Story
  biography_json?: Json | null;
  personality_json?: Json | null;

  // Step 3: Combat (optional)
  addCombatStats: boolean; // checkbox
  combatStats?: {
    hp_max: number;
    armor_class: number;
    speed: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    actions_json?: Json | null;
  } | null;
}

// Enum dla statusu NPC
enum NPCStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
  UNKNOWN = 'unknown'
}

// Enum dla typów akcji
enum ActionType {
  MELEE_WEAPON_ATTACK = 'melee_weapon_attack',
  RANGED_WEAPON_ATTACK = 'ranged_weapon_attack',
  SPELL_ATTACK = 'spell_attack',
  OTHER = 'other'
}
```

## 6. Zarządzanie stanem

### 6.1. Server State - React Query

Widok wykorzystuje **React Query** (TanStack Query v5) do zarządzania stanem serwera (NPCs z bazy danych).

**Custom Hooks (src/hooks/useNPCs.ts):**

```typescript
// Query: pobieranie wszystkich NPCs kampanii z filtrowaniem
export function useNPCsQuery(campaignId: string, filters?: NPCFilters) {
  return useQuery({
    queryKey: ['npcs', campaignId, filters],
    queryFn: () => getNPCs(campaignId, filters),
    enabled: !!campaignId,
  });
}

// Query: pobieranie pojedynczego NPC z dodatkowymi danymi (combat stats, relationships, backlinks)
export function useNPCDetailsQuery(npcId: string) {
  return useQuery({
    queryKey: ['npc', npcId, 'details'],
    queryFn: async () => {
      // Równoległe pobieranie NPC, combat stats i relationships
      const [npc, combatStats, relationships] = await Promise.all([
        getNPC(npcId),
        getNPCCombatStats(npcId),
        getNPCRelationships(npcId),
      ]);

      // TODO: Pobieranie backlinks (wymaga osobnego API endpoint)
      // TODO: Pobieranie faction/location names (może być w jednym query przez JOIN)

      return {
        npc,
        combatStats,
        relationships: relationships.map(rel => ({
          relationship: rel,
          otherNpcName: '', // TODO: pobierz z API
          otherNpcImageUrl: null,
        })),
        backlinks: [], // TODO: z API
        factionName: undefined,
        locationName: undefined,
      };
    },
    enabled: !!npcId,
  });
}

// Mutation: tworzenie NPC
export function useCreateNPCMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, command }: { campaignId: string; command: CreateNPCCommand }) =>
      createNPC(campaignId, command),
    onMutate: async ({ campaignId, command }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['npcs', campaignId] });
      const previousNPCs = queryClient.getQueryData(['npcs', campaignId]);

      const optimisticNPC: NPC = {
        id: 'temp-id',
        campaign_id: campaignId,
        ...command,
        status: command.status || 'alive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['npcs', campaignId], (old: NPC[]) =>
        [optimisticNPC, ...(old || [])]
      );

      return { previousNPCs };
    },
    onError: (err, { campaignId }, context) => {
      // Rollback na błąd
      queryClient.setQueryData(['npcs', campaignId], context?.previousNPCs);
      toast.error('Failed to create NPC');
    },
    onSuccess: (newNPC, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['npcs', campaignId] });
      toast.success('NPC created successfully');
    },
  });
}

// Mutation: aktualizacja NPC
export function useUpdateNPCMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ npcId, command }: { npcId: string; command: UpdateNPCCommand }) =>
      updateNPC(npcId, command),
    onSuccess: (updatedNPC) => {
      // Invalidate queries dla campaign NPCs
      queryClient.invalidateQueries({ queryKey: ['npcs', updatedNPC.campaign_id] });
      // Invalidate query dla konkretnego NPC
      queryClient.invalidateQueries({ queryKey: ['npc', updatedNPC.id] });
      toast.success('NPC updated successfully');
    },
    onError: () => {
      toast.error('Failed to update NPC');
    },
  });
}

// Mutation: usuwanie NPC
export function useDeleteNPCMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (npcId: string) => deleteNPC(npcId),
    onSuccess: (_, npcId) => {
      // Invalidate wszystkie NPCs (będą ponownie pobrane)
      queryClient.invalidateQueries({ queryKey: ['npcs'] });
      toast.success('NPC deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete NPC');
    },
  });
}

// Mutation: upsert combat stats
export function useUpsertNPCCombatStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ npcId, command }: { npcId: string; command: UpsertNPCCombatStatsCommand }) =>
      upsertNPCCombatStats(npcId, command),
    onSuccess: (_, { npcId }) => {
      queryClient.invalidateQueries({ queryKey: ['npc', npcId, 'details'] });
      toast.success('Combat stats updated successfully');
    },
    onError: () => {
      toast.error('Failed to update combat stats');
    },
  });
}

// Mutation: usuwanie combat stats
export function useDeleteNPCCombatStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (npcId: string) => deleteNPCCombatStats(npcId),
    onSuccess: (_, npcId) => {
      queryClient.invalidateQueries({ queryKey: ['npc', npcId, 'details'] });
      toast.success('Combat stats removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove combat stats');
    },
  });
}

// Mutation: tworzenie relacji
export function useCreateNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateNPCRelationshipCommand) =>
      createNPCRelationship(command),
    onSuccess: (newRelationship) => {
      // Invalidate relationships dla obu NPCs (bidirectional)
      queryClient.invalidateQueries({ queryKey: ['npc', newRelationship.npc_id_1, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['npc', newRelationship.npc_id_2, 'details'] });
      toast.success('Relationship created successfully');
    },
    onError: () => {
      toast.error('Failed to create relationship');
    },
  });
}

// Mutation: aktualizacja relacji
export function useUpdateNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relationshipId, command }: { relationshipId: string; command: UpdateNPCRelationshipCommand }) =>
      updateNPCRelationship(relationshipId, command),
    onSuccess: (updatedRelationship) => {
      queryClient.invalidateQueries({ queryKey: ['npc', updatedRelationship.npc_id_1, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['npc', updatedRelationship.npc_id_2, 'details'] });
      toast.success('Relationship updated successfully');
    },
    onError: () => {
      toast.error('Failed to update relationship');
    },
  });
}

// Mutation: usuwanie relacji
export function useDeleteNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId: string) => deleteNPCRelationship(relationshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['npcs'] });
      toast.success('Relationship deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete relationship');
    },
  });
}
```

### 6.2. Local State - React useState

Widok wykorzystuje lokalny state (useState) dla ephemeralnych stanów UI:

```typescript
// W komponencie NPCsView
const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null);
const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [editingNPCId, setEditingNPCId] = useState<string | null>(null);
const [filters, setFilters] = useState<NPCFilters>({});

// W NPCFormDialog
const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
const [isSubmitting, setIsSubmitting] = useState(false);
const [imageUploadProgress, setImageUploadProgress] = useState(0);

// W CombatTab
const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);
const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
```

### 6.3. Campaign Context

Widok korzysta z globalnego **campaignStore** (Zustand) aby pobrać aktualnie wybraną kampanię:

```typescript
// src/stores/campaignStore.ts
const selectedCampaign = useCampaignStore(state => state.selectedCampaign);
```

### 6.4. Form State - React Hook Form

Formularz w NPCFormDialog wykorzystuje React Hook Form z walidacją Zod:

```typescript
const form = useForm<NPCFormData>({
  resolver: zodResolver(npcFormSchema),
  defaultValues: {
    name: '',
    role: null,
    faction_id: null,
    current_location_id: null,
    status: 'alive',
    image_url: null,
    biography_json: null,
    personality_json: null,
    addCombatStats: false,
    combatStats: null,
  },
});
```

**Nie jest wymagany dedykowany custom hook** dla zarządzania stanem widoku - React Query + lokalny useState są wystarczające.

## 7. Integracja API

Widok integruje się z API poprzez warstwę abstrakcji w `src/lib/api/`, która wykorzystuje **Supabase Client**.

### 7.1. API Functions

**src/lib/api/npcs.ts:**

```typescript
/**
 * GET - Pobieranie wszystkich NPCs kampanii z filtrowaniem
 * Query parameters: faction_id, current_location_id, status
 */
export async function getNPCs(
  campaignId: string,
  filters?: NPCFilters
): Promise<NPC[]>

/**
 * GET - Pobieranie pojedynczego NPC
 */
export async function getNPC(npcId: string): Promise<NPC>

/**
 * POST - Tworzenie nowego NPC
 */
export async function createNPC(
  campaignId: string,
  command: CreateNPCCommand
): Promise<NPC>

/**
 * PATCH - Aktualizacja NPC (partial update)
 */
export async function updateNPC(
  npcId: string,
  command: UpdateNPCCommand
): Promise<NPC>

/**
 * DELETE - Usuwanie NPC
 * Related npc_combat_stats and npc_relationships będą usunięte (ON DELETE CASCADE)
 */
export async function deleteNPC(npcId: string): Promise<void>
```

**src/lib/api/npc-combat-stats.ts:**

```typescript
/**
 * GET - Pobieranie combat stats dla NPC
 * Returns null jeśli brak combat stats (optional 1:1 relationship)
 */
export async function getNPCCombatStats(npcId: string): Promise<NPCCombatStats | null>

/**
 * POST/PATCH - Upsert combat stats (create or update)
 * Uses npc_id as primary key (1:1 relationship)
 */
export async function upsertNPCCombatStats(
  npcId: string,
  command: UpsertNPCCombatStatsCommand
): Promise<NPCCombatStats>

/**
 * DELETE - Usuwanie combat stats
 */
export async function deleteNPCCombatStats(npcId: string): Promise<void>
```

**src/lib/api/npc-relationships.ts:**

```typescript
/**
 * GET - Pobieranie wszystkich relacji dla NPC
 * Returns relationships gdzie NPC jest npc_id_1 lub npc_id_2 (bidirectional)
 */
export async function getNPCRelationships(npcId: string): Promise<NPCRelationship[]>

/**
 * POST - Tworzenie nowej relacji
 * Validation: npc_id_1 !== npc_id_2 (client-side)
 */
export async function createNPCRelationship(
  command: CreateNPCRelationshipCommand
): Promise<NPCRelationship>

/**
 * PATCH - Aktualizacja relacji (partial update)
 */
export async function updateNPCRelationship(
  relationshipId: string,
  command: UpdateNPCRelationshipCommand
): Promise<NPCRelationship>

/**
 * DELETE - Usuwanie relacji
 */
export async function deleteNPCRelationship(relationshipId: string): Promise<void>
```

### 7.2. Request/Response Types

**getNPCs:**
- Request: `campaignId: string`, `filters?: NPCFilters`
  ```typescript
  {
    faction_id?: string | null;
    current_location_id?: string | null;
    status?: 'alive' | 'dead' | 'unknown';
  }
  ```
- Response: `NPC[]` (sortowane created_at DESC)

**getNPC:**
- Request: `npcId: string`
- Response: `NPC`

**createNPC:**
- Request: `campaignId: string`, `command: CreateNPCCommand`
  ```typescript
  {
    name: string; // required
    role?: string | null;
    biography_json?: Json | null;
    personality_json?: Json | null;
    image_url?: string | null;
    faction_id?: string | null;
    current_location_id?: string | null;
    status?: 'alive' | 'dead' | 'unknown'; // default: alive
  }
  ```
- Response: `NPC` (pełny obiekt z wygenerowanym ID)

**updateNPC:**
- Request: `npcId: string`, `command: UpdateNPCCommand`
  ```typescript
  {
    name?: string;
    role?: string | null;
    biography_json?: Json | null;
    personality_json?: Json | null;
    image_url?: string | null;
    faction_id?: string | null;
    current_location_id?: string | null;
    status?: 'alive' | 'dead' | 'unknown';
  }
  ```
- Response: `NPC` (zaktualizowany obiekt)

**deleteNPC:**
- Request: `npcId: string`
- Response: `void` (204 No Content)

**getNPCCombatStats:**
- Request: `npcId: string`
- Response: `NPCCombatStats | null`

**upsertNPCCombatStats:**
- Request: `npcId: string`, `command: UpsertNPCCombatStatsCommand`
  ```typescript
  {
    hp_max: number;
    armor_class: number;
    speed: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    actions_json?: Json | null;
  }
  ```
- Response: `NPCCombatStats`

**deleteNPCCombatStats:**
- Request: `npcId: string`
- Response: `void` (204 No Content)

**getNPCRelationships:**
- Request: `npcId: string`
- Response: `NPCRelationship[]`

**createNPCRelationship:**
- Request: `command: CreateNPCRelationshipCommand`
  ```typescript
  {
    npc_id_1: string; // required
    npc_id_2: string; // required, different from npc_id_1
    relationship_type: string; // required
    description?: string | null;
    strength?: number; // 0-100, default 50
  }
  ```
- Response: `NPCRelationship`

**updateNPCRelationship:**
- Request: `relationshipId: string`, `command: UpdateNPCRelationshipCommand`
  ```typescript
  {
    relationship_type?: string;
    description?: string | null;
    strength?: number;
  }
  ```
- Response: `NPCRelationship`

**deleteNPCRelationship:**
- Request: `relationshipId: string`
- Response: `void` (204 No Content)

### 7.3. Rozszerzone API Endpoints (do potencjalnej implementacji w przyszłości)

Widok może w przyszłości wymagać dodatkowych API endpoints dla backlinks i wzbogaconych danych:

```typescript
/**
 * GET - Pobieranie NPC z dodatkowymi danymi (backlinks, faction/location names)
 * Query parameters: include=backlinks,combat_stats,relationships,faction,location
 */
export async function getNPCWithDetails(
  npcId: string,
  include?: string[]
): Promise<NPCDetailsViewModel>
```

### 7.4. Image Upload

Upload obrazów wykorzystuje **Supabase Storage**:

```typescript
// src/lib/api/storage.ts

/**
 * Upload obrazu do Supabase Storage z kompresją do WebP
 * Bucket: 'npc-images'
 */
export async function uploadNPCImage(
  campaignId: string,
  file: File
): Promise<string> {
  // 1. Client-side kompresja do WebP (max 5 MB)
  const compressedFile = await compressImageToWebP(file, 5 * 1024 * 1024);

  // 2. Upload do Supabase Storage
  const fileName = `${campaignId}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
  const { data, error } = await supabase.storage
    .from('npc-images')
    .upload(fileName, compressedFile);

  if (error) throw error;

  // 3. Zwróć public URL
  const { data: { publicUrl } } = supabase.storage
    .from('npc-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Usuwanie obrazu z Supabase Storage
 */
export async function deleteNPCImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const fileName = imageUrl.split('/npc-images/')[1];

  const { error } = await supabase.storage
    .from('npc-images')
    .remove([fileName]);

  if (error) throw error;
}
```

### 7.5. Security - RLS

Wszystkie operacje są zabezpieczone przez **Row-Level Security (RLS)** w Supabase. User może tylko:
- Odczytywać NPCs z własnych kampanii
- Tworzyć NPCs w własnych kampaniach
- Aktualizować/usuwać NPCs z własnych kampanii

RLS policies są zdefiniowane na poziomie bazy danych (poza zakresem frontendu).

## 8. Interakcje użytkownika

### 8.1. Przeglądanie NPCs

1. **Widok początkowy:**
   - User widzi grid kart NPCs (3 kolumny na desktop, 2 na tablet)
   - Każda karta: obraz, nazwa, rola, faction badge, location badge, status indicator, combat ready badge
   - **Akcja:** Click na kartę → otwarcie NPCDetailSlideover z prawej strony

2. **Filtrowanie NPCs:**
   - User używa filtrów w header:
     - FactionMultiSelect - wybór wielu frakcji
     - LocationSelect - wybór jednej lokacji
     - StatusSelect - wybór statusu (alive/dead/unknown)
   - **Akcja:** Zmiana filtra → refetch NPCs z nowymi parametrami → aktualizacja gridu

3. **Empty State:**
   - Jeśli brak NPCs w kampanii → pokazanie empty state z CTA "Add NPC"
   - **Akcja:** Click "Add NPC" → otwarcie NPCFormDialog

### 8.2. Tworzenie nowego NPC

1. **Otwarcie dialogu:**
   - **Akcja:** Click na "Add NPC" button w header → otwarcie NPCFormDialog

2. **Wypełnienie Step 1 (Basic Info):**
   - User wprowadza nazwę (required)
   - User opcjonalnie wprowadza rolę (np. "Quest Giver")
   - User opcjonalnie wybiera frakcję z autocomplete dropdown
   - User opcjonalnie wybiera lokację z autocomplete dropdown
   - User wybiera status (alive/dead/unknown, default: alive)
   - User opcjonalnie uploaduje obraz (drag & drop lub file picker)
   - **Akcja:** Click "Next" → przejście do Step 2

3. **Wypełnienie Step 2 (Story):**
   - User opcjonalnie pisze biografię w rich text editorze (z @mentions)
   - User opcjonalnie pisze personality traits w rich text editorze
   - **Akcja:** Click "Next" → przejście do Step 3

4. **Wypełnienie Step 3 (Combat - optional):**
   - User zaznacza checkbox "Add Combat Stats" jeśli chce dodać statystyki walki
   - Jeśli zaznaczony:
     - User wprowadza HP Max, AC, Speed
     - User wprowadza 6 atrybutów (STR/DEX/CON/INT/WIS/CHA)
     - User opcjonalnie dodaje akcje (ActionBuilder)
   - **Akcja:** Click "Create NPC" → wywołanie mutation

5. **Walidacja:**
   - Real-time walidacja pól (React Hook Form + Zod)
   - Wyświetlanie błędów walidacji pod polami
   - Submit button disabled jeśli form invalid

6. **Submit:**
   - Optimistic update - NPC od razu pojawia się w gridzie
   - Pokazanie loading state na przycisku
   - Toast notification po sukcesie/błędzie
   - Zamknięcie dialogu po sukcesie
   - Jeśli combat stats zaznaczony → wywołanie drugiej mutation dla upsertNPCCombatStats

### 8.3. Przeglądanie szczegółów NPC (Slideover)

1. **Otwarcie slideover:**
   - **Akcja:** Click na kartę NPC w gridzie → otwarcie NPCDetailSlideover z prawej strony
   - Slideover width 600px, side="right", overlay z backdrop

2. **Nawigacja między zakładkami:**
   - **Story Tab (default):** wyświetla informacje fabularne NPC
   - **Combat Tab:** wyświetla combat stats (lub przycisk "Add Combat Stats")
   - **Relationships Tab:** wyświetla relacje z innymi NPCs
   - **Akcja:** Click na tab → zmiana aktywnej zakładki

3. **Zamknięcie slideover:**
   - **Akcja:** Click na "X" button w header → zamknięcie slideover
   - **Akcja:** Click na overlay backdrop → zamknięcie slideover

### 8.4. Edycja NPC w Story Tab

1. **Inline edit roli:**
   - **Akcja:** Click na rolę → input field
   - User edytuje rolę
   - **Akcja:** Blur z inputa (kliknięcie poza) → auto-save (mutation)
   - Toast notification po sukcesie/błędzie

2. **Zmiana frakcji/lokacji/statusu:**
   - **Akcja:** Select z dropdown → wywołanie mutation z nową wartością
   - Optimistic update
   - Toast notification po sukcesie

3. **Edycja biografii/personality:**
   - User edytuje treść w rich text editorze
   - **Akcja:** Blur z editora → auto-save (mutation)
   - Toast notification po sukcesie

4. **Upload obrazu:**
   - **Akcja:** Click "Upload Image" lub drag & drop → walidacja (max 5 MB) → kompresja → upload
   - Progress bar podczas uploadu
   - Preview obrazu po sukcesie
   - **Akcja:** Click delete button → usunięcie obrazu (confirmation dialog)

5. **Przeglądanie backlinks:**
   - Sekcja "Mentioned In" pokazuje listę miejsc gdzie NPC jest @mentioned
   - Każdy backlink: typ źródła (ikona), nazwa, link
   - **Akcja:** Click na backlink → nawigacja do źródła (nowa zakładka lub side panel)

### 8.5. Zarządzanie Combat Stats

1. **Dodawanie combat stats:**
   - **Akcja:** Click "Add Combat Stats" w CombatTab → wywołanie mutation z pustymi stats
   - Pokazanie formularza combat stats
   - Toast notification po sukcesie

2. **Edycja combat stats:**
   - User edytuje HP Max, AC, Speed (inline inputs, auto-save on blur)
   - User edytuje ability scores (inline inputs, auto-save on blur)
   - **Akcja:** Blur z inputa → wywołanie mutation upsertNPCCombatStats
   - Toast notification po sukcesie

3. **Dodawanie akcji:**
   - **Akcja:** Click "+ Add Action" → otwarcie ActionBuilder
   - User wypełnia formularz akcji (Name, Type, Attack Bonus, Damage Dice, etc.)
   - **Akcja:** Click "Save" → dodanie akcji do actions_json → wywołanie mutation
   - Toast notification po sukcesie

4. **Edycja/usuwanie akcji:**
   - **Akcja:** Click na akcję → otwarcie ActionBuilder w trybie edit
   - User edytuje dane akcji
   - **Akcja:** Click "Save" → aktualizacja actions_json → wywołanie mutation
   - **Akcja:** Click "Delete" → usunięcie akcji z confirmation dialog

5. **Użycie NPC w combat:**
   - **Akcja:** Click "Use in Combat" → redirect do `/combats/new?npcId=...`
   - Combat wizard otwiera się z preselected NPC

6. **Usuwanie combat stats:**
   - **Akcja:** Click "Remove Combat Stats" (destructive button)
   - Confirmation dialog: "Are you sure you want to remove combat stats?"
   - **Akcja:** Confirm → wywołanie deleteNPCCombatStatsMutation
   - Toast notification + przejście do NoCombatStatsState

### 8.6. Zarządzanie Relationships

1. **Przeglądanie relacji:**
   - RelationshipsTab pokazuje listę relacji NPC
   - Każda relacja: avatar + nazwa drugiego NPC, relationship type, description, strength slider

2. **Dodawanie nowej relacji:**
   - **Akcja:** Click "+ Add Relationship" → otwarcie dialog wyboru NPC
   - User wybiera drugiego NPC z listy (autocomplete dropdown)
   - User wpisuje relationship type (free text, np. "brother", "enemy")
   - User opcjonalnie wpisuje description
   - User opcjonalnie ustawia strength slider (0-100, default 50)
   - **Akcja:** Click "Save" → wywołanie createNPCRelationshipMutation
   - Toast notification po sukcesie

3. **Edycja relacji:**
   - User edytuje relationship type, description lub strength (inline, auto-save on blur)
   - **Akcja:** Blur → wywołanie updateNPCRelationshipMutation
   - Toast notification po sukcesie

4. **Usuwanie relacji:**
   - **Akcja:** Click delete button → confirmation dialog
   - **Akcja:** Confirm → wywołanie deleteNPCRelationshipMutation
   - Toast notification po sukcesie

5. **Nawigacja do powiązanego NPC:**
   - **Akcja:** Click na nazwę lub avatar drugiego NPC → zamknięcie obecnego slideover + otwarcie nowego dla drugiego NPC

### 8.7. @Mentions w rich text editorze

1. **Wpisanie "@":**
   - **Akcja:** User wpisuje "@" w editorze → dropdown z autocomplete
   - Dropdown pokazuje wszystkie encje kampanii (NPCs, locations, quests, etc.)

2. **Search:**
   - User wpisuje kolejne znaki (np. "@volo")
   - Fuzzy search filtruje wyniki real-time
   - Priorytetyzacja recently used entities

3. **Wybór mention:**
   - **Akcja:** Click na encję w dropdown (lub Enter) → wstawienie mention badge
   - Mention renderowany jako kolorowy badge z ikoną

4. **Interakcja z mention:**
   - **Hover:** pokazanie HoverCard z preview encji (nazwa, typ, miniatura)
   - **Click:** nawigacja do karty encji (nowa zakładka lub side panel)

### 8.8. Usuwanie NPC

1. **Akcja delete:**
   - **Akcja:** Click "Edit" w slideover → otwarcie NPCFormDialog w trybie edit
   - W dialogu znajduje się przycisk "Delete NPC" (destructive variant)
   - **Akcja:** Click "Delete NPC" → confirmation dialog: "Are you sure you want to delete this NPC? This action cannot be undone. Related combat stats and relationships will also be deleted."
   - **Akcja:** Confirm → wywołanie deleteNPCMutation
   - Toast notification + zamknięcie dialogu i slideover + usunięcie karty z gridu

## 9. Warunki i walidacja

### 9.1. Warunki walidacji formularza (client-side)

**NPCFormDialog (Zod schema):**

```typescript
const npcFormSchema = z.object({
  // Step 1: Basic Info
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  role: z
    .string()
    .max(100, 'Role must be less than 100 characters')
    .nullable()
    .optional(),
  faction_id: z.string().uuid().nullable().optional(),
  current_location_id: z.string().uuid().nullable().optional(),
  status: z.enum(['alive', 'dead', 'unknown'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  image_url: z.string().url().nullable().optional(),

  // Step 2: Story
  biography_json: z.any().nullable().optional(), // Tiptap JSON
  personality_json: z.any().nullable().optional(), // Tiptap JSON

  // Step 3: Combat (optional)
  addCombatStats: z.boolean(),
  combatStats: z
    .object({
      hp_max: z.number().int().min(1, 'HP Max must be at least 1').max(999),
      armor_class: z.number().int().min(0).max(30),
      speed: z.number().int().min(0).max(999),
      strength: z.number().int().min(1).max(30),
      dexterity: z.number().int().min(1).max(30),
      constitution: z.number().int().min(1).max(30),
      intelligence: z.number().int().min(1).max(30),
      wisdom: z.number().int().min(1).max(30),
      charisma: z.number().int().min(1).max(30),
      actions_json: z.any().nullable().optional(),
    })
    .nullable()
    .optional()
    .refine(
      (data) => {
        // Jeśli addCombatStats jest true, combatStats musi być wypełniony
        return true; // Dodatkowa logika jeśli potrzebna
      },
      { message: 'Combat stats are required when "Add Combat Stats" is checked' }
    ),
});
```

**ActionBuilder (Zod schema):**

```typescript
const actionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['melee_weapon_attack', 'ranged_weapon_attack', 'spell_attack', 'other'], {
    errorMap: () => ({ message: 'Invalid action type' }),
  }),
  attack_bonus: z.number().int().min(-10).max(20).nullable().optional(),
  reach: z.string().max(50).nullable().optional(),
  range: z.string().max(50).nullable().optional(),
  damage_dice: z
    .string()
    .regex(/^\d+d\d+$/, 'Invalid dice format (e.g., 2d6)')
    .nullable()
    .optional(),
  damage_bonus: z.number().int().min(-10).max(20).nullable().optional(),
  damage_type: z.string().max(50).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
});
```

**Walidacja obrazu (ImageUpload):**

```typescript
// W komponencie ImageUpload
function validateImage(file: File): { valid: boolean; error?: string } {
  // Max size: 5 MB
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image size must be less than 5 MB' };
  }

  // Allowed types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Image must be JPEG, PNG or WebP' };
  }

  return { valid: true };
}
```

### 9.2. Warunki walidacji relationships

**CreateNPCRelationshipCommand (validation):**

```typescript
function validateRelationship(command: CreateNPCRelationshipCommand): { valid: boolean; error?: string } {
  // Nie można dodać relacji do samego siebie
  if (command.npc_id_1 === command.npc_id_2) {
    return { valid: false, error: 'Cannot create relationship with self' };
  }

  // Relationship type required
  if (!command.relationship_type || command.relationship_type.trim().length === 0) {
    return { valid: false, error: 'Relationship type is required' };
  }

  // Strength w zakresie 0-100
  if (command.strength !== undefined && (command.strength < 0 || command.strength > 100)) {
    return { valid: false, error: 'Strength must be between 0 and 100' };
  }

  return { valid: true };
}
```

### 9.3. Warunki dostępu (RLS)

**Row-Level Security policies (enforced server-side):**
- User może tylko czytać NPCs z kampanii, które należą do niego (user_id w campaigns table)
- User może tylko tworzyć NPCs w swoich kampaniach
- User może tylko aktualizować/usuwać NPCs z swoich kampanii

**Client-side:**
- Jeśli API zwróci 401 Unauthorized → redirect do /login
- Jeśli API zwróci 404 Not Found → pokazanie "NPC not found" message
- Jeśli API zwróci 403 Forbidden → pokazanie "You don't have access to this campaign" message

### 9.4. Warunki UI

**Disabled states:**
- Submit button w formularzu disabled jeśli:
  - Form invalid (Zod validation failed)
  - Mutation w trakcie (isSubmitting = true)
- Delete button disabled jeśli mutation w trakcie
- Combat stats form disabled jeśli checkbox "Add Combat Stats" nie zaznaczony (progressive disclosure)

**Loading states:**
- Skeleton loading dla gridu NPCs podczas pobierania (useNPCsQuery)
- Skeleton loading dla szczegółów NPC w slideover podczas pobierania (useNPCDetailsQuery)
- Spinner na submit button podczas mutation
- Progress bar podczas uploadu obrazu

**Empty states:**
- Jeśli brak NPCs w kampanii → pokazanie empty state z CTA "Create your first NPC"
- Jeśli brak combat stats → NoCombatStatsState z button "Add Combat Stats"
- Jeśli brak relationships → empty message "No relationships yet"
- Jeśli brak backlinks → empty message "No mentions yet"

## 10. Obsługa błędów

### 10.1. Network Errors

**Wykrywanie:**
```typescript
if (error instanceof TypeError && error.message === 'Failed to fetch') {
  // Network error (offline)
  toast.error('Network error. Please check your connection.');
}
```

**Strategia:**
- React Query automatyczne retry (1x)
- Toast notification z czytelnym komunikatem
- Rollback optimistic updates (onError w mutation)

### 10.2. API Errors

**400 Bad Request (walidacja):**
```typescript
if (error.code === '400') {
  toast.error(error.message || 'Invalid input. Please check your data.');
}
```

**401 Unauthorized (auth):**
```typescript
if (error.code === '401') {
  toast.error('Session expired. Please log in again.');
  router.push('/login');
}
```

**404 Not Found:**
```typescript
if (error.code === 'PGRST116' || error.code === '404') {
  toast.error('NPC not found.');
  // Zamknięcie slideover
  setSelectedNPCId(null);
  setIsSlideoverOpen(false);
}
```

**409 Conflict (circular reference dla relationships):**
```typescript
if (error.code === '409') {
  toast.error('Cannot create relationship: circular reference or duplicate.');
  // Rollback optimistic update
}
```

**500 Internal Server Error:**
```typescript
if (error.code === '500') {
  toast.error('Something went wrong. Please try again later.');
  console.error('Server error:', error);
}
```

### 10.3. File Upload Errors

**Oversized file:**
```typescript
if (file.size > 5 * 1024 * 1024) {
  toast.error('Image size must be less than 5 MB');
  return;
}
```

**Invalid file type:**
```typescript
if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
  toast.error('Image must be JPEG, PNG or WebP');
  return;
}
```

**Upload failed:**
```typescript
try {
  const imageUrl = await uploadNPCImage(campaignId, file);
} catch (error) {
  toast.error('Failed to upload image. Please try again.');
  console.error('Upload error:', error);
}
```

### 10.4. Relationship Validation Errors

**Self-reference:**
```typescript
if (command.npc_id_1 === command.npc_id_2) {
  toast.error('Cannot create relationship with self');
  return;
}
```

**Duplicate relationship:**
- Server-side sprawdzenie czy relacja już istnieje (unique constraint na parę npc_id_1, npc_id_2)
- Jeśli duplicate → API zwraca 409 Conflict
- Toast notification z czytelnym komunikatem

### 10.5. Concurrent Modifications

**Stale data:**
- React Query automatycznie refetch po reconnect
- Invalidate queries po każdej mutation
- Konflikt wersji (jeśli updated_at się nie zgadza) → pokazanie ostrzeżenia i refetch

**Race conditions:**
- React Query automatyczne deduplikowanie requestów (ten sam queryKey)
- Mutations kolejkowane (nie równoległe dla tego samego resource)

### 10.6. Form Validation Errors

**Real-time validation:**
- Zod schema waliduje każde pole on blur
- Błędy wyświetlane pod polami (React Hook Form error state)
- Submit button disabled jeśli form invalid

**Custom validation:**
- Relationship self-reference check przed submit
- Combat stats validation tylko jeśli checkbox zaznaczony

### 10.7. Rich Text Editor Errors

**Invalid JSON structure:**
```typescript
function isValidTiptapJson(json: any): boolean {
  return json?.type === 'doc' && Array.isArray(json?.content);
}

if (!isValidTiptapJson(biographyJson)) {
  toast.error('Invalid description format. Please try again.');
  return;
}
```

**@Mention entity not found:**
- Server-side sprawdzenie czy mentioned entity istnieje
- Jeśli nie istnieje → usunięcie mention z content i toast warning
- Client-side: mention renderowany jako plain text jeśli entity nie może być pobrana

### 10.8. Logging

**Console logging dla debugowania:**
```typescript
// W każdej API funkcji
if (error) {
  console.error('Failed to create NPC:', error);
  throw new Error(error.message);
}
```

**Sentry (opcjonalnie, przyszłość):**
- Automatyczne logowanie błędów do Sentry
- Stack traces dla error debugging
- User context (campaign ID, NPC ID) dla lepszego debugowania

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików i weryfikacja typów

1.1. Weryfikacja typów w `src/types/npcs.ts` - już zaimplementowane ✓

1.2. Weryfikacja typów w `src/types/npc-combat-stats.ts` - już zaimplementowane ✓

1.3. Weryfikacja typów w `src/types/npc-relationships.ts` - już zaimplementowane ✓

1.4. Weryfikacja API helpers:
- `src/lib/api/npcs.ts` - już zaimplementowane ✓
- `src/lib/api/npc-combat-stats.ts` - już zaimplementowane ✓
- `src/lib/api/npc-relationships.ts` - już zaimplementowane ✓

1.5. Utworzenie Zod schemas:
- Plik: `src/lib/schemas/npcs.ts`
- Schemas: `npcFormSchema`, `actionSchema`, `relationshipSchema`

1.6. Utworzenie struktury katalogów:
```
src/components/npcs/
├── NPCsView.tsx
├── NPCsHeader.tsx
├── NPCGrid.tsx
├── NPCCard.tsx
├── NPCsEmptyState.tsx
├── NPCDetailSlideover.tsx
├── StoryTab.tsx
├── CombatTab.tsx
├── RelationshipsTab.tsx
├── NPCFormDialog.tsx
├── ActionBuilder.tsx (reusable, może być w src/components/shared/)
├── ImageUpload.tsx (reusable, może być w src/components/shared/)
└── RichTextEditor.tsx (reusable, może być w src/components/shared/)
```

### Krok 2: Implementacja custom hooks (React Query)

2.1. Utworzenie `src/hooks/useNPCs.ts`:
- `useNPCsQuery(campaignId, filters?)`
- `useNPCDetailsQuery(npcId)` - pobiera NPC, combat stats, relationships
- `useCreateNPCMutation()`
- `useUpdateNPCMutation()`
- `useDeleteNPCMutation()`

2.2. Utworzenie `src/hooks/useNPCCombatStats.ts`:
- `useUpsertNPCCombatStatsMutation()`
- `useDeleteNPCCombatStatsMutation()`

2.3. Utworzenie `src/hooks/useNPCRelationships.ts`:
- `useCreateNPCRelationshipMutation()`
- `useUpdateNPCRelationshipMutation()`
- `useDeleteNPCRelationshipMutation()`

2.4. Implementacja optimistic updates w mutations:
- onMutate: cancel queries, snapshot previous data, optimistic update
- onError: rollback optimistic update, toast error
- onSuccess: invalidate queries, toast success

### Krok 3: Implementacja reusable komponentów

3.1. **RichTextEditor** (Tiptap z @mentions):
- Setup Tiptap z extensions: StarterKit, Image, Link
- Custom @mentions extension (może być osobny krok)
- Toolbar z formatowaniem (bold, italic, headings, lists, etc.)
- onChange handler (emit Tiptap JSON)
- onBlur handler (auto-save trigger)

3.2. **ImageUpload**:
- Drag & drop zone (visual feedback on drag over)
- File input (hidden) z button trigger
- Walidacja (max 5 MB, typy: jpeg/png/webp)
- Client-side kompresja do WebP (library: browser-image-compression)
- Upload do Supabase Storage via `uploadNPCImage()` helper
- Progress bar podczas uploadu
- Preview wybranego obrazu
- Delete button

3.3. **ActionBuilder** (reusable z Player Characters):
- Formularz do dodawania/edycji akcji
- Pola: Name, Type, Attack Bonus, Reach/Range, Damage Dice, Damage Bonus, Damage Type, Description
- Walidacja Zod schema
- Save/Cancel buttons

### Krok 4: Implementacja NPCFormDialog (multi-step form)

4.1. **NPCFormDialog** (Shadcn Dialog, full screen lub large):
- React Hook Form setup z zodResolver
- State dla currentStep (1, 2, 3)
- **Step 1: Basic Info**
  - Inputs: name (required), role, faction (autocomplete), location (autocomplete), status (radio), image (ImageUpload)
- **Step 2: Story**
  - RichTextEditor dla biography
  - RichTextEditor dla personality
- **Step 3: Combat (optional)**
  - Checkbox "Add Combat Stats" (progressive disclosure)
  - CombatStatsForm (enabled gdy checkbox zaznaczony):
    - BasicStatsInputs (HP Max, AC, Speed)
    - AbilityScoresGrid (STR/DEX/CON/INT/WIS/CHA)
    - ActionsList z ActionBuilder
- DialogFooter:
  - BackButton, NextButton, CancelButton, SubmitButton

4.2. **Navigation między krokami:**
- onNext(): walidacja current step → setCurrentStep(currentStep + 1)
- onBack(): setCurrentStep(currentStep - 1)
- onSubmit(): walidacja all steps → wywołanie createNPCMutation (+ upsertNPCCombatStatsMutation jeśli combat stats)

4.3. **Autocomplete dropdowns:**
- FactionSelect: fetch factions via `useFactionsQuery(campaignId)`
- LocationSelect: fetch locations via `useLocationsQuery(campaignId)`

### Krok 5: Implementacja NPCGrid i NPCCard

5.1. **NPCGrid**:
- Fetch NPCs via `useNPCsQuery(campaignId, filters)`
- Grid layout: `grid grid-cols-2 lg:grid-cols-3 gap-6`
- Renderowanie NPCCard[] dla każdego NPC
- Skeleton loading state podczas pobierania

5.2. **NPCCard**:
- Image (square, 200px) lub placeholder jeśli brak image_url
- Nazwa NPC (H3, truncate)
- RoleBadge (kolorowy badge z ikoną)
- FactionBadge (jeśli faction_id assigned)
- LocationBadge (jeśli current_location_id assigned)
- StatusIndicator (alive: emerald dot, dead: red X, unknown: gray ?)
- CombatReadyBadge (jeśli has combat stats)
- Hover effect (border highlight, scale up)
- Click handler → onNPCSelect(npcId)

5.3. **NPCsEmptyState**:
- Empty state message + illustration
- AddNPCButton (emerald variant)

### Krok 6: Implementacja NPCDetailSlideover i zakładek

6.1. **NPCDetailSlideover** (Shadcn Sheet):
- Sheet z side="right" i width 600px
- SlideoverHeader: H2 (NPC name), EditButton, CloseButton
- Tabs (shadcn Tabs) z trzema zakładkami: Story, Combat, Relationships
- Fetch NPC details via `useNPCDetailsQuery(npcId)`
- Loading state (skeleton) podczas fetcha

6.2. **StoryTab**:
- NPCImage (wysokość 300px)
- RoleInput (inline editable z auto-save)
- FactionSelect (autocomplete)
- CurrentLocationSelect (autocomplete)
- StatusRadio (alive/dead/unknown)
- BiographyEditor (RichTextEditor z auto-save)
- PersonalityEditor (RichTextEditor z auto-save)
- BacklinksSection (lista backlinks, TODO: API endpoint)

6.3. **CombatTab**:
- Conditional rendering:
  - **NoCombatStatsState** (jeśli brak stats): Message + AddCombatStatsButton
  - **CombatStatsForm** (jeśli są stats):
    - BasicStatsInputs (HP Max, AC, Speed - inline editable z auto-save)
    - AbilityScoresGrid (inline editable z auto-save)
    - ActionsList:
      - ActionItem[] (Name, Type, Damage)
      - EditButton, DeleteButton dla każdej akcji
      - ActionBuilder (modal) dla dodawania/edycji
    - UseInCombatButton → redirect do `/combats/new?npcId=...`
    - RemoveCombatStatsButton (destructive, z confirmation)

6.4. **RelationshipsTab**:
- RelationshipsList:
  - RelationshipItem[] dla każdej relacji:
    - Avatar + Name drugiego NPC (click → navigate to NPC)
    - RelationshipTypeInput (inline editable z auto-save)
    - DescriptionInput (inline editable z auto-save)
    - StrengthSlider (auto-save on change)
    - DeleteButton (z confirmation)
  - EmptyState jeśli brak relacji
- AddRelationshipButton → otwarcie dialog wyboru NPC + formularz relacji

### Krok 7: Implementacja NPCsHeader z filtrami

7.1. **NPCsHeader**:
- Breadcrumb: fetch campaign name via `useCampaignQuery(campaignId)`
- Links: "My Campaigns" → `/campaigns`, "[Campaign Name]" → `/campaigns/[id]`, "NPCs" (current)
- H1: "NPCs"
- Filtry inline:
  - FactionMultiSelect (shadcn MultiSelect) - fetch factions via `useFactionsQuery(campaignId)`
  - LocationSelect (shadcn Select) - fetch locations via `useLocationsQuery(campaignId)`
  - StatusSelect (shadcn Select) - opcje: alive/dead/unknown
- AddNPCButton (emerald variant)

7.2. **Obsługa filtrów:**
- Local state: `const [filters, setFilters] = useState<NPCFilters>({})`
- onChange handler dla każdego filtra → aktualizacja state → refetch NPCs z nowymi parametrami
- Wyświetlanie filtrów jako badges (np. "Faction: Harpers", "Location: Waterdeep")

### Krok 8: Orchestracja w NPCsView (główny widok)

8.1. **NPCsView** (page.tsx):
- Fetch campaignId z params: `const { id: campaignId } = params;`
- Local state:
  - selectedNPCId (string | null)
  - isSlideoverOpen (boolean)
  - isCreateDialogOpen (boolean)
  - editingNPCId (string | null)
  - filters (NPCFilters)
- Renderowanie:
  - NPCsHeader (pass filters, handlers)
  - NPCGrid (pass NPCs, onNPCSelect) lub NPCsEmptyState (jeśli brak NPCs)
  - NPCDetailSlideover (warunkowo, jeśli isSlideoverOpen)
  - NPCFormDialog (warunkowo, jeśli isCreateDialogOpen || editingNPCId)
- Handlers:
  - onNPCSelect(npcId) → setSelectedNPCId + setIsSlideoverOpen(true)
  - onOpenCreateDialog() → setIsCreateDialogOpen(true)
  - onOpenEditDialog(npcId) → setEditingNPCId(npcId)
  - onCloseDialog() → reset states
  - onFiltersChange(filters) → setFilters

8.2. Integracja z routing:
- Plik: `src/app/(dashboard)/campaigns/[id]/npcs/page.tsx`
- Export default NPCsView
- Dodanie linku "NPCs" w campaign sidebar/navigation

### Krok 9: Image upload i Supabase Storage integration

9.1. **Utworzenie storage bucket** w Supabase:
- Bucket name: `npc-images`
- Public access: true (public URLs)
- RLS policies: user może tylko uploadować do własnych kampanii (folder = campaignId)

9.2. **Implementacja upload helper** (`src/lib/api/storage.ts`):
- `uploadNPCImage(campaignId, file)` - kompresja + upload + return public URL
- `deleteNPCImage(imageUrl)` - usunięcie z storage

9.3. **Client-side kompresja** (library: `browser-image-compression`):
```typescript
import imageCompression from 'browser-image-compression';

async function compressImageToWebP(file: File, maxSizeMB: number): Promise<File> {
  const options = {
    maxSizeMB,
    useWebWorker: true,
    fileType: 'image/webp',
  };
  return await imageCompression(file, options);
}
```

9.4. Integracja w ImageUpload:
- onDrop/onChange → walidacja → kompresja → upload → update form field (image_url)

### Krok 10: Dodanie @mentions do RichTextEditor

10.1. **Custom Tiptap extension** dla @mentions:
- Trigger: wpisanie "@"
- Suggestion plugin (tiptap/suggestion)
- Dropdown z autocomplete (fetch entities via API)
- Fuzzy search (library: `fuse.js`)
- Renderowanie mention jako badge (custom node)

10.2. **API endpoint** dla entities (do autocomplete):
- `GET /api/campaigns/:campaignId/entities/search?q=query`
- Zwraca wszystkie entities (NPCs, locations, quests, etc.) matching query
- Response: `{ id, label, entityType }[]`

10.3. **Mention node rendering**:
- Kolorowy badge z ikoną typu entity
- HoverCard (shadcn) z preview entity on hover
- Click → nawigacja do entity (lub side panel)

10.4. **Backlinks tracking** (server-side):
- Podczas save biography_json/personality_json → parse mentions → insert/update entity_mentions table
- Backlinks query: `SELECT * FROM entity_mentions WHERE target_entity_id = npcId`

### Krok 11: Styling i responsywność

11.1. **Tailwind CSS** styling:
- Konsystentny spacing (p-4, gap-6, etc.)
- Kolorystyka: emerald dla primary actions, red dla destructive
- Dark mode support (dark: variants)

11.2. **Accessibility**:
- Keyboard navigation w gridzie (Tab, Enter)
- ARIA roles: grid, gridcell, dialog, tablist
- Focus management w dialogs i slideover
- Screen reader announcements dla toasts

11.3. **Responsywność:**
- Grid NPCs: 3 kolumny na desktop (1280px+), 2 na tablet (1024px), 1 na mobile
- Slideover: full screen na mobile, 600px width na desktop
- Multi-step form dialog: full screen na mobile, large modal na desktop

### Krok 12: Testowanie

12.1. **Unit tests** (Vitest):
- Testy dla custom hooks (useNPCs, useNPCCombatStats, useNPCRelationships)
- Testy dla form validation (Zod schemas)
- Testy dla utility functions (compressImageToWebP, validateRelationship)

12.2. **Component tests** (React Testing Library):
- Testy dla NPCCard, NPCGrid, NPCsHeader
- Testy dla NPCFormDialog (multi-step navigation)
- Testy dla ActionBuilder

12.3. **E2E tests** (Playwright):
- Test: Create NPC (full flow)
- Test: Edit NPC (Story tab)
- Test: Add combat stats
- Test: Create relationship
- Test: Filter NPCs
- Test: Delete NPC
