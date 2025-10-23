# Architektura UI dla Initiative Forge MVP

## 1. Przegląd struktury UI

Initiative Forge to aplikacja internetowa dla Mistrzów Gry D&D 5e, zbudowana w stacku **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Shadcn/ui** z backendem **Supabase**. Architektura UI opiera się na podejściu SPA (Single Page Application) z Next.js App Router, gdzie wszystkie komponenty są **React client-side** bez Server-Side Rendering.

### Strategia renderowania

- **Next.js SPA mode (Static Export)** - pełna aplikacja client-side bez SSR
- **React client-side** dla całego UI i zarządzania stanem
- **TanStack React Query** do data fetching i cache'owania
- **Zustand** dla real-time combat state management i globalnego stanu
- **Supabase Auth** dla sesji użytkownika (session management z cookies)

### Design System

- **Dark mode only** z motywem emerald-green (emerald-500 jako primary accent)
- **Paleta kolorów**: slate-950/900 backgrounds, slate-50 text, emerald-500/700 accents
- **Typografia**: Inter (sans-serif) + JetBrains Mono (monospace dla liczb)
- **Komponenty**: Shadcn/ui New York theme (Lucide icons)
- **Minimum screen width**: 1024px (komunikat ostrzegawczy dla mniejszych ekranów)

### Accessibility Baseline

- Pełna nawigacja klawiaturą (tab order, focus states z emerald ring)
- ARIA labels dla icon buttons, live regions dla dynamicznych aktualizacji
- WCAG AA contrast compliance
- Semantic HTML + descriptive labels

## 2. Lista widoków

### 2.1. Login Page

**Ścieżka**: `/login`

**Główny cel**: Umożliwienie zalogowania się zarejestrowanym użytkownikom do aplikacji.

**Kluczowe informacje do wyświetlenia**:

- Formularz logowania (email, hasło)
- Link do rejestracji
- Komunikaty błędów walidacji

**Kluczowe komponenty widoku**:

- **Layout**: Centered card (max-width: 400px) na dark background (slate-950)
- **Logo/Title**: "Initiative Forge" (emerald accent)
- **Form Component** (React Hook Form + Zod):
  - Input: Email (type="email", autocomplete="email")
  - Input: Password (type="password", autocomplete="current-password")
  - Inline validation errors (text-destructive)
- **Button**: "Sign In" (emerald-500, full width)
- **Link**: "Don't have an account? Sign up" (emerald-500)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Disabled button podczas submissiona z loading spinner, auto-focus na email field, toast notifications dla błędów/sukcesu
- **Accessibility**: ARIA labels dla form fields, error messages w aria-live region, focus visible states (emerald ring)
- **Security**: Password field z opcjonalnym toggle visibility, Supabase Auth rate limiting, client-side auth guard (ProtectedRoute component)

---

### 2.2. Register Page

**Ścieżka**: `/register`

**Główny cel**: Umożliwienie rejestracji nowych użytkowników z automatycznym logowaniem po sukcesie.

**Kluczowe informacje do wyświetlenia**:

- Formularz rejestracji (email, hasło, potwierdzenie hasła)
- Wymagania dotyczące hasła
- Link do logowania
- Komunikaty błędów (format email, hasła się nie zgadzają, email zajęty)

**Kluczowe komponenty widoku**:

- **Layout**: Identyczny do login (centered card)
- **Form Component**:
  - Input: Email
  - Input: Password (min 8 chars, opcjonalny password strength indicator)
  - Input: Confirm Password
  - Inline validation errors
- **Button**: "Sign Up" (emerald-500, full width)
- **Link**: "Already have an account? Sign in"

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Real-time validation (email format, password match), auto-login po rejestracji → redirect do /campaigns, success toast notification
- **Accessibility**: ARIA describedby dla password requirements, focus management po błędach
- **Security**: Client-side validation + server-side validation, instant signup bez email confirmation (zgodnie z PRD), Supabase Auth SDK

---

### 2.3. My Campaigns View

**Ścieżka**: `/campaigns`

**Główny cel**: Wyświetlenie listy kampanii użytkownika i umożliwienie tworzenia nowych kampanii.

**Kluczowe informacje do wyświetlenia**:

- Grid campaign cards (nazwa, liczba postaci, liczba walk, status aktywnej walki, data ostatniej modyfikacji)
- Możliwość edycji nazwy kampanii (inline)
- Możliwość usunięcia kampanii
- Tile do tworzenia nowej kampanii
- Empty state dla nowych użytkowników

**Kluczowe komponenty widoku**:

- **Header Section**:
  - H1: "My Campaigns"
  - Metadata: "X campaigns" (muted text)
- **Responsive Grid**:
  - 3 kolumny (screen ≥ 1280px)
  - 2 kolumny (1024px ≤ screen < 1280px)
- **Campaign Card** (Shadcn Card):
  - Header: Nazwa kampanii (edytowalna - click → inline input), Dropdown menu (Edit Name, Delete)
  - Body: Icon 👤 + "X characters", Icon ⚔️ + "X combats", Status badge "Active combat" 🔴 (emerald, jeśli istnieje)
  - Footer: "Last modified: [date]" (muted), Button "Select Campaign" (emerald, full width)
- **Plus Tile**:
  - Dashed border card, centered icon +, text "Create New Campaign"
  - Hover: emerald glow
  - Click → Modal z formularzem (input: campaign name)
- **Empty State**:
  - Icon: folder (duży, muted)
  - Heading: "You don't have any campaigns yet"
  - Subtext: "Create your first campaign to get started"
  - Button: "Create Campaign" (emerald)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Skeleton loading states podczas fetch, optimistic UI dla tworzenia kampanii, confirmation modal dla Delete ("This campaign has X active combats. Deleting it will also delete all characters and combats. Are you sure?"), toast notifications (success/error)
- **Accessibility**: ARIA labels dla icon buttons, keyboard navigation dla dropdown menu, focus management w modalach
- **Security**: RLS zapewnia, że user widzi tylko swoje kampanie, validation błędów duplikatów nazw

---

### 2.4. Campaign Dashboard

**Ścieżka**: `/campaigns/:id`

**Główny cel**: Przegląd wybranej kampanii i szybki dostęp do głównych funkcji (zarządzanie postaciami, rozpoczęcie walki).

**Kluczowe informacje do wyświetlenia**:

- Nazwa kampanii (edytowalna inline)
- Data utworzenia kampanii
- Statystyki: liczba postaci (w przyszłości: zadania, sesje)
- Quick actions: przyciski do zarządzania postaciami i rozpoczęcia walki

**Kluczowe komponenty widoku**:

- **Breadcrumb Navigation**: "My Campaigns"
- **Stats Overview Section**:
  - Header: H1 Nazwa kampanii (edytowalna inline - click → input), Metadata "Created on [date]" (muted)
  - Stats Grid (responsywny, przygotowany na przyszłe rozszerzenia):
    - Card: "Player Characters" + liczba (duża, emerald)
- **Quick Actions Section**:
  - H2: "Quick Actions"
  - Grid (2 kolumny):
    - Card "Player Characters": Icon + Description, Button "Manage Characters" → /campaigns/:id/characters
    - Card "Combats": Icon + Description, Button "View Combats" → /campaigns/:id/combats

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Loading state (skeleton), error state (jeśli kampania nie istnieje → 404), focus na główny heading po load, inline editing z auto-save
- **Accessibility**: Focus na H1 po załadowaniu strony, keyboard navigation dla button groups
- **Security**: RLS zapewnia dostęp tylko dla właściciela kampanii, 404 jeśli kampania nie należy do usera

---

### 2.5. Player Characters View

**Ścieżka**: `/campaigns/:id/characters`

**Główny cel**: Zarządzanie postaciami graczy w kampanii (dodawanie, edycja, usuwanie).

**Kluczowe informacje do wyświetlenia**:

- Lista postaci graczy z podstawowymi statystykami (Name, HP, AC, Initiative Modifier, Passive Perception)
- Formularz tworzenia/edycji postaci z automatycznymi obliczeniami
- Empty state jeśli brak postaci

**Kluczowe komponenty widoku**:

- **Header**:
  - Breadcrumb: "My Campaigns > [Campaign Name] > Characters"
  - H1: "Player Characters"
  - Button: "Add Player Character" (emerald, icon +)
- **Character List** (dwie możliwe варианты - UI決定する):
  - **Variant A: Table** (Shadcn Table): Columns: Name, Max HP, AC, Initiative Mod, Passive Perception, Actions (dropdown)
  - **Variant B: Grid** z Character Cards: Card zawiera Name (heading), Stats badges (HP, AC, Init, Perception), Dropdown actions (Edit, Delete)
- **Empty State**:
  - Icon: character icon
  - Heading: "No characters yet"
  - Button: "Add Character"
- **Character Creation/Edit Modal** (Shadcn Dialog, max-width: 600px):
  - Header: "Add Player Character" / "Edit Character"
  - Form (React Hook Form + Zod):
    - **Section 1: Basic Info** (Grid 2x2): Name (required), Max HP (1-999), AC (0-99), Speed (0-999, default 30)
    - **Section 2: Ability Scores** (Grid 2x3): STR, DEX, CON, INT, WIS, CHA (1-30, default 10)
    - **Auto-calculated displays** (real-time): "Initiative Modifier: +X" (emerald), "Passive Perception: X" (emerald)
    - **Section 3: Actions** (Collapsible Accordion):
      - Lista akcji (jeśli istnieją): Action item (Name, Type, Attack Bonus, Damage), Remove button
      - Button: "+ Add Action"
      - **Action Builder**: Name, Type (select: melee/ranged/spell attack), Attack Bonus, Reach/Range, Damage Dice (np. "1d8"), Damage Bonus, Damage Type
  - Footer: "Cancel" (secondary), "Create Character"/"Save Changes" (emerald, disabled jeśli validation fails)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Real-time validation z inline errors, auto-focus na first input po otwarciu modalu, optimistic UI update po save, toast dla błędów API (np. character name already exists)
- **Accessibility**: Focus trap w modalu, Escape zamyka modal (z confirmation jeśli są changes), ARIA labels dla wszystkich inputs, real-time announcements dla auto-calculated values
- **Security**: Validation character name uniqueness w kampanii, RLS zapewnia dostęp tylko do postaci z własnych kampanii

---

### 2.6. Combats List View

**Ścieżka**: `/campaigns/:id/combats`

**Główny cel**: Wyświetlenie listy walk w kampanii, możliwość wznowienia aktywnej walki lub rozpoczęcia nowej.

**Kluczowe informacje do wyświetlenia**:

- Grid combat cards (nazwa, status, data rozpoczęcia/zakończenia, liczba uczestników, obecna runda)
- Przycisk tworzenia nowej walki
- Empty state jeśli brak walk

**Kluczowe komponenty widoku**:

- **Header Section**:
  - Breadcrumb: "My Campaigns > [Campaign Name] > Combats"
  - H1: "Combats"
  - Button: "Start New Combat" (emerald, icon +) → `/campaigns/:id/combats/new`
- **Responsive Grid**:
  - 2 kolumny (1024px ≤ screen < 1280px)
  - 3 kolumny (screen ≥ 1280px)
- **Combat Card** (Shadcn Card):
  - Header: Nazwa walki, Status badge (Active emerald/Completed muted)
  - Body:
    - Round indicator: "Round X" (jeśli active)
    - Participants count: "X participants"
    - Date: "Started [date]" lub "Completed [date]"
  - Footer:
    - Button "Resume Combat" (emerald, jeśli active) → `/combats/:id`
    - Button "View Combat" (secondary, jeśli completed) → `/combats/:id`
    - Dropdown menu (dla completed): Delete
- **Empty State**:
  - Icon: swords (duży, muted)
  - Heading: "No combats yet"
  - Subtext: "Start your first combat to track initiative and manage encounters"
  - Button: "Start New Combat" (emerald)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Skeleton loading states podczas fetch, optimistic UI dla operacji, confirmation modal dla Delete ("Delete this combat? This action cannot be undone."), toast notifications (success/error), visual distinction między active i completed combats (emerald vs muted badges)
- **Accessibility**: ARIA labels dla icon buttons, keyboard navigation dla dropdown menu, focus management w modalach, ARIA live dla statusu ładowania
- **Security**: RLS zapewnia dostęp tylko do walk z własnych kampanii, validation przy usuwaniu

---

### 2.7. Combat Creation Wizard

**Ścieżka**: `/campaigns/:id/combats/new`

**Główny cel**: Utworzenie nowej walki poprzez 5-stopniowy wizard (nazwa, wybór PCs, dodanie potworów, dodanie NPCs, podsumowanie).

**Kluczowe informacje do wyświetlenia**:

- Progress indicator (5 kroków)
- Step 1: Combat name input
- Step 2: Checkboxes postaci graczy (domyślnie wszystkie zaznaczone)
- Step 3: Split view - searchable monster library (left 60%) + added monsters list (right 40%)
- Step 4: Form dla ad-hoc NPCs (Simple/Advanced mode toggle)
- Step 5: Podsumowanie wszystkich uczestników

**Kluczowe komponenty widoku**:

- **Progress Indicator** (Shadcn Stepper lub custom):
  - 5 steps: "Combat Name", "Select PCs", "Add Monsters", "Add NPCs", "Summary"
  - Current step highlighted (emerald), completed steps: checkmark icon
- **Step 1: Combat Name**:
  - H2: "Name Your Combat"
  - Input: Combat Name (required, max 255)
  - Button: "Next" (disabled jeśli empty)
- **Step 2: Select Player Characters**:
  - H2: "Select Player Characters"
  - Lista checkboxów: Checkbox + Character name + badges (HP, AC), domyślnie wszystkie checked
  - Validation: przynajmniej 1 wybrany
  - Buttons: "Back", "Next"
- **Step 3: Add Monsters**:
  - H2: "Add Monsters"
  - **Left Panel (60%)**:
    - Search bar: "Search monsters..." (debounce 300ms)
    - Filter dropdown: CR (range slider lub select)
    - Monster List (infinite scroll): Monster Card (Name, CR badge, Type+Size, "+ Add" button, click → accordion rozwija szczegóły)
    - Loading spinner na dole
  - **Right Panel (40%)**:
    - H3: "Added to Combat"
    - Lista dodanych: Monster item (Name, Count badge "x3" - click → inline input, Remove button X)
    - Empty state: "No monsters added yet"
  - Buttons: "Back", "Next"
- **Step 4: Add Ad-hoc NPCs (Optional)**:
  - H2: "Add NPCs (Optional)"
  - Toggle: "Simple Mode" / "Advanced Mode" (Shadcn Switch)
  - **Simple Mode Form**: Name, Max HP, AC, Initiative Modifier (opcjonalnie)
  - **Advanced Mode Form**: Name, Max HP, AC, Speed, Ability Scores (grid 2x3), Actions (action builder)
  - Lista dodanych NPCs (jeśli są): NPC Card (Name, HP, AC, Remove button)
  - Button: "+ Add NPC"
  - Buttons: "Back", "Next"
- **Step 5: Summary**:
  - H2: "Combat Summary"
  - Sections:
    - "Combat Name": [nazwa]
    - "Player Characters (X)": Lista (Name, HP, AC)
    - "Monsters (X)": Lista (Name x count)
    - "NPCs (X)": Lista (Name, HP, AC)
  - Buttons: "Back", "Start Combat" (emerald, duży)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Keyboard navigation przez steps, focus management przy przechodzeniu między steps, validation każdego stepu przed "Next", progress saved w local state, confirmation modal przy Escape ("Discard combat?"), brak postaci w kampanii → warning banner w Step 2 z linkiem do character creation
- **Accessibility**: ARIA live announcements przy zmianie kroków, focus na heading każdego stepu, keyboard support dla monster search i selection
- **Security**: Validation uczestników (przynajmniej 1), RLS dla dostępu do campaign characters, public read dla monsters

---

### 2.8. Combat View

**Ścieżka**: `/combats/:id`

**Główny cel**: Prowadzenie walki w czasie rzeczywistym z 3-kolumnowym interfejsem (initiative list, active character sheet, reference search).

**Kluczowe informacje do wyświetlenia**:

- **Left column (30%)**: Posortowana lista inicjatywy z HP controls, condition badges, round counter
- **Middle column (50%)**: Karta aktywnej postaci z statystykami, akcjami, roll controls, roll log
- **Right column (20%)**: Reference search (conditions/spells/monsters tabs)
- Floating "Next Turn" button
- Turn transition animations

**Kluczowe komponenty widoku**:

**LEFT COLUMN (30%) - Interactive Initiative List:**

- **Header**:
  - Round counter: "Round X" (emerald badge)
  - Button: "Roll Initiative" (tylko jeśli nie rozpoczęto - initial load)
- **Initiative List** (Scroll Area, auto-scroll do aktywnej):
  - **Initiative Item**:
    - Display name (H3, size depends on active)
    - Initiative value badge (emerald)
    - **Active turn indicator**: emerald glow border + background highlight
    - **HP Controls**:
      - Display: "[current] / [max]"
      - Input field (number)
      - Button: 🩸 "DMG" (destructive red)
      - Button: 💚 "HEAL" (emerald green)
      - Workflow: wpisz wartość → klik DMG/HEAL → current HP update → input clears
    - AC badge: shield icon + value
    - **Condition badges** (small pills): Icon + name, hover → Tooltip z pełnym opisem
    - Button: "+ Add Condition" (small) → Combobox (Shadcn) z listą conditions
    - **0 HP state**: Opacity 0.5, skull icon, strikethrough name, aria-label "[Name] is unconscious"
- Footer: "Combat started [time ago]"

**MIDDLE COLUMN (50%) - Active Character Sheet:**

- **Header Section**:
  - Nazwa postaci (H2, emerald)
  - **HP Bar**: Visual progress bar (emerald fill, gray background), numbers overlay "X / Y HP"
  - AC Display: Shield icon + value (large badge)
- **Stats Section**:
  - H3: "Ability Scores"
  - Grid 2x3: Stat card (STR, DEX, CON, INT, WIS, CHA) - Label (muted), Score value (duży), Modifier badge ("+X"/"-X")
- **Actions Section**:
  - H3: "Actions"
  - Lista akcji jako przyciski (Shadcn Button, outline):
    - Icon typu (melee: sword, ranged: bow, spell: sparkles)
    - Nazwa akcji
    - Badge: attack bonus ("+5")
    - Badge: damage dice ("1d8+3")
    - Click → wykonuje rzut
  - Empty state: "No actions available"
- **Roll Controls**:
  - Radio Group: "Normal" / "Advantage" / "Disadvantage" (icons: = / ↑↑ / ↓↓)
- **Roll Log**:
  - H3: "Recent Rolls"
  - Ostatnie 3 rzuty (małe karty, stack):
    - Roll Card: Icon + typ (Attack/Damage/Save), Wynik (duży, emerald jeśli crit/success, red jeśli fail), Formula + modyfikatory (muted), Timestamp (muted)
  - Empty state: "No rolls yet"

**RIGHT COLUMN (20%) - Reference Search:**

- **Header**: Search bar "Search conditions, spells, monsters..." (debounce 300ms, clear button X)
- **Tabs** (Shadcn Tabs): [Conditions] [Spells] [Monsters]
  - **Conditions Tab**:
    - Lista D&D 5e conditions: Condition Item (accordion) - Icon + Name, click → rozwija opis, button "Apply to [selected]"
  - **Spells Tab**:
    - Filters: Level (0-9, select), Class (multi-select)
    - Spell List: Spell Card (Name, Level badge, School+Casting Time, click → accordion pełny opis)
  - **Monsters Tab**:
    - Monster List: Monster Card (Name, CR badge, Type+Size, click → rozwija stats, opcjonalnie button "Add to Combat")
- Scroll Area dla każdej zakładki, loading states (skeleton)

**Floating Action Button (FAB):**

- Position: fixed bottom-right
- Button (large, emerald, circular): Icon arrow right, Text "Next Turn", Subtext "(Space)"
- Keyboard shortcut: Spacebar
- Animacja: pulsująca

**Turn Transition Animation Sequence:**

1. Fade out emerald glow poprzedniej postaci (0.2s)
2. Smooth scroll lista inicjatywy do następnej (0.3s)
3. Emerald glow następnej postaci (0.3s fade in)
4. Middle column: fade out starej karty → fade in nowej (0.2s każda)
5. Reset input fields w HP controls
6. **End of round**: Toast "Round X begins" (emerald, auto-dismiss 3s), auto-save state snapshot

**Combat Exit Warning:**

- User klika inny link w nawigacji
- Jeśli `isDirty === true`:
  - Modal (Shadcn Alert Dialog): "Unsaved Changes", "You have unsaved changes. Save before leaving?"
  - Actions: "Save & Leave" (emerald), "Leave without saving" (destructive), "Cancel" (secondary)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Zustand dla real-time state (zero latency), debounced auto-save (co 30s jeśli isDirty), optimistic UI dla wszystkich operacji, smooth animations, toast notifications dla błędów
- **Accessibility**: ARIA live region dla roll results ("You rolled 18 to hit"), ARIA live dla turn changes ("It's Aragorn's turn"), focus management (po "Next Turn" → focus na active character name), keyboard shortcuts (Spacebar: Next Turn, D: damage input, H: heal input, Escape: clear focus/close modals)
- **Security**: RLS dla dostępu do combat (tylko owner kampanii), validation HP values (clamp do 0-max), state snapshot encryption (opcjonalnie)
- **Performance**: Virtualized lists jeśli >20 participants, debounced search, skeleton loading states

**Error Cases**:

- Combat nie istnieje → 404 page
- State snapshot corrupted → error state "Failed to load combat state" z "Retry"/"Reset Combat"
- API save error → toast "Failed to save. Changes may be lost." z retry button

---

### 2.9. Monsters Library

**Ścieżka**: `/monsters`

**Główny cel**: Przeglądanie i wyszukiwanie globalnej biblioteki potworów z SRD.

**Kluczowe informacje do wyświetlenia**:

- Search bar z filtrem CR
- Grid monster cards (Name, CR badge, Type, Size)
- Slideover z pełnymi statystykami potwora
- Infinite scroll dla paginacji

**Kluczowe komponenty widoku**:

- **Header**:
  - H1: "Monsters Library"
  - Search bar: "Search monsters..." (debounce 300ms, full width)
  - Filters (inline): CR Filter (Range slider 0-30 lub dual select Min/Max CR), Reset filters button
- **Monster List**:
  - Grid (2 kolumny na 1024px, 3 kolumny na 1280px+):
    - **Monster Card**: Header Name (H3), CR Badge (emerald, large), Type + Size (muted), Click → otwiera Slideover
  - **Infinite scroll**: 20 initial, trigger at 80%, loading spinner na dole "Loading more..."
  - Loading state (initial): Skeleton cards
  - Empty state: "No monsters found matching your filters"
- **Slideover** (Shadcn Sheet, from right, width 400px):
  - Header: Monster Name (H2), CR Badge, Close button (X)
  - Body (Scroll Area):
    - Basic Info: Size, Type, Alignment, AC, HP (average + formula), Speed
    - Ability Scores: Table (STR, DEX, CON, INT, WIS, CHA - score + modifier)
    - Skills, Senses, Languages
    - **Traits**: Accordion dla każdego (name + description)
    - **Actions**: Accordion (name, description z attack roll/damage)
    - **Bonus Actions, Reactions**: Accordion (jeśli istnieją)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Debounced search (300ms), paginated API calls, skeleton loading, smooth slideover animation
- **Accessibility**: Focus trap w slideover, Escape zamyka slideover, ARIA labels dla filter controls, search input aria-describedby="search-hint"
- **Security**: Public read access (no auth required), rate limiting dla API

---

### 2.10. Spells Library

**Ścieżka**: `/spells`

**Główny cel**: Przeglądanie i wyszukiwanie globalnej biblioteki czarów z SRD.

**Kluczowe informacje do wyświetlenia**:

- Search bar z filtrami Level i Class
- Grid spell cards (Name, Level badge, School, Casting Time)
- Slideover z pełnym opisem czaru
- Infinite scroll dla paginacji

**Kluczowe komponenty widoku**:

- **Header**:
  - H1: "Spells Library"
  - Search bar: "Search spells..." (debounce 300ms)
  - Filters (inline):
    - Level Filter: Multi-select dropdown (Cantrip, 1st, 2nd, ..., 9th)
    - Class Filter: Multi-select dropdown (Wizard, Cleric, Bard, ...)
    - Reset filters button
- **Spell List**:
  - Grid (2 kolumny na 1024px, 3 kolumny na 1280px+):
    - **Spell Card**: Header Name (H3), Level Badge (emerald, "3rd Level"/"Cantrip"), School (muted, "Evocation"), Casting Time (muted, "Action"), Click → Slideover
  - **Infinite scroll**: 20 initial, load at 80%
  - Loading state: Skeleton cards
  - Empty state: "No spells found"
- **Slideover** (from right, width 400px):
  - Header: Spell Name (H2), Level + School badges, Close button
  - Body (Scroll Area):
    - **Casting Info**: Casting Time, Range, Components (V, S, M - jeśli M to material description), Duration (+ concentration badge)
    - **Description**: Pełny tekst (markdown formatting)
    - **Attack/Save Info** (jeśli applicable): Attack Type, Saving Throw (Ability + success effect)
    - **Damage/Healing** (jeśli applicable): Damage formula (dice + type), Average (calculated)
    - **At Higher Levels**: Text (jeśli applicable)
    - **Available Classes**: Lista badges (Wizard, Sorcerer, ...)

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Debounced search, multi-select filters z keyboard navigation (arrow keys, space), smooth animations
- **Accessibility**: Focus trap w slideover, Escape zamyka, ARIA labels dla filters, multi-select keyboard accessible
- **Security**: Public read access, rate limiting

---

### 2.11. Main Layout (Sidebar Navigation)

**Ścieżka**: N/A (obecny na wszystkich widokach po zalogowaniu)

**Główny cel**: Globalna nawigacja i dostęp do głównych modułów aplikacji.

**Kluczowe informacje do wyświetlenia**:

- Current campaign display (nazwa z localStorage, persystuje przez całą sesję)
- Global modules (My Campaigns, Monsters Library, Spells Library)
- Campaign modules (Combat, Player Characters - aktywne tylko gdy kampania wybrana)
- User menu (logout)

**Kluczowe komponenty widoku**:

- **Sidebar** (fixed left, width 240px, background slate-900, border-right slate-800, client:only="react"):
  - **Top Section**:
    - Logo + App Name: "Initiative Forge" (emerald accent), click → /campaigns
  - **Current Campaign Display**:
    - Label: "Current Campaign" (muted, small)
    - Nazwa kampanii (z localStorage, persystuje niezależnie od URL)
    - Gdy brak kampanii: link "Select a campaign" → /campaigns
    - Źródło prawdy: localStorage (`selectedCampaignId`)
    - Hook: `useSelectedCampaign` - zarządzanie localStorage + walidacja
  - **Global Modules Section**:
    - Label: "Global" (muted, uppercase, small)
    - Nav List:
      - "My Campaigns" (icon: folder, link: /campaigns) - prowadzi do listy kampanii
      - "Monsters Library" (icon: dragon, link: /monsters)
      - "Spells Library" (icon: sparkles, link: /spells)
    - Active link: emerald left border + emerald text
  - **Campaign Modules Section**:
    - Label: "Campaign" (muted, uppercase, small)
    - Conditional rendering: tylko jeśli `selectedCampaignId !== null`
    - Nav List:
      - "Campaign Home" (icon: home, link: /campaigns/:selectedCampaignId) - dashboard wybranej kampanii
      - "Combats" (icon: swords, link: /campaigns/:selectedCampaignId/combats) - lista walk, Badge "Active" (emerald, pulsing) jeśli istnieje aktywna walka
      - "Player Characters" (icon: users, link: /campaigns/:selectedCampaignId/characters)
  - **Bottom Section**:
    - User Menu (Dropdown): Trigger (Avatar + Email truncated), Content (User info, "Logout" - icon log-out, destructive text)
- **Main Content Area**: Background slate-950, padding responsive (4-8), max-width: none

**UX, dostępność i względy bezpieczeństwa**:

- **UX**: Campaign context z localStorage (persystuje przez sesję), aktywna kampania widoczna zawsze (nawet na /campaigns, /monsters), smooth transitions między widokami, active link highlighting, zmiana kampanii przez kliknięcie w kartę na /campaigns
- **Accessibility**: Sidebar role="navigation", skip to main content link (visually hidden, focused on tab), active links aria-current="page", keyboard navigation (Tab przez nav items, Enter to activate), focus visible (emerald ring)
- **Security**: Supabase signOut przy logout → redirect /login, RLS zapewnia dostęp tylko do własnych kampanii, localStorage validation (usuwanie nieprawidłowych ID)
- **SSR**: Sidebar renderowany client:only="react" - eliminuje problemy z localStorage podczas SSR, brak hydration mismatch

---

### 2.12. Error States

**Ścieżka**: N/A (komponenty obecne w razie potrzeby)

**Główny cel**: Obsługa błędów i edge cases.

**Kluczowe komponenty**:

- **404 Page**:
  - Centered layout, Icon (question mark/broken link), Heading "Page Not Found", Subtext "The page you're looking for doesn't exist.", Button "Go to My Campaigns" (emerald)
- **401 Unauthorized**:
  - Redirect to /login, Toast "Please log in to continue"
- **Screen Size Warning (<1024px)**:
  - Full-screen overlay (slate-950, z-index 9999)
  - Centered: Icon monitor (large), Heading "Screen Too Small", Subtext "Initiative Forge requires a minimum screen width of 1024px. Please use a larger device or resize your browser window."
  - No dismiss button (blocking)
- **API Error States** (Toast notifications - Shadcn Toast):
  - Success: green, checkmark icon, auto-dismiss 3s
  - Error: red, X icon, auto-dismiss 5s, "Retry" action button
  - Info: blue, info icon, auto-dismiss 3s

## 3. Mapa podróży użytkownika

### Główny przypadek użycia: "DM prowadzi walkę z goblinami"

#### Krok 1: Onboarding

- User odwiedza `/register`
- Wpisuje email i hasło, klika "Sign Up"
- System automatycznie loguje i przekierowuje do `/campaigns`

#### Krok 2: Konfiguracja kampanii

- User widzi empty state: "You don't have any campaigns yet"
- Klika "+ Create New Campaign"
- Wpisuje nazwę "Lost Mines of Phandelver", klika "Create"
- System przekierowuje do `/campaigns/:id` (Campaign Dashboard)

#### Krok 3: Dodawanie postaci graczy

- User klika "Manage Characters"
- Przekierowanie do `/campaigns/:id/characters`
- User klika "Add Player Character", modal się otwiera
- User wypełnia formularz:
  - Name: "Aragorn", Max HP: 45, AC: 16, Speed: 30
  - Ability scores: STR 16, DEX 14, CON 14, INT 10, WIS 12, CHA 14
  - System auto-oblicza: Initiative Mod +2, Passive Perception 11
  - Dodaje akcję: "Longsword Attack" (melee, +5 to hit, 1d8+3 slashing)
- User klika "Create Character", modal zamyka się, postać pojawia się na liście
- User powtarza dla 3 innych postaci

#### Krok 4: Rozpoczęcie walki

- User wraca do Campaign Dashboard (breadcrumb lub sidebar)
- Klika "Start New Combat"
- Przekierowanie do `/campaigns/:id/combats/new`

**Wizard - Step 1:**

- User wpisuje nazwę: "Goblin Ambush", klika "Next"

**Wizard - Step 2:**

- User widzi checkboxy z 4 postaciami (wszystkie zaznaczone), klika "Next"

**Wizard - Step 3:**

- User wpisuje "goblin" w search bar
- Widzi wyniki: Goblin (CR 1/4)
- Klika "+ Add" obok Goblin
- W prawej kolumnie pojawia się "Goblin x1"
- User klika "x1", zmienia na "x3", klika "Next"

**Wizard - Step 4:**

- User pomija (nie dodaje NPCs), klika "Next"

**Wizard - Step 5:**

- User widzi podsumowanie: 4 PCs + 3 gobliny
- Klika "Start Combat"
- System wykonuje rzuty inicjatywy (client-side)
- Przekierowanie do `/combats/:id`

#### Krok 5: Prowadzenie walki

**Tura 1 - Aragorn (initiative 18):**

- User widzi:
  - Left column: posortowaną listę, Aragorn na górze z emerald glow
  - Middle column: kartę Aragorn z akcjami
  - Right column: reference search
- User klika "Longsword Attack"
- System wyświetla rzut: d20 (15) + 5 = 20 (to hit), damage: 1d8 (6) + 3 = 9 slashing
- User wpisuje "9" w damage input przy "Goblin #1", klika 🩸 DMG
- HP Goblin #1: 7 → 0 (opacity 0.5, skull icon)
- User klika FAB "Next Turn" (lub Spacebar)

**Tura 2 - Legolas (initiative 16):**

- System smooth scroll do Legolas, emerald glow przesuwa się
- Middle column załadowuje kartę Legolas
- User klika "Longbow Attack", wybiera "Advantage"
- System rzuca: d20 (7, 14) = 14 + 7 = 21, damage: 1d8 (5) + 4 = 9
- User zadaje 9 damage Goblin #2 (7 → 0), klika "Next Turn"

**Tura 3 - Goblin #3 (initiative 12):**

- User widzi kartę Goblin #3
- Klika "Scimitar", system rzuca: d20 (8) + 4 = 12
- User sprawdza AC Aragorn (16) - miss, klika "Next Turn"

**Koniec rundy:**

- Po ostatniej turze, toast: "Round 2 begins", auto-save state snapshot

**Koniec walki:**

- Wszystkie gobliny 0 HP
- User klika "My Campaigns" w sidebar
- Modal: "You have unsaved changes. Save before leaving?"
- User klika "Save & Leave", system zapisuje, przekierowuje do `/campaigns`

### Alternatywne ścieżki

**Ścieżka A: Przeglądanie biblioteki potworów**

- User klika "Monsters Library" w sidebar
- Przekierowanie do `/monsters`
- User wpisuje "dragon", filtruje CR: 10-20
- Klika "Adult Red Dragon", slideover otwiera się z pełnymi stats
- User przegląda, zamyka slideover

**Ścieżka B: Sprawdzanie czaru podczas walki**

- User w `/combats/:id`, klika tab "Spells" w right column
- Wpisuje "fireball", klika na "Fireball"
- Accordion rozwija opis z damage formula (8d6 fire)
- User czyta, nie opuszcza combat view

**Ścieżka C: Dodawanie stanu do postaci**

- User w `/combats/:id` widzi, że Aragorn został oślepiony
- Klika "+ Add Condition" przy Aragorn
- Combobox otwiera się, wybiera "Blinded"
- Badge "Blinded" pojawia się, hover → tooltip z opisem

## 4. Układ i struktura nawigacji

### Hierarchia nawigacji

```
/ (root - redirect do /campaigns jeśli zalogowany, /login jeśli nie)
├── /login
├── /register
└── /campaigns (po zalogowaniu - Main Layout z sidebar)
    ├── /campaigns (My Campaigns View)
    ├── /campaigns/:id (Campaign Dashboard)
    ├── /campaigns/:id/characters (Player Characters View)
    ├── /campaigns/:id/combats (Combats List View)
    ├── /campaigns/:id/combats/new (Combat Creation Wizard)
    ├── /combats/:id (Combat View - active combat)
    ├── /monsters (Monsters Library)
    └── /spells (Spells Library)
```

### Sidebar Navigation (Main Layout)

**Top Section:**

- Logo + App Name: "Initiative Forge" → click redirects to `/campaigns`
- Campaign selector dropdown (pokazuje wybraną kampanię lub "Select a campaign", saved w localStorage)

**Global Modules Section:**

- My Campaigns (ikona folder + label) → `/campaigns`
- Monsters Library (ikona dragon + label) → `/monsters`
- Spells Library (ikona sparkles + label) → `/spells`

**Campaign Modules Section** (tylko jeśli kampania wybrana):

- Campaign Home (ikona home + label) → `/campaigns/:selectedId` - dashboard wybranej kampanii
- Combats (ikona swords + label) → `/campaigns/:selectedId/combats` - lista walk, Badge "Active" (emerald, pulsing) jeśli istnieje aktywna walka
- Player Characters (ikona users + label) → `/campaigns/:selectedId/characters`

**Bottom Section:**

- User menu (avatar + email) → Dropdown: Logout

### Breadcrumb Navigation

Używany w widokach zagnieżdżonych:

- `/campaigns/:id` → "My Campaigns"
- `/campaigns/:id/characters` → "My Campaigns > [Campaign Name] > Characters"
- `/campaigns/:id/combats` → "My Campaigns > [Campaign Name] > Combats"
- `/campaigns/:id/combats/new` → "My Campaigns > [Campaign Name] > Combats > New Combat"
- `/combats/:id` → "My Campaigns > [Campaign Name] > [Combat Name]"

### Nawigacja klawiaturą

- **Tab order**: Sidebar → Main content → Modals
- **Spacebar**: "Next Turn" w combat view
- **Escape**: Zamknięcie modali, slideoverów
- **Arrow keys**: Nawigacja w comboboxach, listach
- **D** (Combat View): Focus damage input
- **H** (Combat View): Focus heal input

## 5. Kluczowe komponenty

### 5.1. Komponenty współdzielone (reusable)

#### CampaignCard

**Wykorzystanie**: My Campaigns View
**Struktur**: Card z header (nazwa edytowalna, dropdown menu), body (badges: postaci, walki, status), footer (data modyfikacji, button "Select Campaign")
**Props**: campaign object, onSelect, onEdit, onDelete
**Accessibility**: ARIA labels dla icon buttons, keyboard navigation w dropdown

#### CharacterStatBadge

**Wykorzystanie**: Player Characters View, Combat View
**Struktura**: Badge z ikoną i wartością (np. shield icon + AC value)
**Props**: type (hp/ac/init/perception), value
**Accessibility**: aria-label opisuje typ i wartość

#### InitiativeItem

**Wykorzystanie**: Combat View (left column)
**Struktura**: Card z display name, initiative badge, HP controls, AC badge, condition badges, "+ Add Condition"
**Props**: participant object, isActive (boolean), onDamage, onHeal, onAddCondition
**Accessibility**: ARIA live dla HP changes, focus trap w HP controls

#### RollResult

**Wykorzystanie**: Combat View (roll log)
**Struktura**: Mała karta z icon, typ rzutu, wynik, formula, timestamp
**Props**: roll object (type, result, formula, modifiers, timestamp)
**Accessibility**: aria-label z pełnym opisem rzutu

#### MonsterCard

**Wykorzystanie**: Monsters Library, Combat Creation Wizard
**Struktura**: Card z name, CR badge, type+size, click → accordion/slideover
**Props**: monster object, variant (compact/full), onClick
**Accessibility**: Keyboard accessible (Enter to expand), focus management

#### SpellCard

**Wykorzystanie**: Spells Library, Combat View (reference search)
**Struktura**: Card z name, level badge, school+casting time, click → accordion/slideover
**Props**: spell object, variant (compact/full), onClick
**Accessibility**: Keyboard accessible, screen reader friendly

### 5.2. Layout komponenty

#### MainLayout

**Wykorzystanie**: Wszystkie widoki po zalogowaniu
**Struktura**: Sidebar (240px) + Main content area (flex-1)
**Accessibility**: Skip to main content link, ARIA landmarks (navigation, main)

#### WizardLayout

**Wykorzystanie**: Combat Creation Wizard
**Struktura**: Progress indicator + Step content + Navigation buttons (Back, Next)
**Props**: steps array, currentStep, onNext, onBack
**Accessibility**: ARIA live announcements przy zmianie kroków, focus management

#### ThreeColumnLayout

**Wykorzystanie**: Combat View
**Struktura**: Grid 30% / 50% / 20% (responsive collapse right column <1280px)
**Accessibility**: ARIA labels dla każdej kolumny (Initiative, Character, Reference)

### 5.3. Form komponenty (Shadcn/ui)

- **Input**: Text, number, password (z validation states)
- **Select/Dropdown**: Single-select, multi-select
- **Combobox**: Searchable select (dla conditions)
- **Checkbox**: Dla multi-selection (PCs w wizard)
- **Radio Group**: Dla roll controls (Normal/Advantage/Disadvantage)
- **Switch**: Dla toggles (Simple/Advanced mode w NPC creation)
- **Accordion**: Dla collapsible content (actions, traits, spell descriptions)
- **Dialog**: Dla modali (character creation, confirmation dialogs)
- **Sheet**: Dla slideoverów (monster/spell details)
- **Toast**: Dla notifications (success/error/info)

### 5.4. Data display komponenty

- **Table**: Dla structured data (opcjonalnie w Player Characters View)
- **Badge**: Dla statusów, CR, levels, conditions
- **Progress Bar**: Dla HP visualization w combat view
- **Skeleton**: Dla loading states
- **Empty State**: Dla pustych list (no campaigns, no characters, etc.)

### 5.5. Interactive komponenty

- **Button**: Primary (emerald), secondary, destructive
- **Floating Action Button (FAB)**: "Next Turn" w combat view
- **Dropdown Menu**: Dla actions (Edit, Delete)
- **Scroll Area**: Dla długich list (initiative, reference search)
- **Tabs**: Dla reference search (Conditions/Spells/Monsters)

### 5.6. State management komponenty

#### CombatStateProvider

**Wykorzystanie**: Combat View
**Technologia**: Zustand store
**Odpowiedzialność**: Zarządzanie real-time combat state (participants, current turn, round, HP updates, conditions), auto-save do API
**Accessibility**: Exposes state dla ARIA live announcements

#### FormProvider

**Wykorzystanie**: Wszystkie formularze
**Technologia**: React Hook Form + Zod
**Odpowiedzialność**: Validation, submission, error handling
**Accessibility**: Auto-focus na first error, ARIA invalid states

---

## 6. Mapowanie API do widoków

### My Campaigns View

- **GET** `/api/campaigns` → Lista kampanii
- **POST** `/api/campaigns` → Tworzenie kampanii
- **PATCH** `/api/campaigns/:id` → Edycja nazwy
- **DELETE** `/api/campaigns/:id` → Usunięcie

### Campaign Dashboard

- **GET** `/api/campaigns/:id` → Szczegóły kampanii
- **GET** `/api/campaigns/:campaignId/characters` → Liczba postaci

### Player Characters View

- **GET** `/api/campaigns/:campaignId/characters` → Lista
- **POST** `/api/campaigns/:campaignId/characters` → Tworzenie
- **PATCH** `/api/campaigns/:campaignId/characters/:id` → Edycja
- **DELETE** `/api/campaigns/:campaignId/characters/:id` → Usunięcie

### Combats List View

- **GET** `/api/campaigns/:campaignId/combats` → Lista walk
- **DELETE** `/api/campaigns/:campaignId/combats/:id` → Usunięcie walki

### Combat Creation Wizard

- **GET** `/api/campaigns/:campaignId/characters` → Step 2
- **GET** `/api/monsters?name=...&cr=...` → Step 3
- **POST** `/api/campaigns/:campaignId/combats` → Step 5

### Combat View

- **GET** `/api/campaigns/:campaignId/combats/:id` → Initial load
- **PATCH** `/api/campaigns/:campaignId/combats/:id/snapshot` → Auto-save
- **PATCH** `/api/campaigns/:campaignId/combats/:id/status` → Completion
- **GET** `/api/conditions` → Reference search
- **GET** `/api/spells?...` → Reference search
- **GET** `/api/monsters?...` → Reference search

### Monsters/Spells Libraries

- **GET** `/api/monsters?...` → Search/filter/pagination
- **GET** `/api/spells?...` → Search/filter/pagination

---

## 7. Przypadki brzegowe i stany błędów

### Authentication

- **Niezalogowany user → protected route**: Middleware redirect do `/login`, toast "Please log in to continue"
- **Session expired**: Supabase auto-refresh tokena (transparentne), jeśli fails → redirect `/login` + toast
- **Błąd rejestracji (email zajęty)**: Inline validation error, focus na email field

### Campaigns

- **User bez kampanii**: Empty state w `/campaigns` z prompt do tworzenia
- **Duplikat nazwy**: Validation error z sugestią dodania suffixu
- **Usunięcie kampanii z walkami**: Confirmation modal ostrzegający o cascade delete

### Player Characters

- **Kampania bez postaci**: Empty state
- **Duplikat nazwy w kampanii**: Validation error
- **Nieprawidłowe ability scores**: Inline validation (1-30)

### Combat Creation

- **Brak postaci w kampanii**: Warning banner w Step 2, link do character creation
- **Brak uczestników**: Disable "Start Combat", validation message
- **Monster library error**: Error state z retry button

### Combat View

- **Combat nie istnieje**: 404 page
- **State snapshot corrupted**: Error state z "Retry"/"Reset Combat"
- **Damage/heal nieprawidłowa wartość**: Inline validation
- **HP poniżej 0**: Clamp do 0, visual state (skull, opacity)
- **HP przekracza max**: Clamp do max, toast warning
- **Auto-save fails**: Toast z retry button, isDirty flag → exit warning

### Libraries

- **No results**: Empty state z sugestią zmiany filtrów
- **API timeout**: Error state z retry
- **Malformed data w slideover**: Error state "Failed to load details"

### Layout

- **Screen <1024px**: Full-screen blocking overlay
- **Campaign nie wybrana**: Campaign modules disabled w sidebar z tooltipami

---

## 8. Podsumowanie

Architektura UI Initiative Forge MVP została zaprojektowana z naciskiem na **płynność prowadzenia walki**, **dostępność** i **intuicyjną nawigację**. Kluczowe decyzje projektowe:

1. **Next.js SPA architecture** zapewnia szybką, responsywną aplikację z pełną interaktywnością client-side, bez overhead SSR
2. **3-kolumnowy layout w Combat View** minimalizuje potrzebę przełączania się między ekranami podczas walki
3. **Auto-calculations i client-side dice rolling** redukują cognitive load DMa
4. **Reference search zawsze dostępny** eliminuje konieczność wertowania podręczników
5. **Dark mode z emerald accents** zmniejsza zmęczenie wzroku podczas długich sesji
6. **Accessibility-first approach** zapewnia dostępność dla wszystkich użytkowników
7. **Progressive disclosure** (wizardy, accordions) upraszcza złożone formularze
8. **TanStack React Query** dla efektywnego cache'owania i synchronizacji danych
9. **Zustand** dla real-time combat state z zerową latencją

Metryka sukcesu: **średni czas walki (4 PCs + 3 potwory) < 10 minut** zostanie osiągnięta dzięki eliminacji friction points (wyszukiwanie stats, ręczne obliczenia, zarządzanie HP/conditions).
