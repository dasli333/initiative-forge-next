# Plan implementacji widoku Session Prep i Session Journal

## 1. Przegląd

Widoki Session Prep i Session Journal stanowią kompleksowy system zarządzania sesjami RPG. Session Prep umożliwia DM planowanie nadchodzącej sesji z celami, encounters, quick links do encji i prep checklist. Session Journal pozwala na dokumentowanie zakończonej sesji z podsumowaniem, key events, loot, XP i integracją z timeline. Oba widoki wspierają rich text z @mentions oraz automatic tracking powiązanych encji.

## 2. Routing widoku

**Session Prep:**
- Ścieżka: `/campaigns/:id/sessions/prep/:sessionNumber`
- Dynamiczny routing na podstawie numeru sesji

**Session Journal:**
- Ścieżka: `/campaigns/:id/sessions/journal/:sessionNumber`
- Dynamiczny routing na podstawie numeru sesji

**Lista Sesji:**
- Ścieżka: `/campaigns/:id/sessions`
- Wyświetla wszystkie sesje kampanii z możliwością nawigacji do Prep lub Journal

## 3. Struktura komponentów

```
SessionsListPage
├── SessionsHeader
│   ├── Breadcrumb
│   ├── H1
│   └── CreateSessionButton
└── SessionsList
    └── SessionCard[]
        ├── SessionStatusBadge
        ├── SessionNumber
        ├── SessionDate
        ├── SessionTitle
        └── SessionActions (LinkToPrep, LinkToJournal, Delete)

SessionPrepPage
├── SessionPrepHeader
│   ├── Breadcrumb
│   ├── H1
│   ├── StatusBadge
│   └── MarkAsReadyButton
├── BasicInfoSection
│   ├── SessionNumberDisplay
│   ├── SessionDatePicker
│   ├── InGameDateInput
│   └── TitleInput
├── GoalsSection
│   └── TiptapRichTextEditor (with @mentions)
├── EncountersSection
│   ├── EncountersList
│   │   └── EncounterItem[] (reorderable with dnd-kit)
│   │       ├── TypeBadge (story/combat)
│   │       ├── NameInput
│   │       ├── DescriptionTextarea
│   │       ├── DragHandle
│   │       └── RemoveButton
│   └── AddEncounterButton
├── QuickLinksSection
│   ├── PinnedEntitiesGrid (drag to reorder)
│   │   └── EntityMiniCard[]
│   │       ├── TypeIcon
│   │       ├── EntityName
│   │       ├── QuickPreview (on hover)
│   │       └── UnpinButton
│   └── PinEntityButton (opens command palette)
├── PrepChecklistSection
│   ├── ChecklistItems
│   │   └── ChecklistItem[] (keyboard navigable)
│   │       ├── Checkbox
│   │       ├── TextInput
│   │       └── RemoveButton
│   └── AddItemButton
├── NotesSection
│   └── TiptapRichTextEditor (with @mentions)
└── FooterActions
    ├── SaveDraftButton
    ├── MarkAsReadyButton
    └── DeleteSessionButton

SessionJournalPage
├── SessionJournalHeader
│   ├── Breadcrumb
│   ├── H1
│   └── SessionDateDisplay
├── SummarySection
│   └── TiptapRichTextEditor (with @mentions)
├── KeyEventsSection
│   ├── EventsList
│   │   └── EventItem[]
│   │       ├── TextTextarea
│   │       ├── AddToTimelineCheckbox
│   │       └── RemoveButton
│   └── AddEventButton
├── CharacterDecisionsSection
│   └── TiptapRichTextEditor (with @mentions)
├── RewardsSection
│   ├── LootGivenList
│   │   ├── LootItem[]
│   │   │   ├── ItemNameInput
│   │   │   └── RemoveButton
│   │   └── AddLootButton
│   └── XPGivenInput (number)
├── NextSessionSection
│   └── TiptapRichTextEditor (with @mentions)
├── MentionedEntitiesSection
│   └── EntitiesBadgesGrid (auto-generated from @mentions)
└── FooterActions
    ├── SaveJournalButton
    └── MarkAsCompletedButton
```

## 4. Szczegóły komponentów

### SessionsListPage

**Opis:** Główny widok listy sesji kampanii. Wyświetla wszystkie sesje w porządku malejącym po session_number z opcją filtrowania po statusie. Umożliwia tworzenie nowej sesji i nawigację do widoków Prep/Journal.

**Główne elementy:**
- `SessionsHeader`: Nagłówek z breadcrumb i przyciskiem tworzenia sesji
- `SessionsList`: Grid/lista kart sesji z filtrami
- `CreateSessionDialog`: Modal do tworzenia nowej sesji

**Obsługiwane interakcje:**
- Kliknięcie "Create New Session" → otwiera dialog z formularzem
- Kliknięcie na kartę sesji → nawigacja do Session Prep (jeśli status draft/ready) lub Journal (jeśli completed)
- Filtrowanie po statusie (dropdown)
- Usuwanie sesji (confirmation dialog)

**Warunki walidacji:**
- Session_number musi być unikalny w ramach kampanii
- Session_date musi być w formacie YYYY-MM-DD
- Status domyślny: "draft"

**Typy:**
- `Session` (DTO z database)
- `CreateSessionCommand` (request)
- `SessionFilters` (query params)
- `SessionCardViewModel` (derived from Session)

**Propsy:**
- `campaignId: string` (z URL params)

### SessionPrepHeader

**Opis:** Nagłówek widoku Session Prep. Zawiera breadcrumb navigation, tytuł sesji, status badge i przycisk "Mark as Ready".

**Główne elementy:**
- `Breadcrumb` component z shadcn/ui
- `H1` z interpolacją numeru sesji
- `StatusBadge` (draft/ready/in_progress/completed)
- `Button` "Mark as Ready"

**Obsługiwane interakcje:**
- Kliknięcie "Mark as Ready" → zmienia status na "ready", optimistic update

**Warunki walidacji:**
- Przycisk "Mark as Ready" aktywny tylko dla statusu "draft"

**Typy:**
- `Session`
- `SessionStatus = 'draft' | 'ready' | 'in_progress' | 'completed'`

**Propsy:**
- `session: Session`
- `onStatusChange: (status: SessionStatus) => void`

### BasicInfoSection

**Opis:** Sekcja z podstawowymi informacjami o sesji: numer (tylko display), data rzeczywista (date picker), data in-game (free text), tytuł.

**Główne elementy:**
- `div` z display numeru sesji
- `DatePicker` (react-day-picker) dla session_date
- `Input` (shadcn/ui) dla in_game_date
- `Input` (shadcn/ui) dla title

**Obsługiwane interakcje:**
- Zmiana session_date → auto-save on blur
- Zmiana in_game_date → auto-save on blur
- Zmiana title → auto-save on blur

**Warunki walidacji:**
- Session_date wymagana, musi być valid date
- In_game_date opcjonalna, max 100 znaków
- Title opcjonalny, max 200 znaków

**Typy:**
- `BasicInfoFormData: { session_date: string, in_game_date?: string, title?: string }`

**Propsy:**
- `session: Session`
- `onUpdate: (data: Partial<UpdateSessionCommand>) => void`

### GoalsSection

**Opis:** Sekcja celów sesji z rich text editor obsługującym formatowanie i @mentions. Pozwala na zapisywanie celów fabularnych i mechanicznych sesji.

**Główne elementy:**
- `H3` "Session Goals"
- `TiptapEditor` z extension @mentions

**Obsługiwane interakcje:**
- Wpisanie @ → otwiera mention autocomplete
- Wybranie encji z autocomplete → wstawia mention badge
- Auto-save on blur

**Warunki walidacji:**
- Goals stored as Tiptap JSON (type: "doc", content: [...])
- Max size: 50KB JSON

**Typy:**
- `TiptapJson` (Tiptap document format)
- `MentionNode: { type: 'mention', attrs: { id: string, label: string, entityType: string } }`

**Propsy:**
- `goals: TiptapJson | null`
- `onUpdate: (goals: TiptapJson) => void`

### EncountersSection

**Opis:** Lista planowanych encounters (story/combat) z możliwością dodawania, edycji, usuwania i zmiany kolejności (drag & drop). Każdy encounter ma typ, nazwę i opis.

**Główne elementy:**
- `H3` "Planned Encounters"
- `SortableContext` (dnd-kit) zawierający `EncounterItem[]`
- `AddEncounterButton`

**Obsługiwane interakcje:**
- Drag & drop do reorder encounters → optimistic update
- Kliknięcie "Add Encounter" → dodaje nowy pusty encounter
- Zmiana type/name/description → auto-save on blur
- Kliknięcie "Remove" → usuwa encounter z confirmation

**Warunki walidacji:**
- Encounter name wymagany, max 200 znaków
- Description opcjonalny, max 1000 znaków
- Type: "story" | "combat"

**Typy:**
```typescript
interface Encounter {
  id: string; // UUID v4
  type: 'story' | 'combat';
  name: string;
  description?: string;
  order: number;
}

interface PlanJsonEncounters {
  encounters: Encounter[];
}
```

**Propsy:**
- `encounters: Encounter[]`
- `onUpdate: (encounters: Encounter[]) => void`

### QuickLinksSection

**Opis:** Panel z przypietymi encjami (NPCs/locations/quests/items) dla szybkiego dostępu podczas sesji. Wyświetla miniaturowe karty z hover preview. Drag & drop do reorder. Command palette (Ctrl+K) do pinning nowych encji.

**Główne elementy:**
- `H3` "Quick Access"
- `SortableContext` (dnd-kit) zawierający `EntityMiniCard[]`
- `PinEntityButton` → otwiera `CommandPalette`

**Obsługiwane interakcje:**
- Drag & drop do reorder pinned entities → optimistic update
- Hover na EntityMiniCard → wyświetla HoverCard z quick preview
- Kliknięcie EntityMiniCard → otwiera full entity card (new tab lub side panel)
- Kliknięcie "X" → usuwa pin
- Kliknięcie "Pin Entity" → otwiera cmdk command palette z fuzzy search
- Wybranie encji z palette → dodaje do pinned list

**Warunki walidacji:**
- Max 20 pinned entities
- Pinned entity musi istnieć w campaign

**Typy:**
```typescript
interface PinnedEntity {
  id: string; // UUID entity
  type: 'npc' | 'location' | 'quest' | 'item' | 'faction' | 'arc';
  name: string;
  order: number;
}

interface QuickLinksViewModel extends PinnedEntity {
  previewData: {
    subtitle?: string; // Role dla NPC, Type dla Location, etc.
    imageUrl?: string;
  };
}
```

**Propsy:**
- `pinnedEntities: PinnedEntity[]`
- `campaignId: string`
- `onUpdate: (entities: PinnedEntity[]) => void`

### PrepChecklistSection

**Opis:** TODO lista dla DM z zadaniami do wykonania przed sesją. Keyboard navigable, checkable items z możliwością dodawania i usuwania.

**Główne elementy:**
- `H3` "Prep Checklist"
- `ChecklistItems` lista `ChecklistItem[]`
- `AddItemButton`

**Obsługiwane interakcje:**
- Toggle checkbox → optimistic update
- Edycja tekstu → auto-save on blur
- Kliknięcie "Add Item" → dodaje nowy unchecked item
- Kliknięcie "Remove" → usuwa item
- Keyboard: Tab/Shift+Tab nawigacja, Enter/Space toggle checkbox

**Warunki walidacji:**
- Item text wymagany, max 500 znaków
- Max 50 items

**Typy:**
```typescript
interface ChecklistItem {
  id: string; // UUID v4
  text: string;
  completed: boolean;
  order: number;
}
```

**Propsy:**
- `checklist: ChecklistItem[]`
- `onUpdate: (items: ChecklistItem[]) => void`

### NotesSection

**Opis:** Pole na notatki i przypomnienia DM z rich text editor i @mentions.

**Główne elementy:**
- `H3` "Notes & Reminders"
- `TiptapEditor` z extension @mentions

**Obsługiwane interakcje:**
- Identyczne jak GoalsSection
- Auto-save on blur

**Warunki walidacji:**
- Notes stored as Tiptap JSON
- Max size: 100KB JSON

**Typy:**
- `TiptapJson`

**Propsy:**
- `notes: TiptapJson | null`
- `onUpdate: (notes: TiptapJson) => void`

### FooterActions (Session Prep)

**Opis:** Stopka z akcjami zapisu/zmiany statusu/usuwania sesji.

**Główne elementy:**
- `Button` "Save Draft"
- `Button` "Mark as Ready"
- `Button` "Delete Session" (destructive variant)

**Obsługiwane interakcje:**
- Save Draft → PATCH /api/campaigns/:id/sessions/:sessionId z aktualnymi danymi
- Mark as Ready → zmienia status na "ready"
- Delete Session → confirmation dialog → DELETE endpoint → redirect do /campaigns/:id/sessions

**Warunki walidacji:**
- Save Draft dostępny zawsze
- Mark as Ready dostępny gdy status = "draft"
- Delete wymaga potwierdzenia

**Propsy:**
- `session: Session`
- `onSave: () => void`
- `onStatusChange: (status: SessionStatus) => void`
- `onDelete: () => void`

### SessionJournalPage

**Opis:** Widok dziennika zakończonej sesji. Dokumentuje summary, key events, character decisions, loot, XP, next session notes. Auto-tracking @mentioned entities. Integracja z timeline.

**Główne elementy:**
- `SessionJournalHeader`: Breadcrumb, H1, date display
- `SummarySection`: Rich text editor
- `KeyEventsSection`: Lista wydarzeń z checkbox "Add to Timeline"
- `CharacterDecisionsSection`: Rich text editor
- `RewardsSection`: Loot list i XP number input
- `NextSessionSection`: Rich text editor
- `MentionedEntitiesSection`: Auto-generated badges z @mentions
- `FooterActions`: Save, Mark as Completed

**Obsługiwane interakcje:**
- Edycja pól rich text → auto-save on blur
- Dodawanie key events → optimistic update
- Toggle "Add to Timeline" checkbox → zapisuje flagę
- Save Journal → PATCH endpoint
- Mark as Completed → zmienia status na "completed" + auto-creates timeline events dla key events z `add_to_timeline === true`

**Warunki walidacji:**
- Summary wymagany, stored as Tiptap JSON
- Key events: text wymagany, max 1000 znaków
- XP given: positive integer or 0
- Loot items: name wymagany, max 200 znaków
- Status musi być "in_progress" lub "completed" podczas edycji loga

**Typy:**
```typescript
interface KeyEvent {
  id: string; // UUID v4
  text: string;
  add_to_timeline: boolean;
}

interface LootItem {
  id: string; // UUID v4
  name: string;
}

interface LogJson {
  summary: TiptapJson;
  key_events: KeyEvent[];
  character_decisions: TiptapJson;
  loot_given: LootItem[];
  xp_given: number;
  next_session_notes: TiptapJson;
}
```

**Propsy:**
- `session: Session`
- `campaignId: string`
- `onUpdate: (command: UpdateSessionCommand) => void`

### MentionedEntitiesSection

**Opis:** Sekcja automatycznie generowana na podstawie wszystkich @mentions w polach rich text dziennika. Wyświetla badges z ikonami typów encji i linkami.

**Główne elementy:**
- `H3` "Entities Mentioned"
- `EntitiesBadgesGrid`: Grid kolorowych badges

**Obsługiwane interakcje:**
- Kliknięcie badge → nawigacja do entity card (new tab lub side panel)
- Auto-update przy każdej zmianie @mentions

**Warunki walidacji:**
- Entities extracted z wszystkich Tiptap JSON fields w log_json
- Deduplikacja po entity ID

**Typy:**
```typescript
interface MentionedEntity {
  id: string;
  type: 'npc' | 'location' | 'quest' | 'item' | 'faction' | 'arc' | 'session';
  name: string;
}
```

**Propsy:**
- `logJson: LogJson`
- `campaignId: string`

## 5. Typy

### DTO Types (z API/Database)

```typescript
// Zdefiniowane w src/types/sessions.ts
export type Session = Tables<'sessions'>;

export interface CreateSessionCommand {
  session_number: number;
  session_date: string; // YYYY-MM-DD
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: Json | null;
  log_json?: Json | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface UpdateSessionCommand {
  session_number?: number;
  session_date?: string;
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: Json | null;
  log_json?: Json | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface SessionFilters {
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}
```

### ViewModel Types (nowe, do dodania w src/types/sessions.ts)

```typescript
// Plan JSON structure
export interface PlanJson {
  goals: TiptapJson | null;
  encounters: Encounter[];
  pinned_entities: PinnedEntity[];
  prep_checklist: ChecklistItem[];
  notes: TiptapJson | null;
}

export interface Encounter {
  id: string; // UUID v4
  type: 'story' | 'combat';
  name: string;
  description?: string;
  order: number;
}

export interface PinnedEntity {
  id: string; // UUID entity ID
  type: 'npc' | 'location' | 'quest' | 'item' | 'faction' | 'arc';
  name: string;
  order: number;
}

export interface ChecklistItem {
  id: string; // UUID v4
  text: string;
  completed: boolean;
  order: number;
}

// Log JSON structure
export interface LogJson {
  summary: TiptapJson;
  key_events: KeyEvent[];
  character_decisions: TiptapJson;
  loot_given: LootItem[];
  xp_given: number;
  next_session_notes: TiptapJson;
}

export interface KeyEvent {
  id: string; // UUID v4
  text: string;
  add_to_timeline: boolean;
}

export interface LootItem {
  id: string; // UUID v4
  name: string;
}

// View-specific ViewModels
export interface SessionCardViewModel {
  id: string;
  session_number: number;
  title: string | null;
  session_date: string;
  status: SessionStatus;
  hasPrep: boolean; // plan_json !== null
  hasJournal: boolean; // log_json !== null
}

export interface QuickLinksViewModel extends PinnedEntity {
  previewData: {
    subtitle?: string;
    imageUrl?: string;
  };
}

export interface MentionedEntity {
  id: string;
  type: 'npc' | 'location' | 'quest' | 'item' | 'faction' | 'arc' | 'session';
  name: string;
}

// Tiptap types (re-export z Tiptap lub custom)
export type TiptapJson = {
  type: 'doc';
  content: TiptapNode[];
};

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface MentionNode extends TiptapNode {
  type: 'mention';
  attrs: {
    id: string;
    label: string;
    entityType: 'npc' | 'location' | 'quest' | 'item' | 'faction' | 'arc' | 'session';
  };
}

export type SessionStatus = 'draft' | 'ready' | 'in_progress' | 'completed';
```

## 6. Zarządzanie stanem

### React Query Hooks (src/hooks/useSessions.ts)

Custom hook zarządzający stanem sesji z wykorzystaniem TanStack Query v5.

```typescript
// Queries
export function useSessionsQuery(campaignId: string, filters?: SessionFilters)
export function useSessionQuery(sessionId: string)

// Mutations
export function useCreateSessionMutation(campaignId: string)
export function useUpdateSessionMutation()
export function useDeleteSessionMutation()
```

**Optimistic Updates:**
- `useUpdateSessionMutation` używa optimistic updates dla szybkiego UI feedback
- Rollback on error z toast notification (Sonner)
- Dirty state tracking dla auto-save

**Cache Invalidation:**
- Po utworzeniu sesji: invalidate `['sessions', campaignId]`
- Po aktualizacji sesji: invalidate `['sessions', campaignId]` i `['session', sessionId]`
- Po usunięciu sesji: invalidate `['sessions', campaignId]`

### Local State Management

**Auto-save Logic:**
- Używamy `useDebounce` hook (debounce delay: 500ms) dla auto-save on blur
- Zustand store dla dirty/saving state tracking: `useSessionFormStore`
- Visual feedback: "Saving..." indicator w header

```typescript
interface SessionFormState {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
}
```

**Drag & Drop State:**
- `dnd-kit` dla encounters reordering i pinned entities reordering
- Local state podczas drag, commit on drop z optimistic update

## 7. Integracja API

### Endpoint Implementation (już zaimplementowane w src/lib/api/sessions.ts)

**List Sessions:**
- Method: `getSessions(campaignId: string, filters?: SessionFilters): Promise<Session[]>`
- GET `/api/campaigns/:campaignId/sessions?status=...`
- Response: `Session[]`

**Get Single Session:**
- Method: `getSession(sessionId: string): Promise<Session>`
- GET `/api/campaigns/:campaignId/sessions/:id`
- Response: `Session`

**Create Session:**
- Method: `createSession(campaignId: string, command: CreateSessionCommand): Promise<Session>`
- POST `/api/campaigns/:campaignId/sessions`
- Request Body: `CreateSessionCommand`
- Response: `Session` (201 Created)
- Error: 409 Conflict jeśli session_number już istnieje

**Update Session:**
- Method: `updateSession(sessionId: string, command: UpdateSessionCommand): Promise<Session>`
- PATCH `/api/campaigns/:campaignId/sessions/:id`
- Request Body: `UpdateSessionCommand` (partial update)
- Response: `Session` (200 OK)
- Note: Przy `log_json.key_events[].add_to_timeline === true`, server auto-creates timeline events

**Delete Session:**
- Method: `deleteSession(sessionId: string): Promise<void>`
- DELETE `/api/campaigns/:campaignId/sessions/:id`
- Response: 204 No Content

### Request/Response Types

**Request Types:**
- `CreateSessionCommand`: zawiera wszystkie pola do utworzenia sesji
- `UpdateSessionCommand`: partial update, wszystkie pola opcjonalne

**Response Types:**
- `Session`: pełny obiekt sesji z database (Tables<'sessions'>)

## 8. Interakcje użytkownika

### Session Prep Flow

1. **Tworzenie nowej sesji:**
   - User klika "Create New Session" → otwiera dialog
   - Wprowadza session_number, session_date → submit
   - System tworzy sesję ze statusem "draft" → redirect do `/campaigns/:id/sessions/prep/:sessionNumber`

2. **Wypełnianie Session Plan:**
   - User wprowadza basic info (date, in-game date, title) → auto-save on blur
   - User pisze cele w GoalsSection z @mentions → auto-save on blur
   - User dodaje encounters (story/combat) → drag to reorder → auto-save
   - User pinnuje encje przez command palette (Ctrl+K) → drag to reorder → auto-save
   - User dodaje items do prep checklist → toggle completed → auto-save
   - User pisze notes z @mentions → auto-save

3. **Oznaczanie jako Ready:**
   - User klika "Mark as Ready" → status zmienia się na "ready" → optimistic update + backend sync

4. **Podczas sesji (opcjonalnie):**
   - Status można zmienić na "in_progress" (manual lub auto przy otwarciu podczas scheduled date)

### Session Journal Flow

1. **Dostęp do Journal:**
   - Po zakończonej sesji, user nawiguje do `/campaigns/:id/sessions/journal/:sessionNumber`
   - Status sesji powinien być "in_progress" lub "completed"

2. **Wypełnianie Session Log:**
   - User pisze summary z @mentions → auto-save on blur
   - User dodaje key events z checkbox "Add to Timeline" → auto-save
   - User pisze character decisions z @mentions → auto-save on blur
   - User dodaje loot items (structured list) → auto-save
   - User wprowadza XP given (number) → auto-save on blur
   - User pisze next session notes/cliffhanger z @mentions → auto-save on blur

3. **Mentioned Entities:**
   - System automatycznie wyciąga wszystkie @mentions z rich text fields
   - Wyświetla sekcję "Mentioned Entities" z badges (auto-update)

4. **Timeline Integration:**
   - User zaznacza checkboxy "Add to Timeline" przy key events
   - Klika "Mark as Completed" → status zmienia się na "completed"
   - Server auto-creates timeline events dla zaznaczonych key events z linkiem do session log

### General Interactions

- **Auto-save:** Wszystkie edycje są auto-saved on blur z debounce 500ms
- **Optimistic Updates:** Zmiany statusu, toggle checkboxów, reordering są optimistic
- **Command Palette:** Ctrl+K otwiera cmdk z fuzzy search do pinning entities
- **Hover Previews:** Najechanie na @mention lub pinned entity wyświetla HoverCard z quick preview
- **Keyboard Navigation:** Prep checklist i key events list są fully keyboard navigable (Tab, Enter, Space)

## 9. Warunki i walidacja

### Session Number Uniqueness
- **Warunek:** Session_number musi być unikalny w ramach kampanii
- **Weryfikacja:** Backend zwraca 409 Conflict przy duplikacie
- **UI:** CreateSessionDialog waliduje przed submit, wyświetla error message

### Session Date Validation
- **Warunek:** Session_date wymagany, format YYYY-MM-DD
- **Weryfikacja:** React Hook Form + Zod schema na froncie
- **UI:** DatePicker zapewnia correct format, error message pod polem

### Status Transitions
- **Warunek:** Status może być zmieniany tylko w określonej kolejności: draft → ready → in_progress → completed
- **Weryfikacja:** UI ukrywa/disabluje przyciski zmiany statusu w niepoprawnych stanach
- **UI:** "Mark as Ready" widoczny tylko dla draft, "Mark as Completed" tylko dla in_progress

### Plan JSON Validation
- **Warunek:** Encounters muszą mieć name (wymagany), max 200 znaków
- **Weryfikacja:** React Hook Form + Zod schema, inline validation
- **UI:** Input ma error state, message pod polem

- **Warunek:** Checklist items muszą mieć text (wymagany), max 500 znaków
- **Weryfikacja:** React Hook Form + Zod schema
- **UI:** Input disabled "Add" button jeśli text pusty

- **Warunek:** Max 20 pinned entities
- **Weryfikacja:** Frontend count check przed dodaniem
- **UI:** "Pin Entity" button disabled jeśli limit reached, tooltip z informacją

### Log JSON Validation
- **Warunek:** Summary wymagany (Tiptap JSON nie może być pusty)
- **Weryfikacja:** Zod schema sprawdza czy content[] nie jest pusty
- **UI:** "Save Journal" button disabled jeśli summary pusty, validation message

- **Warunek:** XP given musi być positive integer lub 0
- **Weryfikacja:** React Hook Form + Zod schema: `z.number().int().min(0)`
- **UI:** Number input z min="0", step="1", error message

- **Warunek:** Key events text wymagany, max 1000 znaków
- **Weryfikacja:** Zod schema
- **UI:** Textarea z character counter, error state

- **Warunek:** Loot items name wymagany, max 200 znaków
- **Weryfikacja:** Zod schema
- **UI:** Input validation, error message

### API Preconditions
- **Warunek:** Session log może być edytowany tylko gdy status = "in_progress" lub "completed"
- **Weryfikacja:** Backend validation, zwraca 400 Bad Request
- **UI:** SessionJournalPage sprawdza status, wyświetla read-only view jeśli status !== in_progress/completed

- **Warunek:** User musi być właścicielem kampanii (RLS policy)
- **Weryfikacja:** Supabase RLS na poziomie database
- **UI:** Auth guard na route level (ProtectedRoute)

## 10. Obsługa błędów

### Network Errors
- **Scenariusz:** Brak połączenia z internetem lub Supabase down
- **Obsługa:** React Query retry logic (1x), toast error "Failed to save. Retrying..." → po failure: "Couldn't save. Please check your connection."
- **Recovery:** User może retry manual przez "Save Draft" button

### Validation Errors
- **Scenariusz:** User wprowadza invalid data (np. pusty encounter name)
- **Obsługa:** React Hook Form wyświetla inline error messages, disabluje submit
- **Recovery:** User poprawia dane, error znika on change

### Session Number Conflict
- **Scenariusz:** User próbuje utworzyć sesję z numerem już istniejącym w kampanii
- **Obsługa:** Backend zwraca 409 Conflict → frontend wyświetla toast error "A session with this number already exists"
- **Recovery:** User zmienia session_number w CreateSessionDialog

### Session Not Found
- **Scenariusz:** User nawiguje do nieistniejącej sesji (invalid sessionId w URL)
- **Obsługa:** Backend zwraca 404 → frontend wyświetla error page "Session not found" z linkiem do /campaigns/:id/sessions
- **Recovery:** User nawiguje do listy sesji

### Auto-save Failures
- **Scenariusz:** Auto-save podczas edycji failuje (network error, validation error)
- **Obsługa:** Zustand store `isSaving` zostaje false, toast error "Failed to auto-save"
- **Recovery:** User retry przez manual "Save Draft" button, local changes zachowane w form state

### Timeline Integration Errors
- **Scenariusz:** Server failuje przy auto-tworzeniu timeline events po "Mark as Completed"
- **Obsługa:** Backend zwraca 500 Internal Server Error → frontend wyświetla toast error "Session marked as completed, but some timeline events couldn't be created. Please add them manually."
- **Recovery:** User może manual dodać events do timeline z poziomu Timeline view

### Pinned Entity Not Found
- **Scenariusz:** Pinned entity został usunięty z kampanii, ale pozostał w pinned list
- **Obsługa:** Backend validation przed save OR frontend fetch entities on mount i filtruje nieistniejące
- **Recovery:** System automatycznie usuwa invalid pinned entities, toast info "Some pinned entities were removed because they no longer exist"

### Rich Text Editor Crashes
- **Scenariusz:** Tiptap editor crashuje (corrupted JSON, browser issue)
- **Obsługa:** Error boundary wokół TiptapEditor, fallback do plain textarea z warning "Rich text editor failed to load. Using plain text mode."
- **Recovery:** User może kontynuować edycję w plain text, JSON będzie zapisany jako plain text node

### Exceeded Size Limits
- **Scenariusz:** User wprowadza zbyt duży JSON (> 50KB goals, > 100KB notes)
- **Obsługa:** Frontend count JSON size before submit, wyświetla validation error "Content too large. Please shorten your text."
- **Recovery:** User shortens content lub usuwa images/large blocks

## 11. Kroki implementacji

### Krok 1: Typy i Schemat Walidacji
1. Rozszerz `src/types/sessions.ts` o ViewModel types:
   - `PlanJson`, `LogJson`, `Encounter`, `PinnedEntity`, `ChecklistItem`, `KeyEvent`, `LootItem`
   - `SessionCardViewModel`, `QuickLinksViewModel`, `MentionedEntity`
   - `TiptapJson`, `TiptapNode`, `MentionNode`
   - `SessionStatus` type alias
2. Stwórz Zod schemas w `src/lib/schemas/sessions.ts`:
   - `createSessionSchema`, `updateSessionSchema`
   - `planJsonSchema` (z nested schemas: encounterSchema, pinnedEntitySchema, checklistItemSchema)
   - `logJsonSchema` (z nested schemas: keyEventSchema, lootItemSchema)
   - `tiptapJsonSchema` (basic validation, type: "doc", content: array)

### Krok 2: React Query Hooks
1. Stwórz `src/hooks/useSessions.ts`:
   - `useSessionsQuery(campaignId, filters?)` - fetch list
   - `useSessionQuery(sessionId)` - fetch single
   - `useCreateSessionMutation(campaignId)` - create z optimistic update
   - `useUpdateSessionMutation()` - update z optimistic update i rollback on error
   - `useDeleteSessionMutation()` - delete z cache invalidation
2. Skonfiguruj queryClient cache times (staleTime: 10min, gcTime: 15min) - już zrobione globalnie
3. Dodaj toast notifications (Sonner) dla success/error states

### Krok 3: Zustand Store dla Form State
1. Stwórz `src/stores/useSessionFormStore.ts`:
   - State: `isDirty`, `isSaving`, `lastSavedAt`
   - Actions: `setDirty`, `setSaving`, `setLastSaved`
   - Persist config: false (ephemeral state)
2. Użyj store w SessionPrepPage i SessionJournalPage dla auto-save visual feedback

### Krok 4: Tiptap Rich Text Editor z @Mentions
1. Zainstaluj dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-mention`
2. Stwórz `src/components/sessions/TiptapEditor.tsx`:
   - Configure Tiptap editor z starter-kit extensions
   - Add custom Mention extension z suggestion plugin
   - Implement mention autocomplete dropdown (fuzzy search z fuse.js)
   - Styling: mention badges z kolorami per entity type
   - Propsy: `content: TiptapJson | null`, `onUpdate: (json: TiptapJson) => void`, `campaignId: string`
3. Implement mention HoverCard z quick preview (Radix UI HoverCard)
4. Implement utility functions:
   - `extractMentionsFromTiptapJson(json: TiptapJson): MentionedEntity[]`
   - `fetchEntitiesForMentions(campaignId: string): Promise<EntityAutocompleteOption[]>`

### Krok 5: Lista Sesji (Sessions List Page)
1. Stwórz `src/app/(dashboard)/campaigns/[id]/sessions/page.tsx`:
   - Fetch sessions z `useSessionsQuery(campaignId)`
   - Render `SessionsHeader` z CreateSessionButton
   - Render `SessionsList` (grid lub table)
2. Stwórz `src/components/sessions/SessionCard.tsx`:
   - Display session_number, title, session_date, status badge
   - Actions: LinkToPrep, LinkToJournal, Delete (confirmation dialog)
   - Conditional rendering: jeśli status=draft/ready → primary link to Prep, else → primary link to Journal
3. Stwórz `src/components/sessions/CreateSessionDialog.tsx`:
   - React Hook Form + Zod validation
   - Fields: session_number (number input), session_date (DatePicker), title (optional)
   - Submit → `useCreateSessionMutation` → redirect do prep view

### Krok 6: Session Prep Header i Layout
1. Stwórz `src/app/(dashboard)/campaigns/[id]/sessions/prep/[sessionNumber]/page.tsx`:
   - Fetch session z `useSessionQuery(sessionId)` - resolve sessionId from sessionNumber
   - Render `SessionPrepPage` component
2. Stwórz `src/components/sessions/prep/SessionPrepPage.tsx`:
   - Layout: single column z sekcjami
   - Render wszystkie sekcje (BasicInfo, Goals, Encounters, QuickLinks, PrepChecklist, Notes, FooterActions)
   - Implement auto-save logic z `useDebounce` i `useSessionFormStore`
3. Stwórz `src/components/sessions/prep/SessionPrepHeader.tsx`:
   - Breadcrumb, H1, StatusBadge, MarkAsReadyButton
   - MarkAsReadyButton → `updateSession({ status: 'ready' })` z optimistic update

### Krok 7: Session Prep - Basic Info Section
1. Stwórz `src/components/sessions/prep/BasicInfoSection.tsx`:
   - React Hook Form dla session_date, in_game_date, title
   - DatePicker z react-day-picker (shadcn/ui)
   - Auto-save on blur → `updateSession()`
   - Validation z Zod schema

### Krok 8: Session Prep - Goals i Notes Sections
1. Stwórz `src/components/sessions/prep/GoalsSection.tsx`:
   - Render `TiptapEditor` z `goals` z plan_json
   - onUpdate → aktualizuj plan_json.goals → `updateSession()`
2. Stwórz `src/components/sessions/prep/NotesSection.tsx`:
   - Identyczna implementacja jak GoalsSection, ale dla plan_json.notes

### Krok 9: Session Prep - Encounters Section
1. Zainstaluj `@dnd-kit/core`, `@dnd-kit/sortable`
2. Stwórz `src/components/sessions/prep/EncountersSection.tsx`:
   - State: local array `encounters` z plan_json.encounters
   - Render `SortableContext` z `EncounterItem[]`
   - DragEndEvent → reorder array → `updateSession({ plan_json: { ...plan_json, encounters } })`
3. Stwórz `src/components/sessions/prep/EncounterItem.tsx`:
   - useSortable hook dla drag handle
   - Fields: type dropdown (story/combat), name input, description textarea
   - RemoveButton → confirmation → usuń z array → update session
   - Auto-save on blur dla name/description

### Krok 10: Session Prep - Quick Links Section
1. Stwórz `src/components/sessions/prep/QuickLinksSection.tsx`:
   - State: local array `pinnedEntities` z plan_json.pinned_entities
   - Render `SortableContext` z `EntityMiniCard[]`
   - DragEndEvent → reorder → update session
   - PinEntityButton → otwiera Command Palette (cmdk)
2. Zainstaluj `cmdk`
3. Stwórz `src/components/sessions/prep/CommandPalette.tsx`:
   - Fetch wszystkie entities kampanii (NPCs, locations, quests, items, factions, arcs)
   - Fuzzy search z fuse.js
   - Wybranie entity → dodaj do pinned_entities → update session
   - Shortcut: Ctrl+K
4. Stwórz `src/components/sessions/prep/EntityMiniCard.tsx`:
   - Display: TypeIcon, name, subtitle (role/type)
   - HoverCard z quick preview (fetch entity data on demand)
   - UnpinButton → usuń z array → update session

### Krok 11: Session Prep - Prep Checklist Section
1. Stwórz `src/components/sessions/prep/PrepChecklistSection.tsx`:
   - State: local array `checklist` z plan_json.prep_checklist
   - Render `ChecklistItem[]` z keyboard navigation (Tab, Enter, Space)
   - AddItemButton → append new item → update session
2. Stwórz `src/components/sessions/prep/ChecklistItem.tsx`:
   - Checkbox, TextInput, RemoveButton
   - Toggle checkbox → optimistic update → update session
   - Edit text → auto-save on blur → update session
   - Keyboard: Enter toggle checkbox, Tab navigate

### Krok 12: Session Prep - Footer Actions
1. Stwórz `src/components/sessions/prep/FooterActions.tsx`:
   - SaveDraftButton → manual trigger `updateSession()` (re-submit current form state)
   - MarkAsReadyButton → `updateSession({ status: 'ready' })`
   - DeleteSessionButton → confirmation dialog → `deleteSession()` → redirect

### Krok 13: Session Journal Header i Layout
1. Stwórz `src/app/(dashboard)/campaigns/[id]/sessions/journal/[sessionNumber]/page.tsx`:
   - Fetch session z `useSessionQuery(sessionId)`
   - Check status: jeśli !== in_progress/completed → wyświetl read-only view lub redirect
   - Render `SessionJournalPage` component
2. Stwórz `src/components/sessions/journal/SessionJournalPage.tsx`:
   - Layout: single column z sekcjami
   - Render: Summary, KeyEvents, CharacterDecisions, Rewards, NextSession, MentionedEntities, FooterActions
   - Auto-save logic identyczny jak w Session Prep

### Krok 14: Session Journal - Summary, Decisions, Next Session Sections
1. Stwórz `src/components/sessions/journal/SummarySection.tsx`:
   - Render `TiptapEditor` z log_json.summary
   - onUpdate → update log_json → `updateSession()`
2. Stwórz `src/components/sessions/journal/CharacterDecisionsSection.tsx`:
   - Identyczna implementacja dla log_json.character_decisions
3. Stwórz `src/components/sessions/journal/NextSessionSection.tsx`:
   - Identyczna implementacja dla log_json.next_session_notes

### Krok 15: Session Journal - Key Events Section
1. Stwórz `src/components/sessions/journal/KeyEventsSection.tsx`:
   - State: local array `keyEvents` z log_json.key_events
   - Render `EventItem[]`
   - AddEventButton → append new item → update session
2. Stwórz `src/components/sessions/journal/EventItem.tsx`:
   - Textarea dla text (wymagany, max 1000 chars)
   - Checkbox "Add to Timeline"
   - RemoveButton → confirmation → usuń → update session
   - Auto-save on blur

### Krok 16: Session Journal - Rewards Section
1. Stwórz `src/components/sessions/journal/RewardsSection.tsx`:
   - Render `LootGivenList` i `XPGivenInput`
2. Stwórz `src/components/sessions/journal/LootGivenList.tsx`:
   - State: local array `lootGiven` z log_json.loot_given
   - Render `LootItem[]` (name input + RemoveButton)
   - AddLootButton → append new item → update session
3. Stwórz `src/components/sessions/journal/XPGivenInput.tsx`:
   - Number input z validation (min 0, integer)
   - Auto-save on blur → update log_json.xp_given

### Krok 17: Session Journal - Mentioned Entities Section
1. Stwórz `src/components/sessions/journal/MentionedEntitiesSection.tsx`:
   - Extract mentions z wszystkich Tiptap JSON fields w log_json za pomocą `extractMentionsFromTiptapJson()`
   - Deduplikacja po entity ID
   - Render grid badges z TypeIcon, name, link
   - Kliknięcie badge → nawigacja do entity card

### Krok 18: Session Journal - Footer Actions
1. Stwórz `src/components/sessions/journal/FooterActions.tsx`:
   - SaveJournalButton → manual trigger `updateSession()`
   - MarkAsCompletedButton → `updateSession({ status: 'completed' })` z informacją o timeline integration
   - Backend auto-creates timeline events dla key_events z `add_to_timeline === true`
   - Toast notification: "Session marked as completed. X events added to timeline."

### Krok 19: Accessibility i Keyboard Navigation
1. Implement ARIA labels dla wszystkich interactive elements
2. Keyboard navigation dla:
   - Prep checklist (Tab, Enter, Space)
   - Key events list (Tab, Enter, Space)
   - Command Palette (Arrow keys, Enter, Escape)
   - Drag & drop (Move Up/Down buttons jako alternatywę)
3. ARIA live regions dla auto-save status ("Saving...", "Saved at...")
4. Focus management przy otwarciu dialogów i command palette

### Krok 20: Testy Jednostkowe (Vitest)
1. Testy dla utility functions:
   - `extractMentionsFromTiptapJson()`
   - `fetchEntitiesForMentions()`
2. Testy dla Zod schemas:
   - `planJsonSchema`, `logJsonSchema`
3. Testy dla React Query hooks:
   - Mock Supabase client
   - Test optimistic updates i rollback
4. Testy komponentów:
   - SessionCard, CreateSessionDialog
   - EncounterItem, ChecklistItem, EntityMiniCard

### Krok 21: Testy E2E (Playwright)
1. Test flow: Create Session → Fill Prep → Mark as Ready
2. Test flow: Fill Journal → Mark as Completed → Verify timeline integration
3. Test: Drag & drop reordering (encounters, pinned entities)
4. Test: Command Palette (Ctrl+K) → pin entity
5. Test: Auto-save behavior (edit field → blur → verify saved)
6. Test: @mentions autocomplete → select entity → verify mention badge

### Krok 22: Error Boundaries i Loading States
1. Implement Error Boundary wokół SessionPrepPage i SessionJournalPage
2. Loading skeletons dla:
   - Sessions list (Skeleton cards)
   - Session prep/journal (Skeleton sections)
3. Implement retry logic dla failed queries (React Query default: 1 retry)

### Krok 23: Styling i Responsive Design
1. Tailwind CSS classes dla wszystkich komponentów (zgodnie z shadcn/ui patterns)
2. Responsive breakpoints:
   - Desktop/tablet: full layout
   - Mobile: single column, stacked sections (outside MVP scope, ale warto przygotować structure)
3. Dark mode support z Tailwind `dark:` variant (jeśli już zaimplementowane w projekcie)

### Krok 24: Documentation
1. Dodaj JSDoc comments dla wszystkich public functions i components
2. Update README z informacjami o Sessions module
3. Add Storybook stories dla reusable components (EntityMiniCard, ChecklistItem, etc.) - opcjonalnie

### Krok 25: Performance Optimization
1. React.memo dla komponentów list items (EncounterItem, ChecklistItem, EntityMiniCard)
2. useMemo dla expensive computations (extract mentions, fuzzy search)
3. Virtualizacja dla długich list (jeśli > 50 items) z `@tanstack/react-virtual` - opcjonalnie
4. Debounce auto-save (już zaplanowane: 500ms)
5. Lazy loading dla TiptapEditor i CommandPalette (dynamic import z React.lazy)
