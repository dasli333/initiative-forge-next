# Plan implementacji widoku Monsters Library

## 1. Przegląd

Widok Monsters Library (`/monsters`) to globalna, przeszukiwalna biblioteka potworów z SRD (System Reference Document) dla D&D 5e. Umożliwia Mistrzom Gry (DM) szybkie wyszukiwanie i przeglądanie statystyk potworów podczas przygotowań do sesji lub w jej trakcie. Widok oferuje dynamiczne wyszukiwanie po nazwie z debounce, filtrowanie po Challenge Rating (CR), infinite scroll dla wydajnej paginacji oraz slideover z pełnymi statystykami potwora. Biblioteka jest dostępna globalnie, bez konieczności wyboru kampanii.

## 2. Routing widoku

**Ścieżka:** `/monsters`

**Plik:** `src/pages/monsters.astro`

**Typ:** Publiczny widok (bez wymaganej autentykacji zgodnie z RLS policy API)

## 3. Struktura komponentów

```
MonstersPage (Astro)
└── MonstersLibraryView (React)
    ├── MonstersHeader (React)
    │   ├── SearchBar (React)
    │   ├── CRFilter (React)
    │   └── Button (Shadcn - Reset filters)
    ├── MonsterGrid (React)
    │   ├── MonsterCard (React) - wielokrotnie
    │   ├── SkeletonCards (React) - loading state
    │   ├── EmptyState (React) - no results
    │   └── LoadingSpinner (React) - infinite scroll loading
    └── MonsterSlideover (React - Shadcn Sheet)
        └── MonsterDetails (React)
            ├── BasicInfoSection (React)
            ├── AbilityScoresTable (React)
            ├── SkillsSensesLanguages (React)
            ├── TraitsAccordion (Shadcn Accordion)
            ├── ActionsAccordion (Shadcn Accordion)
            ├── BonusActionsAccordion (Shadcn Accordion) - conditional
            └── ReactionsAccordion (Shadcn Accordion) - conditional
```

## 4. Szczegóły komponentów

### 4.1. MonstersPage (Astro component)

**Opis komponentu:**
Główna strona Astro dla route `/monsters`. Służy jako wrapper SSR dla React component `MonstersLibraryView`. Odpowiada za podstawowy layout strony, import stylów i przekazanie control do React dla interaktywności.

**Główne elementy:**
- Layout import (`BaseLayout` lub `MainLayout`)
- Import client-side React component `MonstersLibraryView`
- Meta tags dla SEO (title: "Monsters Library", description)
- Client directive `client:load` dla React component

**Obsługiwane interakcje:**
- Brak (server-rendered wrapper)

**Obsługiwana walidacja:**
- Brak

**Typy:**
- Brak (Astro component)

**Propsy:**
- Brak (route entry point)

**Przykładowa struktura:**
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import MonstersLibraryView from '@/components/monsters/MonstersLibraryView';
---

<BaseLayout title="Monsters Library">
  <MonstersLibraryView client:load />
</BaseLayout>
```

### 4.2. MonstersLibraryView (React component)

**Opis komponentu:**
Główny kontener React zarządzający całym widokiem biblioteki potworów. Odpowiada za state management (filtry, paginacja, wybrany potwór), orchestrację wywołań API przez React Query oraz kompozycję child components. Jest to główny "smart component" widoku.

**Główne elementy:**
- `<div>` kontener z pełną wysokością i padding
- `<MonstersHeader>` - nagłówek z search i filtrami
- `<MonsterGrid>` - lista kart potworów z infinite scroll
- `<MonsterSlideover>` - slideover z detalami

**Obsługiwane interakcje:**
- `handleSearchChange(query: string)` - obsługa zmiany search query
- `handleCRFilterChange(min: number | null, max: number | null)` - obsługa zmiany filtrów CR
- `handleResetFilters()` - reset wszystkich filtrów do wartości domyślnych
- `handleMonsterClick(monsterId: string)` - otwarcie slideover z detalami potwora
- `handleSlideoverClose()` - zamknięcie slideover

**Obsługiwana walidacja:**
- Walidacja zakresu CR: `crMin` >= 0, `crMax` <= 30, `crMin` <= `crMax`
- Debounce search query (300ms)

**Typy:**
- `ListMonstersResponseDTO` (z `src/types.ts`)
- `MonsterDTO` (z `src/types.ts`)
- `FilterStateViewModel` (nowy typ lokalny)

**Propsy:**
- Brak (top-level component)

**State:**
```typescript
// Filtry
const [searchQuery, setSearchQuery] = useState<string>('');
const [crMin, setCrMin] = useState<number | null>(null);
const [crMax, setCrMax] = useState<number | null>(null);

// Debounced search dla API
const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

// Slideover
const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
const [isSlideoverOpen, setIsSlideoverOpen] = useState<boolean>(false);

// React Query
const {
  data,
  isLoading,
  isError,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useMonsters({
  searchQuery: debouncedSearchQuery,
  crMin,
  crMax,
  limit: 20
});
```

### 4.3. MonstersHeader (React component)

**Opis komponentu:**
Header sekcja widoku zawierająca tytuł strony (H1), search bar, filtry CR oraz przycisk resetowania filtrów. Komponuje inline wszystkie kontrolki filtrowania.

**Główne elementy:**
- `<header>` - semantic header element
- `<h1>` - "Monsters Library"
- `<SearchBar>` - input z ikoną search
- `<CRFilter>` - dual select lub range slider
- `<Button>` (Shadcn) - "Reset filters" (variant: ghost)

**Obsługiwane interakcje:**
- Propagacja `onSearchChange` z `SearchBar`
- Propagacja `onCRFilterChange` z `CRFilter`
- `onClick` na Reset button

**Obsługiwana walidacja:**
- Brak (delegowana do child components)

**Typy:**
```typescript
interface MonstersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  crMin: number | null;
  crMax: number | null;
  onCRFilterChange: (min: number | null, max: number | null) => void;
  onResetFilters: () => void;
}
```

**Propsy:**
- `searchQuery` - aktualna wartość search query
- `onSearchChange` - callback przy zmianie search
- `crMin` - minimalne CR filtra
- `crMax` - maksymalne CR filtra
- `onCRFilterChange` - callback przy zmianie CR
- `onResetFilters` - callback resetowania filtrów

### 4.4. SearchBar (React component)

**Opis komponentu:**
Input field z ikoną lupy do wyszukiwania potworów po nazwie. Implementuje controlled input z immediate update lokalnego stanu i debounced callback do parenta. Zapewnia accessibility przez odpowiednie ARIA attributes.

**Główne elementy:**
- `<div>` - wrapper z relative positioning
- `<Input>` (Shadcn) - text input
- `<Search>` icon (Lucide) - ikona lupy po lewej
- ARIA attributes: `aria-label="Search monsters"`, `aria-describedby="search-hint"`

**Obsługiwane interakcje:**
- `onChange` - natychmiastowa aktualizacja lokalnego stanu
- Effect z debounce (300ms) - wywołanie `onSearchChange` po 300ms bezczynności

**Obsługiwana walidacja:**
- Brak (każdy string jest validny)

**Typy:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Propsy:**
- `value` - kontrolowana wartość inputu
- `onChange` - callback wywoływany po debounce
- `placeholder` - domyślnie "Search monsters..."

### 4.5. CRFilter (React component)

**Opis komponentu:**
Komponent filtrowania po Challenge Rating. Implementuje dual select (dropdown Min + dropdown Max) jako primary interface. Wyświetla dostępne wartości CR (0-30, z ułamkami jak 1/4, 1/2). Waliduje, że min <= max.

**Główne elementy:**
- `<div>` - flex container dla dwóch select
- `<Label>` (Shadcn) - "Challenge Rating"
- `<Select>` (Shadcn) - Min CR dropdown
- `<Select>` (Shadcn) - Max CR dropdown
- Optional: wyświetlanie aktywnego zakresu jako text

**Obsługiwane interakcje:**
- `onMinChange` - zmiana minimum CR
- `onMaxChange` - zmiana maximum CR
- Walidacja: jeśli min > max, wyświetl error hint

**Obsługiwana walidacja:**
- `min` >= 0
- `max` <= 30
- `min` <= `max` (jeśli oba są set)
- Wyświetl warning jeśli warunek naruszony

**Typy:**
```typescript
interface CRFilterProps {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

// CR values including fractions
const CR_VALUES = [
  { value: 0, label: '0' },
  { value: 0.125, label: '1/8' },
  { value: 0.25, label: '1/4' },
  { value: 0.5, label: '1/2' },
  ...Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
];
```

**Propsy:**
- `min` - minimalne CR (null = brak limitu)
- `max` - maksymalne CR (null = brak limitu)
- `onChange` - callback z nowym min i max

### 4.6. MonsterGrid (React component)

**Opis komponentu:**
Grid container wyświetlający karty potworów w responsywnym layoutcie. Implementuje infinite scroll przez Intersection Observer. Obsługuje loading states (skeleton cards), empty state i error state.

**Główne elementy:**
- `<div>` - grid container (CSS Grid)
  - 2 kolumny na `@media (min-width: 1024px)`
  - 3 kolumny na `@media (min-width: 1280px)`
- `<MonsterCard>` - wielokrotnie dla każdego potwora
- `<SkeletonCards>` - podczas initial loading
- `<EmptyState>` - gdy brak wyników
- `<div>` ref element - trigger dla infinite scroll (at 80% scroll)
- `<LoadingSpinner>` - podczas ładowania kolejnych stron

**Obsługiwane interakcje:**
- `onClick` na każdej karcie - propagacja `onMonsterClick`
- Intersection Observer na trigger element - wywołanie `fetchNextPage`

**Obsługiwana walidacja:**
- Brak

**Typy:**
```typescript
interface MonsterGridProps {
  monsters: MonsterDTO[];
  isLoading: boolean;
  isError: boolean;
  onMonsterClick: (monsterId: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}
```

**Propsy:**
- `monsters` - tablica potworów do wyświetlenia
- `isLoading` - czy trwa initial load
- `isError` - czy wystąpił błąd
- `onMonsterClick` - callback kliknięcia karty
- `hasNextPage` - czy są kolejne strony
- `isFetchingNextPage` - czy ładuje się następna strona
- `onLoadMore` - callback do załadowania kolejnej strony

**Implementacja infinite scroll:**
```typescript
const observerTarget = useRef<HTMLDivElement>(null);

useEffect(() => {
  const target = observerTarget.current;
  if (!target) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    { threshold: 0.8 }
  );

  observer.observe(target);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, onLoadMore]);
```

### 4.7. MonsterCard (React component)

**Opis komponentu:**
Pojedyncza karta potwora w grid. Wyświetla podstawowe informacje: nazwę, CR badge, typ i rozmiar. Klikalna - otwiera slideover z pełnymi statystykami. Stylowana jako card z hover effect.

**Główne elementy:**
- `<Card>` (Shadcn) - główny kontener
- `<CardHeader>` (Shadcn):
  - `<h3>` - nazwa potwora
  - `<Badge>` (Shadcn) - CR badge (emerald color)
- `<CardContent>` (Shadcn):
  - `<p>` - Type + Size (muted text)

**Obsługiwane interakcje:**
- `onClick` - wywołanie `onMonsterClick(monsterId)`
- Hover effect - subtle scale/shadow
- Focus styles dla keyboard navigation

**Obsługiwana walidacja:**
- Brak

**Typy:**
```typescript
interface MonsterCardProps {
  monster: MonsterDTO;
  onClick: (monsterId: string) => void;
}
```

**Propsy:**
- `monster` - dane potwora do wyświetlenia
- `onClick` - callback kliknięcia

**Styling:**
- CR Badge: `variant="default"` z `className="bg-emerald-500"`
- Card: hover effect `hover:shadow-lg transition-shadow`
- Cursor: `cursor-pointer`

### 4.8. MonsterSlideover (React component - Shadcn Sheet)

**Opis komponentu:**
Slideover panel wyświetlający pełne statystyki wybranego potwora. Implementowany jako Shadcn Sheet component z animacją slide-in from right. Width 400px. Zawiera header z nazwą i CR badge oraz scrollable body z detalami.

**Główne elementy:**
- `<Sheet>` (Shadcn) - root component
  - `open={isOpen}`
  - `onOpenChange={onOpenChange}`
- `<SheetContent>` (Shadcn):
  - `side="right"`
  - `className="w-[400px]"`
- `<SheetHeader>` (Shadcn):
  - `<SheetTitle>` - nazwa potwora
  - `<Badge>` - CR badge (emerald)
  - `<SheetClose>` - X button (built-in)
- `<ScrollArea>` (Shadcn):
  - `<MonsterDetails>` - treść z detalami

**Obsługiwane interakcje:**
- `onOpenChange(false)` - zamknięcie przez X button lub ESC
- ESC key - automatic close (built-in Sheet behavior)
- Click outside - automatic close (built-in)
- Focus trap - automatic (built-in radix-ui primitive)

**Obsługiwana walidacja:**
- Brak (dane z API są już zwalidowane)

**Typy:**
```typescript
interface MonsterSlideoverProps {
  monster: MonsterDTO | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Propsy:**
- `monster` - dane potwora do wyświetlenia (null jeśli nie wybrano)
- `isOpen` - czy slideover jest otwarty
- `onOpenChange` - callback zmiany stanu open

**Accessibility:**
- Focus trap: automatyczny (radix-ui)
- ESC close: automatyczny (radix-ui)
- ARIA labels: automatyczne (SheetTitle staje się aria-labelledby)
- Screen reader: Sheet announces itself properly

### 4.9. MonsterDetails (React component)

**Opis komponentu:**
Treść slideover zawierająca wszystkie statystyki potwora. Podzielona na sekcje: Basic Info, Ability Scores Table, Skills/Senses/Languages oraz accordiony dla Traits, Actions, Bonus Actions i Reactions.

**Główne elementy:**
- `<div>` - główny kontener z spacingiem
- `<BasicInfoSection>` - Size, Type, Alignment, AC, HP, Speed
- `<AbilityScoresTable>` - tabela 6 atrybutów (STR-CHA) z score i modifier
- `<SkillsSensesLanguages>` - listy umiejętności, zmysłów, języków
- `<Accordion>` (Shadcn) - dla Traits (każdy trait jako AccordionItem)
- `<Accordion>` (Shadcn) - dla Actions
- `<Accordion>` (Shadcn) - dla Bonus Actions (jeśli istnieją)
- `<Accordion>` (Shadcn) - dla Reactions (jeśli istnieją)

**Obsługiwane interakcje:**
- Expand/collapse accordionów
- Scroll przez ScrollArea parenta

**Obsługiwana walidacja:**
- Brak (dane z API)

**Typy:**
```typescript
interface MonsterDetailsProps {
  data: MonsterDataDTO;
}
```

**Propsy:**
- `data` - pełne dane potwora (MonsterDataDTO)

**Sekcje:**

#### BasicInfoSection:
```typescript
<div className="space-y-2">
  <div className="grid grid-cols-2 gap-2 text-sm">
    <div><span className="font-semibold">Size:</span> {data.size}</div>
    <div><span className="font-semibold">Type:</span> {data.type}</div>
    <div><span className="font-semibold">Alignment:</span> {data.alignment}</div>
    <div><span className="font-semibold">AC:</span> {data.armorClass}</div>
    <div><span className="font-semibold">HP:</span> {data.hitPoints.average} ({data.hitPoints.formula})</div>
    <div><span className="font-semibold">Speed:</span> {data.speed.join(', ')}</div>
  </div>
</div>
```

#### AbilityScoresTable:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>STR</TableHead>
      <TableHead>DEX</TableHead>
      <TableHead>CON</TableHead>
      <TableHead>INT</TableHead>
      <TableHead>WIS</TableHead>
      <TableHead>CHA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>{data.abilityScores.strength.score} ({formatModifier(data.abilityScores.strength.modifier)})</TableCell>
      {/* ... */}
    </TableRow>
  </TableBody>
</Table>
```

#### Actions Accordion:
```typescript
<Accordion type="multiple">
  {data.actions.map((action) => (
    <AccordionItem key={action.name} value={action.name}>
      <AccordionTrigger>{action.name}</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm">{action.description}</p>
        {action.attackRoll && (
          <p className="text-sm mt-1">
            <span className="font-semibold">Attack:</span> +{action.attackRoll.bonus}
          </p>
        )}
        {action.damage && action.damage.map((dmg, idx) => (
          <p key={idx} className="text-sm">
            <span className="font-semibold">Damage:</span> {dmg.average} ({dmg.formula}) {dmg.type}
          </p>
        ))}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### 4.10. SkeletonCards (React component)

**Opis komponentu:**
Loading state dla grid podczas initial load. Wyświetla 20 skeleton cards w tym samym layoutcie co MonsterGrid.

**Główne elementy:**
- `<Card>` (Shadcn) - wielokrotnie (20x)
- `<Skeleton>` (Shadcn) - placeholdery dla tekstu

**Obsługiwane interakcje:**
- Brak (loading state)

**Obsługiwana walidacja:**
- Brak

**Typy:**
```typescript
interface SkeletonCardsProps {
  count?: number; // default 20
}
```

**Propsy:**
- `count` - liczba skeleton cards (default 20)

### 4.11. EmptyState (React component)

**Opis komponentu:**
Stan wyświetlany gdy brak wyników dla aktualnych filtrów. Zawiera komunikat i sugestię zmiany filtrów.

**Główne elementy:**
- `<div>` - centered container
- Icon (Lucide) - np. Search lub FileQuestion
- `<p>` - "No monsters found matching your filters"
- `<p>` - "Try adjusting your search or filters"

**Obsługiwane interakcje:**
- Brak

**Obsługiwana walidacja:**
- Brak

**Typy:**
```typescript
interface EmptyStateProps {
  message?: string;
}
```

**Propsy:**
- `message` - opcjonalna custom message

## 5. Typy

### 5.1. Istniejące typy (z src/types.ts)

#### MonsterDTO
```typescript
export type MonsterDTO = Omit<Monster, "data"> & {
  data: MonsterDataDTO;
};
```

Główny typ potwora zwracany z API. Zawiera:
- `id` (string) - UUID potwora
- `name` (string) - nazwa z database
- `data` (MonsterDataDTO) - pełne dane JSONB
- `created_at` (string) - timestamp

#### MonsterDataDTO
```typescript
export interface MonsterDataDTO {
  name: {
    en: string;
    pl: string;
  };
  size: string; // "Small", "Medium", "Large", etc.
  type: string; // "humanoid", "beast", "dragon", etc.
  category: string;
  alignment: string; // "Neutral Evil", "Lawful Good", etc.
  senses: string[]; // ["Darkvision 60 ft.", "Passive Perception 9"]
  languages: string[]; // ["Common", "Goblin"]
  abilityScores: {
    strength: { score: number; modifier: number; save: number };
    dexterity: { score: number; modifier: number; save: number };
    constitution: { score: number; modifier: number; save: number };
    intelligence: { score: number; modifier: number; save: number };
    wisdom: { score: number; modifier: number; save: number };
    charisma: { score: number; modifier: number; save: number };
  };
  speed: string[]; // ["30 ft.", "fly 60 ft."]
  hitPoints: {
    average: number;
    formula: string; // "2d6"
  };
  armorClass: number;
  challengeRating: {
    rating: string; // "1/4", "1/2", "5", etc.
    experiencePoints: number;
    proficiencyBonus: number;
  };
  skills: string[]; // ["Stealth +6"]
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  gear: string[];
  traits: MonsterTrait[];
  actions: MonsterAction[];
  bonusActions: MonsterAction[];
  reactions: MonsterAction[];
  initiative: {
    modifier: number;
    total: number;
  };
  legendaryActions?: LegendaryActions;
  id: string;
}
```

#### ListMonstersResponseDTO
```typescript
export interface ListMonstersResponseDTO extends PaginationMetadataDTO {
  monsters: MonsterDTO[];
}

// Gdzie PaginationMetadataDTO to:
export interface PaginationMetadataDTO {
  total: number;   // Całkowita liczba potworów matching filters
  limit: number;   // Limit per page (20)
  offset: number;  // Current offset
}
```

#### MonsterAction (z monster.schema)
```typescript
interface MonsterAction {
  name: string;
  description: string;
  type?: string; // "melee", "ranged"
  attackRoll?: {
    type: string;
    bonus: number;
  };
  damage?: {
    average: number;
    formula: string; // "1d6 + 2"
    type: string; // "Slashing", "Piercing", etc.
  }[];
}
```

#### MonsterTrait
```typescript
interface MonsterTrait {
  name: string;
  description: string;
}
```

### 5.2. Nowe typy ViewModels

#### FilterStateViewModel
```typescript
/**
 * ViewModel zarządzający stanem filtrów w MonstersLibraryView
 */
interface FilterStateViewModel {
  searchQuery: string;      // Query dla wyszukiwania (debounced before API call)
  crMin: number | null;      // Minimum CR (null = no limit)
  crMax: number | null;      // Maximum CR (null = no limit)
}
```

**Użycie:** State w `MonstersLibraryView`, props dla `MonstersHeader`

**Walidacja:**
- `searchQuery` - any string
- `crMin` - null lub number >= 0
- `crMax` - null lub number <= 30
- Jeśli oba set: `crMin` <= `crMax`

#### MonsterCardViewModel (opcjonalny - transformacja)
```typescript
/**
 * Uproszczony ViewModel dla MonsterCard
 * Opcjonalnie - można używać bezpośrednio MonsterDTO
 */
interface MonsterCardViewModel {
  id: string;
  name: string;        // data.name.en (lub .pl based on locale)
  cr: string;          // data.challengeRating.rating
  type: string;        // data.type
  size: string;        // data.size
}

// Transformer function (jeśli potrzebne)
const toMonsterCardViewModel = (monster: MonsterDTO, locale: 'en' | 'pl' = 'en'): MonsterCardViewModel => ({
  id: monster.id,
  name: monster.data.name[locale],
  cr: monster.data.challengeRating.rating,
  type: monster.data.type,
  size: monster.data.size
});
```

**Użycie:** Props dla `MonsterCard` (ale można też używać pełnego `MonsterDTO`)

#### FetchMonstersParams
```typescript
/**
 * Parametry dla API call /api/monsters
 * Używane w useMonsters hook
 */
interface FetchMonstersParams {
  searchQuery?: string;
  crMin?: number | null;
  crMax?: number | null;
  limit: number;        // Hardcoded 20
  offset: number;       // Managed by React Query infinite
}
```

**Użycie:** Parametry dla `fetchMonsters` function i `useMonsters` hook

## 6. Zarządzanie stanem

### 6.1. Local React State (useState)

**W MonstersLibraryView:**

```typescript
// Filtry - immediate user input
const [searchQuery, setSearchQuery] = useState<string>('');
const [crMin, setCrMin] = useState<number | null>(null);
const [crMax, setCrMax] = useState<number | null>(null);

// Debounced search dla API (custom hook)
const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

// Slideover state
const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
const [isSlideoverOpen, setIsSlideoverOpen] = useState<boolean>(false);
```

**W SearchBar:**
```typescript
// Opcjonalnie - jeśli SearchBar zarządza własnym immediate state
const [inputValue, setInputValue] = useState<string>(value);
```

### 6.2. Server State (React Query)

**useMonsters hook - infinite query:**

```typescript
const {
  data,                  // InfiniteData<ListMonstersResponseDTO>
  isLoading,            // Initial loading
  isError,              // Error occurred
  error,                // Error object
  fetchNextPage,        // Function to load next page
  hasNextPage,          // Boolean - more pages available
  isFetchingNextPage    // Loading next page
} = useInfiniteQuery({
  queryKey: ['monsters', { searchQuery: debouncedSearchQuery, crMin, crMax }],
  queryFn: ({ pageParam = 0 }) => fetchMonsters({
    searchQuery: debouncedSearchQuery,
    crMin,
    crMax,
    limit: 20,
    offset: pageParam
  }),
  getNextPageParam: (lastPage, allPages) => {
    const loadedCount = allPages.reduce((sum, page) => sum + page.monsters.length, 0);
    return loadedCount < lastPage.total ? loadedCount : undefined;
  },
  staleTime: 1000 * 60 * 60, // 1 hour (matches API cache)
  enabled: true
});

// Flatten data for rendering
const monsters = data?.pages.flatMap(page => page.monsters) ?? [];
```

**Query Key Dependencies:**
- Query key zawiera wszystkie filtry (`searchQuery`, `crMin`, `crMax`)
- Zmiana któregokolwiek filtra powoduje automatyczny refetch i reset pagination
- React Query automatycznie cache'uje wyniki dla każdej kombinacji filtrów

### 6.3. Custom Hooks

#### useDebouncedValue
```typescript
/**
 * Hook debounce dla wartości (np. search query)
 * @param value - Wartość do debounce
 * @param delay - Opóźnienie w ms (300 dla search)
 * @returns Debounced value
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Użycie:** W `MonstersLibraryView` dla `searchQuery`

#### useMonsters
```typescript
/**
 * React Query infinite hook dla pobierania listy potworów
 * @param params - Parametry filtrowania i paginacji
 * @returns React Query infinite query result
 */
function useMonsters(params: {
  searchQuery: string;
  crMin: number | null;
  crMax: number | null;
  limit: number;
}) {
  return useInfiniteQuery({
    queryKey: ['monsters', params],
    queryFn: ({ pageParam = 0 }) => fetchMonsters({ ...params, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.monsters.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    staleTime: 1000 * 60 * 60,
  });
}
```

**Lokalizacja:** `src/components/hooks/useMonsters.ts`

### 6.4. Zustand Store (opcjonalnie - nie wymagane dla MVP)

Dla tego widoku Zustand store NIE jest konieczny. Wszystkie stany są lokalne dla widoku i nie muszą być sharowane z innymi komponentami. W przyszłości można rozważyć Zustand dla:
- Globalnego ustawienia locale (en/pl)
- Recently viewed monsters
- Favorite monsters

## 7. Integracja API

### 7.1. Endpoint: GET /api/monsters

**URL:** `/api/monsters`

**Method:** GET

**Query Parameters:**
- `name` (optional, string) - Filter by monster name (case-insensitive partial match)
- `cr` (optional, string) - Filter by exact Challenge Rating (np. "1/4", "5")
- `cr_min` (optional, number) - Minimum CR for range filtering
- `cr_max` (optional, number) - Maximum CR for range filtering
- `limit` (optional, number) - Max results per page (default: 20, max: 100)
- `offset` (optional, number) - Pagination offset (default: 0)

**Request Type:**
```typescript
interface FetchMonstersRequest {
  searchQuery?: string;  // Maps to 'name' param
  crMin?: number | null;  // Maps to 'cr_min' param
  crMax?: number | null;  // Maps to 'cr_max' param
  limit: number;          // Fixed: 20
  offset: number;         // Managed by React Query
}
```

**Response Type:** `ListMonstersResponseDTO`
```typescript
{
  monsters: MonsterDTO[];
  total: number;
  limit: number;
  offset: number;
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query parameters (Zod validation failed)
  ```typescript
  {
    error: "Invalid query parameters",
    details: ZodError[]
  }
  ```
- `500 Internal Server Error` - Server error
  ```typescript
  {
    error: "Internal server error"
  }
  ```

**Cache:** Response cached for 1 hour (`Cache-Control: public, max-age=3600`)

### 7.2. Implementacja fetchMonsters

**Lokalizacja:** `src/lib/api/monsters.ts` (nowy plik)

```typescript
import type { ListMonstersResponseDTO } from '@/types';

interface FetchMonstersParams {
  searchQuery?: string;
  crMin?: number | null;
  crMax?: number | null;
  limit: number;
  offset: number;
}

export async function fetchMonsters(params: FetchMonstersParams): Promise<ListMonstersResponseDTO> {
  const queryParams = new URLSearchParams();

  if (params.searchQuery) {
    queryParams.set('name', params.searchQuery);
  }
  if (params.crMin !== null && params.crMin !== undefined) {
    queryParams.set('cr_min', String(params.crMin));
  }
  if (params.crMax !== null && params.crMax !== undefined) {
    queryParams.set('cr_max', String(params.crMax));
  }
  queryParams.set('limit', String(params.limit));
  queryParams.set('offset', String(params.offset));

  const response = await fetch(`/api/monsters?${queryParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
```

### 7.3. React Query Configuration

**Lokalizacja:** `src/lib/queryClient.ts` (może już istnieć)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      cacheTime: 1000 * 60 * 30, // 30 minutes default
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Provider setup:** W głównym layout lub app root (może już być skonfigurowane)

## 8. Interakcje użytkownika

### 8.1. Wyszukiwanie po nazwie

**Akcja użytkownika:** Wpisanie tekstu w SearchBar

**Flow:**
1. Użytkownik wpisuje tekst w `<SearchBar>` (np. "goblin")
2. Wartość jest natychmiastowo aktualizowana w local state `searchQuery`
3. `useDebouncedValue` hook czeka 300ms
4. Po 300ms bezczynności, `debouncedSearchQuery` jest aktualizowany
5. React Query wykrywa zmianę query key `['monsters', { searchQuery: 'goblin', ... }]`
6. Automatycznie wykonuje nowe zapytanie `/api/monsters?name=goblin&limit=20&offset=0`
7. `MonsterGrid` pokazuje `<SkeletonCards>` podczas loading
8. Po otrzymaniu odpowiedzi, grid renderuje nową listę kart
9. Jeśli `total === 0`, pokazuje `<EmptyState>`

**Walidacja:**
- Brak (każdy string jest akceptowalny)

**Edge cases:**
- Pusty string - pokazuje wszystkich potworów (no filter)
- Bardzo krótki string (1 znak) - może zwrócić dużo wyników (OK, API handle)
- Special characters - API handle (PostgreSQL ILIKE)

### 8.2. Filtrowanie po CR

**Akcja użytkownika:** Wybór Min i/lub Max CR w `CRFilter`

**Flow:**
1. Użytkownik wybiera Min CR = 1 w pierwszym select
2. State `crMin` jest aktualizowany na `1`
3. React Query wykrywa zmianę query key
4. Wykonuje zapytanie `/api/monsters?cr_min=1&limit=20&offset=0`
5. Grid pokazuje loading state
6. Renderuje przefiltrowaną listę
7. Użytkownik wybiera Max CR = 5
8. State `crMax` aktualizowany na `5`
9. Zapytanie `/api/monsters?cr_min=1&cr_max=5&limit=20&offset=0`
10. Grid aktualizuje listę

**Walidacja:**
- Min >= 0
- Max <= 30
- Min <= Max (jeśli oba są set)
- Wyświetl inline error hint jeśli min > max

**Edge cases:**
- Oba null - no filter
- Tylko min set - all monsters >= min
- Tylko max set - all monsters <= max

### 8.3. Kombinacja filtrów

**Akcja użytkownika:** Wyszukiwanie + CR filter jednocześnie

**Flow:**
1. Użytkownik wpisuje "dragon" w search
2. Po debounce, lista pokazuje wszystkie dragons
3. Użytkownik ustawia CR min = 10
4. Query key: `['monsters', { searchQuery: 'dragon', crMin: 10, crMax: null }]`
5. Zapytanie `/api/monsters?name=dragon&cr_min=10&limit=20&offset=0`
6. Lista pokazuje tylko dragony z CR >= 10

**Nota:** Wszystkie filtry działają jako AND (nie OR)

### 8.4. Reset filtrów

**Akcja użytkownika:** Kliknięcie "Reset filters" button

**Flow:**
1. Użytkownik klika button w `MonstersHeader`
2. Handler `handleResetFilters()` jest wywoływany
3. State jest resetowany:
   - `setSearchQuery('')`
   - `setCrMin(null)`
   - `setCrMax(null)`
4. React Query wykrywa zmianę query key (wszystkie filtry = default)
5. Zapytanie `/api/monsters?limit=20&offset=0`
6. Grid pokazuje pełną, nieprzefiltrowaną listę

### 8.5. Infinite scroll - ładowanie kolejnych potworów

**Akcja użytkownika:** Scrollowanie listy w dół

**Flow:**
1. Użytkownik scrolluje grid w dół
2. Intersection Observer wykrywa, że trigger element (at 80% scroll) jest visible
3. Sprawdza warunki: `hasNextPage === true && !isFetchingNextPage`
4. Wywołuje `fetchNextPage()` z React Query
5. Na dole gridu pojawia się `<LoadingSpinner>` z tekstem "Loading more..."
6. React Query wykonuje zapytanie z `offset = currentLoadedCount`
   - Przykład: 20 potworów załadowanych → `offset=20`
7. Po otrzymaniu odpowiedzi:
   - Nowe potwory są appendowane do istniejącej listy (React Query infinite merge)
   - Spinner znika
   - Użytkownik może dalej scrollować
8. Jeśli `loadedCount >= total`, `hasNextPage` staje się `false`, trigger nie działa

**Warunki:**
- `hasNextPage === true` (są jeszcze dane do załadowania)
- `!isFetchingNextPage` (nie trwa już inne ładowanie)
- Trigger element jest w viewport

### 8.6. Kliknięcie karty potwora

**Akcja użytkownika:** Kliknięcie na `MonsterCard`

**Flow:**
1. Użytkownik klika kartę potwora (np. "Goblin")
2. Handler `handleMonsterClick(monsterId)` jest wywoływany
3. State aktualizowany:
   - `setSelectedMonsterId(monsterId)`
   - `setIsSlideoverOpen(true)`
4. `MonsterSlideover` component renderuje się z `isOpen={true}`
5. Shadcn Sheet animuje slide-in from right (400px width)
6. `MonsterDetails` renderuje pełne statystyki z `data` wybranego potwora
   - Basic Info (AC, HP, Speed, etc.)
   - Ability Scores Table
   - Skills, Senses, Languages
   - Accordiony: Traits, Actions, Bonus Actions, Reactions
7. Focus jest automatycznie przeniesiony do Sheet (radix-ui behavior)

**Dane:**
- Wybrany potwór jest wyszukiwany w już załadowanej liście (z React Query cache)
- Brak dodatkowego API call (dane już są w pamięci)

### 8.7. Zamknięcie slideover

**Akcja użytkownika:** Kliknięcie X button, ESC key lub click outside

**Flow:**
1. Użytkownik wykonuje jedną z akcji:
   - Klika X button w header
   - Naciska klawisz ESC
   - Klika poza slideoverem (backdrop)
2. Shadcn Sheet wywołuje `onOpenChange(false)`
3. Handler `handleSlideoverClose()` aktualizuje state:
   - `setIsSlideoverOpen(false)`
   - Opcjonalnie: `setSelectedMonsterId(null)` (lub czekaj aż zamknie się)
4. Sheet animuje slide-out to right
5. Focus wraca do ostatniego focused element (automatycznie - radix-ui)
6. Grid pozostaje w tym samym stanie (bez scroll reset)

**Accessibility:**
- ESC close: automatyczne (radix-ui)
- Focus return: automatyczne (radix-ui)
- Screen reader announcement: automatyczne

### 8.8. Przeglądanie accordionów w slideover

**Akcja użytkownika:** Kliknięcie accordion trigger (np. "Traits", "Actions")

**Flow:**
1. Użytkownik klika trigger "Actions"
2. Shadcn Accordion expand z animacją
3. Content pokazuje listę akcji:
   - Każda akcja jako AccordionItem
   - Name jako trigger, description + stats jako content
4. Użytkownik może expand wiele akcji jednocześnie (`type="multiple"`)
5. Scroll area umożliwia scrollowanie przez długą zawartość

## 9. Warunki i walidacja

### 9.1. Walidacja filtrów CR

**Komponenty:** `CRFilter`, `MonstersLibraryView`

**Warunki:**
1. `crMin` >= 0 (minimum value)
2. `crMax` <= 30 (maximum value)
3. `crMin` <= `crMax` (jeśli oba są set)

**Implementacja w CRFilter:**
```typescript
const handleMinChange = (value: number | null) => {
  // Jeśli max jest set i nowy min > max, wyświetl error
  if (max !== null && value !== null && value > max) {
    setError('Minimum CR cannot be greater than Maximum CR');
    return;
  }
  setError(null);
  onChange(value, max);
};

const handleMaxChange = (value: number | null) => {
  // Jeśli min jest set i nowy max < min, wyświetl error
  if (min !== null && value !== null && value < min) {
    setError('Maximum CR cannot be less than Minimum CR');
    return;
  }
  setError(null);
  onChange(min, value);
};
```

**UI Feedback:**
- Error hint wyświetlany pod selectami (red text)
- Invalid combination blokuje API call (nie aktualizuje state w parent)

### 9.2. Walidacja query parametrów przez API

**Backend:** Zod schema `ListMonstersQuerySchema` w `src/lib/schemas/monster.schema.ts`

**Frontend handling:**
- API zwraca 400 Bad Request z details
- React Query `onError` handler catch błąd
- Wyświetl toast notification: "Invalid filter parameters"
- Log do console dla debugging

**Komponenty:** `useMonsters` hook error handling

### 9.3. Walidacja debounce

**Komponent:** `MonstersLibraryView` + `useDebouncedValue`

**Warunek:** Search query musi czekać 300ms przed wywołaniem API

**Implementacja:**
```typescript
const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

// React Query query key używa debounced value
const { ... } = useMonsters({
  searchQuery: debouncedSearchQuery, // NOT searchQuery
  crMin,
  crMax,
  limit: 20
});
```

**Wpływ na UI:**
- Użytkownik widzi immediate feedback w input (kontrolowany przez `searchQuery`)
- Grid aktualizuje się dopiero po 300ms (używa `debouncedSearchQuery`)
- Redukuje liczbę API calls podczas szybkiego typowania

### 9.4. Walidacja pagination

**Komponent:** `useMonsters` hook (React Query infinite)

**Warunki:**
1. `limit` = 20 (hardcoded, nie przekraczamy max 100)
2. `offset` >= 0 (managed by React Query)
3. `offset` < `total` (aby nie requestować poza zakres)

**Implementacja:**
```typescript
getNextPageParam: (lastPage, allPages) => {
  const loadedCount = allPages.reduce((sum, page) => sum + page.monsters.length, 0);
  // Jeśli załadowaliśmy wszystko, return undefined (no more pages)
  return loadedCount < lastPage.total ? loadedCount : undefined;
},
```

**Wpływ na UI:**
- `hasNextPage` staje się `false` gdy wszystko załadowane
- Infinite scroll trigger przestaje działać
- Brak "Loading more..." spinnera

## 10. Obsługa błędów

### 10.1. Error: 400 Bad Request (Invalid query parameters)

**Scenariusz:** Frontend wysyła nieprawidłowe parametry do API (błąd walidacji Zod)

**Przyczyny:**
- Błąd w logice `CRFilter` (np. wysłano string zamiast number)
- Race condition w state updates
- Bug w `fetchMonsters` function (nieprawidłowe mapowanie params)

**Obsługa:**
1. React Query `onError` handler catch error
2. Parse error message z response (Zod details)
3. Log error do console: `console.error('API Validation Error:', error.details)`
4. Wyświetl toast notification (jeśli jest toast system):
   - Title: "Invalid Filter Parameters"
   - Description: "Please check your filters and try again"
5. **Nie** resetuj filtrów automatycznie (user może chcieć zobaczyć co wpisał)
6. Wyświetl error state w grid (opcjonalnie)

**Komponenty:** `useMonsters` hook, Toast system

**Implementacja:**
```typescript
const { ... } = useInfiniteQuery({
  // ...
  onError: (error) => {
    console.error('Failed to fetch monsters:', error);
    toast({
      title: 'Invalid Filter Parameters',
      description: 'Please check your filters and try again.',
      variant: 'destructive'
    });
  }
});
```

### 10.2. Error: 500 Internal Server Error

**Scenariusz:** Backend ma problem (database down, service error, bug)

**Przyczyny:**
- Database connection failed
- Bug w `listMonsters` service
- Supabase outage

**Obsługa:**
1. React Query automatycznie retry 1x (default config)
2. Jeśli retry fails, `isError` staje się `true`
3. `MonsterGrid` renderuje error state:
   - Icon (AlertCircle z Lucide)
   - Message: "Failed to load monsters. Please try again."
   - Retry button: calls `refetch()` z React Query
4. Log error do monitoring service (np. Sentry) - jeśli skonfigurowany
5. Wyświetl toast notification (opcjonalnie)

**Komponenty:** `MonsterGrid`, Error boundary (opcjonalnie)

**Implementacja w MonsterGrid:**
```typescript
if (isError) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-lg font-semibold">Failed to load monsters</p>
      <p className="text-muted-foreground mb-4">Please try again</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}
```

### 10.3. Error: Network Error (Offline)

**Scenariusz:** Użytkownik traci połączenie z internetem

**Przyczyny:**
- Brak Wi-Fi
- Server unreachable
- DNS failure

**Obsługa:**
1. React Query automatycznie retry (default 3x z exponential backoff)
2. Podczas retry, pokazuje loading state (nie error od razu)
3. Po wyczerpaniu retry, `isError` = `true`
4. `MonsterGrid` renderuje network error state:
   - Icon (WifiOff z Lucide)
   - Message: "Network error. Please check your connection."
   - Retry button
5. Jeśli są cached data, pokazuj je (React Query staleTime)
6. React Query może automatycznie refetch gdy network wraca (opcjonalnie)

**Komponenty:** `MonsterGrid`, `useMonsters` hook

**Implementacja:**
```typescript
const { data, isError, error, refetch } = useMonsters(...);

// Pokazuj cached data nawet jeśli error
const monsters = data?.pages.flatMap(page => page.monsters) ?? [];

if (isError && monsters.length === 0) {
  // No cached data, show error
  return <NetworkErrorState onRetry={refetch} />;
}

if (isError && monsters.length > 0) {
  // Show cached data + error toast
  toast({ title: 'Connection Error', description: 'Showing cached data' });
}
```

### 10.4. Error: Empty Results (No monsters found)

**Scenariusz:** API zwraca `total: 0` (brak potworów matching filters)

**Przyczyny:**
- Zbyt restrykcyjne filtry (np. "XYZ" + CR 0-1 = no results)
- Typo w search query
- Database faktycznie nie ma takich potworów

**Obsługa:**
1. API zwraca 200 OK z `{ monsters: [], total: 0, ... }`
2. React Query nie traktuje jako error (to success z empty array)
3. `MonsterGrid` wykrywa `monsters.length === 0 && !isLoading`
4. Renderuje `<EmptyState>`:
   - Icon (Search z Lucide)
   - Message: "No monsters found matching your filters"
   - Suggestion: "Try adjusting your search or filters"
   - Opcjonalnie: Quick reset button

**Komponenty:** `EmptyState`, `MonsterGrid`

**Implementacja:**
```typescript
if (!isLoading && monsters.length === 0) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      message="No monsters found matching your filters"
      suggestion="Try adjusting your search or filters"
    />
  );
}
```

**Nota:** To NIE jest error (status 200), tylko empty result set

### 10.5. Error: Rate Limiting (429 Too Many Requests)

**Scenariusz:** Użytkownik wykonuje zbyt wiele requestów w krótkim czasie

**Przyczyny:**
- Szybkie zmiany filtrów (mimo debounce)
- Bug powodujący request loop
- API rate limit jest bardzo niski

**Obsługa:**
1. API zwraca 429 status
2. React Query `onError` handler
3. Wyświetl toast: "Too many requests. Please slow down."
4. React Query automatycznie retry z exponential backoff
5. Cache redukuje liczbę requestów (1h staleTime)
6. Debounce (300ms) już redukuje zapytania

**Komponenty:** `useMonsters` hook, Toast system

**Implementacja:**
```typescript
onError: (error) => {
  if (error.message.includes('429')) {
    toast({
      title: 'Too Many Requests',
      description: 'Please wait a moment before searching again.',
      variant: 'destructive'
    });
  }
}
```

**Prevention:**
- Debounce search (300ms) ✓
- React Query cache (1h staleTime) ✓
- Nie wykonuj requestów gdy params się nie zmieniły ✓

### 10.6. Error: Monster not found for slideover

**Scenariusz:** Użytkownik klika kartę, ale potwór nie istnieje w cache

**Przyczyny:**
- Race condition (potwór usunięty z DB między fetch a click)
- Bug w state management
- Cache corruption

**Obsługa:**
1. `MonsterSlideover` otrzymuje `monster={null}`
2. Sprawdź: `if (!monster) return null;` lub show error w slideover
3. Close slideover automatycznie
4. Wyświetl toast: "Monster details not available"
5. Opcjonalnie: trigger refetch listy

**Komponenty:** `MonsterSlideover`, `MonstersLibraryView`

**Implementacja:**
```typescript
// W MonstersLibraryView
const selectedMonster = monsters.find(m => m.id === selectedMonsterId) ?? null;

// W MonsterSlideover
if (!monster) {
  // Close slideover
  onOpenChange(false);
  // Show toast
  toast({ title: 'Monster Not Found', description: 'Details are not available' });
  return null;
}
```

### 10.7. Global Error Boundary

**Scenariusz:** Unhandled JavaScript error w componentcie

**Obsługa:**
- Wrap `MonstersLibraryView` w React Error Boundary
- Catch błędy renderowania
- Wyświetl fallback UI: "Something went wrong. Please refresh the page."
- Log error do Sentry (jeśli skonfigurowany)

**Implementacja:**
```typescript
// W MonstersPage.astro
<ErrorBoundary fallback={<ErrorFallback />}>
  <MonstersLibraryView client:load />
</ErrorBoundary>
```

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

**Zadania:**
1. Utworzyć katalog `src/components/monsters/`
2. Utworzyć katalog `src/components/hooks/` (jeśli nie istnieje)
3. Utworzyć katalog `src/lib/api/` (jeśli nie istnieje)
4. Utworzyć plik `src/pages/monsters.astro`

**Pliki do utworzenia:**
- `src/pages/monsters.astro`
- `src/components/monsters/MonstersLibraryView.tsx`
- `src/components/monsters/MonstersHeader.tsx`
- `src/components/monsters/SearchBar.tsx`
- `src/components/monsters/CRFilter.tsx`
- `src/components/monsters/MonsterGrid.tsx`
- `src/components/monsters/MonsterCard.tsx`
- `src/components/monsters/MonsterSlideover.tsx`
- `src/components/monsters/MonsterDetails.tsx`
- `src/components/monsters/SkeletonCards.tsx`
- `src/components/monsters/EmptyState.tsx`
- `src/components/hooks/useDebouncedValue.ts`
- `src/components/hooks/useMonsters.ts`
- `src/lib/api/monsters.ts`

### Krok 2: Implementacja API client i custom hooks

**Zadania:**
1. Implementować `fetchMonsters` function w `src/lib/api/monsters.ts`
   - Przyjmuje `FetchMonstersParams`
   - Buduje query string z URLSearchParams
   - Wykonuje fetch do `/api/monsters`
   - Obsługuje błędy (throw Error z message)
   - Zwraca `ListMonstersResponseDTO`

2. Implementować `useDebouncedValue` hook w `src/components/hooks/useDebouncedValue.ts`
   - Generic hook `<T>`
   - Przyjmuje `value: T` i `delay: number`
   - Zwraca debounced value
   - Cleanup timeout w useEffect

3. Implementować `useMonsters` hook w `src/components/hooks/useMonsters.ts`
   - Używa `useInfiniteQuery` z React Query
   - Query key: `['monsters', { searchQuery, crMin, crMax }]`
   - Query function: wywołuje `fetchMonsters` z `pageParam` jako offset
   - `getNextPageParam`: oblicza następny offset lub undefined
   - `staleTime: 1000 * 60 * 60` (1 hour)
   - Export typed result

**Zależności:**
- `@tanstack/react-query` (powinno być już zainstalowane)
- Types z `src/types.ts`

**Testy manualne:**
- Sprawdzić w React Query DevTools, że query działa
- Przetestować różne kombinacje params
- Sprawdzić cache behavior

### Krok 3: Implementacja prostych UI components

**Zadania:**

1. **SkeletonCards.tsx** - prosty loading state
   - Array.from({ length: count }) map do Skeleton components
   - Użyć Shadcn Card + Skeleton components
   - Same dimensions jak MonsterCard

2. **EmptyState.tsx** - no results message
   - Centered container
   - Icon (Search z Lucide)
   - Message + suggestion text
   - Optional props dla custom message

3. **SearchBar.tsx** - input field
   - Shadcn Input component
   - Search icon z Lucide (po lewej)
   - Controlled component (value + onChange props)
   - ARIA attributes
   - Placeholder: "Search monsters..."

**Nie wymaga:** API calls, złożona logika, state management

### Krok 4: Implementacja CRFilter component

**Zadania:**
1. Utworzyć `CRFilter.tsx`
2. Zdefiniować `CR_VALUES` array (0, 1/8, 1/4, 1/2, 1-30)
3. Użyć Shadcn Select component (dwa selecty: Min i Max)
4. Implementować walidację min <= max
5. Wyświetlać error hint jeśli invalid
6. Label "Challenge Rating"
7. Options: "No minimum" / "No maximum" dla null values

**Props:**
- `min: number | null`
- `max: number | null`
- `onChange: (min, max) => void`

**UI:**
- Flex container z gap
- Dwa selecty obok siebie (lub stack na mobile)
- Error hint poniżej (red text) jeśli min > max

### Krok 5: Implementacja MonsterCard component

**Zadania:**
1. Utworzyć `MonsterCard.tsx`
2. Użyć Shadcn Card, CardHeader, CardContent
3. Layout:
   - Header: H3 z nazwą + CR Badge (emerald)
   - Content: Type + Size (muted text)
4. Props: `monster: MonsterDTO`, `onClick: (id) => void`
5. Styling:
   - `cursor-pointer`
   - `hover:shadow-lg transition-shadow`
   - Focus styles dla keyboard nav
6. Extract name: `monster.data.name.en` (lub .pl)
7. Extract CR: `monster.data.challengeRating.rating`
8. Badge: `<Badge className="bg-emerald-500">{cr}</Badge>`

**Accessibility:**
- Keyboard clickable (button role lub onKeyDown)
- Focus visible styles

### Krok 6: Implementacja MonsterGrid component

**Zadania:**
1. Utworzyć `MonsterGrid.tsx`
2. Props: monsters array, loading states, callbacks
3. Grid layout:
   ```css
   display: grid;
   grid-template-columns: repeat(2, 1fr); /* @media (min-width: 1024px) */
   grid-template-columns: repeat(3, 1fr); /* @media (min-width: 1280px) */
   gap: 1rem;
   ```
4. Conditional rendering:
   - `if (isLoading && !isFetchingNextPage)` → `<SkeletonCards count={20} />`
   - `if (isError)` → Error state UI
   - `if (monsters.length === 0)` → `<EmptyState />`
   - Else → map monsters to `<MonsterCard>`
5. Infinite scroll:
   - Ref element na końcu listy (div)
   - useEffect z Intersection Observer
   - Trigger at 80% (`threshold: 0.8`)
   - Call `onLoadMore()` jeśli `hasNextPage && !isFetchingNextPage`
6. Loading spinner na dole jeśli `isFetchingNextPage`

**Dependencies:**
- `MonsterCard`
- `SkeletonCards`
- `EmptyState`
- Intersection Observer API

### Krok 7: Implementacja MonstersHeader component

**Zadania:**
1. Utworzyć `MonstersHeader.tsx`
2. Props: searchQuery, crMin, crMax, callbacks
3. Layout:
   - `<header>` semantic element
   - `<h1>` "Monsters Library"
   - `<SearchBar>` full width
   - Flex container dla filtrów:
     - `<CRFilter>`
     - `<Button>` "Reset filters" (variant ghost)
4. Wire up callbacks:
   - `<SearchBar onChange={onSearchChange}>`
   - `<CRFilter onChange={onCRFilterChange}>`
   - `<Button onClick={onResetFilters}>`
5. Responsive layout (może być stack na mobile)

**Dependencies:**
- `SearchBar`
- `CRFilter`
- Shadcn Button

### Krok 8: Implementacja MonsterDetails sub-components

**Zadania:**

1. **BasicInfoSection.tsx**
   - Props: `data: MonsterDataDTO`
   - Grid layout 2 columns
   - Show: Size, Type, Alignment, AC, HP (average + formula), Speed (join)

2. **AbilityScoresTable.tsx**
   - Props: `abilityScores: MonsterDataDTO['abilityScores']`
   - Shadcn Table component
   - Header: STR, DEX, CON, INT, WIS, CHA
   - Row: score (modifier) - format modifier z +/-

3. **SkillsSensesLanguages.tsx**
   - Props: `skills, senses, languages` arrays
   - Three sections z labels
   - Join arrays z comma

4. **TraitsAccordion.tsx**
   - Props: `traits: MonsterTrait[]`
   - Shadcn Accordion (`type="multiple"`)
   - Map traits to AccordionItem
   - Trigger: trait.name
   - Content: trait.description

5. **ActionsAccordion.tsx** (podobnie dla BonusActions, Reactions)
   - Props: `actions: MonsterAction[]`
   - Accordion z AccordionItem per action
   - Trigger: action.name
   - Content:
     - Description
     - Attack roll (jeśli istnieje): `+{bonus}`
     - Damage (jeśli istnieje): `{average} ({formula}) {type}`

### Krok 9: Implementacja MonsterDetails i MonsterSlideover

**Zadania:**

1. **MonsterDetails.tsx**
   - Props: `data: MonsterDataDTO`
   - Compose sub-components:
     ```tsx
     <div className="space-y-6">
       <BasicInfoSection data={data} />
       <AbilityScoresTable abilityScores={data.abilityScores} />
       <SkillsSensesLanguages skills={data.skills} senses={data.senses} languages={data.languages} />
       <TraitsAccordion traits={data.traits} />
       <ActionsAccordion actions={data.actions} />
       {data.bonusActions.length > 0 && <BonusActionsAccordion actions={data.bonusActions} />}
       {data.reactions.length > 0 && <ReactionsAccordion actions={data.reactions} />}
     </div>
     ```

2. **MonsterSlideover.tsx**
   - Props: `monster: MonsterDTO | null`, `isOpen: boolean`, `onOpenChange: (open) => void`
   - Shadcn Sheet component:
     ```tsx
     <Sheet open={isOpen} onOpenChange={onOpenChange}>
       <SheetContent side="right" className="w-[400px]">
         <SheetHeader>
           <SheetTitle>{monster?.data.name.en}</SheetTitle>
           <Badge className="bg-emerald-500">{monster?.data.challengeRating.rating}</Badge>
         </SheetHeader>
         <ScrollArea className="h-full py-6">
           {monster && <MonsterDetails data={monster.data} />}
         </ScrollArea>
       </SheetContent>
     </Sheet>
     ```
   - Handle `monster === null` → return null or show placeholder

**Dependencies:**
- Shadcn Sheet, ScrollArea, Badge
- `MonsterDetails` + sub-components

### Krok 10: Implementacja MonstersLibraryView (główny kontener)

**Zadania:**
1. Utworzyć `MonstersLibraryView.tsx`
2. Setup state:
   ```typescript
   const [searchQuery, setSearchQuery] = useState('');
   const [crMin, setCrMin] = useState<number | null>(null);
   const [crMax, setCrMax] = useState<number | null>(null);
   const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
   const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
   const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
   ```
3. Use `useMonsters` hook:
   ```typescript
   const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useMonsters({
     searchQuery: debouncedSearchQuery,
     crMin,
     crMax,
     limit: 20
   });
   const monsters = data?.pages.flatMap(page => page.monsters) ?? [];
   ```
4. Implementować handlers:
   - `handleSearchChange(query)` → `setSearchQuery(query)`
   - `handleCRFilterChange(min, max)` → validate + set state
   - `handleResetFilters()` → reset all filters
   - `handleMonsterClick(id)` → `setSelectedMonsterId(id)`, `setIsSlideoverOpen(true)`
   - `handleSlideoverClose()` → `setIsSlideoverOpen(false)`
5. Compose layout:
   ```tsx
   <div className="container mx-auto py-8">
     <MonstersHeader
       searchQuery={searchQuery}
       onSearchChange={handleSearchChange}
       crMin={crMin}
       crMax={crMax}
       onCRFilterChange={handleCRFilterChange}
       onResetFilters={handleResetFilters}
     />
     <MonsterGrid
       monsters={monsters}
       isLoading={isLoading}
       isError={isError}
       onMonsterClick={handleMonsterClick}
       hasNextPage={hasNextPage}
       isFetchingNextPage={isFetchingNextPage}
       onLoadMore={fetchNextPage}
     />
     <MonsterSlideover
       monster={monsters.find(m => m.id === selectedMonsterId) ?? null}
       isOpen={isSlideoverOpen}
       onOpenChange={setIsSlideoverOpen}
     />
   </div>
   ```

**Dependencies:**
- Wszystkie sub-components
- Custom hooks: `useDebouncedValue`, `useMonsters`

### Krok 11: Utworzenie Astro page

**Zadania:**
1. Utworzyć `src/pages/monsters.astro`
2. Import layout (np. `BaseLayout` lub `MainLayout`)
3. Import `MonstersLibraryView`
4. Setup client directive: `client:load`
5. Meta tags:
   - Title: "Monsters Library - Initiative Forge"
   - Description: "Browse and search the global library of D&D 5e SRD monsters"
6. Optional: Breadcrumbs, nav highlighting

**Przykład:**
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import MonstersLibraryView from '@/components/monsters/MonstersLibraryView';
---

<BaseLayout title="Monsters Library" description="Browse and search D&D 5e monsters from SRD">
  <MonstersLibraryView client:load />
</BaseLayout>
```

### Krok 12: Styling i polish

**Zadania:**
1. **Responsive layout:**
   - Grid 2 columns @1024px, 3 columns @1280px ✓ (specified)
   - Stack header filters na mobile (jeśli trzeba)
   - Slideover full-screen na mobile (opcjonalnie)

2. **Animations:**
   - Smooth slideover slide-in/out (built-in Sheet)
   - Hover effects na kartach (subtle scale/shadow)
   - Accordion expand animation (built-in)
   - Loading spinner smooth rotation

3. **Colors and typography:**
   - CR Badge emerald (`bg-emerald-500`) ✓
   - Muted text dla Type/Size ✓
   - Consistent spacing (Tailwind spacing scale)
   - Font weights (semibold dla labels, normal dla values)

4. **Accessibility:**
   - Color contrast (WCAG AA minimum)
   - Focus visible styles (all interactive elements)
   - Touch targets (min 44x44px na mobile)

5. **Performance:**
   - React.memo() dla `MonsterCard` (optional optimization)
   - Virtualization jeśli performance issues (react-window)
   - Image optimization (jeśli będą dodane obrazki potworów)

## Podsumowanie implementacji

Widok Monsters Library zostanie zaimplementowany jako kompozycja 11 głównych komponentów React zintegrowanych z React Query dla server state management. Kluczowe aspekty implementacji:

- **Architektura:** Astro page → React view → kompozycja sub-components
- **Data fetching:** React Query infinite query z 1h cache i debounced search (300ms)
- **Filtrowanie:** Dynamiczne search + dual CR range filter z walidacją
- **Paginacja:** Infinite scroll (Intersection Observer) z 20 items per page
- **UI/UX:** Shadcn components, smooth animations, accessibility-compliant
- **Error handling:** Comprehensive error states dla 400/500/network errors
- **Performance:** Debounce, cache, skeleton loading, optimized re-renders

Wszystkie wymagania z PRD i View Description zostały pokryte w planie implementacji. Widok będzie intuicyjny, wydajny i accessible zgodnie z best practices dla React 19 i Astro 5.
