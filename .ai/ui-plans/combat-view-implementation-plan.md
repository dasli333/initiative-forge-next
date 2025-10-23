# Plan implementacji widoku Combat

## 1. Przegląd

Widok Combat to główny interfejs do prowadzenia walk w czasie rzeczywistym w systemie D&D 5e. Jest to najbardziej złożony widok w aplikacji Initiative Forge, wykorzystujący hybrydowe podejście do zarządzania stanem (Zustand dla stanu czasu rzeczywistego + backend dla persystencji). Widok składa się z trzech głównych kolumn: listy inicjatywy (30%), karty aktywnej postaci (50%) oraz panelu referencyjnego (20%). Głównym celem jest zapewnienie płynnego prowadzenia walki bez konieczności przełączania kontekstu lub szukania informacji w podręcznikach.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/combats/:id`

Parametry:
- `:id` - UUID walki, wykorzystywane do pobrania danych z API

Notatka: Zgodnie z architekturą API, campaign_id jest zawarte w obiekcie Combat, więc nie jest wymagane w URL.

## 3. Struktura komponentów

```
src/pages/combats/[id].astro (Strona Astro z SSR)
└── CombatViewWrapper.tsx (client:load, React Query wrapper)
    └── CombatTracker.tsx (Główny komponent React)
        ├── InitiativeList.tsx (Lewa kolumna - 30%)
        │   ├── InitiativeHeader.tsx
        │   │   ├── RoundCounter.tsx
        │   │   └── RollInitiativeButton.tsx
        │   └── ScrollArea (Shadcn)
        │       └── InitiativeItem.tsx[] (dla każdego uczestnika)
        │           ├── ParticipantName.tsx
        │           ├── InitiativeBadge.tsx
        │           ├── HPControls.tsx
        │           │   ├── Input (Shadcn)
        │           │   ├── DamageButton.tsx
        │           │   └── HealButton.tsx
        │           ├── ACBadge.tsx
        │           ├── ConditionBadge.tsx[]
        │           └── AddConditionButton.tsx
        │               └── Combobox (Shadcn)
        ├── ActiveCharacterSheet.tsx (Środkowa kolumna - 50%)
        │   ├── CharacterHeader.tsx
        │   │   ├── CharacterName.tsx
        │   │   ├── HPBar.tsx (Progress)
        │   │   └── ACDisplay.tsx
        │   ├── StatsSection.tsx
        │   │   └── StatsGrid.tsx
        │   │       └── StatCard.tsx[] (6 kart)
        │   ├── ActionsSection.tsx
        │   │   └── ActionsList.tsx
        │   │       └── ActionButton.tsx[]
        │   ├── RollControls.tsx
        │   │   └── RadioGroup (Shadcn)
        │   └── RollLog.tsx
        │       └── RollCard.tsx[] (ostatnie 3)
        ├── ReferencePanel.tsx (Prawa kolumna - 20%)
        │   ├── SearchBar.tsx
        │   └── Tabs (Shadcn)
        │       ├── ConditionsTab.tsx
        │       │   └── Accordion (Shadcn)
        │       ├── SpellsTab.tsx
        │       │   ├── SpellFilters.tsx
        │       │   └── SpellCard.tsx[]
        │       └── MonstersTab.tsx
        │           └── MonsterCard.tsx[]
        ├── NextTurnButton.tsx (FAB - fixed bottom-right)
        └── UnsavedChangesDialog.tsx (AlertDialog)
```

## 4. Szczegóły komponentów

### CombatViewWrapper (Wrapper React Query)

**Opis:** Komponent opakowujący zapewniający QueryClientProvider i HydrationBoundary zgodnie z wzorcem używanym w projekcie. Jest to punkt wejścia dla React w tej stronie.

**Główne elementy:**
- `QueryClientProvider` z `getQueryClient()`
- `HydrationBoundary` z `dehydratedState`
- Renderuje `CombatTracker` jako dziecko

**Obsługiwane zdarzenia:** Brak (przekazuje tylko props)

**Walidacja:** Brak

**Typy:**
- `DehydratedState` (z @tanstack/react-query)
- `combatId: string`
- `campaignId: string`

**Propsy:**
```typescript
interface CombatViewWrapperProps {
  dehydratedState: DehydratedState;
  combatId: string;
  campaignId: string;
}
```

### CombatTracker (Główny komponent widoku)

**Opis:** Komponent orkiestrujący, zarządza layoutem trzech kolumn oraz logiką biznesową walki. Łączy store Zustand z komponentami UI. Odpowiada za inicjalizację stanu, obsługę globalnych skrótów klawiszowych.

**Główne elementy:**
- Layout trzech kolumn (Grid z Tailwind: `grid-cols-[30%_50%_20%]`)
- `InitiativeList` (lewa kolumna)
- `ActiveCharacterSheet` (środkowa kolumna)
- `ReferencePanel` (prawa kolumna)
- `NextTurnButton` (floating)
- `UnsavedChangesDialog` (conditional)

**Obsługiwane zdarzenia:**
- Inicjalizacja: `useEffect(() => loadCombat(data), [data])`
- Skróty klawiszowe: `useKeyboardShortcuts({ Space: handleNextTurn, D: focusDamageInput, H: focusHealInput, Escape: handleCancel })`
- Navigation intercept: `useUnsavedChanges(isDirty)`

**Walidacja:** Brak na tym poziomie (delegowane do dzieci)

**Typy:**
- `CombatDTO`
- `CombatParticipantDTO[]`
- `RollMode`
- `RollResult[]`

**Propsy:**
```typescript
interface CombatTrackerProps {
  combatId: string;
  campaignId: string;
}
```

### InitiativeList (Lewa kolumna)

**Opis:** Scrollowalna lista uczestników walki posortowana według inicjatywy. Wyświetla informacje o HP, AC, warunkach oraz pozwala na zadawanie obrażeń i leczenie. Automatycznie przewija do aktywnego uczestnika przy zmianie tury.

**Główne elementy:**
- `InitiativeHeader`: nagłówek z licznikiem rund i przyciskiem "Roll Initiative"
- `ScrollArea` (Shadcn): obszar przewijania
- `InitiativeItem[]`: lista komponentów uczestników (mapowanie po `participants`)

**Obsługiwane zdarzenia:**
- `onRollInitiative()`: wywołuje `rollInitiative()` z store
- `onParticipantUpdate(id, data)`: aktualizuje uczestnika w store
- Auto-scroll: `useEffect(() => scrollToActive(), [activeParticipantIndex])`

**Walidacja:** Brak (delegowana do `InitiativeItem`)

**Typy:**
- `CombatParticipantDTO[]`
- `number` (currentRound)
- `number | null` (activeParticipantIndex)

**Propsy:**
```typescript
interface InitiativeListProps {
  participants: CombatParticipantDTO[];
  currentRound: number;
  activeParticipantIndex: number | null;
  onRollInitiative: () => void;
  onParticipantUpdate: (id: string, updates: Partial<CombatParticipantDTO>) => void;
}
```

### InitiativeItem (Element listy inicjatywy)

**Opis:** Pojedynczy uczestnik walki na liście inicjatywy. Wyświetla nazwę, wartość inicjatywy, HP, AC oraz aktywne warunki. Zawiera kontrolki do zadawania obrażeń i leczenia. Aktywny uczestnik jest wizualnie wyróżniony (emerald glow + background).

**Główne elementy:**
- `<div>` z conditional styling (aktywny: `ring-2 ring-emerald-500 bg-emerald-500/10`)
- `<h3>`: Nazwa uczestnika (większa dla aktywnego)
- `Badge`: Wartość inicjatywy (emerald)
- `HPControls`: Komponenty kontroli HP
- `Badge`: AC z ikoną tarczy
- `ConditionBadge[]`: Aktywne warunki
- `Button`: "+ Add Condition"
- Conditional: Jeśli `current_hp === 0`: opacity-50, skull icon, line-through na nazwie

**Obsługiwane zdarzenia:**
- `onHPChange(amount, type)`: Aktualizuje HP
- `onAddCondition(condition)`: Dodaje warunek
- `onRemoveCondition(conditionId)`: Usuwa warunek

**Walidacja:**
- HP musi być w zakresie [0, max_hp]
- Warunek musi istnieć w bazie conditions
- Nie można dodać duplikatu warunku

**Typy:**
- `CombatParticipantDTO`
- `ActiveConditionDTO[]`
- `boolean` (isActive)

**Propsy:**
```typescript
interface InitiativeItemProps {
  participant: CombatParticipantDTO;
  isActive: boolean;
  onUpdate: (updates: Partial<CombatParticipantDTO>) => void;
  onAddCondition: (condition: ActiveConditionDTO) => void;
  onRemoveCondition: (conditionId: string) => void;
}
```

### HPControls (Kontrolki HP)

**Opis:** Komponent zawierający pole input oraz przyciski DMG i HEAL do zarządzania punktami życia uczestnika. Wartość wpisana w input jest używana przez oba przyciski. Po wykonaniu operacji input jest czyszczony.

**Główne elementy:**
- `Input` (Shadcn) typu number, placeholder "Value"
- `Button` "DMG" (variant destructive, red)
- `Button` "HEAL" (variant default, emerald)
- Display: "X / Y HP"

**Obsługiwane zdarzenia:**
- `onChange(value)`: Aktualizuje lokalny stan inputu
- `onDamage()`: Wywołuje `onHPChange(value, "damage")`, czyści input
- `onHeal()`: Wywołuje `onHPChange(value, "heal")`, czyści input

**Walidacja:**
- Wartość musi być dodatnią liczbą całkowitą
- Przyciski disabled jeśli input pusty lub nieprawidłowy
- Po operacji wynik clampowany do [0, max_hp]

**Typy:**
- `number` (currentHP)
- `number` (maxHP)
- `(amount: number, type: "damage" | "heal") => void` (onHPChange)

**Propsy:**
```typescript
interface HPControlsProps {
  currentHP: number;
  maxHP: number;
  onHPChange: (amount: number, type: "damage" | "heal") => void;
}
```

### ConditionBadge (Badge warunku)

**Opis:** Mały pill badge wyświetlający ikonę i nazwę warunku. Po najechaniu kursorem pokazuje Tooltip z pełnym opisem warunku. Zawiera przycisk X do usunięcia warunku.

**Główne elementy:**
- `Badge` (Shadcn) z custom styling
- Icon (Lucide) reprezentująca warunek
- Nazwa warunku (skrócona jeśli długa)
- `Tooltip` (Shadcn) z pełnym opisem
- `Button` X (małe, w hover)

**Obsługiwane zdarzenia:**
- `onRemove(conditionId)`: Usuwa warunek

**Walidacja:** Brak

**Typy:**
- `ActiveConditionDTO` (condition na uczestnika)
- `ConditionDTO` (pełny opis z bazy)

**Propsy:**
```typescript
interface ConditionBadgeProps {
  condition: ActiveConditionDTO;
  fullCondition: ConditionDTO; // Dla opisu
  onRemove: (conditionId: string) => void;
}
```

### ActiveCharacterSheet (Środkowa kolumna)

**Opis:** Szczegółowa karta aktywnego uczestnika wyświetlająca jego statystyki, dostępne akcje, kontrolki rzutów oraz historię ostatnich rzutów. Jest to główny punkt interakcji podczas tury postaci.

**Główne elementy:**
- `CharacterHeader`: Nazwa, HP bar, AC
- `StatsSection`: Siatka 6 atrybutów
- `ActionsSection`: Lista dostępnych akcji
- `RollControls`: Radio group dla Normal/Advantage/Disadvantage
- `RollLog`: Ostatnie 3 rzuty

**Obsługiwane zdarzenia:**
- `onActionClick(action)`: Wykonuje rzut na atak i obrażenia
- `onRollModeChange(mode)`: Zmienia tryb rzutu

**Walidacja:** Brak na tym poziomie

**Typy:**
- `CombatParticipantDTO` (active participant)
- `RollMode`
- `RollResult[]`

**Propsy:**
```typescript
interface ActiveCharacterSheetProps {
  participant: CombatParticipantDTO | null;
  rollMode: RollMode;
  recentRolls: RollResult[];
  onActionClick: (action: ActionDTO) => void;
  onRollModeChange: (mode: RollMode) => void;
}
```

### StatsGrid (Siatka atrybutów)

**Opis:** Grid 2x3 wyświetlający sześć głównych atrybutów postaci (STR, DEX, CON, INT, WIS, CHA) jako karty z wartością i modyfikatorem.

**Główne elementy:**
- `<div>` z `grid grid-cols-2 gap-4`
- 6x `StatCard` dla każdego atrybutu

**Obsługiwane zdarzenia:** Brak

**Walidacja:** Brak

**Typy:**
- `StatsDTO`

**Propsy:**
```typescript
interface StatsGridProps {
  stats: StatsDTO;
}
```

### StatCard (Karta atrybutu)

**Opis:** Pojedyncza karta wyświetlająca nazwę atrybutu, jego wartość oraz modyfikator w formacie "+X" lub "-X".

**Główne elementy:**
- `Card` (Shadcn)
- Label (muted text): "STR", "DEX", etc.
- Wartość (duży text): np. "16"
- `Badge`: Modyfikator, np. "+3"

**Obsługiwane zdarzenia:** Brak

**Walidacja:** Brak

**Typy:**
- `string` (nazwa)
- `number` (wartość)
- `number` (modyfikator)

**Propsy:**
```typescript
interface StatCardProps {
  name: string; // "STR", "DEX", etc.
  score: number;
  modifier: number;
}
```

### ActionsList (Lista akcji)

**Opis:** Lista dostępnych akcji aktywnej postaci. Każda akcja jest reprezentowana jako przycisk z ikoną, nazwą oraz bonus do ataku i obrażeniami.

**Główne elementy:**
- `<div>` container
- `ActionButton[]` dla każdej akcji
- Empty state: "No actions available" (jeśli brak akcji)

**Obsługiwane zdarzenia:**
- `onActionClick(action)`: Przekazuje do rodzica

**Walidacja:** Brak

**Typy:**
- `ActionDTO[]`

**Propsy:**
```typescript
interface ActionsListProps {
  actions: ActionDTO[];
  onActionClick: (action: ActionDTO) => void;
}
```

### ActionButton (Przycisk akcji)

**Opis:** Przycisk reprezentujący pojedynczą akcję (atak, czar, etc.). Wyświetla ikonę typu akcji, nazwę oraz bonusy. Po kliknięciu wykonuje rzut zgodnie z trybem (normal/adv/disadv).

**Główne elementy:**
- `Button` (Shadcn, variant outline)
- Icon: sword (melee), bow (ranged), sparkles (spell)
- Nazwa akcji
- `Badge`: Bonus do ataku (np. "+5")
- `Badge`: Kości obrażeń (np. "1d8+3")

**Obsługiwane zdarzenia:**
- `onClick()`: Wywołuje `onActionClick(action)`

**Walidacja:** Brak

**Typy:**
- `ActionDTO`

**Propsy:**
```typescript
interface ActionButtonProps {
  action: ActionDTO;
  onClick: (action: ActionDTO) => void;
}
```

### RollControls (Kontrolki trybu rzutu)

**Opis:** Radio group do wyboru trybu rzutu: Normal, Advantage (2d20, wybierz wyższy), Disadvantage (2d20, wybierz niższy). Wybór wpływa na następne rzuty d20.

**Główne elementy:**
- `RadioGroup` (Shadcn)
- 3 opcje:
  - "Normal" z ikoną = (equals)
  - "Advantage" z ikoną ↑↑
  - "Disadvantage" z ikoną ↓↓

**Obsługiwane zdarzenia:**
- `onChange(mode)`: Zmienia tryb rzutu w store

**Walidacja:**
- Musi być jedna z: "normal", "advantage", "disadvantage"

**Typy:**
- `RollMode`: `"normal" | "advantage" | "disadvantage"`

**Propsy:**
```typescript
interface RollControlsProps {
  value: RollMode;
  onChange: (mode: RollMode) => void;
}
```

### RollLog (Historia rzutów)

**Opis:** Wyświetla ostatnie 3 rzuty wykonane przez aktywną postać. Każdy rzut jest reprezentowany jako karta z wizualnym feedbackiem (emerald dla sukcesu, red dla porażki).

**Główne elementy:**
- `<div>` container z stack layout
- `RollCard[]` (max 3, od najnowszego)
- Empty state: "No rolls yet"

**Obsługiwane zdarzenia:** Brak (read-only)

**Walidacja:** Brak

**Typy:**
- `RollResult[]`

**Propsy:**
```typescript
interface RollLogProps {
  rolls: RollResult[];
}
```

### RollCard (Karta rzutu)

**Opis:** Pojedyncza karta reprezentująca wykonany rzut. Wyświetla typ rzutu, wynik (z kolorowaniem), formułę oraz timestamp.

**Główne elementy:**
- `Card` (Shadcn) z conditional styling
- Icon: zależna od typu (Sword, Heart, Shield)
- Label typu: "Attack" / "Damage" / "Save"
- Wynik (duży, emerald jeśli crit/success, red jeśli fail)
- Formuła (muted): "1d20+5" lub "2d6+3"
- Timestamp (muted, relative): "2s ago"

**Obsługiwane zdarzenia:** Brak

**Walidacja:** Brak

**Typy:**
- `RollResult`

**Propsy:**
```typescript
interface RollCardProps {
  roll: RollResult;
}
```

### ReferencePanel (Prawa kolumna)

**Opis:** Panel referencyjny z wyszukiwarką i trzema zakładkami: Conditions, Spells, Monsters. Służy jako szybki dostęp do informacji bez opuszczania ekranu walki.

**Główne elementy:**
- `SearchBar`: Input z debounce 300ms
- `Tabs` (Shadcn) z trzema zakładkami
- `ScrollArea` dla każdej zakładki

**Obsługiwane zdarzenia:**
- `onSearchChange(term)`: Aktualizuje term z debounce
- `onTabChange(tab)`: Zmienia aktywną zakładkę
- `onApplyCondition(conditionId)`: Aplikuje warunek do aktywnego uczestnika

**Walidacja:**
- Search term max 100 znaków

**Typy:**
- `string` (searchTerm)
- `ReferenceTab`: `"conditions" | "spells" | "monsters"`

**Propsy:**
```typescript
interface ReferencePanelProps {
  onApplyCondition: (conditionId: string, participantId: string) => void;
}
```

### ConditionsTab (Zakładka warunków)

**Opis:** Lista wszystkich warunków D&D 5e jako akordeon. Każdy warunek ma przycisk "Apply to [active]" do szybkiego zastosowania.

**Główne elementy:**
- `Accordion` (Shadcn)
- `AccordionItem[]` dla każdego warunku:
  - Icon + Nazwa warunku
  - Pełny opis (po rozwinięciu)
  - `Button` "Apply to [name]" (disabled jeśli brak aktywnego)

**Obsługiwane zdarzenia:**
- `onApply(conditionId)`: Aplikuje warunek

**Walidacja:** Brak (read-only)

**Typy:**
- `ConditionDTO[]`
- `string | null` (activeParticipantId)

**Propsy:**
```typescript
interface ConditionsTabProps {
  conditions: ConditionDTO[];
  activeParticipantId: string | null;
  onApply: (conditionId: string) => void;
}
```

### SpellsTab (Zakładka czarów)

**Opis:** Przeszukiwalna lista czarów z filtrami po poziomie i klasie. Infinite scroll dla dużych list. Czary są tylko do referencji (read-only).

**Główne elementy:**
- `SpellFilters`: Select dla poziomu (0-9), multi-select dla klas
- `ScrollArea` z infinite scroll
- `SpellCard[]` jako akordeon

**Obsługiwane zdarzenia:**
- `onFilterChange(filters)`: Aktualizuje filtry
- Scroll to bottom: `fetchNextPage()`

**Walidacja:** Brak

**Typy:**
- `SpellDTO[]`
- `SpellFilters`: `{ level?: number, classes?: string[] }`

**Propsy:**
```typescript
interface SpellsTabProps {
  searchTerm: string;
}
```

### MonstersTab (Zakładka potworów)

**Opis:** Przeszukiwalna lista potworów z informacjami referencyjnymi. Podobnie jak SpellsTab, służy jako szybki dostęp do statystyk potworów.

**Główne elementy:**
- `ScrollArea` z infinite scroll
- `MonsterCard[]` jako akordeon:
  - Nazwa, CR badge, Type+Size
  - Rozwinięcie: pełne statystyki

**Obsługiwane zdarzenia:**
- Scroll to bottom: `fetchNextPage()`

**Walidacja:** Brak

**Typy:**
- `MonsterDTO[]`

**Propsy:**
```typescript
interface MonstersTabProps {
  searchTerm: string;
}
```

### NextTurnButton (FAB)

**Opis:** Floating Action Button w prawym dolnym rogu ekranu. Przechodzi do następnej tury z animacją. Zawiera również subtext informujący o skrócie klawiszowym (Space).

**Główne elementy:**
- `Button` (fixed position, circular, large, emerald)
- Icon: Arrow right
- Text: "Next Turn"
- Subtext: "(Space)"
- Pulsująca animacja (CSS)

**Obsługiwane zdarzenia:**
- `onClick()`: Wywołuje `nextTurn()` z store

**Walidacja:** Brak

**Typy:** Brak

**Propsy:**
```typescript
interface NextTurnButtonProps {
  onClick: () => void;
  disabled?: boolean; // Jeśli inicjatywa nie została rzucona
}
```

### UnsavedChangesDialog (Dialog ostrzeżenia)

**Opis:** Alert dialog wyświetlany gdy użytkownik próbuje opuścić stronę z niezapisanymi zmianami. Oferuje 3 opcje: zapisz i wyjdź, wyjdź bez zapisywania, anuluj.

**Główne elementy:**
- `AlertDialog` (Shadcn)
- Tytuł: "Unsaved Changes"
- Opis: "You have unsaved changes. Save before leaving?"
- 3 przyciski:
  - "Save & Leave" (emerald)
  - "Leave without saving" (destructive)
  - "Cancel" (secondary)

**Obsługiwane zdarzenia:**
- `onSaveAndLeave()`: Zapisuje stan → nawiguje
- `onLeaveWithoutSaving()`: Odrzuca zmiany → nawiguje
- `onCancel()`: Zamyka dialog

**Walidacja:**
- Pokazuje się tylko jeśli `isDirty === true`

**Typy:**
- `boolean` (isOpen)

**Propsy:**
```typescript
interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
}
```

## 5. Typy

### Typy istniejące (z src/types.ts)

Wykorzystujemy istniejące typy z projektu:

- `CombatDTO`: Pełny obiekt combat z `state_snapshot: CombatSnapshotDTO | null`
- `CombatSnapshotDTO`: `{ participants: CombatParticipantDTO[], active_participant_index: number | null }`
- `CombatParticipantDTO`: Pełne dane uczestnika walki (id, source, display_name, initiative, current_hp, max_hp, armor_class, stats, actions, is_active_turn, active_conditions)
- `StatsDTO`: `{ str, dex, con, int, wis, cha }` (wszystkie number)
- `ActionDTO`: Akcja z polami (name, type, attack_bonus?, damage_dice?, damage_bonus?, damage_type?, description?)
- `ActiveConditionDTO`: `{ condition_id, name, duration_in_rounds }` (duration może być null dla nieokreślonych)
- `ConditionDTO`: Pełny warunek z bazy (id, name, description)
- `SpellDTO`: Czar z polem `data: SpellDataDTO`
- `MonsterDTO`: Potwór z polem `data: MonsterDataDTO`

### Nowe typy wymagane dla widoku

```typescript
// src/types/combat-view.types.ts

/**
 * Tryb rzutu kością d20
 */
export type RollMode = "normal" | "advantage" | "disadvantage";

/**
 * Wynik pojedynczego rzutu (dla roll log)
 */
export interface RollResult {
  id: string; // UUID dla React keys
  type: "attack" | "damage" | "save"; // Typ rzutu
  result: number; // Końcowy wynik (po modyfikatorach)
  formula: string; // Wzór, np. "1d20+5" lub "2d6+3"
  rolls: number[]; // Pojedyncze rzuty kośćmi, np. [12, 18] dla advantage
  modifier: number; // Bonus/penalty
  timestamp: Date; // Czas wykonania
  isCrit?: boolean; // Natural 20 na ataku
  isFail?: boolean; // Natural 1 na ataku
  actionName?: string; // Nazwa akcji, np. "Longsword Attack"
}

/**
 * Aktywna zakładka w panelu referencyjnym
 */
export type ReferenceTab = "conditions" | "spells" | "monsters";

/**
 * Zmiana HP uczestnika
 */
export interface HPChange {
  participantId: string;
  amount: number;
  type: "damage" | "heal";
}

/**
 * Aplikacja warunku do uczestnika
 */
export interface ConditionApplication {
  participantId: string;
  conditionId: string;
  durationInRounds: number | null; // null = nieokreślony
}

/**
 * Stan walki dla Zustand store
 */
export interface CombatState {
  // Stan podstawowy
  combat: CombatDTO | null;
  participants: CombatParticipantDTO[];
  activeParticipantIndex: number | null;
  currentRound: number;

  // Stan UI
  rollMode: RollMode;
  recentRolls: RollResult[];
  isDirty: boolean; // Czy są niezapisane zmiany
  isSaving: boolean; // Czy trwa zapis
  lastSavedAt: Date | null; // Ostatni udany zapis

  // Akcje
  loadCombat: (combat: CombatDTO) => void;
  rollInitiative: () => void;
  nextTurn: () => void;
  updateHP: (participantId: string, amount: number, type: "damage" | "heal") => void;
  addCondition: (participantId: string, condition: ActiveConditionDTO) => void;
  removeCondition: (participantId: string, conditionId: string) => void;
  executeAction: (participantId: string, action: ActionDTO) => void;
  setRollMode: (mode: RollMode) => void;
  saveSnapshot: () => Promise<void>;
  markClean: () => void;
  reset: () => void;
}
```

## 6. Zarządzanie stanem

Widok Combat wykorzystuje hybrydowe podejście do zarządzania stanem:

### Zustand Store (useCombatStore)

**Lokalizacja:** `src/stores/useCombatStore.ts`

**Odpowiedzialność:**
- Zarządzanie stanem walki w czasie rzeczywistym (zero latency)
- Wszystkie operacje turn-by-turn (inicjatywa, next turn, HP, warunki, rzuty)
- Przechowywanie historii rzutów

**Struktura:**

```typescript
import { create } from 'zustand';
import type { CombatState } from '@/types/combat-view.types';
import { rollDice, calculateModifier, executeAttack } from '@/lib/dice';

export const useCombatStore = create<CombatState>((set, get) => ({
  // Stan początkowy
  combat: null,
  participants: [],
  activeParticipantIndex: null,
  currentRound: 1,
  rollMode: "normal",
  recentRolls: [],
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  // Akcja: Załaduj combat z API
  loadCombat: (combat) => {
    set({
      combat,
      participants: combat.state_snapshot?.participants || [],
      activeParticipantIndex: combat.state_snapshot?.active_participant_index ?? null,
      currentRound: combat.current_round,
      isDirty: false,
      recentRolls: [],
    });
  },

  // Akcja: Rzuć inicjatywę dla wszystkich
  rollInitiative: () => {
    const { participants } = get();

    const withInitiative = participants.map(p => ({
      ...p,
      initiative: rollDice(1, 20)[0] + calculateModifier(p.stats.dex),
    }));

    // Sortuj malejąco po inicjatywie
    const sorted = withInitiative.sort((a, b) => b.initiative - a.initiative);

    set({
      participants: sorted,
      activeParticipantIndex: 0,
      isDirty: true,
    });
  },

  // Akcja: Następna tura
  nextTurn: () => {
    const { participants, activeParticipantIndex } = get();

    if (activeParticipantIndex === null) return;

    const nextIndex = activeParticipantIndex + 1;

    if (nextIndex >= participants.length) {
      // Koniec rundy
      set(state => ({
        activeParticipantIndex: 0,
        currentRound: state.currentRound + 1,
        isDirty: true,
      }));

      // Toast: "Round X begins"
      // TODO: Implementacja toast notification
    } else {
      set({
        activeParticipantIndex: nextIndex,
        isDirty: true,
      });
    }
  },

  // Akcja: Aktualizuj HP
  updateHP: (participantId, amount, type) => {
    set(state => ({
      participants: state.participants.map(p => {
        if (p.id !== participantId) return p;

        const delta = type === "damage" ? -amount : amount;
        const newHP = Math.max(0, Math.min(p.max_hp, p.current_hp + delta));

        return { ...p, current_hp: newHP };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Dodaj warunek
  addCondition: (participantId, condition) => {
    set(state => ({
      participants: state.participants.map(p => {
        if (p.id !== participantId) return p;

        // Sprawdź duplikaty
        if (p.active_conditions.some(c => c.condition_id === condition.condition_id)) {
          return p;
        }

        return {
          ...p,
          active_conditions: [...p.active_conditions, condition],
        };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Usuń warunek
  removeCondition: (participantId, conditionId) => {
    set(state => ({
      participants: state.participants.map(p => {
        if (p.id !== participantId) return p;

        return {
          ...p,
          active_conditions: p.active_conditions.filter(c => c.condition_id !== conditionId),
        };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Wykonaj akcję (atak)
  executeAction: (participantId, action) => {
    const { rollMode, participants } = get();
    const participant = participants.find(p => p.id === participantId);

    if (!participant) return;

    // Rzut na trafienie
    const attackResult = executeAttack(action, rollMode);

    // Rzut na obrażenia (jeśli trafiono)
    // TODO: Implementacja logiki damage roll

    // Dodaj do roll log
    const rollResult: RollResult = {
      id: crypto.randomUUID(),
      type: "attack",
      result: attackResult.total,
      formula: `1d20+${action.attack_bonus || 0}`,
      rolls: attackResult.rolls,
      modifier: action.attack_bonus || 0,
      timestamp: new Date(),
      isCrit: attackResult.isCrit,
      isFail: attackResult.isFail,
      actionName: action.name,
    };

    set(state => ({
      recentRolls: [rollResult, ...state.recentRolls].slice(0, 3),
    }));
  },

  // Akcja: Zmień tryb rzutu
  setRollMode: (mode) => {
    set({ rollMode: mode });
  },

  // Akcja: Zapisz snapshot do API
  saveSnapshot: async () => {
    const { combat, participants, activeParticipantIndex, currentRound, isSaving } = get();

    if (!combat || isSaving) return;

    set({ isSaving: true });

    try {
      const snapshot: CombatSnapshotDTO = {
        participants,
        active_participant_index: activeParticipantIndex,
      };

      const response = await fetch(
        `/api/campaigns/${combat.campaign_id}/combats/${combat.id}/snapshot`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state_snapshot: snapshot,
            current_round: currentRound,
          }),
        }
      );

      if (!response.ok) throw new Error("Save failed");

      set({
        isDirty: false,
        isSaving: false,
        lastSavedAt: new Date(),
      });
    } catch (error) {
      set({ isSaving: false });
      // TODO: Wyświetl toast z błędem
      throw error;
    }
  },

  // Akcja: Oznacz jako zapisane
  markClean: () => {
    set({ isDirty: false });
  },

  // Akcja: Reset stanu
  reset: () => {
    set({
      combat: null,
      participants: [],
      activeParticipantIndex: null,
      currentRound: 1,
      rollMode: "normal",
      recentRolls: [],
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
    });
  },
}));
```

### Custom Hooks

**useCombat(combatId: string)**

Lokalizacja: `src/hooks/queries/useCombat.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import type { CombatDTO } from "@/types";

export function useCombat(combatId: string) {
  return useQuery({
    queryKey: ["combat", combatId],
    queryFn: async () => {
      const response = await fetch(`/api/combats/${combatId}`);
      if (!response.ok) throw new Error("Failed to fetch combat");
      return response.json() as Promise<CombatDTO>;
    },
    staleTime: 0, // Zawsze świeże (real-time state)
    refetchOnWindowFocus: false, // Nie refetch przy focus (mamy Zustand)
  });
}
```

**useSaveSnapshot(combatId: string, campaignId: string)**

Lokalizacja: `src/hooks/mutations/useSaveSnapshot.ts`

```typescript
import { useMutation } from "@tanstack/react-query";
import type { CombatSnapshotDTO } from "@/types";

export function useSaveSnapshot(combatId: string, campaignId: string) {
  return useMutation({
    mutationFn: async ({ snapshot, round }: { snapshot: CombatSnapshotDTO; round: number }) => {
      const response = await fetch(
        `/api/campaigns/${campaignId}/combats/${combatId}/snapshot`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state_snapshot: snapshot,
            current_round: round,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save snapshot");
      return response.json();
    },
  });
}
```

**useConditions()**

Lokalizacja: `src/hooks/queries/useConditions.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import type { ConditionDTO } from "@/types";

export function useConditions() {
  return useQuery({
    queryKey: ["conditions"],
    queryFn: async () => {
      const response = await fetch("/api/conditions");
      if (!response.ok) throw new Error("Failed to fetch conditions");
      const data = await response.json();
      return data.conditions as ConditionDTO[];
    },
    staleTime: Infinity, // Warunki nie zmieniają się
  });
}
```

**useUnsavedChanges(isDirty: boolean, onBeforeUnload: () => void)**

Lokalizacja: `src/hooks/useUnsavedChanges.ts`

```typescript
import { useEffect } from "react";

export function useUnsavedChanges(
  isDirty: boolean,
  onBeforeUnload: () => void
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Chrome wymaga tej linii
        onBeforeUnload();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, onBeforeUnload]);
}
```

**useKeyboardShortcuts(handlers: Record<string, () => void>)**

Lokalizacja: `src/hooks/useKeyboardShortcuts.ts`

```typescript
import { useEffect } from "react";

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignoruj jeśli użytkownik jest w input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlers]);
}
```

## 7. Integracja API

### Prefetch na serwerze (Astro page)

**Lokalizacja:** `src/pages/combats/[id].astro`

```astro
---
import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CombatViewWrapper } from "@/components/combat/CombatViewWrapper";
import Layout from "@/layouts/Layout.astro";

export const prerender = false;

const { id } = Astro.params;

if (!id) {
  return Astro.redirect("/404");
}

const queryClient = getQueryClient();

// Prefetch combat data
try {
  await queryClient.prefetchQuery({
    queryKey: ["combat", id],
    queryFn: async () => {
      const response = await fetch(`${Astro.url.origin}/api/combats/${id}`, {
        headers: {
          Cookie: Astro.request.headers.get("Cookie") || "",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return Astro.redirect("/404");
        }
        throw new Error("Failed to fetch combat");
      }

      return response.json();
    },
  });
} catch (error) {
  console.error("Error prefetching combat:", error);
  return Astro.redirect("/404");
}

const dehydratedState = dehydrate(queryClient);

// Wyciągnij campaignId z prefetched data
const combatData = queryClient.getQueryData(["combat", id]) as any;
const campaignId = combatData?.campaign_id;

if (!campaignId) {
  return Astro.redirect("/404");
}
---

<Layout title="Combat">
  <CombatViewWrapper
    client:load
    dehydratedState={dehydratedState}
    combatId={id}
    campaignId={campaignId}
  />
</Layout>
```

### Typy Request/Response

**GET /api/campaigns/:campaignId/combats/:id**
- Request: Brak (params w URL)
- Response: `CombatDTO`

**PATCH /api/campaigns/:campaignId/combats/:id/snapshot**
- Request: `UpdateCombatSnapshotCommand`
  ```typescript
  {
    state_snapshot: CombatSnapshotDTO,
    current_round: number
  }
  ```
- Response: `CombatDTO` (zaktualizowany)

**PATCH /api/campaigns/:campaignId/combats/:id/status**
- Request: `UpdateCombatStatusCommand`
  ```typescript
  {
    status: "active" | "completed"
  }
  ```
- Response: `CombatDTO`

**GET /api/conditions**
- Request: Brak
- Response: `{ conditions: ConditionDTO[] }`

**GET /api/spells**
- Request: Query params (search, level, class, limit, offset)
- Response: `ListSpellsResponseDTO`
  ```typescript
  {
    spells: SpellDTO[],
    total: number,
    limit: number,
    offset: number
  }
  ```

**GET /api/monsters**
- Request: Query params (search, cr, limit, offset)
- Response: `ListMonstersResponseDTO`
  ```typescript
  {
    monsters: MonsterDTO[],
    total: number,
    limit: number,
    offset: number
  }
  ```

## 8. Interakcje użytkownika

### Lista inicjatywy

1. **Rzut na inicjatywę**
   - Użytkownik: Klika "Roll Initiative"
   - System: Dla każdego uczestnika: `d20 + mod(DEX)` → sortuje malejąco → ustawia `activeParticipantIndex = 0` → wyświetla emerald glow na pierwszym
   - Result: Lista posortowana, pierwsza postać aktywna

2. **Zadawanie obrażeń**
   - Użytkownik: Wpisuje wartość (np. 8) w input HP → klika "DMG"
   - System: Wywołuje `updateHP(participantId, 8, "damage")` → odejmuje 8 od current_hp (clamp do 0) → czyści input → ustawia `isDirty = true`
   - Result: HP zaktualizowane, input pusty
   - Edge case: Jeśli HP spadnie do 0 → opacity 0.5, skull icon, strikethrough nazwa

3. **Leczenie**
   - Użytkownik: Wpisuje wartość (np. 5) → klika "HEAL"
   - System: Wywołuje `updateHP(participantId, 5, "heal")` → dodaje 5 do current_hp (clamp do max_hp) → czyści input → ustawia `isDirty = true`
   - Result: HP zaktualizowane, nie przekracza max

4. **Dodawanie warunku**
   - Użytkownik: Klika "+ Add Condition" → otwiera się Combobox → wybiera "Poisoned"
   - System: Wywołuje `addCondition(participantId, { condition_id, name: "Poisoned", duration_in_rounds: null })` → dodaje do `active_conditions` → wyświetla badge
   - Result: Badge "Poisoned" pojawia się obok nazwy
   - Hover: Tooltip z pełnym opisem warunku

5. **Usuwanie warunku**
   - Użytkownik: Klika X na badge warunku
   - System: Wywołuje `removeCondition(participantId, conditionId)` → usuwa z `active_conditions`
   - Result: Badge znika

### Karta aktywnej postaci

6. **Wykonanie akcji (atak)**
   - Użytkownik: Klika przycisk "Longsword" (attack_bonus: +5, damage: 1d8+3)
   - System:
     - Sprawdza `rollMode` (np. "advantage")
     - Rzuca 2d20, wybiera wyższy (np. 12, 18 → 18)
     - Dodaje +5 → total 23
     - Sprawdza natural 20 (crit)
     - Rzuca damage: 1d8+3
     - Tworzy `RollResult` → dodaje do `recentRolls` (max 3)
   - Result: W roll log pojawia się karta z wynikiem 23 (emerald jeśli crit)

7. **Zmiana trybu rzutu**
   - Użytkownik: Klika radio "Advantage" w RollControls
   - System: Wywołuje `setRollMode("advantage")`
   - Result: Następne rzuty d20 będą z przewagą (2d20, wyższy)

### Panel referencyjny

8. **Wyszukiwanie czarów**
   - Użytkownik: Wpisuje "fireball" w search bar
   - System: Debounce 300ms → wywołuje query z `search="fireball"` → filtruje listę
   - Result: Wyświetla tylko czary zawierające "fireball"

9. **Filtrowanie czarów**
   - Użytkownik: Wybiera Level 3, Class "Wizard" w filtrach
   - System: Aktualizuje query params → refetch
   - Result: Tylko czary 3 poziomu dla Wizarda

10. **Aplikowanie warunku z panelu**
    - Użytkownik: Otwiera Conditions tab → rozwija "Stunned" → klika "Apply to Aragorn"
    - System: Wywołuje `addCondition(activeParticipantId, { condition_id, name: "Stunned", duration_in_rounds: null })`
    - Result: Badge "Stunned" pojawia się przy Aragorn na liście inicjatywy

### Floating Action Button

11. **Następna tura (klik)**
    - Użytkownik: Klika FAB "Next Turn"
    - System:
      1. Wywołuje `nextTurn()`
      2. Sprawdza czy to ostatni uczestnik → jeśli tak, zwiększa `currentRound`, resetuje `activeParticipantIndex = 0`, toast "Round X begins"
      3. Jeśli nie, zwiększa `activeParticipantIndex`
      4. Animacje:
         - Fade out emerald glow poprzedniej postaci (200ms)
         - Smooth scroll do nowej postaci (300ms)
         - Fade in emerald glow nowej postaci (300ms)
         - Fade out old card → fade in new card (200ms każda)
      5. Ustawia `isDirty = true`
    - Result: Aktywna jest następna postać, animacja smooth

12. **Następna tura (Spacebar)**
    - Użytkownik: Naciśka spację (nie będąc w input)
    - System: Jak w punkcie 11
    - Result: Jak w punkcie 11

### Nawigacja

13. **Próba opuszczenia z niezapisanymi zmianami**
    - Użytkownik: Klika link w nawigacji (np. "Campaigns") przy `isDirty = true`
    - System:
      1. `useUnsavedChanges` hook interceptuje nawigację
      2. Wyświetla `UnsavedChangesDialog`
      3. Użytkownik wybiera jedną z 3 opcji:
         - "Save & Leave": Wywołuje `saveSnapshot()` → po sukcesie `navigate(href)`
         - "Leave without saving": Od razu `navigate(href)`, odrzuca zmiany
         - "Cancel": Zamyka dialog, zostaje na stronie
    - Result: Dialog chroni przed utratą danych

## 9. Warunki i walidacja

### Warunki walidowane przez interfejs

1. **HP Input (InitiativeItem)**
   - **Komponent:** HPControls
   - **Warunki:**
     - Wartość musi być liczbą całkowitą
     - Wartość musi być dodatnia (> 0)
     - Po operacji wynik clampowany do [0, max_hp]
   - **Wpływ na UI:**
     - Input czerwony border jeśli niepoprawna wartość
     - Przyciski DMG/HEAL disabled jeśli input pusty lub niepoprawny

2. **Dodawanie warunku (InitiativeItem)**
   - **Komponent:** AddConditionButton → Combobox
   - **Warunki:**
     - Warunek musi istnieć w bazie conditions (GET /api/conditions)
     - Nie można dodać duplikatu warunku (sprawdzenie po condition_id)
   - **Wpływ na UI:**
     - Combobox pokazuje tylko dostępne warunki
     - Duplikaty są ignorowane (silent fail lub toast "Already applied")

3. **Rzut inicjatywy (InitiativeList)**
   - **Komponent:** RollInitiativeButton
   - **Warunki:**
     - Inicjatywa może być rzucona tylko raz (lub reset całej walki)
     - Wszyscy uczestnicy muszą mieć wartość DEX w stats
   - **Wpływ na UI:**
     - Przycisk "Roll Initiative" disabled po pierwszym rzucie
     - Jeśli brak DEX → użyj 10 (modyfikator 0)

4. **Następna tura (NextTurnButton)**
   - **Komponent:** NextTurnButton
   - **Warunki:**
     - Inicjatywa musi być rzucona (`activeParticipantIndex !== null`)
     - Musi być przynajmniej 1 uczestnik
   - **Wpływ na UI:**
     - FAB disabled jeśli inicjatywa nie rzucona
     - Pokazuje tooltip "Roll initiative first"

5. **Wykonanie akcji (ActionButton)**
   - **Komponent:** ActionButton
   - **Warunki:**
     - Akcja musi mieć `attack_bonus` (dla ataku) lub `damage_dice` (dla obrażeń)
     - Rollmode musi być valid: "normal" | "advantage" | "disadvantage"
   - **Wpływ na UI:**
     - Przycisk akcji disabled jeśli brak wymaganych pól
     - Roll log pokazuje error jeśli rzut się nie powiódł

6. **Aplikowanie warunku z panelu (ConditionsTab)**
   - **Komponent:** ApplyConditionButton
   - **Warunki:**
     - Musi być aktywny uczestnik (`activeParticipantIndex !== null`)
     - Warunek nie może być już zastosowany do tego uczestnika
   - **Wpływ na UI:**
     - Przycisk "Apply to [name]" disabled jeśli brak aktywnego
     - Jeśli już zastosowany → pokazuje "Already applied"

7. **Search w panelu referencyjnym (ReferencePanel)**
   - **Komponent:** SearchBar
   - **Warunki:**
     - Search term max 100 znaków
     - Debounce 300ms przed wywołaniem query
   - **Wpływ na UI:**
     - Input max length 100
     - Skeleton loader podczas ładowania wyników

## 10. Obsługa błędów

### 1. Combat Not Found (404)

**Gdzie:** Podczas ładowania strony (prefetch lub query)

**Przyczyna:**
- Combat nie istnieje w bazie
- User nie ma dostępu (nie jest ownerem kampanii)

**Obsługa:**
```typescript
// W src/pages/combats/[id].astro
if (!response.ok) {
  if (response.status === 404) {
    return Astro.redirect("/404");
  }
}

// Alternatywnie, in-page error state:
// Wyświetl pełnoekranowy ErrorState
<ErrorState
  title="Combat not found"
  message="This combat doesn't exist or you don't have access."
  action={<Button onClick={() => navigate('/combats')}>Back to Combats</Button>}
/>
```

**User feedback:**
- Przekierowanie na stronę 404 LUB
- Pełnoekranowy error state z przyciskiem powrotu

### 2. Corrupted State Snapshot

**Gdzie:** Podczas parsowania `state_snapshot` z API

**Przyczyna:**
- JSONB w bazie uszkodzony
- Niezgodność struktury z `CombatSnapshotDTO`

**Obsługa:**
```typescript
// W useCombatStore.loadCombat()
try {
  const participants = combat.state_snapshot?.participants || [];
  // Walidacja struktury
  if (!Array.isArray(participants)) {
    throw new Error("Invalid snapshot structure");
  }

  set({ participants, ... });
} catch (error) {
  // Wyświetl error banner
  toast.error("Failed to load combat state", {
    description: "The combat data is corrupted.",
    action: {
      label: "Reset Combat",
      onClick: () => {
        // Resetuj state_snapshot do initial state
        resetCombatSnapshot(combatId);
      },
    },
  });
}
```

**User feedback:**
- Toast notification z czerwonym tłem
- Opcje: "Retry" (refetch) / "Reset Combat" (resetuj do pustego state)

### 3. API Save Error

**Gdzie:** Podczas manual save (`saveSnapshot()`)

**Przyczyna:**
- Błąd sieci
- Błąd serwera (500)
- Timeout

**Obsługa:**
```typescript
// W useCombatStore.saveSnapshot()
try {
  const response = await fetch(...);
  if (!response.ok) throw new Error("Save failed");

  set({ isDirty: false, lastSavedAt: new Date() });
} catch (error) {
  // Retry z exponential backoff
  set({ isSaving: false });

  toast.error("Failed to save", {
    description: "Your changes may be lost.",
    action: {
      label: "Retry",
      onClick: () => saveSnapshot(),
    },
  });

  // Auto-retry 3x z backoff: 2s, 4s, 8s
  retryWithBackoff(saveSnapshot, 3);
}
```

**User feedback:**
- Toast notification "Failed to save. Changes may be lost."
- Przycisk "Retry" w toast
- Auto-retry w tle (3 próby)

### 4. Network Error

**Gdzie:** Dowolne wywołanie API (conditions, spells, monsters)

**Przyczyna:**
- Brak połączenia z internetem
- Serwer offline

**Obsługa:**
```typescript
// W React Query configuration (queryClient)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "online", // Tylko gdy online
    },
  },
});

// W komponentach
if (error && error.message.includes("network")) {
  return (
    <ErrorState
      title="Network Error"
      message="Check your internet connection."
      action={<Button onClick={() => refetch()}>Retry</Button>}
    />
  );
}
```

**User feedback:**
- Skeleton loader → Error state "Network error"
- Przycisk "Retry"
- Auto-retry 3x w tle

### 5. Invalid HP Input

**Gdzie:** HPControls component

**Przyczyna:**
- User wpisał tekst zamiast liczby
- User wpisał liczbę ujemną

**Obsługa:**
```typescript
// W HPControls
const [value, setValue] = useState("");
const [error, setError] = useState("");

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setValue(val);

  // Walidacja
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) {
    setError("Must be a positive number");
  } else {
    setError("");
  }
};

const isValid = !error && value !== "";
```

**User feedback:**
- Input czerwony border jeśli błąd
- Małą czerwonym textem pod inputem: "Must be a positive number"
- Przyciski DMG/HEAL disabled

### 6. Missing Conditions Data

**Gdzie:** ConditionsTab component

**Przyczyna:**
- Endpoint /api/conditions zwrócił błąd
- Brak danych w bazie

**Obsługa:**
```typescript
// W ConditionsTab
const { data, isLoading, error, refetch } = useConditions();

if (isLoading) {
  return <SkeletonLoader />;
}

if (error) {
  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground">Failed to load conditions</p>
      <Button onClick={() => refetch()} className="mt-2">
        Retry
      </Button>
    </div>
  );
}
```

**User feedback:**
- Skeleton loader podczas ładowania
- Error state "Failed to load conditions" + przycisk "Retry"

### 7. Unsaved Changes on Browser Close

**Gdzie:** useUnsavedChanges hook

**Przyczyna:**
- User zamyka kartę/okno przeglądarki przy `isDirty = true`

**Obsługa:**
```typescript
// W useUnsavedChanges
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = ""; // Wyświetli natywny dialog przeglądarki
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);
```

**User feedback:**
- Natywny dialog przeglądarki: "Leave site? Changes you made may not be saved."

## 11. Kroki implementacji

### Faza 1: Setup i typy (1-2 dni)

1. **Stwórz strukturę plików**
   ```
   src/types/combat-view.types.ts
   src/stores/useCombatStore.ts
   src/lib/dice.ts
   src/hooks/queries/useCombat.ts
   src/hooks/queries/useConditions.ts
   src/hooks/mutations/useSaveSnapshot.ts
   src/hooks/useUnsavedChanges.ts
   src/hooks/useKeyboardShortcuts.ts
   src/components/combat/
   src/pages/combats/[id].astro
   ```

2. **Zdefiniuj wszystkie typy**
   - Skopiuj `RollMode`, `RollResult`, `ReferenceTab`, `CombatState` do `combat-view.types.ts`
   - Export wszystkich typów

3. **Zaimplementuj dice utility**
   - Funkcje: `rollDice(count, sides)`, `calculateModifier(score)`, `rollWithMode(mode)`, `executeAttack(action, mode)`

4. **Stwórz custom hooks**
   - Zaimplementuj `useCombat`, `useConditions`, `useSaveSnapshot`
   - Zaimplementuj `useUnsavedChanges`, `useKeyboardShortcuts`

### Faza 2: Zustand Store (2-3 dni)

5. **Zaimplementuj useCombatStore**
   - Skopiuj strukturę z sekcji 6
   - Zaimplementuj wszystkie akcje: `loadCombat`, `rollInitiative`, `nextTurn`, `updateHP`, `addCondition`, `removeCondition`, `executeAction`, `setRollMode`, `saveSnapshot`, `markClean`, `reset`
   - Przetestuj każdą akcję w izolacji

6. **Dodaj logikę rzutów kośćmi**
   - Integruj `executeAction` z dice utility
   - Implementuj advantage/disadvantage logic
   - Testuj crit/fail detection (natural 20/1)

### Faza 3: Komponenty bazowe (2-3 dni)

7. **Stwórz komponenty UI (bottom-up)**
   - `Badge` components: `InitiativeBadge`, `ACBadge`, `ConditionBadge`
   - `StatCard`, `StatsGrid`
   - `RollCard`, `RollLog`
   - `HPControls`
   - Przetestuj każdy w izolacji (Storybook opcjonalnie)

8. **Stwórz komponenty akcji**
   - `ActionButton`, `ActionsList`
   - `RollControls` (RadioGroup)
   - Przetestuj z mock data

### Faza 4: Główne kolumny (3-4 dni)

9. **Zaimplementuj InitiativeList**
   - `InitiativeHeader` (RoundCounter, RollInitiativeButton)
   - `InitiativeItem` (całość z HP controls, conditions)
   - Auto-scroll do aktywnej postaci
   - Przetestuj z 5-10 uczestnikami

10. **Zaimplementuj ActiveCharacterSheet**
    - `CharacterHeader` (nazwa, HP bar, AC)
    - `StatsSection` + `StatsGrid`
    - `ActionsSection` + `ActionsList`
    - `RollControls` + `RollLog`
    - Przetestuj z różnymi postaciami

11. **Zaimplementuj ReferencePanel**
    - `SearchBar` z debounce
    - `Tabs` (Shadcn)
    - `ConditionsTab` (Accordion)
    - `SpellsTab` (z filtrami, infinite scroll)
    - `MonstersTab` (infinite scroll)
    - Przetestuj search i filtry

### Faza 5: Layout i integracja (2-3 dni)

12. **Stwórz CombatTracker (główny komponent)**
    - Layout trzech kolumn (Grid)
    - Podłącz wszystkie kolumny
    - Integracja z useCombatStore
    - Keyboard shortcuts

13. **Stwórz NextTurnButton (FAB)**
    - Fixed positioning
    - Pulsująca animacja
    - Keyboard shortcut (Space)

14. **Stwórz UnsavedChangesDialog**
    - AlertDialog (Shadcn)
    - 3 akcje: Save & Leave, Leave without saving, Cancel
    - Integracja z useUnsavedChanges

### Faza 6: Strona Astro i wrapper (1 dzień)

15. **Stwórz stronę Astro**
    - `src/pages/combats/[id].astro`
    - Prefetch combat data
    - Dehydrate query client
    - Error handling (404)

16. **Stwórz CombatViewWrapper**
    - QueryClientProvider
    - HydrationBoundary
    - Przekaż props do CombatTracker

### Faza 7: Animacje i UX (2-3 dni)

17. **Zaimplementuj turn transition animations**
    - Fade out old glow (200ms)
    - Smooth scroll to new (300ms)
    - Fade in new glow (300ms)
    - Card transition (fade out → fade in, 200ms każda)
    - Przetestuj płynność

18. **Dodaj 0 HP state**
    - Opacity 0.5
    - Skull icon
    - Strikethrough nazwa
    - aria-label "[Name] is unconscious"

19. **Dodaj end-of-round toast**
    - Toast "Round X begins" (emerald, auto-dismiss 3s)
    - Triggered po ostatniej turze

### Faza 8: Accessibility i keyboard (1-2 dni)

20. **Dodaj ARIA support**
    - aria-live regions dla rzutów
    - aria-live dla zmian tury
    - Focus management (po Next Turn → focus na aktywną postać)
    - aria-labels dla icon-only buttons

21. **Przetestuj keyboard navigation**
    - Tab przez wszystkie kontrolki
    - Space dla Next Turn
    - D/H dla focus damage/heal input (opcjonalnie)
    - Escape dla cancel/close

### Faza 9: Error handling i edge cases (1-2 dni)

22. **Implementuj wszystkie error states**
    - 404 page redirect
    - Corrupted state handling
    - Save error toast z retry
    - Network error states
    - Invalid input feedback

23. **Przetestuj edge cases**
    - 0 HP uczestnik
    - Duplikaty warunków
    - Empty action list
    - Brak aktywnego uczestnika
    - >20 uczestników (virtualization warning)
    

---

**Koniec planu implementacji**
