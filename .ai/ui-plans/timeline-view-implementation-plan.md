# Plan implementacji widoku Timeline (Oś Czasu)

## 1. Przegląd

Widok Timeline umożliwia DM tworzenie i przeglądanie chronologicznej osi czasu wydarzeń kampanii. Wyświetla wydarzenia sortowane według **daty sortowania (sort_date)**, przy czym wyświetlana data (in-game) pozostaje polem tekstowym dla pełnej elastyczności. Wydarzenia mogą być linkowane z innymi encjami kampanii poprzez @mentions. Każde wydarzenie może mieć datę in-game, datę sortowania oraz opcjonalnie datę rzeczywistą. Wydarzenia pochodzące z session log są read-only i oznaczone specjalnym badge'em z linkiem do sesji.

## 2. Routing widoku

**Ścieżka:** `/campaigns/[id]/timeline`

Widok dostępny jako podstrona wybranej kampanii w module World Building.

## 3. Struktura komponentów

```
TimelineView (page component)
├── TimelineHeader
│   ├── Breadcrumb (shadcn/ui)
│   ├── H1 Title
│   ├── TimelineFilters (inline)
│   │   ├── SourceTypeSelect
│   │   ├── DateRangeInputs (from/to)
│   │   └── ClearFiltersButton
│   └── AddEventButton (emerald)
├── TimelineList (vertical layout)
│   ├── TimelineEventItem[] (accordion-style)
│   │   ├── DateBadge (left side, emerald)
│   │   ├── EventCard (right side)
│   │   │   ├── EventCardHeader
│   │   │   │   ├── Title (H3)
│   │   │   │   ├── SourceBadge (manual/session_log)
│   │   │   │   └── RealDateText (muted)
│   │   │   ├── DescriptionPreview (collapsed)
│   │   │   ├── RelatedEntitiesBadges
│   │   │   └── ExpandedDetails (accordion content)
│   │   │       ├── FullDescription (Tiptap display)
│   │   │       ├── RelatedEntitiesList (full)
│   │   │       └── ActionButtons (Edit/Delete)
│   └── EmptyState (conditionally rendered)
└── TimelineEventModal (dialog)
    ├── ModalHeader
    ├── TimelineEventForm
    │   ├── TitleInput (required)
    │   ├── EventDateInput (free text, required, display only)
    │   ├── SortDateInput (date picker, required, for sorting)
    │   ├── RealDatePicker (optional)
    │   ├── DescriptionEditor (Tiptap with @mentions)
    │   └── SourceTypeDisplay (auto: manual)
    └── ModalFooter (Cancel/Create buttons)
```

## 4. Szczegóły komponentów

### TimelineView (page component)

**Opis:** Główny komponent strony obsługujący routing, fetch danych i orkiestrację filtrowania. Zarządza stanem filtrów i otwarciem modala tworzenia wydarzenia.

**Główne elementy:**
- `TimelineHeader` - nagłówek ze ścieżką breadcrumb, tytułem i filtami
- `TimelineList` - lista wydarzeń lub empty state
- `TimelineEventModal` - dialog tworzenia/edycji wydarzenia

**Obsługiwane interakcje:**
- Otwarcie modala tworzenia nowego wydarzenia
- Zmiana filtrów (source type, date range)
- Fetch wydarzeń z API przy montowaniu i zmianach filtrów

**Walidacja:**
- Weryfikacja istnienia campaignId w URL params
- Obsługa stanów ładowania i błędów z API

**Typy:**
- `TimelineEvent` (DTO z API)
- `TimelineFiltersState` (ViewModel dla stanu filtrów)

**Propsy:**
- `params: { id: string }` - campaign ID z Next.js dynamic route

### TimelineHeader

**Opis:** Header widoku zawierający breadcrumb navigation, tytuł strony, inline filters i przycisk dodawania wydarzenia.

**Główne elementy:**
- `<Breadcrumb>` - nawigacja (My Campaigns > [Campaign Name] > Timeline)
- `<h1>` - tytuł "Timeline"
- `TimelineFilters` - komponenty filtrowania
- `<Button>` - emerald button "Add Event"

**Obsługiwane interakcje:**
- Kliknięcie "Add Event" → otwarcie modala tworzenia
- Zmiana filtrów → callback do rodzica

**Walidacja:**
- Brak specyficznych warunków walidacji

**Typy:**
- `Campaign` (dla breadcrumb)
- `TimelineFiltersState`

**Propsy:**
```typescript
interface TimelineHeaderProps {
  campaign: Campaign;
  filters: TimelineFiltersState;
  onFiltersChange: (filters: TimelineFiltersState) => void;
  onAddEventClick: () => void;
}
```

### TimelineFilters

**Opis:** Inline filters pozwalające na filtrowanie wydarzeń po source type (all/manual/session_log) i zakresie dat in-game (free text: from/to).

**Główne elementy:**
- `<Select>` - wybór source type (all/manual/session_log)
- `<Input type="text">` - date from (fantasy calendar, free text)
- `<Input type="text">` - date to (fantasy calendar, free text)
- `<Button variant="ghost">` - clear filters

**Obsługiwane interakcje:**
- Zmiana source type → aktualizacja filtrów
- Wpisanie date range → fuzzy match filter (debounced)
- Clear filters → reset do wartości domyślnych

**Walidacja:**
- Brak ścisłej walidacji - daty są free text (fuzzy match)

**Typy:**
- `TimelineFiltersState`

**Propsy:**
```typescript
interface TimelineFiltersProps {
  value: TimelineFiltersState;
  onChange: (filters: TimelineFiltersState) => void;
}
```

### TimelineList

**Opis:** Vertical timeline layout wyświetlający chronologicznie posortowane wydarzenia. Renderuje listę `TimelineEventItem` lub `EmptyState` jeśli brak wydarzeń.

**Główne elementy:**
- `<div>` - vertical container z timeline line (CSS)
- `TimelineEventItem[]` - lista wydarzeń
- `EmptyState` - conditional render gdy events.length === 0

**Obsługiwane interakcje:**
- Scroll przez listę wydarzeń
- Delegacja interakcji do `TimelineEventItem`

**Walidacja:**
- Sprawdzenie czy lista wydarzeń jest pusta → wyświetlenie EmptyState

**Typy:**
- `TimelineEvent[]`

**Propsy:**
```typescript
interface TimelineListProps {
  events: TimelineEvent[];
  isLoading: boolean;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
}
```

### TimelineEventItem

**Opis:** Single timeline event card w formie akordeon. Wyświetla date badge (left), event card z preview (right) i expanded details przy rozwinięciu.

**Główne elementy:**
- `<div>` - DateBadge (emerald, sticky left): "15 Eleint, 1492 DR"
- `<Accordion>` (shadcn/ui) - event card z expand/collapse
- `<AccordionTrigger>` - collapsed view (title, source badge, preview, entities)
- `<AccordionContent>` - expanded view (full description, entities, actions)

**Obsługiwane interakcje:**
- Kliknięcie na card → expand accordion
- Kliknięcie Edit (tylko dla manual events) → otwarcie edit modal
- Kliknięcie Delete (tylko dla manual events) → potwierdzenie i usunięcie
- Kliknięcie source badge (session_log) → nawigacja do session log
- Kliknięcie related entity badge → nawigacja do encji

**Walidacja:**
- Edit/Delete buttons disabled jeśli `source_type === 'session_log'`

**Typy:**
- `TimelineEvent`
- `RelatedEntity` (extracted z `related_entities_json`)

**Propsy:**
```typescript
interface TimelineEventItemProps {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
}
```

### EventCard

**Opis:** Card wyświetlający informacje o wydarzeniu - używany jako trigger w akordeon oraz expanded content.

**Główne elementy:**
- `<h3>` - title
- `<Badge>` - source badge (manual/session_log)
- `<p className="text-muted-foreground">` - real date
- `<div>` - description preview (first 100 chars, collapsed view)
- `<div>` - related entities badges (ikona + nazwa)
- `<div>` - full Tiptap content display (expanded view)
- `<div>` - action buttons (Edit, Delete)

**Obsługiwane interakcje:**
- Hover na entity badge → tooltip z nazwą
- Click na entity badge → nawigacja
- Click Edit → callback
- Click Delete → callback

**Walidacja:**
- Sprawdzenie source_type przed wyświetleniem Edit/Delete

**Typy:**
- `TimelineEvent`
- `RelatedEntity`

**Propsy:**
```typescript
interface EventCardProps {
  event: TimelineEvent;
  expanded: boolean;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
}
```

### RelatedEntitiesBadges

**Opis:** Lista klikanych badges reprezentujących related entities (NPCs, locations, quests, etc.) z ikonami typu.

**Główne elementy:**
- `<div className="flex gap-2">` - container
- `<Badge>` z ikoną + nazwą dla każdej encji

**Obsługiwane interakcje:**
- Click na badge → nawigacja do encji (`/campaigns/[id]/[entityType]/[entityId]`)

**Walidacja:**
- Brak specyficznych warunków

**Typy:**
- `RelatedEntity[]`

**Propsy:**
```typescript
interface RelatedEntitiesBadgesProps {
  entities: RelatedEntity[];
  limit?: number; // dla collapsed view (np. 3)
}
```

### TimelineEventModal

**Opis:** Dialog (shadcn Dialog) do tworzenia lub edycji timeline event. Zawiera formularz z polami: title, event_date, sort_date, real_date (optional), description (Tiptap rich text z @mentions).

**Główne elementy:**
- `<Dialog>` (shadcn/ui)
- `<DialogContent>`
- `<DialogHeader>` - tytuł ("Create Event" / "Edit Event")
- `TimelineEventForm` - formularz z React Hook Form
- `<DialogFooter>` - Cancel / Save buttons

**Obsługiwane interakcje:**
- Submit form → create/update mutation
- Cancel → zamknięcie modala
- Walidacja formularza

**Walidacja:**
- `title` - required, min 1 char
- `event_date` - required, free text (fantasy calendar)
- `sort_date` - required, date picker (used for sorting)
- `real_date` - optional, format YYYY-MM-DD
- `description_json` - optional, Tiptap JSON

**Typy:**
- `CreateTimelineEventCommand` (dla create)
- `UpdateTimelineEventCommand` (dla edit)
- `TimelineEventFormData` (ViewModel dla React Hook Form)

**Propsy:**
```typescript
interface TimelineEventModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  event?: TimelineEvent; // dla edit mode
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

### TimelineEventForm

**Opis:** Formularz obsługiwany przez React Hook Form z walidacją Zod. Pola: title, event_date (free text), sort_date (date picker), real_date (date picker), description (Tiptap with @mentions).

**Główne elementy:**
- `<Input>` - title (required)
- `<Input type="text">` - event_date (free text, required)
- `<Popover>` z `Calendar` (shadcn/ui) - sort_date picker (required, labeled "Sorting Date")
- `<Popover>` z `Calendar` (shadcn/ui) - real_date picker (optional)
- `<TiptapEditor>` - description z @mentions extension
- `<div className="text-sm text-muted-foreground">` - info o auto source_type: manual

**Obsługiwane interakcje:**
- Zmiana pól formularza → walidacja on blur
- Submit → walidacja i callback
- Tiptap @mentions → autocomplete z encjami kampanii

**Walidacja:**
- title: required, minLength: 1, maxLength: 200
- event_date: required, minLength: 1 (free text)
- sort_date: required, date object
- real_date: optional, regex: YYYY-MM-DD lub null
- description_json: optional, valid Tiptap JSON schema

**Typy:**
- `TimelineEventFormData` (ViewModel)
- `CreateTimelineEventCommand` | `UpdateTimelineEventCommand` (DTO)

**Propsy:**
```typescript
interface TimelineEventFormProps {
  mode: 'create' | 'edit';
  initialData?: TimelineEvent;
  campaignId: string;
  onSubmit: (data: CreateTimelineEventCommand | UpdateTimelineEventCommand) => void;
  onCancel: () => void;
}
```

### EmptyState

**Opis:** Komponent wyświetlany gdy brak wydarzeń na timeline. Pokazuje komunikat i przycisk "Add Event".

**Główne elementy:**
- `<div>` - centered container
- `<p>` - "No events yet"
- `<Button>` - "Add Event"

**Obsługiwane interakcje:**
- Click "Add Event" → otwarcie modala

**Walidacja:**
- Brak

**Typy:**
- Brak

**Propsy:**
```typescript
interface EmptyStateProps {
  onAddEventClick: () => void;
}
```

## 5. Typy

### DTO (Data Transfer Objects - z API)

```typescript
// Zdefiniowane w src/types/timeline-events.ts
export type TimelineEvent = Tables<'timeline_events'>;

export interface CreateTimelineEventCommand {
  title: string;
  description_json?: Json | null;
  event_date: string; // In-game fantasy calendar (display)
  sort_date: string; // YYYY-MM-DD (for sorting)
  real_date?: string | null; // YYYY-MM-DD
  related_entities_json?: Json | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface UpdateTimelineEventCommand {
  title?: string;
  description_json?: Json | null;
  event_date?: string;
  sort_date?: string;
  real_date?: string | null;
  related_entities_json?: Json | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface TimelineEventFilters {
  source_type?: string;
  source_id?: string;
}
```

### ViewModel (nowe typy dla UI)

```typescript
// src/types/timeline-view.types.ts (nowy plik)

import type { TimelineEvent } from '@/types/timeline-events';
import type { JSONContent } from '@tiptap/core';

/**
 * Related Entity extracted from timeline event's related_entities_json
 */
export interface RelatedEntity {
  type: 'npc' | 'location' | 'quest' | 'faction' | 'item' | 'arc';
  id: string;
  name: string;
}

/**
 * State for timeline filters
 */
export interface TimelineFiltersState {
  sourceType: 'all' | 'manual' | 'session_log';
  dateFrom: string; // free text
  dateTo: string; // free text
}

/**
 * Form data for creating/editing timeline event (React Hook Form)
 */
export interface TimelineEventFormData {
  title: string;
  event_date: string; // fantasy calendar free text
  sort_date: Date; // Date object for picker
  real_date: Date | null; // Date object or null
  description_json: JSONContent | null; // Tiptap JSON
}

/**
 * Extended timeline event with parsed related entities
 */
export interface TimelineEventViewModel extends TimelineEvent {
  relatedEntities: RelatedEntity[];
}
```

## 6. Zarządzanie stanem

### Global State
- Brak - widok nie wymaga globalnego stanu Zustand
- Stan filtrów i modala przechowywany lokalnie w `TimelineView`

### Server State (React Query)
- `useTimelineEventsQuery(campaignId, filters)` - fetch wydarzeń z API (sorted by sort_date)
- `useCreateTimelineEventMutation(campaignId)` - tworzenie wydarzenia
- `useUpdateTimelineEventMutation(campaignId)` - edycja wydarzenia
- `useDeleteTimelineEventMutation(campaignId)` - usuwanie wydarzenia

**Query Keys:**
- `['campaigns', campaignId, 'timeline-events', filters]`

**Invalidation strategy:**
- Po create/update/delete → invalidate `['campaigns', campaignId, 'timeline-events']`

### Local Component State

```typescript
// TimelineView state
const [filters, setFilters] = useState<TimelineFiltersState>({
  sourceType: 'all',
  dateFrom: '',
  dateTo: '',
});

const [modalState, setModalState] = useState<{
  open: boolean;
  mode: 'create' | 'edit';
  event?: TimelineEvent;
}>({
  open: false,
  mode: 'create',
});
```

### Custom Hook (opcjonalnie)

```typescript
// src/hooks/useTimelineFilters.ts
export function useTimelineFilters() {
  const [filters, setFilters] = useState<TimelineFiltersState>({
    sourceType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const clearFilters = () => {
    setFilters({ sourceType: 'all', dateFrom: '', dateTo: '' });
  };

  const apiFilters: TimelineEventFilters = {
    source_type: filters.sourceType !== 'all' ? filters.sourceType : undefined,
    // date range filtering done client-side (fuzzy match)
  };

  return { filters, setFilters, clearFilters, apiFilters };
}
```

## 7. Integracja API

### Endpointy i typy

**GET `/api/campaigns/:campaignId/timeline-events`**

Wykorzystywana funkcja: `getTimelineEvents(campaignId: string, filters?: TimelineEventFilters)`

**Request:**
- `campaignId: string` (z URL params)
- `filters?: TimelineEventFilters` (query params)

**Response:**
- `TimelineEvent[]` - lista wydarzeń posortowana chronologicznie (ORDER BY sort_date ASC)

**Query hook:**
```typescript
// src/hooks/useTimelineEvents.ts
import { useQuery } from '@tanstack/react-query';
import { getTimelineEvents } from '@/lib/api/timeline-events';

export function useTimelineEventsQuery(
  campaignId: string,
  filters?: TimelineEventFilters
) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'timeline-events', filters],
    queryFn: () => getTimelineEvents(campaignId, filters),
    enabled: !!campaignId,
  });
}
```

---

**POST `/api/campaigns/:campaignId/timeline-events`**

Wykorzystywana funkcja: `createTimelineEvent(campaignId: string, command: CreateTimelineEventCommand)`

**Request:**
- `campaignId: string`
- `command: CreateTimelineEventCommand`
  - `title: string` (required)
  - `description_json?: Json | null`
  - `event_date: string` (required, free text)
  - `sort_date: string` (required, YYYY-MM-DD)
  - `real_date?: string | null` (YYYY-MM-DD)
  - `related_entities_json?: Json | null` (auto-extracted z @mentions)
  - `source_type?: string | null` (default: "manual")
  - `source_id?: string | null`

**Response:**
- `TimelineEvent` - utworzone wydarzenie

**Mutation hook:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTimelineEvent } from '@/lib/api/timeline-events';
import { toast } from 'sonner';

export function useCreateTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateTimelineEventCommand) =>
      createTimelineEvent(campaignId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'timeline-events'],
      });
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create timeline event:', error);
      toast.error('Failed to create event');
    },
  });
}
```

---

**PATCH `/api/campaigns/:campaignId/timeline-events/:id`**

Wykorzystywana funkcja: `updateTimelineEvent(eventId: string, command: UpdateTimelineEventCommand)`

**Request:**
- `eventId: string`
- `command: UpdateTimelineEventCommand` (partial update)

**Response:**
- `TimelineEvent` - zaktualizowane wydarzenie

**Mutation hook:**
```typescript
export function useUpdateTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, command }: { eventId: string; command: UpdateTimelineEventCommand }) =>
      updateTimelineEvent(eventId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'timeline-events'],
      });
      toast.success('Event updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update timeline event:', error);
      toast.error('Failed to update event');
    },
  });
}
```

---

**DELETE `/api/campaigns/:campaignId/timeline-events/:id`**

Wykorzystywana funkcja: `deleteTimelineEvent(eventId: string)`

**Request:**
- `eventId: string`

**Response:**
- `void`

**Mutation hook:**
```typescript
export function useDeleteTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteTimelineEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'timeline-events'],
      });
      toast.success('Event deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete timeline event:', error);
      toast.error('Failed to delete event');
    },
  });
}
```

## 8. Interakcje użytkownika

### 1. Filtrowanie wydarzeń

**Trigger:** Użytkownik zmienia wartość w `TimelineFilters` (source type select lub date range inputs)

**Przepływ:**
1. Użytkownik wybiera source type (all/manual/session_log) z dropdown
2. `onChange` callback aktualizuje state `filters` w `TimelineView`
3. React Query automatycznie re-fetch z nowymi query params
4. Lista wydarzeń jest aktualizowana

**Date range filtering (fuzzy match):**
1. Użytkownik wpisuje date from/to (free text, np. "15 Eleint", "1492 DR")
2. Debounced onChange aktualizuje filters state
3. Client-side fuzzy match filtruje listę wydarzeń (`event_date.includes(dateFrom)`)
4. Lista jest re-renderowana z przefiltrowanymi wynikami

### 2. Dodawanie nowego wydarzenia

**Trigger:** Kliknięcie "Add Event" button w `TimelineHeader`

**Przepływ:**
1. Użytkownik klika "Add Event"
2. `setModalState({ open: true, mode: 'create' })`
3. `TimelineEventModal` otwiera się
4. Użytkownik wypełnia formularz (title, event_date required, sort_date required, real_date optional, description z @mentions)
5. Kliknięcie "Create Event" → `useCreateTimelineEventMutation.mutate()`
6. Optimistic UI: modal zamyka się, toast "Creating..."
7. Sukces: invalidate query, toast "Event created successfully", lista refresh
8. Błąd: toast "Failed to create event", modal pozostaje otwarty

### 3. Edycja wydarzenia (manual events only)

**Trigger:** Kliknięcie "Edit" button w `EventCard` (expanded accordion)

**Przepływ:**
1. Użytkownik klika "Edit" przy manual event
2. `setModalState({ open: true, mode: 'edit', event })`
3. Modal otwiera się z pre-filled form
4. Użytkownik modyfikuje pola
5. Kliknięcie "Save" → `useUpdateTimelineEventMutation.mutate({ eventId, command })`
6. Optimistic UI: modal zamyka się, toast "Updating..."
7. Sukces: invalidate query, toast "Event updated", lista refresh
8. Błąd: toast "Failed to update event", modal pozostaje otwarty

**Warunek:** Edit button disabled jeśli `event.source_type === 'session_log'`

### 4. Usuwanie wydarzenia (manual events only)

**Trigger:** Kliknięcie "Delete" button w `EventCard`

**Przepływ:**
1. Użytkownik klika "Delete" przy manual event
2. Alert confirmation dialog (shadcn AlertDialog): "Are you sure you want to delete this event?"
3. Kliknięcie "Confirm" → `useDeleteTimelineEventMutation.mutate(eventId)`
4. Optimistic UI: event wyszarzony, toast "Deleting..."
5. Sukces: invalidate query, toast "Event deleted", lista refresh
6. Błąd: toast "Failed to delete event", event powraca

**Warunek:** Delete button disabled jeśli `event.source_type === 'session_log'`

### 5. Expand/collapse wydarzenia

**Trigger:** Kliknięcie na `TimelineEventItem` card (Accordion trigger)

**Przepływ:**
1. Użytkownik klika collapsed event card
2. Accordion expand animation (shadcn Accordion)
3. Expanded view wyświetla:
   - Full description (Tiptap rich text display)
   - Complete related entities list
   - Edit/Delete buttons (jeśli manual event)
4. Kliknięcie ponownie → collapse accordion

**Keyboard navigation:**
- Arrow keys → przejście między wydarzeniami
- Enter → expand/collapse aktywnego wydarzenia
- Screen reader announces event date on focus

### 6. Nawigacja do related entities

**Trigger:** Kliknięcie na related entity badge

**Przepływ:**
1. Użytkownik klika badge z nazwą NPC/location/quest/etc.
2. Next.js router.push → `/campaigns/[campaignId]/[entityType]/[entityId]`
3. Nawigacja do karty encji

### 7. Nawigacja do session log (dla session_log events)

**Trigger:** Kliknięcie na source badge "Session Log"

**Przepływ:**
1. Użytkownik klika badge "Session Log"
2. Next.js router.push → `/campaigns/[campaignId]/sessions/[sessionId]`
3. Nawigacja do session log z anchor link do wydarzenia

### 8. @Mentions w description

**Trigger:** Wpisanie `@` w Tiptap editor

**Przepływ:**
1. Użytkownik wpisuje `@` w description field
2. Tiptap @mentions extension otwiera dropdown z autocomplete
3. Dropdown wyświetla encje kampanii (NPCs, locations, quests, etc.) z fuzzy search
4. Użytkownik wybiera encję (klik lub Enter)
5. Mention wstawiany jako badge z ID encji
6. Na submit, server auto-ekstraktuje mentions → `related_entities_json`

## 9. Warunki i walidacja

### Warunki dostępu do widoku

**Komponent:** `TimelineView`

**Warunek:** Użytkownik zalogowany i campaign istnieje

**Implementacja:**
- `ProtectedRoute` wrapper w layout
- Sprawdzenie `campaignId` z URL params
- Query `useCampaignQuery(campaignId)` dla breadcrumb
- Jeśli campaign nie istnieje → redirect `/campaigns` z toast error

### Walidacja formularza tworzenia/edycji

**Komponent:** `TimelineEventForm`

**Schemat Zod:**
```typescript
// src/lib/schemas/timeline-event.schema.ts
import { z } from 'zod';

export const createTimelineEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  event_date: z.string().min(1, 'In-game date is required'),
  sort_date: z.date({ required_error: 'Sorting date is required' }),
  real_date: z.date().nullable().optional(),
  description_json: z.any().nullable().optional(), // Tiptap JSONContent
});

export const updateTimelineEventSchema = createTimelineEventSchema.partial();
```

**Warunki:**
- `title`: required, 1-200 chars
- `event_date`: required, min 1 char (free text)
- `sort_date`: required, valid date
- `real_date`: optional, valid date or null
- `description_json`: optional, valid Tiptap JSON

**Wyświetlanie błędów:**
- Inline error messages pod polami (czerwony tekst)
- Toast notification przy błędzie submit

### Walidacja Edit/Delete actions

**Komponent:** `EventCard`

**Warunek:** Edit/Delete dostępne TYLKO dla manual events

**Implementacja:**
```typescript
const isManualEvent = event.source_type === 'manual' || event.source_type === null;
const canEdit = isManualEvent;
const canDelete = isManualEvent;

// Renderowanie warunkowe
{canEdit && <Button onClick={() => onEdit(event)}>Edit</Button>}
{canDelete && <Button onClick={() => onDelete(event.id)}>Delete</Button>}
```

**UI feedback:**
- Session log events: brak Edit/Delete buttons
- Session log events: source badge "Session Log" z link icon

### Filtrowanie - client-side fuzzy match

**Komponent:** `TimelineView`

**Warunek:** Date range filtering (free text)

**Implementacja:**
```typescript
const filteredEvents = events.filter((event) => {
  // Source type filter (server-side)
  // Date range filter (client-side fuzzy match)
  if (filters.dateFrom && !event.event_date.toLowerCase().includes(filters.dateFrom.toLowerCase())) {
    return false;
  }
  if (filters.dateTo && !event.event_date.toLowerCase().includes(filters.dateTo.toLowerCase())) {
    return false;
  }
  return true;
});
```

### Related entities parsing

**Komponent:** `TimelineEventItem`

**Warunek:** `related_entities_json` może być null lub invalid JSON

**Implementacja:**
```typescript
function parseRelatedEntities(json: Json | null): RelatedEntity[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(JSON.stringify(json));
    if (Array.isArray(parsed)) {
      return parsed.filter((e) => e.type && e.id && e.name);
    }
  } catch (error) {
    console.error('Failed to parse related entities:', error);
  }
  return [];
}
```

## 10. Obsługa błędów

### Błędy API

**Scenariusz:** Fetch wydarzeń fail (network error, RLS policy violation, etc.)

**Obsługa:**
1. React Query automatycznie retry (1x)
2. Jeśli fail → `isError: true`, `error` object dostępny
3. Wyświetlenie error state w UI:
   ```typescript
   if (isError) {
     return (
       <div className="text-center text-red-500">
         <p>Failed to load timeline events</p>
         <Button onClick={() => refetch()}>Retry</Button>
       </div>
     );
   }
   ```
4. Toast notification: "Failed to load timeline events"

### Błędy mutacji (create/update/delete)

**Scenariusz:** Mutation fail (validation error, network error, permission denied)

**Obsługa:**
1. `onError` callback w mutation hook
2. Toast error notification: "Failed to create/update/delete event"
3. Console.error z szczegółami
4. Modal pozostaje otwarty (dla create/update)
5. Event powraca do listy (dla delete optimistic update)

### Błędy walidacji formularza

**Scenariusz:** Użytkownik submit invalid form

**Obsługa:**
1. React Hook Form + Zod walidacja
2. Inline error messages pod polami
3. Submit button disabled jeśli form invalid
4. Error state w formularzu: `errors.title?.message`

### Campaign not found

**Scenariusz:** `campaignId` z URL nie istnieje lub user nie ma dostępu (RLS)

**Obsługa:**
1. `useCampaignQuery(campaignId)` zwraca error
2. Redirect do `/campaigns` z toast: "Campaign not found"
3. Implementacja w `TimelineView`:
   ```typescript
   const { data: campaign, isError } = useCampaignQuery(campaignId);

   useEffect(() => {
     if (isError) {
       toast.error('Campaign not found');
       router.push('/campaigns');
     }
   }, [isError]);
   ```

### Empty state

**Scenariusz:** Brak wydarzeń na timeline (valid state, nie error)

**Obsługa:**
1. Renderowanie `EmptyState` component
2. Komunikat: "No events yet"
3. Button "Add Event" → otwarcie modala

### Parsing errors (related_entities_json, description_json)

**Scenariusz:** Invalid JSON w database fields

**Obsługa:**
1. Try-catch przy parsowaniu
2. Fallback do pustej tablicy / null
3. Console.error z logiem błędu
4. Graceful degradation - wyświetlenie wydarzenia bez related entities

## 11. Kroki implementacji

### Krok 1: Setup typów i schematów walidacji
- Utworzyć plik `src/types/timeline-view.types.ts` z ViewModels
- Utworzyć plik `src/lib/schemas/timeline-event.schema.ts` z Zod schemas
- Zweryfikować istniejące typy w `src/types/timeline-events.ts`

### Krok 2: Aktualizacja Bazy Danych i Komponentów UI
- **[NEW] Dodać kolumnę `sort_date` do tabeli `timeline_events` w Supabase (typ DATE)**
- **[NEW] Zainstalować komponent Calendar (`npx shadcn-ui@latest add calendar`)**
- Upewnić się, że `react-day-picker` jest zainstalowany

### Krok 3: Implementacja React Query hooks
- Utworzyć plik `src/hooks/useTimelineEvents.ts`
- Zaimplementować hooki:
  - `useTimelineEventsQuery(campaignId, filters)` (z sortowaniem po `sort_date`)
  - `useCreateTimelineEventMutation(campaignId)`
  - `useUpdateTimelineEventMutation(campaignId)`
  - `useDeleteTimelineEventMutation(campaignId)`

### Krok 4: Utworzenie utility functions
- Utworzyć `src/lib/utils/timeline.utils.ts`:
  - `parseRelatedEntities(json: Json | null): RelatedEntity[]`
  - `filterEventsByDateRange(events: TimelineEvent[], dateFrom: string, dateTo: string): TimelineEvent[]`
  - `getEntityTypeIcon(type: string): IconComponent`
  - `getEntityTypePath(type: string, campaignId: string, entityId: string): string`

### Krok 5: Implementacja base components (bottom-up)

**5a. RelatedEntitiesBadges**
- Utworzyć `src/components/timeline/RelatedEntitiesBadges.tsx`
- Wyświetlanie badges z ikonami i nazwami
- Obsługa click → nawigacja

**5b. EmptyState**
- Utworzyć `src/components/timeline/EmptyState.tsx`
- Centered layout z komunikatem i przyciskiem

**5c. EventCard**
- Utworzyć `src/components/timeline/EventCard.tsx`
- Implementacja collapsed view (title, preview, entities)
- Implementacja expanded view (full description, actions)
- Integracja z Tiptap display (read-only)

### Krok 6: Implementacja TimelineEventItem (accordion)
- Utworzyć `src/components/timeline/TimelineEventItem.tsx`
- Użycie shadcn Accordion
- DateBadge (left) + EventCard (right) layout
- Obsługa expand/collapse
- ARIA attributes dla accessibility

### Krok 7: Implementacja TimelineList
- Utworzyć `src/components/timeline/TimelineList.tsx`
- Vertical timeline layout z CSS line
- Renderowanie listy `TimelineEventItem`
- Conditional render `EmptyState`
- Loading state (skeletons)

### Krok 8: Implementacja TimelineFilters
- Utworzyć `src/components/timeline/TimelineFilters.tsx`
- Source type Select (shadcn Select)
- Date range inputs (free text)
- Clear filters button
- Debounced onChange dla date inputs

### Krok 9: Implementacja TimelineHeader
- Utworzyć `src/components/timeline/TimelineHeader.tsx`
- Breadcrumb navigation (shadcn Breadcrumb)
- H1 title
- Integracja `TimelineFilters`
- "Add Event" button (emerald)

### Krok 10: Implementacja TimelineEventForm
- Utworzyć `src/components/timeline/TimelineEventForm.tsx`
- React Hook Form setup z Zod validation
- Title input
- Event date input (free text)
- Sort date picker (shadcn Calendar)
- Real date picker (shadcn Calendar)
- Description editor (Tiptap with @mentions)
- Submit/Cancel handlers

### Krok 11: Implementacja TimelineEventModal
- Utworzyć `src/components/timeline/TimelineEventModal.tsx`
- shadcn Dialog wrapper
- Integracja `TimelineEventForm`
- Obsługa create/edit modes
- Mutation hooks integration
- Loading states i error handling

### Krok 12: Implementacja głównego widoku TimelineView
- Utworzyć `src/app/(dashboard)/campaigns/[id]/timeline/page.tsx`
- Setup state (filters, modal)
- Integracja React Query hooks
- Orchestracja wszystkich komponentów:
  - `TimelineHeader`
  - `TimelineList`
  - `TimelineEventModal`
- Obsługa loading/error states
- Keyboard navigation support

### Krok 13: Stylowanie i responsywność
- Tailwind CSS styling dla vertical timeline
- Timeline line (::before pseudo-element)
- Responsive layout (mobile: stack vertically)
- Dark mode support
- Hover states i transitions

### Krok 14: Integracja @mentions w Tiptap
- Sprawdzić czy istnieje custom @mentions extension
- Konfiguracja autocomplete:
  - Fetch encji kampanii (`useCampaignEntitiesQuery`)
  - Fuzzy search w dropdown
  - Renderowanie badges z ikonami typów
- Server-side extraction mentions → `related_entities_json` (verify w API)

### Krok 15: Accessibility (ARIA)
- ARIA landmarks (main, navigation)
- `role="list"` i `role="listitem"` dla timeline
- `aria-expanded` dla accordion
- Keyboard navigation (Arrow keys, Enter)
- Screen reader announcements (event date on focus)
- Focus management przy open/close modal

### Krok 16: Testy jednostkowe (opcjonalnie)
- Test `TimelineFilters` component
- Test `parseRelatedEntities` utility
- Test `TimelineEventForm` validation
- Test mutation hooks (mocked Supabase)

### Krok 17: Testowanie end-to-end
- Manualne testy pełnego flow:
  - Fetch wydarzeń
  - Filtrowanie (source type, date range)
  - Create new event
  - Edit manual event
  - Delete manual event (confirmation)
  - Expand/collapse events
  - Navigate to related entities
  - Navigate to session log (dla session_log events)
- Test keyboard navigation
- Test screen reader compatibility

### Krok 18: Integracja z routing
- Sprawdzić routing w `src/app/(dashboard)/campaigns/[id]/layout.tsx`
- Dodać link do Timeline w campaign navigation sidebar
- Zweryfikować breadcrumb navigation

### Krok 19: Dokumentacja i cleanup
- Dodać komentarze JSDoc do komponentów
- Cleanup console.logs
- Sprawdzić czy wszystkie TODOs resolved
- Update CLAUDE.md z informacjami o nowym widoku (jeśli potrzebne)
