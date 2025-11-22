# Plan implementacji widoku Story Items (Przedmioty Fabularne)

## 1. Przegląd

Widok Story Items umożliwia DM śledzenie kluczowych przedmiotów fabularnych (artefakty, dokumenty, klejnoty rodzinne) z systemem ownership tracking (polymorphic: NPC/PC/Faction/Location/Unknown). Przedmioty posiadają opis rich text z @mentions oraz timeline historii własności. Widok używa standardowego layoutu SplitLayout (30% lista, 70% szczegóły) zgodnie z wzorcem używanym w NPCs, Locations, Quests i Lore Notes.

## 2. Routing widoku

**Ścieżka:** `/campaigns/[id]/story-items`

**URL-driven selection:** `?selectedId={storyItemId}`

Widok dostępny jako podstrona wybranej kampanii w module World Building.

## 3. Struktura komponentów

```
StoryItemsView (page component)
├── StoryItemsHeader
│   ├── Breadcrumb (shadcn/ui)
│   ├── H1 Title
│   └── AddStoryItemButton (emerald)
├── SplitLayout (30/70)
│   ├── LEFT PANEL (30%)
│   │   └── StoryItemsList
│   │       ├── SearchInput
│   │       ├── SortSelect
│   │       ├── StoryItemFiltersCompact (popover)
│   │       └── StoryItemCard[] (scrollable)
│   └── RIGHT PANEL (70%)
│       └── StoryItemDetailPanel
│           ├── NoSelectionState
│           ├── ViewMode
│           │   ├── ImageDisplay
│           │   ├── HeaderSection (name, actions)
│           │   ├── CurrentOwnerSection
│           │   ├── DescriptionSection (Tiptap display)
│           │   ├── OwnershipHistorySection (timeline)
│           │   └── BacklinksSection
│           └── EditMode (inline editing)
├── StoryItemFormDialog (create)
├── ChangeOwnerDialog
└── AddHistoricalOwnerDialog
```

## 4. Szczegóły komponentów

### StoryItemsView (page component)

**Opis:** Główny komponent strony obsługujący routing, fetch danych i orkiestrację UI. Zarządza stanem filtrów, selection i dialogów.

**Główne elementy:**
- `StoryItemsHeader` - nagłówek z breadcrumb i Add button
- `SplitLayout` - standardowy 30/70 split
- `StoryItemsList` - left panel z listą i filtrami
- `StoryItemDetailPanel` - right panel ze szczegółami
- `StoryItemFormDialog` - dialog tworzenia przedmiotu
- `ChangeOwnerDialog` - dialog zmiany właściciela
- `AddHistoricalOwnerDialog` - dialog dodawania historii

**Obsługiwane interakcje:**
- URL-driven selection (`selectedId` w search params)
- Otwarcie create dialog
- Zmiana filtrów
- Fetch story items z API

**Walidacja:**
- Weryfikacja istnienia campaignId w URL params
- Obsługa stanów ładowania i błędów z API

**Typy:**
- `StoryItemDTO[]`
- `StoryItemFilters`
- `DialogState`

**State:**
```typescript
const selectedId = searchParams.get('selectedId');
const [filters, setFilters] = useState<StoryItemFilters>({});
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isChangeOwnerOpen, setIsChangeOwnerOpen] = useState(false);
const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [editedData, setEditedData] = useState<Partial<StoryItemDTO> | null>(null);
```

### StoryItemsHeader

**Opis:** Header widoku zawierający breadcrumb navigation, tytuł strony i przycisk dodawania przedmiotu.

**Główne elementy:**
- `<Breadcrumb>` - nawigacja (My Campaigns > [Campaign Name] > Story Items)
- `<h1>` - tytuł "Story Items"
- `<Button>` - emerald "Add Story Item"

**Obsługiwane interakcje:**
- Kliknięcie "Add Story Item" → otwarcie create dialog

**Propsy:**
```typescript
interface StoryItemsHeaderProps {
  campaign: CampaignDTO;
  onAddClick: () => void;
}
```

### StoryItemsList (Left Panel - 30%)

**Opis:** Lewa kolumna z listą story items, search, sort i filtrami. Wyświetla przewijalne karty przedmiotów.

**Główne elementy:**
- `<Input>` - search bar (fuzzy search by name)
- `<Select>` - sort dropdown (Recent, Name A-Z, Name Z-A, Owner)
- `<StoryItemFiltersCompact>` - compact filters popover
- `<ScrollArea>` - scrollable list container
- `<StoryItemCard>[]` - lista kart przedmiotów
- `<EmptyState>` - gdy brak przedmiotów

**Obsługiwane interakcje:**
- Search input (debounced) → filtrowanie lokalnie
- Sort select → zmiana kolejności
- Filter change → callback do rodzica
- Click na kartę → router.push z selectedId

**Walidacja:**
- Sprawdzenie czy lista jest pusta → EmptyState

**Typy:**
- `StoryItemDTO[]`
- `StoryItemFilters`

**Propsy:**
```typescript
interface StoryItemsListProps {
  items: StoryItemDTO[];
  selectedId: string | null;
  filters: StoryItemFilters;
  onFilterChange: (filters: StoryItemFilters) => void;
  onItemSelect: (id: string) => void;
  isLoading: boolean;
}
```

### StoryItemCard (List Item)

**Opis:** Horizontal card w liście - image thumbnail (left) + content (right). Klikalna, highlight gdy selected.

**Główne elementy:**
- `<div>` - container z border i hover state
- `<img>` - square thumbnail (64px)
- `<div>` - content area
  - `<h3>` - nazwa przedmiotu (font-semibold)
  - `<Badge>` - current owner badge (avatar/icon + name + type)
  - `<Badge variant="secondary">` - "Unknown" jeśli brak owner

**Obsługiwane interakcje:**
- Click → select item (router.push)
- Hover → highlight
- Selected state → visual emphasis (border color)

**Typy:**
- `StoryItemDTO`

**Propsy:**
```typescript
interface StoryItemCardProps {
  item: StoryItemDTO;
  isSelected: boolean;
  onClick: () => void;
}
```

### StoryItemFiltersCompact

**Opis:** Compact filters w Popover - zgodnie z wzorcem używanym w NPCs/Quests. Button z badge count + popover z kontrolkami.

**Główne elementy:**
- `<Button variant="outline">` - "Filters" z badge (active count)
- `<Popover>` - dropdown container
- `<PopoverContent>` - filters controls
  - `<Label>` + `<RadioGroup>` - Owner Type filter (All, NPC, PC, Faction, Location, Unknown)
  - `<Label>` + `<Select>` - Specific Owner (conditional, autocomplete)
- Active filters chips (bottom)
- "Clear all filters" button

**Obsługiwane interakcje:**
- Owner Type change → update filters
- Specific Owner select → update filters (conditional visibility)
- Clear filters → reset to defaults

**Walidacja:**
- Specific Owner select disabled jeśli Owner Type = "All" lub "Unknown"

**Typy:**
- `StoryItemFilters`

**Propsy:**
```typescript
interface StoryItemFiltersCompactProps {
  filters: StoryItemFilters;
  onChange: (filters: StoryItemFilters) => void;
  campaignId: string; // dla autocomplete owners
}
```

### StoryItemDetailPanel (Right Panel - 70%)

**Opis:** Prawa kolumna wyświetlająca szczegóły wybranego przedmiotu. Obsługuje view mode i edit mode (inline editing).

**States:**
1. **NoSelectionState** - gdy selectedId = null
2. **ViewMode** - wyświetlanie z przyciskiem Edit
3. **EditMode** - inline editing z Save/Cancel

**Główne elementy (View Mode):**
- `<div>` - image display (large, max 400px)
- `<div>` - header section
  - `<h2>` - nazwa przedmiotu
  - `<div>` - action buttons (Edit, Delete)
- `<div>` - current owner section
  - `<h3>` - "Current Owner"
  - Avatar/Icon + Name + Type badge
  - Link do owner's page
  - `<Button>` - "Change Owner"
- `<div>` - description section
  - `<h3>` - "Description"
  - Tiptap read-only display
- `<div>` - ownership history section
  - `<h3>` - "Ownership History"
  - `<OwnershipTimeline>` - vertical timeline
  - `<Button>` - "+ Add Historical Owner"
- `<div>` - backlinks section
  - `<h3>` - "Mentioned In"
  - Entity cards list

**Główne elementy (Edit Mode):**
- `<Input>` - name (editable)
- `<ImageUpload>` - image upload/change
- `<TiptapEditor>` - description editor z @mentions
- Buttons: Save (primary), Cancel (ghost)
- Current Owner i History - non-editable (separate dialogs)

**Obsługiwane interakcje:**
- Click Edit → enter edit mode
- Click Save → mutation + exit edit mode
- Click Cancel → discard changes + exit edit mode
- Click Delete → confirmation dialog + delete mutation
- Click "Change Owner" → open ChangeOwnerDialog
- Click "+ Add Historical Owner" → open AddHistoricalOwnerDialog

**Walidacja:**
- Name required
- Image max 5 MB

**Typy:**
- `StoryItemDTO`
- `OwnershipHistoryEntry[]`
- `BacklinkDTO[]`

**Propsy:**
```typescript
interface StoryItemDetailPanelProps {
  item: StoryItemDTO | null;
  isLoading: boolean;
  onEdit: (data: Partial<StoryItemDTO>) => void;
  onDelete: (id: string) => void;
  onChangeOwner: () => void;
  onAddHistory: () => void;
}
```

### OwnershipTimeline

**Opis:** Vertical timeline wyświetlający historię własności przedmiotu. Chronologiczny porządek (oldest → newest).

**Główne elementy:**
- `<div>` - vertical container z timeline line (CSS ::before)
- Timeline entries (each):
  - `<div>` - timeline dot (emerald)
  - `<div>` - content card
    - Avatar/Icon + Owner Name
    - Type badge
    - Period: "1370 DR - 1374 DR" lub "1374 DR - Present"
    - Link do owner's page

**Obsługiwane interakcje:**
- Click on owner name → nawigacja do owner's detail
- Hover → highlight entry
- Keyboard navigation (Arrow keys)

**Walidacja:**
- Sortowanie chronologiczne
- Current owner oznaczony "Present"

**Typy:**
- `OwnershipHistoryEntry[]`

**Propsy:**
```typescript
interface OwnershipTimelineProps {
  entries: OwnershipHistoryEntry[];
  currentOwner: {
    type: string;
    id: string;
    name: string;
  } | null;
}
```

### StoryItemFormDialog (Creation)

**Opis:** Dialog (shadcn Dialog) do tworzenia nowego story item. React Hook Form z Zod validation.

**Główne elementy:**
- `<Dialog>` - shadcn Dialog wrapper
- `<DialogHeader>` - "Create Story Item"
- `<DialogContent>` - formularz
  - `<Input>` - Name (required)
  - `<TiptapEditor>` - Description (rich text z @mentions)
  - `<ImageUpload>` - Image (drag & drop, max 5 MB)
  - `<Select>` - Current Owner Type (None/NPC/PC/Faction/Location)
  - `<Select>` - Current Owner (autocomplete, conditional)
- `<DialogFooter>` - Cancel, Create (emerald)

**Obsługiwane interakcje:**
- Owner Type change → show/hide Owner select
- Submit → validation + create mutation
- Cancel → close dialog

**Walidacja (Zod):**
- name: required, min 1, max 200
- description_json: optional, valid Tiptap JSON
- image: optional, max 5 MB
- owner: if owner_type selected, owner_id required

**Typy:**
- `CreateStoryItemCommand`
- `StoryItemFormData` (ViewModel)

**Propsy:**
```typescript
interface StoryItemFormDialogProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

### ChangeOwnerDialog

**Opis:** Dialog do zmiany aktualnego właściciela przedmiotu. Opcja dodania current owner do historii.

**Główne elementy:**
- `<Dialog>` - shadcn Dialog
- `<DialogHeader>` - "Change Owner"
- `<DialogContent>` - formularz
  - `<Select>` - New Owner Type (NPC/PC/Faction/Location/Unknown)
  - `<Select>` - New Owner (autocomplete, conditional)
  - `<Checkbox>` - "Add current owner to ownership history"
  - `<Input type="text">` - Period End (free text, conditional on checkbox)
- `<DialogFooter>` - Cancel, Change Owner

**Obsługiwane interakcje:**
- Owner Type change → show/hide Owner select
- Checkbox toggle → show/hide Period End input
- Submit → change owner mutation + optional history entry

**Walidacja:**
- New owner required (unless Unknown)
- Period End optional (free text, no format validation)

**Typy:**
- `ChangeOwnerCommand`

**Propsy:**
```typescript
interface ChangeOwnerDialogProps {
  open: boolean;
  storyItem: StoryItemDTO;
  onClose: () => void;
  onSuccess: () => void;
}
```

### AddHistoricalOwnerDialog

**Opis:** Dialog do dodawania wpisu do ownership history (historical owner).

**Główne elementy:**
- `<Dialog>` - shadcn Dialog
- `<DialogHeader>` - "Add Historical Owner"
- `<DialogContent>` - formularz
  - `<Select>` - Owner Type (NPC/PC/Faction/Location)
  - `<Select>` - Owner (autocomplete)
  - `<Input type="text">` - Period Start (required, free text)
  - `<Input type="text">` - Period End (optional, free text)
- `<DialogFooter>` - Cancel, Add to History

**Obsługiwane interakcje:**
- Owner Type change → update Owner select options
- Submit → add history mutation

**Walidacja:**
- Owner Type + Owner required
- Period Start required (free text)
- Period End optional (free text)
- Client-side warning: overlapping periods check (non-blocking)

**Typy:**
- `AddHistoricalOwnerCommand`

**Propsy:**
```typescript
interface AddHistoricalOwnerDialogProps {
  open: boolean;
  storyItemId: string;
  existingHistory: OwnershipHistoryEntry[];
  onClose: () => void;
  onSuccess: () => void;
}
```

## 5. Typy

### DTO (Data Transfer Objects)

```typescript
// src/types/story-items.ts

export interface StoryItemDTO {
  id: string;
  campaign_id: string;
  name: string;
  description_json: JSONContent | null;
  image_url: string | null;
  current_owner_type: 'npc' | 'pc' | 'faction' | 'location' | null;
  current_owner_id: string | null;
  current_owner_name?: string; // enriched from join
  created_at: string;
  updated_at: string;
}

export interface OwnershipHistoryEntry {
  id: string;
  story_item_id: string;
  owner_type: 'npc' | 'pc' | 'faction' | 'location';
  owner_id: string;
  owner_name: string; // enriched from join
  period_start: string; // fantasy calendar free text
  period_end: string | null; // null = current owner
  created_at: string;
}

export interface StoryItemFilters {
  owner_type?: 'npc' | 'pc' | 'faction' | 'location' | 'unknown' | null;
  owner_id?: string | null;
}

export interface CreateStoryItemCommand {
  name: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
  current_owner_type?: 'npc' | 'pc' | 'faction' | 'location' | null;
  current_owner_id?: string | null;
}

export interface UpdateStoryItemCommand {
  name?: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
}

export interface ChangeOwnerCommand {
  new_owner_type: 'npc' | 'pc' | 'faction' | 'location' | null;
  new_owner_id: string | null;
  add_to_history: boolean;
  period_end?: string | null; // if add_to_history = true
}

export interface AddHistoricalOwnerCommand {
  owner_type: 'npc' | 'pc' | 'faction' | 'location';
  owner_id: string;
  period_start: string;
  period_end: string | null;
}
```

### ViewModel (UI types)

```typescript
// src/types/story-items-view.types.ts

export interface StoryItemFormData {
  name: string;
  description_json: JSONContent | null;
  image_url: string | null;
  current_owner_type: 'npc' | 'pc' | 'faction' | 'location' | null;
  current_owner_id: string | null;
}

export interface ChangeOwnerFormData {
  new_owner_type: 'npc' | 'pc' | 'faction' | 'location' | null;
  new_owner_id: string | null;
  add_to_history: boolean;
  period_end: string | null;
}

export interface AddHistoricalOwnerFormData {
  owner_type: 'npc' | 'pc' | 'faction' | 'location';
  owner_id: string;
  period_start: string;
  period_end: string | null;
}
```

## 6. Zarządzanie stanem

### Global State
- Brak - widok nie wymaga globalnego stanu Zustand
- Stan selection i dialogów przechowywany lokalnie w page component

### Server State (React Query)

**Query hooks:**
- `useStoryItemsQuery(campaignId, filters)` - fetch story items
- `useStoryItemDetailsQuery(id)` - fetch single item details
- `useOwnershipHistoryQuery(storyItemId)` - fetch ownership history

**Mutation hooks:**
- `useCreateStoryItemMutation(campaignId)` - create item
- `useUpdateStoryItemMutation()` - update item
- `useDeleteStoryItemMutation()` - delete item
- `useChangeOwnerMutation()` - change current owner
- `useAddHistoricalOwnerMutation()` - add history entry

**Query Keys:**
- `['campaigns', campaignId, 'story-items', filters]`
- `['story-items', id]`
- `['story-items', id, 'ownership-history']`

**Invalidation strategy:**
- Po create/update/delete → invalidate `['campaigns', campaignId, 'story-items']`
- Po change owner → invalidate `['story-items', id]` + history query
- Po add history → invalidate `['story-items', id, 'ownership-history']`

### Local Component State

```typescript
// StoryItemsView state
const selectedId = searchParams.get('selectedId');

const [filters, setFilters] = useState<StoryItemFilters>({});

const [dialogState, setDialogState] = useState({
  createOpen: false,
  changeOwnerOpen: false,
  addHistoryOpen: false,
});

const [isEditing, setIsEditing] = useState(false);
const [editedData, setEditedData] = useState<Partial<StoryItemDTO> | null>(null);
```

## 7. Integracja API

### API Functions (`src/lib/api/story-items.ts`)

```typescript
// GET story items with filters
export async function getStoryItems(
  campaignId: string,
  filters?: StoryItemFilters
): Promise<StoryItemDTO[]>

// GET single story item with details
export async function getStoryItemDetails(id: string): Promise<StoryItemDTO>

// POST create story item
export async function createStoryItem(
  campaignId: string,
  command: CreateStoryItemCommand
): Promise<StoryItemDTO>

// PATCH update story item
export async function updateStoryItem(
  id: string,
  command: UpdateStoryItemCommand
): Promise<StoryItemDTO>

// DELETE story item
export async function deleteStoryItem(id: string): Promise<void>

// PATCH change owner
export async function changeStoryItemOwner(
  id: string,
  command: ChangeOwnerCommand
): Promise<StoryItemDTO>

// GET ownership history
export async function getOwnershipHistory(
  storyItemId: string
): Promise<OwnershipHistoryEntry[]>

// POST add historical owner
export async function addHistoricalOwner(
  storyItemId: string,
  command: AddHistoricalOwnerCommand
): Promise<OwnershipHistoryEntry>
```

### Query Implementation Pattern

**Example - useStoryItemsQuery:**
```typescript
// src/hooks/useStoryItems.ts
export function useStoryItemsQuery(
  campaignId: string,
  filters?: StoryItemFilters
) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'story-items', filters],
    queryFn: () => getStoryItems(campaignId, filters),
    enabled: !!campaignId,
  });
}
```

**Example - useCreateStoryItemMutation:**
```typescript
export function useCreateStoryItemMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateStoryItemCommand) =>
      createStoryItem(campaignId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'story-items'],
      });
      toast.success('Story item created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create story item:', error);
      toast.error('Failed to create story item');
    },
  });
}
```

## 8. Interakcje użytkownika

### 1. Przeglądanie listy story items

**Trigger:** Wejście na `/campaigns/[id]/story-items`

**Przepływ:**
1. Page component fetch story items z API
2. Render list w left panel (30%)
3. Empty state jeśli brak items
4. No selection state w right panel (70%)

### 2. Filtrowanie story items

**Trigger:** Zmiana filtrów w StoryItemFiltersCompact

**Przepływ:**
1. Użytkownik klika "Filters" button
2. Popover otwiera się z kontrolkami
3. Zmiana Owner Type → update filters state
4. Zmiana Specific Owner → update filters state
5. React Query re-fetch z nowymi filters
6. Lista aktualizowana

### 3. Wyszukiwanie i sortowanie

**Trigger:** Search input lub Sort select change

**Przepływ:**
1. Search: debounced onChange → local filtering po name
2. Sort: onChange → re-sort local list
3. Lista re-renderowana

### 4. Wybór story item

**Trigger:** Click na StoryItemCard

**Przepływ:**
1. onClick → router.push z selectedId
2. URL update: `?selectedId={id}`
3. Detail panel fetch szczegółów
4. Render detail view w right panel

### 5. Tworzenie story item

**Trigger:** Click "Add Story Item"

**Przepływ:**
1. setDialogState({ createOpen: true })
2. StoryItemFormDialog otwiera się
3. Użytkownik wypełnia formularz (name required)
4. Submit → useCreateStoryItemMutation
5. Optimistic: dialog zamyka się, toast "Creating..."
6. Success: invalidate query, toast "Created", auto-select nowy item
7. Error: toast "Failed", dialog pozostaje otwarty

### 6. Edycja story item (inline)

**Trigger:** Click "Edit" button w detail panel

**Przepływ:**
1. setIsEditing(true)
2. Pola stają się edytowalne (name, image, description)
3. Zmiany stagowane w editedData state
4. Click "Save" → useUpdateStoryItemMutation
5. Optimistic: exit edit mode, toast "Saving..."
6. Success: invalidate query, toast "Updated"
7. Error: toast "Failed", re-enter edit mode
8. Click "Cancel" → discard changes, exit edit mode

### 7. Zmiana właściciela

**Trigger:** Click "Change Owner" button

**Przepływ:**
1. setDialogState({ changeOwnerOpen: true })
2. ChangeOwnerDialog otwiera się
3. Użytkownik wybiera new owner type + owner
4. Optional: check "Add current to history" + period end
5. Submit → useChangeOwnerMutation
6. Optimistic: dialog zamyka się, owner badge update
7. Success: invalidate queries, toast "Owner changed"
8. Error: toast "Failed", dialog pozostaje otwarty

### 8. Dodawanie historical owner

**Trigger:** Click "+ Add Historical Owner"

**Przepływ:**
1. setDialogState({ addHistoryOpen: true })
2. AddHistoricalOwnerDialog otwiera się
3. Użytkownik wypełnia: owner type, owner, period start, period end
4. Submit → useAddHistoricalOwnerMutation
5. Client-side check: overlapping periods warning (non-blocking)
6. Success: invalidate history query, toast "Added to history"
7. Error: toast "Failed"

### 9. @Mentions w description

**Trigger:** Wpisanie `@` w Tiptap editor

**Przepływ:**
1. Tiptap @mentions extension otwiera dropdown
2. Autocomplete fetch campaign entities (fuzzy search)
3. Użytkownik wybiera encję
4. Mention wstawiany jako badge z ID
5. Na submit: server auto-extract mentions → entity_mentions sync

### 10. Nawigacja do owner's page

**Trigger:** Click na owner badge/link

**Przepływ:**
1. router.push → `/campaigns/[id]/[ownerType]s?selectedId=[ownerId]`
2. Przykład: NPC → `/campaigns/123/npcs?selectedId=npc-456`

### 11. Usuwanie story item

**Trigger:** Click "Delete" button

**Przepływ:**
1. AlertDialog confirmation: "Are you sure?"
2. Confirm → useDeleteStoryItemMutation
3. Optimistic: clear selection, toast "Deleting..."
4. Success: invalidate query, toast "Deleted", router.push bez selectedId
5. Error: toast "Failed"

## 9. Warunki i walidacja

### Warunki dostępu

- Użytkownik zalogowany (ProtectedRoute)
- Campaign istnieje (useCampaignQuery)
- User ma dostęp do campaign (RLS)

### Walidacja formularza (Zod)

**CreateStoryItemSchema:**
```typescript
export const createStoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description_json: z.any().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  current_owner_type: z.enum(['npc', 'pc', 'faction', 'location']).nullable().optional(),
  current_owner_id: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    // If owner type selected, owner_id required
    if (data.current_owner_type && !data.current_owner_id) return false;
    return true;
  },
  { message: 'Owner required when type is selected', path: ['current_owner_id'] }
);
```

**ChangeOwnerSchema:**
```typescript
export const changeOwnerSchema = z.object({
  new_owner_type: z.enum(['npc', 'pc', 'faction', 'location']).nullable(),
  new_owner_id: z.string().uuid().nullable(),
  add_to_history: z.boolean(),
  period_end: z.string().nullable().optional(),
}).refine(
  (data) => {
    if (data.new_owner_type && data.new_owner_type !== 'unknown' && !data.new_owner_id) {
      return false;
    }
    return true;
  },
  { message: 'Owner required', path: ['new_owner_id'] }
);
```

**AddHistoricalOwnerSchema:**
```typescript
export const addHistoricalOwnerSchema = z.object({
  owner_type: z.enum(['npc', 'pc', 'faction', 'location']),
  owner_id: z.string().uuid('Invalid owner'),
  period_start: z.string().min(1, 'Period start is required'),
  period_end: z.string().nullable().optional(),
});
```

### Validation - Overlapping Periods

**Client-side warning** (non-blocking):
```typescript
function checkOverlappingPeriods(
  newEntry: AddHistoricalOwnerFormData,
  existingHistory: OwnershipHistoryEntry[]
): boolean {
  // Simple string comparison for free text dates
  // Warning only, doesn't block submission
  const overlaps = existingHistory.some(entry => {
    // Check if periods overlap (naive string comparison)
    // Real implementation depends on calendar format
    return false; // placeholder
  });

  if (overlaps) {
    toast.warning('Period may overlap with existing entry');
  }

  return overlaps;
}
```

### Image Upload Validation

- Max size: 5 MB (client-side check)
- Automatic WebP compression
- Storage bucket: `story-item-images`

## 10. Obsługa błędów

### Błędy API

**Fetch fail:**
```typescript
if (isError) {
  return (
    <div className="text-center text-red-500">
      <p>Failed to load story items</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}
```

**Mutation fail:**
- onError callback → toast error
- Console.error z details
- Dialog/edit mode pozostaje otwarty
- Optimistic update rollback

### Deleted Owner Handling

**Scenario:** Owner został usunięty z kampanii

**Obsługa:**
```typescript
function renderOwner(item: StoryItemDTO) {
  if (item.current_owner_type && !item.current_owner_name) {
    return <Badge variant="secondary">Deleted {item.current_owner_type}</Badge>;
  }
  // Normal render
}
```

### Empty States

**No items:** EmptyState z "Add Story Item" button
**No selection:** NoSelectionState w detail panel
**No ownership history:** Empty timeline z message

## 11. Accessibility

### Keyboard Navigation

- **List:** Arrow keys → navigate items, Enter → select
- **Timeline:** Arrow keys → navigate entries, Tab → focus links
- **Dialogs:** Tab → cycle fields, Escape → close
- **Search:** Focus on Ctrl+F (optional)

### ARIA Attributes

```typescript
// List items
<div role="list">
  <div role="listitem" aria-selected={isSelected}>
    ...
  </div>
</div>

// Owner badge
<Badge aria-label={`Current owner: ${ownerName}, ${ownerType}`}>
  ...
</Badge>

// Timeline
<div role="list" aria-label="Ownership history timeline">
  <div role="listitem">...</div>
</div>
```

### Screen Reader Support

- Image alt text
- Button labels
- Form field labels + descriptions
- Error message announcements

### Focus Management

- Dialog open → focus first input
- Dialog close → restore focus to trigger button
- Item select → focus detail panel
- Edit mode → focus first editable field

## 12. Kroki implementacji

### Krok 1: Setup typów i schematów
- [ ] Utworzyć `src/types/story-items.ts` (DTOs)
- [ ] Utworzyć `src/types/story-items-view.types.ts` (ViewModels)
- [ ] Utworzyć `src/lib/schemas/story-items.schema.ts` (Zod schemas)

### Krok 2: API layer
- [ ] Utworzyć `src/lib/api/story-items.ts`
- [ ] Implementacja funkcji: getStoryItems, getStoryItemDetails, createStoryItem, updateStoryItem, deleteStoryItem
- [ ] Implementacja ownership functions: changeStoryItemOwner, getOwnershipHistory, addHistoricalOwner
- [ ] Entity mentions sync (extract z description_json)

### Krok 3: React Query hooks
- [ ] Utworzyć `src/hooks/useStoryItems.ts`
- [ ] Implementacja query hooks: useStoryItemsQuery, useStoryItemDetailsQuery, useOwnershipHistoryQuery
- [ ] Implementacja mutation hooks: useCreateStoryItemMutation, useUpdateStoryItemMutation, useDeleteStoryItemMutation, useChangeOwnerMutation, useAddHistoricalOwnerMutation

### Krok 4: Utility functions
- [ ] Utworzyć `src/lib/utils/story-items.utils.ts`
- [ ] `getOwnerTypeIcon(type)` - ikona dla owner type
- [ ] `getOwnerTypePath(type, campaignId, ownerId)` - URL do owner's page
- [ ] `checkOverlappingPeriods(newEntry, existing)` - validation helper

### Krok 5: Base components (bottom-up)

**5a. OwnershipTimeline**
- [ ] Utworzyć `src/components/story-items/OwnershipTimeline.tsx`
- [ ] Vertical timeline layout z CSS
- [ ] Timeline entries z avatar/icon + period
- [ ] Current owner marker ("Present")

**5b. StoryItemCard**
- [ ] Utworzyć `src/components/story-items/StoryItemCard.tsx`
- [ ] Horizontal card: image + content
- [ ] Owner badge display
- [ ] Selected state styling

**5c. StoryItemFiltersCompact**
- [ ] Utworzyć `src/components/story-items/StoryItemFiltersCompact.tsx`
- [ ] Popover z Owner Type RadioGroup
- [ ] Specific Owner Select (conditional)
- [ ] Active filters chips + clear button

### Krok 6: List component
- [ ] Utworzyć `src/components/story-items/StoryItemsList.tsx`
- [ ] Search input (debounced)
- [ ] Sort select
- [ ] Filters integration
- [ ] Scrollable list z StoryItemCard
- [ ] Empty state

### Krok 7: Detail panel
- [ ] Utworzyć `src/components/story-items/StoryItemDetailPanel.tsx`
- [ ] NoSelectionState
- [ ] ViewMode: image, header, owner section, description, history, backlinks
- [ ] EditMode: inline editing (name, image, description)
- [ ] Integration z OwnershipTimeline
- [ ] Edit/Save/Cancel logic

### Krok 8: Dialogs

**8a. StoryItemFormDialog**
- [ ] Utworzyć `src/components/story-items/forms/StoryItemFormDialog.tsx`
- [ ] React Hook Form + Zod validation
- [ ] Fields: name, description (Tiptap), image, owner type, owner
- [ ] Conditional owner select

**8b. ChangeOwnerDialog**
- [ ] Utworzyć `src/components/story-items/forms/ChangeOwnerDialog.tsx`
- [ ] Form: new owner type, new owner, add to history checkbox, period end
- [ ] Conditional fields

**8c. AddHistoricalOwnerDialog**
- [ ] Utworzyć `src/components/story-items/forms/AddHistoricalOwnerDialog.tsx`
- [ ] Form: owner type, owner, period start, period end
- [ ] Overlapping periods warning

### Krok 9: Layout wrapper
- [ ] Utworzyć `src/components/story-items/StoryItemsLayout.tsx`
- [ ] SplitLayout integration (30/70)
- [ ] StoryItemsList w left panel
- [ ] StoryItemDetailPanel w right panel

### Krok 10: Header component
- [ ] Utworzyć `src/components/story-items/StoryItemsHeader.tsx`
- [ ] Breadcrumb navigation
- [ ] Title + Add button

### Krok 11: Main page component
- [ ] Utworzyć `src/app/(dashboard)/campaigns/[id]/story-items/page.tsx`
- [ ] URL-driven selection (searchParams)
- [ ] State management (filters, dialogs, editing)
- [ ] React Query hooks integration
- [ ] Orchestration wszystkich komponentów
- [ ] Loading/error states

### Krok 12: Styling i responsywność
- [ ] Timeline line CSS (::before pseudo-element)
- [ ] Hover states i transitions
- [ ] Dark mode support
- [ ] Responsive adjustments (mobile)

### Krok 13: @Mentions integration
- [ ] Verify Tiptap @mentions extension
- [ ] Campaign entities autocomplete
- [ ] Server-side mentions extraction (API)
- [ ] Backlinks integration

### Krok 14: Accessibility
- [ ] ARIA labels i landmarks
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Focus management

### Krok 15: Testing
- [ ] Manual testing full flow
- [ ] Edge cases (deleted owners, overlapping periods)
- [ ] Keyboard navigation testing
- [ ] Error handling testing

### Krok 16: Navigation integration
- [ ] Add "Story Items" link do campaign sidebar
- [ ] Verify breadcrumb navigation
- [ ] Deep linking test

### Krok 17: Dokumentacja
- [ ] JSDoc comments
- [ ] Cleanup console.logs
- [ ] Update CLAUDE.md (if needed)

## 13. Kluczowe różnice od obecnego planu

### ❌ Obecny plan (niespójny):
- Grid layout (3 kolumny)
- Slideover do szczegółów (width 600px)
- Modały do tworzenia/edycji

### ✅ Zaktualizowany plan (zgodny z architekturą):
- **SplitLayout (30/70)** - jak NPCs/Quests/Lore
- **URL-driven selection** - deep linking
- **Inline editing** w detail panel - spójny UX
- **Dialog** do tworzenia - shadcn Dialog
- **Compact filters** w Popover - wzorzec z innych widoków
- **Fantasy calendar** - free text (jak Timeline)
- **Max 10 history entries** - rozsądny limit
- **Overlapping validation** - warning, non-blocking
- **Ownership timeline** - chronologiczny porządek

## 14. Kluczowe decyzje projektowe

1. **Layout:** SplitLayout dla consistency z resztą app
2. **Calendar format:** Free text dla flexibility
3. **Owner tracking:** Polymorphic (NPC/PC/Faction/Location/Unknown)
4. **History limit:** 10 entries max
5. **Overlapping periods:** Warning only (allow duplicates)
6. **Image storage:** WebP compression, 5 MB limit
7. **@Mentions:** Auto-sync do entity_mentions table
8. **Filters:** Compact popover pattern
9. **URL state:** selectedId w search params
10. **Edit mode:** Inline editing (not dialog)
