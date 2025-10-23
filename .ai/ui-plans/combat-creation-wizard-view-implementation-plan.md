# Plan implementacji widoku Combat Creation Wizard

## 1. Przegląd

Widok **Combat Creation Wizard** to 5-stopniowy kreator umożliwiający Mistrzowi Gry (DM) utworzenie nowej walki w ramach kampanii. Użytkownik przechodzi przez kolejne kroki: nadanie nazwy walce, wybór postaci graczy, dodanie potworów z biblioteki, opcjonalne dodanie NPC-ów utworzonych ad-hoc oraz podsumowanie przed rozpoczęciem walki. Po zakończeniu kreatora system wywołuje API do utworzenia walki i przekierowuje użytkownika do widoku śledzenia walki (combat tracker).

Wizard zapewnia intuicyjną nawigację, walidację na każdym kroku, zarządzanie focusem oraz dostępność zgodną z WCAG (ARIA announcements, keyboard navigation). Celem widoku jest usprawnienie procesu przygotowania starcia, eliminując konieczność ręcznego zarządzania wieloma źródłami danych.

## 2. Routing widoku

**Ścieżka**: `/campaigns/:id/combats/new`

Widok jest dostępny po kliknięciu przycisku "Rozpocznij nową walkę" w widoku listy walk kampanii (`/campaigns/:id/combats`).

**Parametry URL:**
- `:id` - UUID kampanii, dla której tworzona jest walka

**Nawigacja po zakończeniu:**
- Sukces: Redirect do `/campaigns/:id/combats/:combatId` (combat tracker)
- Anulowanie (Escape): Modal z potwierdzeniem → Redirect do `/campaigns/:id/combats`

## 3. Struktura komponentów

Widok składa się z głównego kontenera `CombatCreationWizard` (strona Astro z React component) oraz 5 komponentów reprezentujących poszczególne kroki wizardu. Komponenty są renderowane warunkowo na podstawie aktualnego stanu `currentStep`.

**Hierarchia komponentów:**

```
CombatCreationWizardPage.astro (Astro page)
└── CombatCreationWizard.tsx (React component, client:load)
    ├── ProgressIndicator
    │   └── StepIndicatorItem x5
    ├── Step1_CombatName
    │   ├── Heading (h2)
    │   ├── Input (Shadcn Input)
    │   └── Button "Next" (Shadcn Button)
    ├── Step2_SelectPlayerCharacters
    │   ├── Heading (h2)
    │   ├── WarningBanner (conditional, jeśli brak postaci)
    │   ├── PlayerCharactersList
    │   │   └── PlayerCharacterCheckboxItem x N
    │   │       ├── Checkbox (Shadcn Checkbox)
    │   │       ├── CharacterName
    │   │       └── Badges (HP, AC - Shadcn Badge)
    │   └── NavigationButtons (Back, Next)
    ├── Step3_AddMonsters
    │   ├── Heading (h2)
    │   ├── SplitView (flex: 60% / 40%)
    │   │   ├── LeftPanel
    │   │   │   ├── SearchBar (Shadcn Input with Search icon)
    │   │   │   ├── FilterDropdown (CR - Shadcn Select)
    │   │   │   ├── MonstersList (infinite scroll container)
    │   │   │   │   └── MonsterCard x N (Shadcn Accordion item)
    │   │   │   │       ├── MonsterCardHeader (Name, CR Badge, Type+Size)
    │   │   │   │       ├── AddButton (Shadcn Button "+")
    │   │   │   │       └── MonsterDetailsAccordion (stats, actions)
    │   │   │   └── LoadingSpinner (conditional, Shadcn Spinner)
    │   │   └── RightPanel
    │   │       ├── Heading (h3 "Added to Combat")
    │   │       ├── AddedMonstersList
    │   │       │   └── AddedMonsterItem x N
    │   │       │       ├── MonsterName
    │   │       │       ├── CountBadge (editable inline input)
    │   │       │       └── RemoveButton (Shadcn Button icon X)
    │   │       └── EmptyState (conditional, text "No monsters added yet")
    │   └── NavigationButtons (Back, Next)
    ├── Step4_AddNPCs
    │   ├── Heading (h2 "Add NPCs (Optional)")
    │   ├── ModeToggle (Shadcn Switch: Simple / Advanced)
    │   ├── NPCForm (conditional: Simple or Advanced)
    │   │   ├── SimpleNPCForm
    │   │   │   ├── NameInput (Shadcn Input)
    │   │   │   ├── MaxHPInput (Shadcn Input type number)
    │   │   │   ├── ACInput (Shadcn Input type number)
    │   │   │   └── InitiativeModifierInput (Shadcn Input type number, optional)
    │   │   └── AdvancedNPCForm
    │   │       ├── NameInput
    │   │       ├── MaxHPInput
    │   │       ├── ACInput
    │   │       ├── SpeedInput (Shadcn Input)
    │   │       ├── AbilityScoresGrid (grid 2x3)
    │   │       │   └── AbilityScoreInput x6 (STR, DEX, CON, INT, WIS, CHA)
    │   │       └── ActionsBuilder
    │   │           ├── ActionFormFields
    │   │           └── AddActionButton
    │   ├── AddNPCButton (Shadcn Button "+ Add NPC")
    │   ├── AddedNPCsList
    │   │   └── AddedNPCCard x N
    │   │       ├── NPCName
    │   │       ├── HPBadge (Shadcn Badge)
    │   │       ├── ACBadge (Shadcn Badge)
    │   │       └── RemoveButton (Shadcn Button icon X)
    │   └── NavigationButtons (Back, Next)
    └── Step5_Summary
        ├── Heading (h2 "Combat Summary")
        ├── CombatNameSection
        ├── PlayerCharactersSection
        │   ├── SectionHeading (h3 "Player Characters (X)")
        │   └── CharacterSummaryList
        │       └── CharacterSummaryItem x N (Name, HP, AC)
        ├── MonstersSection
        │   ├── SectionHeading (h3 "Monsters (X)")
        │   └── MonsterSummaryList
        │       └── MonsterSummaryItem x N (Name x count)
        ├── NPCsSection (conditional, jeśli są NPCe)
        │   ├── SectionHeading (h3 "NPCs (X)")
        │   └── NPCSummaryList
        │       └── NPCSummaryItem x N (Name, HP, AC)
        └── NavigationButtons (Back, Start Combat - emerald color)
```

## 4. Szczegóły komponentów

### 4.1. CombatCreationWizard (główny kontener)

**Opis komponentu:**
Główny komponent React zarządzający całym przepływem wizardu. Przechowuje lokalny stan wszystkich kroków (nazwa walki, wybrane postacie, dodane potwory, dodane NPCe). Renderuje odpowiedni komponent kroku na podstawie `currentStep` oraz komponent `ProgressIndicator`. Obsługuje nawigację między krokami oraz walidację przed przejściem do kolejnego kroku.

**Główne elementy:**
- `div` (kontener główny z klasami Tailwind dla layoutu)
- `ProgressIndicator` (komponent wskaźnika postępu)
- Warunkowy render komponentu kroku (Step1 - Step5)
- Przyciski nawigacyjne (Back/Next/Start Combat) - renderowane warunkowo w zależności od kroku
- Modal konfirmacji anulowania (Shadcn AlertDialog)

**Obsługiwane interakcje:**
- Zmiana kroku (Next/Back)
- Walidacja przed przejściem do następnego kroku
- Anulowanie wizardu (klawisz Escape → modal konfirmacji)
- Submit (Step 5 → wywołanie API i redirect)

**Obsługiwana walidacja:**
- Step 1: `combatName.trim().length > 0 && combatName.length <= 255`
- Step 2: `selectedPlayerCharacterIds.length >= 1`
- Step 5 (przed submit): Przynajmniej 1 uczestnik (PC lub monster lub NPC)

**Typy:**
- `WizardState` (stan lokalny)
- `CreateCombatCommand` (API request)

**Propsy:**
- `campaignId: string` (z URL params)

---

### 4.2. ProgressIndicator

**Opis komponentu:**
Komponent wizualny wyświetlający 5 kroków wizardu. Highlightuje aktualny krok (kolor emerald), wyświetla checkmark dla ukończonych kroków oraz wyłączone (disabled) dla przyszłych kroków. Może być zaimplementowany przy użyciu Shadcn Stepper lub jako custom komponent.

**Główne elementy:**
- `ol` lub `div` (kontener z layoutem poziomym)
- `StepIndicatorItem` x5 (komponent reprezentujący pojedynczy krok)
  - Numer kroku lub ikona (checkmark dla completed)
  - Etykieta kroku ("Combat Name", "Select PCs", "Add Monsters", "Add NPCs", "Summary")
  - Linia łącząca (opcjonalnie, między krokami)

**Obsługiwane interakcje:**
- Brak (komponent tylko wizualny, read-only)

**Obsługiwana walidacja:**
- N/A

**Typy:**
- `ProgressIndicatorProps: { currentStep: 1 | 2 | 3 | 4 | 5; completedSteps: number[] }`

**Propsy:**
- `currentStep: 1 | 2 | 3 | 4 | 5`
- `completedSteps: number[]` (np. [1, 2] jeśli użytkownik jest na Step 3)

---

### 4.3. Step1_CombatName

**Opis komponentu:**
Pierwszy krok wizardu, umożliwiający użytkownikowi wprowadzenie nazwy walki. Wyświetla heading, pole input oraz przycisk "Next" (disabled jeśli pole jest puste lub przekracza 255 znaków).

**Główne elementy:**
- `div` (kontener)
- `h2` ("Name Your Combat")
- `Input` (Shadcn Input, max length 255)
- `Button` "Next" (Shadcn Button, disabled jeśli invalid)

**Obsługiwane interakcje:**
- Wpisywanie nazwy walki (onChange)
- Kliknięcie "Next" (przejście do Step 2)

**Obsługiwana walidacja:**
- Required: `combatName.trim().length > 0`
- Max length: `combatName.length <= 255`
- Wyświetlenie komunikatu błędu pod inputem jeśli walidacja nie przechodzi

**Typy:**
- `Step1Props: { combatName: string; onNameChange: (name: string) => void; onNext: () => void }`

**Propsy:**
- `combatName: string`
- `onNameChange: (name: string) => void`
- `onNext: () => void`

---

### 4.4. Step2_SelectPlayerCharacters

**Opis komponentu:**
Drugi krok wizardu, wyświetlający listę postaci graczy z kampanii. Każda postać jest reprezentowana przez checkbox (domyślnie wszystkie zaznaczone) oraz badges z HP i AC. Jeśli w kampanii nie ma żadnych postaci, wyświetlany jest warning banner z linkiem do tworzenia nowej postaci.

**Główne elementy:**
- `div` (kontener)
- `h2` ("Select Player Characters")
- `WarningBanner` (conditional, jeśli `playerCharacters.length === 0`)
  - Alert (Shadcn Alert, variant destructive)
  - Tekst: "No player characters in this campaign. Create one first."
  - Link do `/campaigns/:campaignId/characters/new`
- `ul` lub `div` (lista postaci)
- `PlayerCharacterCheckboxItem` x N
  - `Checkbox` (Shadcn Checkbox)
  - `Label` (nazwa postaci)
  - `Badge` HP (np. "HP: 45")
  - `Badge` AC (np. "AC: 16")
- `NavigationButtons`
  - `Button` "Back" (powrót do Step 1)
  - `Button` "Next" (disabled jeśli żadna postać nie zaznaczona)

**Obsługiwane interakcje:**
- Zaznaczanie/odznaczanie checkboxów
- Kliknięcie "Back" (powrót do Step 1)
- Kliknięcie "Next" (przejście do Step 3, jeśli valid)

**Obsługiwana walidacja:**
- Przynajmniej 1 postać musi być zaznaczona: `selectedPlayerCharacterIds.length >= 1`
- Jeśli walidacja nie przechodzi, button "Next" jest disabled
- Wyświetlenie komunikatu: "Please select at least one player character"

**Typy:**
- `Step2Props: { playerCharacters: PlayerCharacterViewModel[]; selectedIds: string[]; onToggle: (id: string) => void; onBack: () => void; onNext: () => void }`
- `PlayerCharacterViewModel: { id: string; name: string; max_hp: number; armor_class: number }`

**Propsy:**
- `playerCharacters: PlayerCharacterViewModel[]`
- `selectedIds: string[]`
- `onToggle: (id: string) => void`
- `onBack: () => void`
- `onNext: () => void`

---

### 4.5. Step3_AddMonsters

**Opis komponentu:**
Trzeci krok wizardu, składający się z dwóch paneli (60% / 40%). Lewy panel zawiera wyszukiwarkę potworów, filtr CR oraz listę potworów z infinite scroll. Prawy panel wyświetla listę dodanych potworów z edytowalnym count i przyciskiem usuwania.

**Główne elementy:**
- `div` (kontener główny, split view)
- **Left Panel (60%)**:
  - `Input` (Shadcn Input, search bar z ikoną Search, debounce 300ms)
  - `Select` (Shadcn Select, filtr CR: "All", "0-1", "2-5", "6-10", "11-15", "16-20", "21+")
  - `div` (infinite scroll container)
    - `MonsterCard` x N (Shadcn Accordion Item)
      - **MonsterCardHeader** (trigger):
        - Nazwa potwora
        - Badge CR (np. "CR 3")
        - Tekst typu i rozmiaru (np. "Medium humanoid")
        - Button "+ Add" (Shadcn Button, size small)
      - **MonsterDetailsAccordion** (content, rozwija się po kliknięciu):
        - HP, AC, Speed
        - Ability scores
        - Actions (lista)
        - Traits (lista)
  - `LoadingSpinner` (conditional, na dole listy podczas ładowania)
- **Right Panel (40%)**:
  - `h3` ("Added to Combat")
  - `ul` lub `div` (lista dodanych potworów)
    - `AddedMonsterItem` x N
      - Nazwa potwora
      - Badge count (np. "x3") → kliknięcie otwiera inline input do edycji liczby
      - Button "Remove" (X icon, Shadcn Button icon variant)
  - `EmptyState` (conditional, jeśli `addedMonsters.size === 0`):
    - Tekst: "No monsters added yet"
- **NavigationButtons**:
  - Button "Back"
  - Button "Next"

**Obsługiwane interakcje:**
- Wpisywanie w search bar → debounce 300ms → fetch monsters z filtrem
- Wybór filtra CR → fetch monsters z filtrem
- Scroll w dół listy → infinite scroll → fetch next page
- Kliknięcie na MonsterCard header → rozwija accordion ze szczegółami
- Kliknięcie "+ Add" → dodanie potwora do prawego panelu (count = 1)
- Kliknięcie count badge → inline input → zmiana liczby kopii (min 1)
- Kliknięcie "Remove" → usunięcie potwora z listy
- Kliknięcie "Back" / "Next"

**Obsługiwana walidacja:**
- Brak wymaganej walidacji (dodanie potworów jest opcjonalne)
- Walidacja count: musi być >= 1 (przy inline edit)

**Typy:**
- `Step3Props: { searchTerm: string; crFilter: string; monsters: MonsterViewModel[]; addedMonsters: Map<string, number>; onSearchChange: (term: string) => void; onCRFilterChange: (cr: string) => void; onAddMonster: (monsterId: string) => void; onUpdateCount: (monsterId: string, count: number) => void; onRemoveMonster: (monsterId: string) => void; onLoadMore: () => void; hasMore: boolean; isLoading: boolean; onBack: () => void; onNext: () => void }`
- `MonsterViewModel: { id: string; name: string; cr: string; type: string; size: string; hp: number; ac: number; actions: ActionDTO[]; traits: any[] }`

**Propsy:**
- `searchTerm: string`
- `crFilter: string`
- `monsters: MonsterViewModel[]`
- `addedMonsters: Map<string, number>` (monster_id -> count)
- `onSearchChange: (term: string) => void`
- `onCRFilterChange: (cr: string) => void`
- `onAddMonster: (monsterId: string) => void`
- `onUpdateCount: (monsterId: string, count: number) => void`
- `onRemoveMonster: (monsterId: string) => void`
- `onLoadMore: () => void`
- `hasMore: boolean`
- `isLoading: boolean`
- `onBack: () => void`
- `onNext: () => void`

---

### 4.6. Step4_AddNPCs

**Opis komponentu:**
Czwarty krok wizardu (opcjonalny), umożliwiający dodawanie NPC-ów ad-hoc. Użytkownik może przełączać się między Simple Mode (podstawowe stats) a Advanced Mode (pełne stats + action builder). Po wypełnieniu formularza i kliknięciu "+ Add NPC", NPC jest dodawany do listy poniżej, a formularz resetuje się.

**Główne elementy:**
- `div` (kontener główny)
- `h2` ("Add NPCs (Optional)")
- `div` (kontener toggle)
  - `Label` ("Simple Mode" / "Advanced Mode")
  - `Switch` (Shadcn Switch)
- **NPCForm** (conditional: Simple lub Advanced):
  - **SimpleNPCForm**:
    - `Input` Name (Shadcn Input, required)
    - `Input` Max HP (Shadcn Input, type number, required, min 1)
    - `Input` AC (Shadcn Input, type number, required, min 0)
    - `Input` Initiative Modifier (Shadcn Input, type number, optional, może być ujemny)
  - **AdvancedNPCForm**:
    - `Input` Name
    - `Input` Max HP
    - `Input` AC
    - `Input` Speed (Shadcn Input, text, np. "30 ft")
    - **AbilityScoresGrid** (grid 2 columns x 3 rows):
      - `Input` STR (type number, 1-30)
      - `Input` DEX
      - `Input` CON
      - `Input` INT
      - `Input` WIS
      - `Input` CHA
    - **ActionsBuilder**:
      - Formularz dodawania akcji (Name, Type, Attack Bonus, Damage Dice, Damage Type, Description)
      - Lista dodanych akcji
      - Button "Add Action"
- `Button` "+ Add NPC" (Shadcn Button, disabled jeśli formularz invalid)
- **AddedNPCsList**:
  - `ul` lub `div`
  - `AddedNPCCard` x N
    - Nazwa NPC
    - Badge HP (np. "HP: 30")
    - Badge AC (np. "AC: 14")
    - Button "Remove" (X icon)
- **NavigationButtons**:
  - Button "Back"
  - Button "Next"

**Obsługiwane interakcje:**
- Przełączanie Simple/Advanced Mode (Switch)
- Wypełnianie formularza (onChange na każdym input)
- Kliknięcie "+ Add NPC" → walidacja → dodanie NPC do listy → reset formularza
- Kliknięcie "Remove" na NPC → usunięcie z listy
- Kliknięcie "Back" / "Next"

**Obsługiwana walidacja:**
- **Simple Mode**:
  - Name: required, max 255
  - Max HP: required, min 1, type number
  - AC: required, min 0, type number
  - Initiative Modifier: optional, type number
- **Advanced Mode**:
  - Name, Max HP, AC: jak Simple Mode
  - Speed: required, text (np. "30 ft")
  - Ability Scores: każdy required, min 1, max 30, type number
  - Actions: opcjonalne (może być pusta lista)
- Button "+ Add NPC" disabled jeśli formularz invalid

**Typy:**
- `Step4Props: { mode: 'simple' | 'advanced'; onModeChange: (mode: 'simple' | 'advanced') => void; npcForm: SimpleNPCFormData | AdvancedNPCFormData; onFormChange: (field: string, value: any) => void; onAddNPC: () => void; addedNPCs: AdHocNPC[]; onRemoveNPC: (npcId: string) => void; onBack: () => void; onNext: () => void }`
- `SimpleNPCFormData: { display_name: string; max_hp: number; armor_class: number; initiative_modifier?: number }`
- `AdvancedNPCFormData: { display_name: string; max_hp: number; armor_class: number; speed: string; stats: StatsDTO; actions: ActionDTO[] }`
- `AdHocNPC: { id: string; display_name: string; max_hp: number; armor_class: number; stats: StatsDTO; actions: ActionDTO[]; initiative_modifier?: number; speed?: string }`

**Propsy:**
- `mode: 'simple' | 'advanced'`
- `onModeChange: (mode: 'simple' | 'advanced') => void`
- `npcForm: SimpleNPCFormData | AdvancedNPCFormData`
- `onFormChange: (field: string, value: any) => void`
- `onAddNPC: () => void`
- `addedNPCs: AdHocNPC[]`
- `onRemoveNPC: (npcId: string) => void`
- `onBack: () => void`
- `onNext: () => void`

---

### 4.7. Step5_Summary

**Opis komponentu:**
Piąty i ostatni krok wizardu, wyświetlający podsumowanie wszystkich wyborów użytkownika. Pokazuje nazwę walki, listę wybranych postaci graczy, listę dodanych potworów (z licznikiem kopii) oraz listę dodanych NPC-ów. Na dole znajdują się przyciski "Back" (powrót do Step 4) oraz "Start Combat" (duży, emerald, wywołuje submit).

**Główne elementy:**
- `div` (kontener główny)
- `h2` ("Combat Summary")
- **CombatNameSection**:
  - `p` lub `div`: "Combat Name: [nazwa]"
- **PlayerCharactersSection**:
  - `h3` ("Player Characters (X)")
  - `ul` (lista postaci)
    - `li` x N: "Name, HP: XX, AC: XX"
- **MonstersSection** (conditional, jeśli dodano potwory):
  - `h3` ("Monsters (X)")
  - `ul` (lista potworów)
    - `li` x N: "Name x count" (np. "Goblin x3")
- **NPCsSection** (conditional, jeśli dodano NPCe):
  - `h3` ("NPCs (X)")
  - `ul` (lista NPCów)
    - `li` x N: "Name, HP: XX, AC: XX"
- **NavigationButtons**:
  - Button "Back"
  - Button "Start Combat" (Shadcn Button, variant default, size lg, emerald color)

**Obsługiwane interakcje:**
- Kliknięcie "Back" (powrót do Step 4)
- Kliknięcie "Start Combat" (wywołanie mutation API → redirect)

**Obsługiwana walidacja:**
- Walidacja przed submit:
  - `combatName` valid
  - Przynajmniej 1 uczestnik (selectedPlayerCharacterIds.length > 0 || addedMonsters.size > 0 || addedNPCs.length > 0)
- Jeśli walidacja nie przechodzi, wyświetlenie error message: "Please add at least one participant to the combat"

**Typy:**
- `Step5Props: { combatName: string; selectedPlayerCharacters: PlayerCharacterViewModel[]; addedMonsters: Map<string, AddedMonsterViewModel>; addedNPCs: AdHocNPC[]; onBack: () => void; onSubmit: () => void; isSubmitting: boolean }`
- `AddedMonsterViewModel: { monster_id: string; name: string; count: number }`

**Propsy:**
- `combatName: string`
- `selectedPlayerCharacters: PlayerCharacterViewModel[]`
- `addedMonsters: Map<string, AddedMonsterViewModel>`
- `addedNPCs: AdHocNPC[]`
- `onBack: () => void`
- `onSubmit: () => void`
- `isSubmitting: boolean`

---

## 5. Typy

### 5.1. Typy stanu wizardu (Local State)

```typescript
/**
 * Stan głównego wizardu przechowywany w komponencie CombatCreationWizard
 */
interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[]; // np. [1, 2] jeśli użytkownik jest na Step 3
  combatName: string;
  selectedPlayerCharacterIds: string[];
  addedMonsters: Map<string, number>; // monster_id -> count
  addedNPCs: AdHocNPC[];

  // Step 3 specific state
  monsterSearchTerm: string;
  monsterCRFilter: string; // "All", "0-1", "2-5", "6-10", "11-15", "16-20", "21+"

  // Step 4 specific state
  npcMode: 'simple' | 'advanced';
  npcFormData: SimpleNPCFormData | AdvancedNPCFormData;
}
```

### 5.2. Typy ViewModel (dla UI)

```typescript
/**
 * ViewModel dla postaci gracza w Step 2
 */
interface PlayerCharacterViewModel {
  id: string;
  name: string;
  max_hp: number;
  armor_class: number;
}

/**
 * ViewModel dla potwora w Step 3 (lewy panel)
 */
interface MonsterViewModel {
  id: string;
  name: string; // z data.name.pl (fallback do en)
  cr: string; // z data.challengeRating.rating
  type: string; // z data.type
  size: string; // z data.size
  hp: number; // z data.hitPoints.average
  ac: number; // z data.armorClass
  actions: ActionDTO[]; // z data.actions
  traits: any[]; // z data.traits
  speed: string[]; // z data.speed
  abilityScores: any; // z data.abilityScores
}

/**
 * ViewModel dla dodanego potwora w Step 3 (prawy panel)
 */
interface AddedMonsterViewModel {
  monster_id: string;
  name: string;
  count: number;
}
```

### 5.3. Typy formularza NPC (Step 4)

```typescript
/**
 * Dane formularza Simple Mode
 */
interface SimpleNPCFormData {
  display_name: string;
  max_hp: number;
  armor_class: number;
  initiative_modifier?: number;
}

/**
 * Dane formularza Advanced Mode
 */
interface AdvancedNPCFormData {
  display_name: string;
  max_hp: number;
  armor_class: number;
  speed: string;
  stats: StatsDTO; // { str, dex, con, int, wis, cha }
  actions: ActionDTO[]; // lista akcji
}

/**
 * Ad-hoc NPC dodany do listy
 * Zawiera temporary ID dla UI oraz wszystkie dane
 */
interface AdHocNPC {
  id: string; // temporary UUID wygenerowany w UI (crypto.randomUUID())
  display_name: string;
  max_hp: number;
  armor_class: number;
  stats: StatsDTO;
  actions: ActionDTO[];
  // Opcjonalne pola z Simple Mode
  initiative_modifier?: number;
  // Opcjonalne pola z Advanced Mode
  speed?: string;
}
```

### 5.4. Typy z API (już zdefiniowane w src/types.ts)

Komponenty będą używać następujących typów z `src/types.ts`:

- `CreateCombatCommand` - request body dla POST /api/campaigns/:campaignId/combats
- `InitialParticipantCommand` - union type dla uczestników (player_character | monster | ad_hoc_npc)
- `PlayerCharacterDTO` - typ postaci gracza z API
- `MonsterDTO` - typ potwora z API
- `CombatDTO` - response type z API po utworzeniu walki
- `StatsDTO` - struktura ability scores (str, dex, con, int, wis, cha)
- `ActionDTO` - struktura akcji (name, type, attack_bonus, damage_dice, itd.)

### 5.5. Mapowanie typów UI -> API

Przed wysłaniem request do API, stan wizardu musi być zmapowany na `CreateCombatCommand`:

```typescript
/**
 * Funkcja mapująca stan wizardu na CreateCombatCommand
 */
function mapWizardStateToCommand(
  wizardState: WizardState,
  playerCharacters: PlayerCharacterDTO[],
  monsters: MonsterDTO[]
): CreateCombatCommand {
  const initial_participants: InitialParticipantCommand[] = [];

  // 1. Dodaj wybrane postacie graczy
  wizardState.selectedPlayerCharacterIds.forEach(pcId => {
    initial_participants.push({
      source: 'player_character',
      player_character_id: pcId
    });
  });

  // 2. Dodaj potwory
  wizardState.addedMonsters.forEach((count, monsterId) => {
    initial_participants.push({
      source: 'monster',
      monster_id: monsterId,
      count: count
    });
  });

  // 3. Dodaj NPCe
  wizardState.addedNPCs.forEach(npc => {
    // Przekształć AdHocNPC na format API
    const stats: StatsDTO = npc.stats;

    // Jeśli Simple Mode, oblicz stats na podstawie initiative_modifier
    // lub użyj domyślnych wartości
    if (npc.initiative_modifier !== undefined && !npc.speed) {
      // Simple Mode - oblicz DEX na podstawie initiative_modifier
      // DEX modifier = initiative_modifier
      // DEX score ≈ 10 + (modifier * 2)
      stats.dex = 10 + (npc.initiative_modifier * 2);
    }

    initial_participants.push({
      source: 'ad_hoc_npc',
      display_name: npc.display_name,
      max_hp: npc.max_hp,
      armor_class: npc.armor_class,
      stats: stats,
      actions: npc.actions || []
    });
  });

  return {
    name: wizardState.combatName,
    initial_participants: initial_participants
  };
}
```

## 6. Zarządzanie stanem

### 6.1. Lokalny stan w głównym komponencie

Stan wizardu będzie zarządzany lokalnie w komponencie `CombatCreationWizard` przy użyciu React hooks (`useState`). To podejście jest wystarczające dla wizardu, ponieważ:

- Stan jest potrzebny tylko w tym widoku
- Nie ma potrzeby dzielenia stanu z innymi komponentami
- Prostsza implementacja niż Zustand dla tego przypadku

**Inicjalizacja stanu:**

```typescript
const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
const [completedSteps, setCompletedSteps] = useState<number[]>([]);
const [combatName, setCombatName] = useState<string>('');
const [selectedPlayerCharacterIds, setSelectedPlayerCharacterIds] = useState<string[]>([]);
const [addedMonsters, setAddedMonsters] = useState<Map<string, number>>(new Map());
const [addedNPCs, setAddedNPCs] = useState<AdHocNPC[]>([]);
const [monsterSearchTerm, setMonsterSearchTerm] = useState<string>('');
const [monsterCRFilter, setMonsterCRFilter] = useState<string>('All');
const [npcMode, setNPCMode] = useState<'simple' | 'advanced'>('simple');
const [npcFormData, setNPCFormData] = useState<SimpleNPCFormData | AdvancedNPCFormData>(
  defaultSimpleFormData
);
```

**Przepływ stanu:**
- Stan jest przekazywany do child components przez propsy
- Child components otrzymują callback functions do aktualizacji stanu (np. `onNameChange`, `onToggle`, `onAddMonster`)
- Parent component (CombatCreationWizard) zarządza logiką walidacji i nawigacji między krokami

### 6.2. Custom hooks

#### usePlayerCharacters

```typescript
/**
 * Hook do pobierania postaci graczy dla kampanii
 * Używa TanStack Query (useQuery)
 */
function usePlayerCharacters(campaignId: string) {
  return useQuery({
    queryKey: ['player-characters', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`);
      if (!response.ok) throw new Error('Failed to fetch player characters');
      const data: ListPlayerCharactersResponseDTO = await response.json();
      return data.characters;
    },
    staleTime: 5 * 60 * 1000, // 5 minut
  });
}
```

#### useMonsterSearch (z infinite scroll)

```typescript
/**
 * Hook do wyszukiwania potworów z infinite scroll
 * Używa TanStack Query (useInfiniteQuery)
 */
function useMonsterSearch(searchTerm: string, crFilter: string) {
  return useInfiniteQuery({
    queryKey: ['monsters', searchTerm, crFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        search: searchTerm,
        cr: crFilter !== 'All' ? crFilter : '',
        limit: '20',
        offset: pageParam.toString(),
      });

      const response = await fetch(`/api/monsters?${params}`);
      if (!response.ok) throw new Error('Failed to fetch monsters');
      const data: ListMonstersResponseDTO = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    staleTime: 10 * 60 * 1000, // 10 minut (dane rzadko się zmieniają)
  });
}
```

#### useCombatCreation (mutation)

```typescript
/**
 * Hook do tworzenia walki
 * Używa TanStack Query (useMutation)
 */
function useCombatCreation(campaignId: string) {
  const navigate = useNavigate(); // lub Astro's navigate

  return useMutation({
    mutationFn: async (command: CreateCombatCommand) => {
      const response = await fetch(`/api/campaigns/${campaignId}/combats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create combat');
      }

      const data: CombatDTO = await response.json();
      return data;
    },
    onSuccess: (combat) => {
      // Redirect do combat tracker
      navigate(`/campaigns/${campaignId}/combats/${combat.id}`);
    },
    onError: (error) => {
      // Wyświetl error toast (np. Shadcn Toast)
      console.error('Error creating combat:', error);
    },
  });
}
```

#### useDebounce (utility hook)

```typescript
/**
 * Hook do debounce wartości (np. search term)
 */
function useDebounce<T>(value: T, delay: number): T {
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

### 6.3. Focus management i accessibility

**Focus management przy zmianie kroków:**

```typescript
useEffect(() => {
  // Po zmianie kroku, ustaw focus na heading danego stepu
  const heading = document.querySelector(`#step-${currentStep}-heading`);
  if (heading instanceof HTMLElement) {
    heading.focus();
  }
}, [currentStep]);
```

**ARIA live announcements:**

```typescript
// W komponencie głównym
const [announcement, setAnnouncement] = useState<string>('');

useEffect(() => {
  const stepNames = ['', 'Combat Name', 'Select Player Characters', 'Add Monsters', 'Add NPCs', 'Summary'];
  setAnnouncement(`Step ${currentStep} of 5: ${stepNames[currentStep]}`);
}, [currentStep]);

// W JSX
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

## 7. Integracja API

### 7.1. Endpointy wykorzystywane przez widok

**1. GET /api/campaigns/:campaignId/characters**

- **Cel:** Pobranie listy postaci graczy dla kampanii (Step 2)
- **Query params:** Brak
- **Response type:** `ListPlayerCharactersResponseDTO`
- **Response body:**
  ```json
  {
    "characters": [
      {
        "id": "uuid",
        "campaign_id": "uuid",
        "name": "Aragorn",
        "max_hp": 45,
        "armor_class": 16,
        "speed": 30,
        "stats": {
          "str": 16,
          "dex": 14,
          "con": 14,
          "int": 10,
          "wis": 12,
          "cha": 14
        },
        "actions": [...]
      }
    ]
  }
  ```
- **Hook:** `usePlayerCharacters(campaignId)`

**2. GET /api/monsters**

- **Cel:** Pobranie listy potworów z biblioteki (Step 3)
- **Query params:**
  - `search` (string, optional): wyszukiwane słowo kluczowe w nazwie
  - `cr` (string, optional): filtr CR (np. "0-1", "2-5")
  - `limit` (number, default 20): max liczba wyników
  - `offset` (number, default 0): offset dla paginacji
- **Response type:** `ListMonstersResponseDTO`
- **Response body:**
  ```json
  {
    "monsters": [
      {
        "id": "uuid",
        "srd_id": "goblin",
        "data": {
          "name": { "en": "Goblin", "pl": "Goblin" },
          "challengeRating": { "rating": "1/4", "experiencePoints": 50 },
          "type": "humanoid",
          "size": "Small",
          "hitPoints": { "average": 7, "formula": "2d6" },
          "armorClass": 15,
          "actions": [...],
          ...
        }
      }
    ],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
  ```
- **Hook:** `useMonsterSearch(searchTerm, crFilter)` (useInfiniteQuery)

**3. POST /api/campaigns/:campaignId/combats**

- **Cel:** Utworzenie nowej walki (Step 5 submit)
- **Request type:** `CreateCombatCommand`
- **Request body:**
  ```json
  {
    "name": "Goblin Ambush",
    "initial_participants": [
      {
        "source": "player_character",
        "player_character_id": "uuid"
      },
      {
        "source": "monster",
        "monster_id": "uuid",
        "count": 3
      },
      {
        "source": "ad_hoc_npc",
        "display_name": "Bandit Leader",
        "max_hp": 30,
        "armor_class": 14,
        "stats": {
          "str": 14,
          "dex": 12,
          "con": 12,
          "int": 10,
          "wis": 10,
          "cha": 14
        },
        "actions": [
          {
            "name": "Scimitar",
            "type": "melee_weapon_attack",
            "attack_bonus": 4,
            "damage_dice": "1d6",
            "damage_bonus": 2,
            "damage_type": "slashing"
          }
        ]
      }
    ]
  }
  ```
- **Response type:** `CombatDTO`
- **Response body:**
  ```json
  {
    "id": "uuid",
    "campaign_id": "uuid",
    "name": "Goblin Ambush",
    "status": "active",
    "current_round": 1,
    "state_snapshot": {
      "participants": [...],
      "active_participant_index": null
    },
    "created_at": "2025-01-16T15:00:00Z",
    "updated_at": "2025-01-16T15:00:00Z"
  }
  ```
- **Hook:** `useCombatCreation(campaignId)` (useMutation)

### 7.2. Przygotowanie request body dla Create Combat

Request body musi być zmapowany z wizard state zgodnie z funkcją `mapWizardStateToCommand` opisaną w sekcji 5.5.

**Ważne uwagi:**

1. **Postacie graczy:** Dla każdej wybranej postaci (`selectedPlayerCharacterIds`) tworzymy `InitialParticipantCommand` z `source: 'player_character'` i `player_character_id`.

2. **Potwory:** Dla każdego potwora w `addedMonsters` (Map) tworzymy `InitialParticipantCommand` z `source: 'monster'`, `monster_id` i `count`.

3. **NPCe:** Dla każdego NPC w `addedNPCs` tworzymy `InitialParticipantCommand` z `source: 'ad_hoc_npc'` oraz wszystkimi wymaganymi polami:
   - `display_name`
   - `max_hp`
   - `armor_class`
   - `stats` (StatsDTO)
   - `actions` (opcjonalne, może być pusta lista)

4. **Simple Mode NPCs:** Jeśli NPC został dodany w Simple Mode, musimy przekształcić `initiative_modifier` na odpowiedni `stats.dex`. Można użyć prostej konwersji: `dex = 10 + (initiative_modifier * 2)`. Pozostałe stats mogą być ustawione na wartości domyślne (np. 10).

## 8. Interakcje użytkownika

### 8.1. Przepływ przez wizard (happy path)

1. **Start wizardu:**
   - User wchodzi na `/campaigns/:id/combats/new`
   - Widzi Step 1 (Combat Name)
   - Progress Indicator pokazuje step 1/5

2. **Step 1: Nazwa walki**
   - User wpisuje nazwę walki (np. "Goblin Ambush")
   - Przycisk "Next" staje się aktywny (nie jest disabled)
   - User klika "Next"
   - → Przejście do Step 2

3. **Step 2: Wybór postaci graczy**
   - Widzi listę postaci (wszystkie domyślnie zaznaczone)
   - User może odznaczyć/zaznaczyć checkboxy
   - User klika "Next"
   - → Przejście do Step 3

4. **Step 3: Dodanie potworów**
   - User wpisuje "goblin" w search bar
   - Po 300ms debounce następuje fetch z filtrem
   - Lista potworów aktualizuje się
   - User klika na "Goblin" card → rozwija się accordion ze szczegółami
   - User klika "+ Add" → Goblin pojawia się w prawym panelu (count: 1)
   - User klika na badge "x1" → otwiera się inline input
   - User zmienia na "3" → Goblin teraz ma count: 3
   - User klika "Next"
   - → Przejście do Step 4

5. **Step 4: Dodanie NPCów (opcjonalne)**
   - User przełącza na "Advanced Mode"
   - User wypełnia formularz:
     - Name: "Bandit Leader"
     - Max HP: 30
     - AC: 14
     - Speed: "30 ft"
     - Stats: STR 14, DEX 12, CON 12, INT 10, WIS 10, CHA 14
     - Dodaje akcję "Scimitar" (melee weapon attack, +4, 1d6+2 slashing)
   - User klika "+ Add NPC"
   - NPC pojawia się na liście poniżej
   - Formularz resetuje się
   - User klika "Next"
   - → Przejście do Step 5

6. **Step 5: Podsumowanie**
   - User przegląda podsumowanie:
     - Combat Name: "Goblin Ambush"
     - Player Characters (4): Aragorn, Legolas, Gimli, Gandalf
     - Monsters (1): Goblin x3
     - NPCs (1): Bandit Leader (HP: 30, AC: 14)
   - User klika "Start Combat"
   - Mutation jest wywołana (POST /api/campaigns/:id/combats)
   - Po sukcesie → redirect do `/campaigns/:id/combats/:combatId`

### 8.2. Interakcje w Step 3 (szczegółowo)

**Search i filtrowanie:**
- User wpisuje tekst → state `monsterSearchTerm` aktualizuje się natychmiast
- `useDebounce` opóźnia wartość o 300ms
- Po 300ms `debouncedSearchTerm` aktualizuje się
- `useMonsterSearch` reaguje na zmianę `debouncedSearchTerm` → fetch API
- Lista potworów aktualizuje się

**Infinite scroll:**
- User scrolluje w dół listy potworów
- Intersection Observer wykrywa, że użytkownik zbliża się do końca listy
- Hook `useMonsterSearch` wywołuje `fetchNextPage()`
- Loader pojawia się na dole listy
- Nowe potwory są dodawane do listy

**Dodawanie potwora:**
- User klika "+ Add" na monster card
- Callback `onAddMonster(monsterId)` jest wywoływany
- W parent component:
  ```typescript
  const handleAddMonster = (monsterId: string) => {
    setAddedMonsters(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(monsterId) || 0;
      newMap.set(monsterId, currentCount + 1);
      return newMap;
    });
  };
  ```
- Potwór pojawia się w prawym panelu (lub count zwiększa się)

**Edycja count:**
- User klika na badge count (np. "x3")
- Badge zamienia się w inline input z wartością "3"
- User zmienia wartość na "5" i naciska Enter lub traci focus
- Callback `onUpdateCount(monsterId, 5)` jest wywoływany
- State `addedMonsters` aktualizuje się
- Badge pokazuje "x5"

**Usuwanie potwora:**
- User klika "X" przy potworze w prawym panelu
- Callback `onRemoveMonster(monsterId)` jest wywoływany
- State `addedMonsters` aktualizuje się (usunięcie entry z Map)
- Potwór znika z listy

### 8.3. Interakcje w Step 4 (szczegółowo)

**Przełączanie trybu:**
- User klika Switch "Simple / Advanced"
- State `npcMode` zmienia się
- Formularz rerenderuje się (inne pola)
- **Uwaga:** Jeśli user miał wypełniony formularz, należy zapytać o potwierdzenie (lub automatycznie zresetować formularz z ostrzeżeniem)

**Wypełnianie formularza Simple Mode:**
- User wypełnia: Name, Max HP, AC, Initiative Modifier
- Każde pole ma onChange handler aktualizujący `npcFormData`
- Walidacja działa na bieżąco (np. Max HP musi być >= 1)
- Button "+ Add NPC" disabled jeśli formularz invalid

**Wypełnianie formularza Advanced Mode:**
- User wypełnia: Name, Max HP, AC, Speed, Stats (6 pól), Actions
- Actions builder: user może dodawać wiele akcji (lista)
- Każda akcja ma: Name, Type, Attack Bonus, Damage Dice, Damage Type, Description
- User klika "Add Action" → akcja dodawana do listy w formularzu
- User może usunąć akcję z listy

**Dodawanie NPC:**
- User klika "+ Add NPC" (po poprawnym wypełnieniu formularza)
- Walidacja frontendowa sprawdza wszystkie pola
- Jeśli valid:
  - Generowany jest temporary ID (`crypto.randomUUID()`)
  - NPC dodawany do `addedNPCs` state
  - Formularz resetuje się do wartości domyślnych
  - NPC pojawia się na liście poniżej

**Usuwanie NPC:**
- User klika "Remove" (X) przy NPC
- Callback `onRemoveNPC(npcId)` wywoływany
- State `addedNPCs` aktualizuje się (filtr po id)
- NPC znika z listy

### 8.4. Keyboard interactions

**Nawigacja między krokami:**
- Tab/Shift+Tab: nawigacja między elementami interaktywnymi
- Enter: submit formularza (np. w Step 1 Enter na input → Next)
- Escape: otwiera modal konfirmacji anulowania wizardu

**Step 3 (Monsters):**
- Tab do search bar → wpisywanie
- Tab do filter dropdown → Arrow Up/Down do wyboru CR
- Tab do listy potworów → Enter/Space na monster card rozwija accordion
- Tab do "+ Add" button → Enter/Space dodaje potwora

**Step 4 (NPCs):**
- Tab przez wszystkie input fields
- Tab do Switch → Space przełącza tryb
- Tab do "+ Add NPC" → Enter dodaje NPC

## 9. Warunki i walidacja

### 9.1. Walidacja kroków wizardu

**Step 1: Combat Name**
- **Warunek:** `combatName.trim().length > 0 && combatName.length <= 255`
- **Komponent:** Step1_CombatName
- **Wpływ na UI:**
  - Button "Next" disabled jeśli warunek nie spełniony
  - Komunikat błędu pod inputem: "Combat name is required" (jeśli empty po blur)
  - Komunikat błędu: "Combat name must be 255 characters or less" (jeśli przekracza)

**Step 2: Select Player Characters**
- **Warunek:** `selectedPlayerCharacterIds.length >= 1`
- **Komponent:** Step2_SelectPlayerCharacters
- **Wpływ na UI:**
  - Button "Next" disabled jeśli warunek nie spełniony
  - Komunikat błędu nad/pod listą: "Please select at least one player character"
- **Przypadek brzegowy: Brak postaci w kampanii**
  - **Warunek:** `playerCharacters.length === 0`
  - **Wpływ na UI:**
    - Warning banner (Shadcn Alert, variant destructive):
      - Tekst: "No player characters in this campaign. Create one first."
      - Link do `/campaigns/:campaignId/characters/new`
    - Lista postaci nie renderuje się
    - Button "Next" disabled

**Step 3: Add Monsters**
- **Warunek:** Brak wymaganej walidacji (dodanie potworów jest opcjonalne)
- **Walidacja count przy edycji:**
  - **Warunek:** `count >= 1`
  - **Wpływ:** Inline input nie akceptuje wartości < 1

**Step 4: Add NPCs**
- **Warunek:** Brak wymaganej walidacji (dodanie NPCów jest opcjonalne)
- **Walidacja formularza Simple Mode:**
  - `display_name.trim().length > 0 && display_name.length <= 255`
  - `max_hp >= 1`
  - `armor_class >= 0`
  - `initiative_modifier` (optional, może być ujemny lub undefined)
  - **Wpływ:** Button "+ Add NPC" disabled jeśli formularz invalid
- **Walidacja formularza Advanced Mode:**
  - `display_name`, `max_hp`, `armor_class` (jak Simple Mode)
  - `speed.trim().length > 0` (np. "30 ft")
  - `stats.*` (każdy atrybut >= 1 && <= 30)
  - `actions` (opcjonalne, może być pusta lista)
  - **Wpływ:** Button "+ Add NPC" disabled jeśli formularz invalid

**Step 5: Summary (przed submit)**
- **Warunek:** Przynajmniej 1 uczestnik w walce
  - `selectedPlayerCharacterIds.length > 0 || addedMonsters.size > 0 || addedNPCs.length > 0`
- **Komponent:** Step5_Summary
- **Wpływ na UI:**
  - Button "Start Combat" disabled jeśli warunek nie spełniony
  - Komunikat błędu: "Please add at least one participant to the combat"

### 9.2. Walidacja na poziomie API (backend)

Backend (endpoint POST /api/campaigns/:campaignId/combats) wykonuje dodatkową walidację:
- Kampania istnieje i należy do użytkownika
- Wszystkie `player_character_id` istnieją i należą do kampanii
- Wszystkie `monster_id` istnieją w bibliotece
- `count` dla potworów >= 1
- Stats dla ad-hoc NPCs są poprawne (każdy atrybut 1-30)

**Obsługa błędów walidacji API:**
- Jeśli API zwraca 400 Bad Request z details, wyświetl szczegółowy komunikat błędu
- Jeśli API zwraca 404 Not Found, wyświetl "Campaign, player character, or monster not found"
- User może poprawić dane i spróbować ponownie

### 9.3. Real-time validation w formularzach

**Strategia walidacji:**
- **On Blur:** Walidacja pola po utracie focusu (np. combat name, NPC form fields)
- **On Change:** Walidacja typu "number" (np. HP, AC) na bieżąco (nie pozwalaj na wpisanie niepoprawnych wartości)
- **On Submit:** Walidacja całego formularza przed dodaniem NPC lub submitowaniem wizardu

**Wyświetlanie błędów:**
- Komunikaty błędów pod polami input (czerwony tekst, mały font)
- Czerwone obramowanie invalid input (border-red-500)
- Disabled przyciski jeśli formularz invalid

## 10. Obsługa błędów

### 10.1. Błędy fetch (player characters, monsters)

**Scenario:** Fetch player characters lub monsters nie powiódł się (network error, 500 Internal Server Error)

**Obsługa:**
- Hook `usePlayerCharacters` lub `useMonsterSearch` zwraca `error` state
- UI wyświetla error message w miejscu listy:
  - Shadcn Alert (variant destructive)
  - Tekst: "Failed to load [player characters/monsters]. Please try again."
  - Button "Retry" → wywołuje `refetch()` z TanStack Query
- Progress indicator i przyciski nawigacyjne pozostają dostępne (user może wrócić do poprzedniego kroku)

**Example (Step 2 - player characters):**
```tsx
if (playerCharactersQuery.isError) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load player characters. Please try again.
      </AlertDescription>
      <Button onClick={() => playerCharactersQuery.refetch()} className="mt-2">
        Retry
      </Button>
    </Alert>
  );
}
```

### 10.2. Błędy mutacji (create combat)

**Scenario:** POST /api/campaigns/:campaignId/combats zwraca błąd (400, 404, 500)

**Obsługa:**
- Hook `useCombatCreation` zwraca `error` state w `onError` callback
- UI wyświetla error toast lub alert na dole wizardu:
  - Shadcn Toast (variant destructive)
  - Tekst: "Failed to create combat: [error message]"
  - User pozostaje w Step 5 i może poprawić dane lub spróbować ponownie
- Jeśli błąd 404 (campaign/character/monster not found):
  - Komunikat: "Some participants were not found. Please check your selections and try again."
  - User może wrócić do poprzednich kroków i zweryfikować wybory
- Jeśli błąd 400 (validation error):
  - Wyświetl szczegóły walidacji z `error.details` jeśli dostępne

**Example:**
```tsx
const createCombatMutation = useCombatCreation(campaignId);

const handleSubmit = () => {
  const command = mapWizardStateToCommand(wizardState, playerCharacters, monsters);
  createCombatMutation.mutate(command);
};

// W UI
{createCombatMutation.isError && (
  <Alert variant="destructive" className="mt-4">
    <AlertTitle>Error creating combat</AlertTitle>
    <AlertDescription>
      {createCombatMutation.error.message}
    </AlertDescription>
  </Alert>
)}
```

### 10.3. Brak postaci w kampanii (Step 2)

**Scenario:** `playerCharacters.length === 0`

**Obsługa:**
- Wyświetl warning banner (Shadcn Alert, variant warning):
  - Tekst: "No player characters in this campaign. Create one first."
  - Link (Shadcn Button as child of `<a>`) do `/campaigns/:campaignId/characters/new`
- Lista postaci nie renderuje się (pusta)
- Button "Next" disabled
- User może kliknąć link i stworzyć postać, następnie wrócić do wizardu (lub rozpocząć walkę tylko z potworami/NPCami)

**Alternative flow:**
- Jeśli user chce stworzyć walkę tylko z potworami/NPCami:
  - Pozwól na przejście do Step 3 bez zaznaczania postaci (zmień walidację na "przynajmniej 1 uczestnik ogółem" zamiast "przynajmniej 1 PC")
  - Dodaj informację: "You can still create a combat with only monsters and NPCs"

### 10.4. Infinite scroll errors (monsters)

**Scenario:** Fetch next page monsters nie powiódł się

**Obsługa:**
- Hook `useMonsterSearch` zwraca `error` state dla danej strony
- UI wyświetla error message na dole listy (zamiast loading spinner):
  - Tekst: "Failed to load more monsters."
  - Button "Try again" → wywołuje `fetchNextPage()` ponownie
- User może nadal korzystać z dotychczas załadowanych potworów

### 10.5. Network errors i offline mode

**Scenario:** Brak połączenia sieciowego podczas fetch

**Obsługa:**
- TanStack Query automatycznie retry (domyślnie 3 razy)
- Jeśli wszystkie retry się nie powiodą, wyświetl error message (jak w 10.1)
- Opcjonalnie: dodaj global listener na `window.offline` event i wyświetl banner: "You are offline. Some features may not work."

### 10.6. Validation errors (frontend)

**Scenario:** User próbuje przejść do następnego kroku bez spełnienia walidacji

**Obsługa:**
- Button "Next" jest disabled jeśli walidacja nie przechodzi
- Wyświetl komunikat błędu (czerwony tekst) wskazujący problem
- Opcjonalnie: scroll do pierwszego invalid field
- Focus na invalid field po próbie submit

### 10.7. Anulowanie wizardu (Escape key)

**Scenario:** User naciska klawisz Escape podczas wypełniania wizardu

**Obsługa:**
- Otwarcie modalu konfirmacji (Shadcn AlertDialog):
  - Tytuł: "Discard combat?"
  - Treść: "Are you sure you want to discard this combat? All progress will be lost."
  - Przyciski:
    - "Cancel" (default) → zamknięcie modalu, user wraca do wizardu
    - "Discard" (destructive) → redirect do `/campaigns/:campaignId/combats`

**Implementation:**
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDiscardModal(true);
    }
  };

  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, []);
```

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury projektu i typów

**Zadania:**
1. Utworzenie katalogu `src/components/combat/wizard/` dla komponentów wizardu
2. Utworzenie pliku `src/components/combat/wizard/types.ts` z typami:
   - `WizardState`
   - `PlayerCharacterViewModel`
   - `MonsterViewModel`
   - `AddedMonsterViewModel`
   - `SimpleNPCFormData`
   - `AdvancedNPCFormData`
   - `AdHocNPC`
3. Utworzenie pliku `src/components/combat/wizard/utils.ts` z funkcjami utility:
   - `mapWizardStateToCommand()`
   - `validateStep1()`, `validateStep2()`, `validateStep5()`
   - `defaultSimpleNPCFormData()`, `defaultAdvancedNPCFormData()`

**Oczekiwany rezultat:**
- Struktura katalogów gotowa
- Typy zdefiniowane i wyeksportowane
- Funkcje utility gotowe do użycia w komponentach

---

### Krok 2: Implementacja custom hooks

**Zadania:**
1. Utworzenie `src/components/combat/wizard/hooks/usePlayerCharacters.ts`
   - Hook `useQuery` do fetch player characters
2. Utworzenie `src/components/combat/wizard/hooks/useMonsterSearch.ts`
   - Hook `useInfiniteQuery` do fetch monsters z infinite scroll
3. Utworzenie `src/components/combat/wizard/hooks/useCombatCreation.ts`
   - Hook `useMutation` do create combat
   - Success callback z navigate do combat tracker
4. Utworzenie `src/components/combat/wizard/hooks/useDebounce.ts`
   - Utility hook do debounce search term

**Oczekiwany rezultat:**
- Wszystkie hooki zaimplementowane i przetestowane
- Hooki używają poprawnych typów z `src/types.ts`

---

### Krok 3: Implementacja komponentu ProgressIndicator

**Zadania:**
1. Utworzenie `src/components/combat/wizard/ProgressIndicator.tsx`
2. Implementacja layoutu poziomego (5 kroków)
3. Implementacja `StepIndicatorItem`:
   - Current step: emerald color, podświetlony
   - Completed steps: checkmark icon (Lucide Check)
   - Future steps: wyłączone (disabled, szary)
4. Stylizacja z Tailwind CSS
5. Dodanie ARIA attributes (`aria-current="step"` dla current step)

**Oczekiwany rezultat:**
- Komponent wizualnie zgodny z designem
- Accessibility (ARIA) zaimplementowana
- Komponent przyjmuje propsy `currentStep` i `completedSteps`

---

### Krok 4: Implementacja Step 1 - Combat Name

**Zadania:**
1. Utworzenie `src/components/combat/wizard/Step1_CombatName.tsx`
2. Implementacja heading (h2), input (Shadcn Input), button "Next"
3. Implementacja walidacji:
   - Required, max 255 znaków
   - Error messages pod inputem
4. Implementacja keyboard support (Enter submit)
5. Testowanie komponentu

**Oczekiwany rezultat:**
- Komponent działa poprawnie
- Walidacja działa (button disabled jeśli invalid)
- Focus management poprawny

---

### Krok 5: Implementacja Step 2 - Select Player Characters

**Zadania:**
1. Utworzenie `src/components/combat/wizard/Step2_SelectPlayerCharacters.tsx`
2. Integracja z hookiem `usePlayerCharacters(campaignId)`
3. Implementacja loading state (Shadcn Skeleton)
4. Implementacja error state (Alert + Retry button)
5. Implementacja warning banner (jeśli brak postaci)
6. Implementacja listy checkboxów (Shadcn Checkbox):
   - Domyślnie wszystkie zaznaczone
   - Badges HP i AC
7. Implementacja walidacji (przynajmniej 1 zaznaczony)
8. Implementacja navigation buttons (Back, Next)
9. Testowanie komponentu

**Oczekiwany rezultat:**
- Komponent pobiera i wyświetla postacie
- Walidacja działa poprawnie
- Error handling zaimplementowany

---

### Krok 6: Implementacja Step 3 - Add Monsters (Left Panel)

**Zadania:**
1. Utworzenie `src/components/combat/wizard/Step3_AddMonsters.tsx`
2. Implementacja split view (60% / 40%)
3. **Left Panel:**
   - Search bar (Shadcn Input z ikoną Search)
   - Integracja z hookiem `useDebounce(searchTerm, 300)`
   - Filter dropdown CR (Shadcn Select)
   - Integracja z hookiem `useMonsterSearch(debouncedSearch, crFilter)`
4. Implementacja infinite scroll:
   - Intersection Observer API
   - Wywołanie `fetchNextPage()` przy scroll do końca
   - Loading spinner na dole listy
5. Implementacja MonsterCard (Shadcn Accordion):
   - Header: Name, CR badge, Type+Size, "+ Add" button
   - Content: szczegóły potwora (HP, AC, Actions, Traits)
6. Implementacja obsługi kliknięcia "+ Add"
7. Testowanie infinite scroll i search

**Oczekiwany rezultat:**
- Lewy panel działa poprawnie
- Infinite scroll działa
- Search i filtrowanie działa z debounce
- MonsterCard wyświetla szczegóły po rozwinięciu

---

### Krok 7: Implementacja Step 3 - Add Monsters (Right Panel)

**Zadania:**
1. **Right Panel (w tym samym pliku Step3_AddMonsters.tsx):**
   - Heading "Added to Combat"
   - Lista dodanych potworów
   - AddedMonsterItem:
     - Name
     - Count badge (editable, kliknięcie → inline input)
     - Remove button (X icon)
   - Empty state (conditional, jeśli lista pusta)
2. Implementacja edycji count:
   - Kliknięcie badge → pokazanie inline input
   - Zmiana wartości → onUpdateCount callback
   - Blur lub Enter → powrót do badge
3. Implementacja usuwania potwora (onRemoveMonster)
4. Testowanie interakcji (dodawanie, edycja count, usuwanie)

**Oczekiwany rezultat:**
- Prawy panel działa poprawnie
- Edycja count działa intuicyjnie
- Usuwanie potworów działa

---

### Krok 8: Implementacja Step 4 - Add NPCs (Simple Mode)

**Zadania:**
1. Utworzenie `src/components/combat/wizard/Step4_AddNPCs.tsx`
2. Implementacja mode toggle (Shadcn Switch)
3. **Simple Mode Form:**
   - Input: Name, Max HP, AC, Initiative Modifier
   - Walidacja real-time (on blur, on change dla numbers)
   - Error messages pod polami
4. Implementacja "+ Add NPC" button (disabled jeśli invalid)
5. Implementacja logiki dodawania NPC:
   - Generowanie temporary ID
   - Dodanie do listy `addedNPCs`
   - Reset formularza
6. Implementacja listy dodanych NPCs (AddedNPCCard)
7. Implementacja usuwania NPC
8. Testowanie Simple Mode

**Oczekiwany rezultat:**
- Simple Mode form działa poprawnie
- Walidacja działa
- Dodawanie i usuwanie NPCs działa

---

### Krok 9: Implementacja Step 4 - Add NPCs (Advanced Mode)

**Zadania:**
1. **Advanced Mode Form (w tym samym pliku):**
   - Input: Name, Max HP, AC, Speed
   - Ability Scores Grid (2x3, 6 inputs)
   - Actions Builder:
     - Formularz akcji (Name, Type, Attack Bonus, Damage Dice, Damage Type, Description)
     - Lista dodanych akcji
     - Button "Add Action"
     - Usuwanie akcji z listy
2. Implementacja walidacji Advanced Mode
3. Implementacja przełączania między Simple/Advanced:
   - Modal konfirmacji jeśli formularz wypełniony
   - Reset formularza po przełączeniu
4. Testowanie Advanced Mode i przełączania

**Oczekiwany rezultat:**
- Advanced Mode form działa poprawnie
- Actions Builder działa
- Przełączanie między trybami działa bezpiecznie

---

### Krok 10: Implementacja Step 5 - Summary

**Zadania:**
1. Utworzenie `src/components/combat/wizard/Step5_Summary.tsx`
2. Implementacja sekcji:
   - Combat Name
   - Player Characters (lista z Name, HP, AC)
   - Monsters (lista z Name x count)
   - NPCs (lista z Name, HP, AC)
3. Implementacja navigation buttons:
   - Back
   - Start Combat (emerald, large, Shadcn Button)
4. Implementacja walidacji przed submit (przynajmniej 1 uczestnik)
5. Testowanie komponentu

**Oczekiwany rezultat:**
- Podsumowanie wyświetla wszystkie wybory użytkownika
- Walidacja działa przed submit
- Przyciski działają poprawnie

---

### Krok 11: Implementacja głównego komponentu CombatCreationWizard

**Zadania:**
1. Utworzenie `src/components/combat/wizard/CombatCreationWizard.tsx`
2. Inicjalizacja lokalnego stanu (wszystkie useState)
3. Implementacja logiki nawigacji między krokami:
   - `handleNext()` z walidacją
   - `handleBack()`
   - Aktualizacja `completedSteps`
4. Implementacja warunkowego renderowania kroków (switch lub conditional)
5. Implementacja modal anulowania (Escape key):
   - Shadcn AlertDialog
   - Listener na Escape
6. Implementacja ARIA live announcements
7. Implementacja focus management (useEffect na currentStep)
8. Implementacja submit (Step 5):
   - Mapowanie wizard state → CreateCombatCommand
   - Wywołanie mutation `useCombatCreation`
   - Obsługa success/error
9. Testowanie całego flow wizardu

**Oczekiwany rezultat:**
- Główny komponent integruje wszystkie kroki
- Nawigacja działa poprawnie
- Walidacja działa na każdym kroku
- Submit działa i redirectuje do combat tracker
- Accessibility (ARIA, focus management) działa

---

### Krok 12: Implementacja strony Astro

**Zadania:**
1. Utworzenie `src/pages/campaigns/[id]/combats/new.astro`
2. Dodanie `export const prerender = false;`
3. Ekstrakcja `campaignId` z params
4. Prefetch player characters na serwerze (opcjonalne, dla lepszej UX):
   - Użycie TanStack Query `prefetchQuery`
   - Dehydrate state
5. Renderowanie komponentu `<CombatCreationWizard client:load>`
6. Przekazanie `campaignId` i `dehydratedState` jako props
7. Dodanie layoutu (np. `<CampaignLayout>`)
8. Testowanie strony

**Oczekiwany rezultat:**
- Strona `/campaigns/:id/combats/new` działa
- React component renderuje się poprawnie
- Prefetch działa (jeśli zaimplementowany)

---

### Krok 13: Stylizacja i UX enhancements

**Zadania:**
1. Przegląd wszystkich komponentów pod kątem zgodności z designem
2. Dopracowanie Tailwind classes (spacing, colors, typography)
3. Dodanie transitions i animations:
   - Fade in/out przy zmianie kroków
   - Smooth scroll do error messages
4. Testowanie responsywności (chociaż MVP nie wymaga pełnej responsywności, warto sprawdzić na różnych rozmiarach okna)
5. Testowanie dark mode (jeśli aplikacja wspiera)
6. Dodanie loading states i skeletons gdzie potrzeba

**Oczekiwany rezultat:**
- Widok wygląda profesjonalnie
- UX jest płynne i intuicyjne
- Brak błędów wizualnych