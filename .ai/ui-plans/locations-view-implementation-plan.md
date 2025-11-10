# Plan implementacji widoku Locations

## 1. Przegląd

Widok Locations zapewnia kompleksowe narzędzie do zarządzania hierarchiczną strukturą lokacji w kampanii RPG. Głównym celem jest umożliwienie Mistrzowi Gry tworzenia, organizowania i przeglądania lokacji w formie drzewa hierarchicznego (np. kontynent → królestwo → miasto → budynek → dungeon). Widok oferuje split panel z drzewem hierarchicznym po lewej stronie (30%) i szczegółami lokacji po prawej (70%), obsługę rich text z @mentions, upload obrazów z kompresją WebP oraz śledzenie relacji między lokacjami poprzez system backlinks.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/campaigns/[id]/locations`

Dynamiczny parametr `[id]` reprezentuje identyfikator kampanii (campaign ID).

## 3. Struktura komponentów

```
LocationsView (główny widok, src/app/(dashboard)/campaigns/[id]/locations/page.tsx)
├── LocationsHeader
│   ├── Breadcrumb (shadcn)
│   ├── H1: "Locations"
│   └── AddLocationButton (Dialog trigger)
├── LocationsLayout (Split view - 30/70)
│   ├── LocationsTree (Left Panel - 30%)
│   │   ├── TreeRoot (dnd-kit)
│   │   └── LocationTreeNode[] (rekurencyjny komponent)
│   │       ├── LocationIcon (typ-based)
│   │       ├── LocationName
│   │       ├── ChildrenCountBadge
│   │       └── ExpandCollapseButton
│   └── LocationDetailsPanel (Right Panel - 70%)
│       ├── EmptyState (gdy nie wybrano lokacji)
│       │   └── RootLocationsGrid
│       │       └── LocationCard[]
│       └── LocationDetails (gdy wybrano lokację)
│           ├── LocationImage (opcjonalne)
│           ├── LocationHeader
│           │   ├── EditableLocationName (inline edit)
│           │   ├── LocationTypeBadge
│           │   └── BreadcrumbNavigation
│           ├── RichTextEditor (Tiptap z @mentions)
│           ├── CoordinatesInput (opcjonalne, lat/lng)
│           ├── BacklinksSection ("Mentioned In")
│           │   └── BacklinkItem[]
│           ├── ChildrenSection
│           │   ├── ChildLocationCard[]
│           │   └── AddChildButton
│           └── DeleteLocationButton
└── LocationFormDialog (Shadcn Dialog)
    ├── LocationForm (React Hook Form + Zod)
    │   ├── NameInput (required)
    │   ├── TypeSelect (kontynent/królestwo/miasto/budynek/dungeon/inne)
    │   ├── ParentLocationSelect (hierarchical dropdown, opcjonalne)
    │   ├── RichTextEditor (Tiptap z @mentions)
    │   ├── ImageUpload (drag & drop zone, max 5 MB)
    │   └── CoordinatesInputs (lat/lng, opcjonalne)
    └── DialogFooter
        ├── CancelButton
        └── SubmitButton ("Create Location" / "Save Changes")
```

## 4. Szczegóły komponentów

### 4.1. LocationsView (główny widok)

**Opis:** Root komponent widoku, odpowiada za orchestrację wszystkich pozostałych komponentów oraz zarządzanie wysokopoziomowym stanem widoku (wybrana lokacja, otwarte dialogi).

**Główne elementy:**
- Kontener typu "flex flex-col h-full"
- LocationsHeader jako pierwsza sekcja
- LocationsLayout zajmujący pozostałą przestrzeń (flex-1)
- LocationFormDialog renderowany warunkowo

**Obsługiwane zdarzenia:**
- `onLocationSelect(locationId: string)` - obsługa wyboru lokacji z drzewa lub gridu
- `onOpenCreateDialog()` - otwarcie dialogu tworzenia nowej lokacji
- `onOpenEditDialog(locationId: string)` - otwarcie dialogu edycji lokacji
- `onCloseDialog()` - zamknięcie dialogu

**Warunki walidacji:**
- Sprawdzenie czy użytkownik ma dostęp do kampanii (campaign ID z URL)
- Walidacja czy campaign ID jest poprawnym UUID
- Obsługa stanu ładowania przy pobieraniu listy lokacji

**Typy:**
- `Location` - główny typ reprezentujący lokację z bazy danych
- `CreateLocationCommand` - typ dla tworzenia nowej lokacji
- `UpdateLocationCommand` - typ dla aktualizacji lokacji

**Propsy:**
- `params: { id: string }` - parametr z Next.js App Router (campaign ID)

### 4.2. LocationsHeader

**Opis:** Nagłówek widoku zawierający breadcrumb, tytuł i przycisk dodawania lokacji.

**Główne elementy:**
- Breadcrumb (shadcn) z linkami: "My Campaigns" → "[Campaign Name]" → "Locations"
- H1 z tekstem "Locations"
- Button z ikoną "+" i tekstem "Add Location" (variant: emerald)

**Obsługiwane zdarzenia:**
- `onClick` na Button - trigger dialog tworzenia lokacji

**Warunki walidacji:**
- Brak specyficznych warunków walidacji

**Typy:**
- Brak specyficznych custom typów

**Propsy:**
```typescript
interface LocationsHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddLocationClick: () => void;
}
```

### 4.3. LocationsTree

**Opis:** Panel po lewej stronie (30% szerokości) wyświetlający hierarchiczne drzewo lokacji z możliwością drag & drop do zmiany parent location.

**Główne elementy:**
- ScrollArea (shadcn) zawierający listę root lokacji
- LocationTreeNode[] dla każdej root lokacji (rekurencyjne renderowanie dzieci)
- Obsługa dnd-kit dla drag & drop

**Obsługiwane zdarzenia:**
- `onClick(locationId: string)` - wybór lokacji do wyświetlenia w prawym panelu
- `onDragEnd(locationId: string, newParentId: string | null)` - zmiana parent location przez drag & drop
- `onExpandToggle(locationId: string)` - expand/collapse node z dziećmi

**Warunki walidacji:**
- Walidacja czy nowy parent nie tworzy cyklicznej referencji (prevent circular references)
- Sprawdzenie czy przeciągana lokacja nie jest przeciągana na siebie samą lub swoje dziecko

**Typy:**
- `Location` - główny typ lokacji
- `LocationTreeData` - typ pomocniczy z dodatkowymi informacjami o expand state:
  ```typescript
  interface LocationTreeData {
    location: Location;
    children: LocationTreeData[];
    isExpanded: boolean;
    childrenCount: number;
  }
  ```

**Propsy:**
```typescript
interface LocationsTreeProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
  onLocationMove: (locationId: string, newParentId: string | null) => void;
}
```

### 4.4. LocationTreeNode

**Opis:** Pojedynczy node w drzewie hierarchii, renderowany rekurencyjnie dla dzieci. Obsługuje expand/collapse oraz drag & drop.

**Główne elementy:**
- Container div z padding i hover state
- Icon reprezentująca typ lokacji (kontynent/królestwo/miasto/budynek/dungeon/inne)
- Nazwa lokacji (truncate dla długich nazw)
- Badge z liczbą dzieci (jeśli > 0)
- Expand/collapse button (jeśli ma dzieci)
- Rekurencyjne renderowanie dzieci (jeśli expanded)

**Obsługiwane zdarzenia:**
- `onClick` - wybór lokacji
- `onExpandToggle` - expand/collapse dzieci
- Drag & Drop events (dnd-kit): `onDragStart`, `onDragOver`, `onDragEnd`

**Warunki walidacji:**
- Brak specyficznych warunków (walidacja w LocationsTree)

**Typy:**
- `LocationTreeData` (jak wyżej)

**Propsy:**
```typescript
interface LocationTreeNodeProps {
  node: LocationTreeData;
  isSelected: boolean;
  onSelect: (locationId: string) => void;
  onToggleExpand: (locationId: string) => void;
  level: number; // dla wcięcia (indentation)
}
```

### 4.5. LocationDetailsPanel

**Opis:** Panel po prawej stronie (70% szerokości) wyświetlający szczegóły wybranej lokacji lub grid root locations (jeśli nic nie wybrano).

**Główne elementy:**
- Warunkowo renderuje EmptyState z RootLocationsGrid LUB LocationDetails
- ScrollArea (shadcn) dla przewijania długich treści

**Obsługiwane zdarzenia:**
- Przekazuje eventy do LocationDetails lub RootLocationsGrid

**Warunki walidacji:**
- Sprawdzenie czy selectedLocationId jest poprawnym UUID
- Obsługa stanu ładowania podczas pobierania szczegółów lokacji

**Typy:**
- `Location` - pełne dane lokacji
- `LocationDetailsViewModel` - rozszerzony typ z dodatkowymi danymi:
  ```typescript
  interface LocationDetailsViewModel {
    location: Location;
    breadcrumb: { id: string; name: string }[];
    backlinks: BacklinkItem[];
    children: Location[];
  }
  ```

**Propsy:**
```typescript
interface LocationDetailsPanelProps {
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
  onEditLocation: (locationId: string) => void;
  onDeleteLocation: (locationId: string) => void;
}
```

### 4.6. LocationDetails

**Opis:** Karta szczegółów wybranej lokacji z możliwością edycji inline (nazwa) i rich text editing (opis).

**Główne elementy:**
- LocationImage (jeśli image_url istnieje) - wysokość 400px, object-fit: cover
- LocationHeader:
  - EditableLocationName (inline edit z auto-save on blur)
  - LocationTypeBadge (kolorowy badge z ikoną)
  - BreadcrumbNavigation (klikalne linki do parent locations)
- RichTextEditor (Tiptap) dla description_json z @mentions
- CoordinatesInput (opcjonalne pola lat/lng)
- BacklinksSection - lista miejsc gdzie lokacja jest @mentioned
- ChildrenSection - grid child locations z AddChildButton
- DeleteLocationButton (destructive variant, z confirm dialog jeśli ma dzieci)

**Obsługiwane zdarzenia:**
- `onNameChange(newName: string)` - inline edit nazwy z auto-save
- `onDescriptionChange(descriptionJson: Json)` - auto-save description on blur
- `onImageUpload(file: File)` - upload i kompresja obrazu
- `onCoordinatesChange(lat: number, lng: number)` - update współrzędnych
- `onDeleteClick()` - otwarcie confirm dialog przed usunięciem

**Warunki walidacji:**
- Name: required, min 1 znak, max 255 znaków
- Image: max 5 MB, typy: image/jpeg, image/png, image/webp
- Coordinates: lat w zakresie -90 do 90, lng w zakresie -180 do 180
- Delete: confirmation required jeśli location ma dzieci (child locations)

**Typy:**
- `LocationDetailsViewModel` (jak wyżej)
- `BacklinkItem`:
  ```typescript
  interface BacklinkItem {
    source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item';
    source_id: string;
    source_name: string;
    source_field: string;
  }
  ```
- `Coordinates`:
  ```typescript
  interface Coordinates {
    lat: number;
    lng: number;
  }
  ```

**Propsy:**
```typescript
interface LocationDetailsProps {
  locationDetails: LocationDetailsViewModel;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (descriptionJson: Json) => Promise<void>;
  onImageUpdate: (imageUrl: string) => Promise<void>;
  onCoordinatesUpdate: (coordinates: Coordinates | null) => Promise<void>;
  onDelete: () => Promise<void>;
  onNavigateToLocation: (locationId: string) => void;
}
```

### 4.7. RootLocationsGrid

**Opis:** Grid wyświetlający root locations (te bez parent_location_id) gdy żadna lokacja nie jest wybrana.

**Główne elementy:**
- Grid layout (3-4 kolumny, responsive)
- LocationCard[] dla każdej root lokacji

**Obsługiwane zdarzenia:**
- `onClick(locationId: string)` - wybór lokacji z gridu

**Warunki walidacji:**
- Filtrowanie lokacji gdzie parent_location_id === null

**Typy:**
- `Location` - podstawowy typ lokacji

**Propsy:**
```typescript
interface RootLocationsGridProps {
  rootLocations: Location[];
  onLocationSelect: (locationId: string) => void;
}
```

### 4.8. LocationCard

**Opis:** Karta reprezentująca pojedynczą lokację w gridzie, wyświetla obraz, nazwę, typ i liczę dzieci.

**Główne elementy:**
- Image (jeśli image_url istnieje) - wysokość 200px
- Nazwa lokacji (H3)
- LocationTypeBadge
- Badge z liczbą dzieci (jeśli > 0)
- Hover effect dla interaktywności

**Obsługiwane zdarzenia:**
- `onClick` - wybór lokacji

**Warunki walidacji:**
- Brak specyficznych warunków

**Typy:**
- `Location`
- `LocationCardViewModel`:
  ```typescript
  interface LocationCardViewModel {
    location: Location;
    childrenCount: number;
  }
  ```

**Propsy:**
```typescript
interface LocationCardProps {
  location: LocationCardViewModel;
  onClick: (locationId: string) => void;
}
```

### 4.9. LocationFormDialog

**Opis:** Modal dialog (Shadcn Dialog) do tworzenia i edycji lokacji. Obsługuje React Hook Form z walidacją Zod.

**Główne elementy:**
- Dialog (shadcn) z title "Create Location" lub "Edit Location"
- LocationForm (React Hook Form) zawierający:
  - Input dla nazwy (required)
  - Select dla typu lokacji (kontynent/królestwo/miasto/budynek/dungeon/inne)
  - Hierarchical Select dla parent location (opcjonalne)
  - RichTextEditor (Tiptap) dla opisu
  - ImageUpload (drag & drop zone z preview)
  - Dwa Inputs dla coordinates (lat/lng, opcjonalne)
- DialogFooter z przyciskami Cancel i Submit

**Obsługiwane zdarzenia:**
- `onSubmit(data: CreateLocationCommand | UpdateLocationCommand)` - submit formularza
- `onCancel()` - zamknięcie dialogu bez zapisywania
- `onImageDrop(file: File)` - upload obrazu z drag & drop

**Warunki walidacji:**
- **Name**: required, min 1 znak, max 255 znaków, trim whitespace
- **Type**: required, musi być jednym z: kontynent, królestwo, miasto, budynek, dungeon, inne
- **Parent Location**: opcjonalne, musi być poprawnym UUID, prevent circular references (nie może być location_id lub dzieckiem tego location)
- **Description**: opcjonalne, valid Tiptap JSON
- **Image**: opcjonalne, max 5 MB, typy: image/jpeg, image/png, image/webp
- **Coordinates**: opcjonalne, ale jeśli podane to:
  - Lat: number w zakresie -90 do 90
  - Lng: number w zakresie -180 do 180

**Typy:**
- `CreateLocationCommand` - dane do tworzenia lokacji
- `UpdateLocationCommand` - dane do aktualizacji lokacji
- `LocationFormData` - typ formularza:
  ```typescript
  interface LocationFormData {
    name: string;
    location_type: string;
    parent_location_id?: string | null;
    description_json?: Json | null;
    image_url?: string | null;
    coordinates_json?: { lat: number; lng: number } | null;
  }
  ```

**Propsy:**
```typescript
interface LocationFormDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: UpdateLocationCommand; // dla edit mode
  parentLocationId?: string | null; // dla pre-fill parent w create mode
  onClose: () => void;
  onSubmit: (data: CreateLocationCommand | UpdateLocationCommand) => Promise<void>;
}
```

### 4.10. ImageUpload

**Opis:** Komponent do uploadu obrazów z drag & drop, preview i kompresją do WebP.

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

### 4.11. RichTextEditor (Tiptap z @mentions)

**Opis:** Rich text editor oparty na Tiptap z custom extension dla @mentions do linkowania encji kampanii.

**Główne elementy:**
- EditorContent (Tiptap) z toolbar
- Toolbar z przyciskami formatowania (bold, italic, headings, lists, etc.)
- @Mentions dropdown z autocomplete przy wpisaniu "@"
- Character counter (opcjonalnie)

**Obsługiwane zdarzenia:**
- `onChange(json: Json)` - update description_json on blur (auto-save)
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
- `TiptapContent` (Json type dla description_json)

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

## 5. Typy

### 5.1. Entity Types (z database.ts)

```typescript
// Główny typ lokacji z bazy danych
export type Location = Tables<'locations'>;

// Struktura z database.ts
interface LocationRow {
  id: string; // uuid, primary key
  campaign_id: string; // uuid, foreign key
  name: string; // varchar(255)
  location_type: string; // varchar(50)
  description_json: Json | null; // jsonb (Tiptap rich text)
  parent_location_id: string | null; // uuid, foreign key (self-reference)
  image_url: string | null; // text
  coordinates_json: Json | null; // jsonb: {lat: number, lng: number}
  created_at: string; // timestamp
  updated_at: string; // timestamp
}
```

### 5.2. Command Models

```typescript
// Tworzenie nowej lokacji
export interface CreateLocationCommand {
  name: string; // required, min 1, max 255
  location_type: string; // required, enum
  description_json?: Json | null; // opcjonalne
  parent_location_id?: string | null; // opcjonalne
  image_url?: string | null; // opcjonalne
  coordinates_json?: Json | null; // opcjonalne
}

// Aktualizacja istniejącej lokacji (partial update)
export interface UpdateLocationCommand {
  name?: string;
  location_type?: string;
  description_json?: Json | null;
  parent_location_id?: string | null;
  image_url?: string | null;
  coordinates_json?: Json | null;
}
```

### 5.3. Filter Types

```typescript
export interface LocationFilters {
  location_type?: string; // filtrowanie po typie
  parent_location_id?: string | null; // filtrowanie po parent (null = root locations)
}
```

### 5.4. View Models

```typescript
// Rozszerzony typ dla drzewa hierarchii
interface LocationTreeData {
  location: Location;
  children: LocationTreeData[]; // rekurencyjnie zagnieżdżone dzieci
  isExpanded: boolean; // stan expand/collapse
  childrenCount: number; // liczba bezpośrednich dzieci
}

// Rozszerzony typ dla szczegółów lokacji
interface LocationDetailsViewModel {
  location: Location;
  breadcrumb: BreadcrumbItem[]; // ścieżka od root do tej lokacji
  backlinks: BacklinkItem[]; // miejsca gdzie lokacja jest @mentioned
  children: Location[]; // bezpośrednie dzieci
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item';
  source_id: string;
  source_name: string;
  source_field: string; // np. "description_json"
}

// Typ dla karty lokacji w gridzie
interface LocationCardViewModel {
  location: Location;
  childrenCount: number;
}

// Typ dla współrzędnych
interface Coordinates {
  lat: number; // -90 do 90
  lng: number; // -180 do 180
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
// Typ danych formularza (React Hook Form)
interface LocationFormData {
  name: string;
  location_type: string;
  parent_location_id?: string | null;
  description_json?: Json | null;
  image_url?: string | null;
  coordinates_json?: { lat: number; lng: number } | null;
}

// Enum dla typów lokacji
enum LocationType {
  CONTINENT = 'kontynent',
  KINGDOM = 'królestwo',
  CITY = 'miasto',
  BUILDING = 'budynek',
  DUNGEON = 'dungeon',
  OTHER = 'inne'
}
```

## 6. Zarządzanie stanem

### 6.1. Server State - React Query

Widok wykorzystuje **React Query** (TanStack Query v5) do zarządzania stanem serwera (lokacje z bazy danych).

**Custom Hooks (src/hooks/useLocations.ts):**

```typescript
// Query: pobieranie wszystkich lokacji kampanii
export function useLocationsQuery(campaignId: string, filters?: LocationFilters) {
  return useQuery({
    queryKey: ['locations', campaignId, filters],
    queryFn: () => getLocations(campaignId, filters),
    enabled: !!campaignId,
  });
}

// Query: pobieranie pojedynczej lokacji z dodatkowymi danymi (breadcrumb, backlinks, children)
export function useLocationDetailsQuery(locationId: string) {
  return useQuery({
    queryKey: ['location', locationId, 'details'],
    queryFn: async () => {
      // Równoległe pobieranie lokacji, breadcrumb, backlinks i children
      const location = await getLocation(locationId);
      // TODO: API endpoint do breadcrumb, backlinks, children
      return {
        location,
        breadcrumb: [], // z API
        backlinks: [], // z API
        children: [], // z API
      };
    },
    enabled: !!locationId,
  });
}

// Mutation: tworzenie lokacji
export function useCreateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, command }: { campaignId: string; command: CreateLocationCommand }) =>
      createLocation(campaignId, command),
    onMutate: async ({ campaignId, command }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['locations', campaignId] });
      const previousLocations = queryClient.getQueryData(['locations', campaignId]);

      const optimisticLocation: Location = {
        id: 'temp-id',
        campaign_id: campaignId,
        ...command,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['locations', campaignId], (old: Location[]) =>
        [optimisticLocation, ...(old || [])]
      );

      return { previousLocations };
    },
    onError: (err, { campaignId }, context) => {
      // Rollback na błąd
      queryClient.setQueryData(['locations', campaignId], context?.previousLocations);
      toast.error('Failed to create location');
    },
    onSuccess: (newLocation, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['locations', campaignId] });
      toast.success('Location created successfully');
    },
  });
}

// Mutation: aktualizacja lokacji
export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, command }: { locationId: string; command: UpdateLocationCommand }) =>
      updateLocation(locationId, command),
    onSuccess: (updatedLocation) => {
      // Invalidate queries dla campaign locations
      queryClient.invalidateQueries({ queryKey: ['locations', updatedLocation.campaign_id] });
      // Invalidate query dla konkretnej lokacji
      queryClient.invalidateQueries({ queryKey: ['location', updatedLocation.id] });
      toast.success('Location updated successfully');
    },
    onError: () => {
      toast.error('Failed to update location');
    },
  });
}

// Mutation: usuwanie lokacji
export function useDeleteLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => deleteLocation(locationId),
    onSuccess: (_, locationId) => {
      // Invalidate wszystkie lokacje (będą ponownie pobrane)
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete location');
    },
  });
}
```

### 6.2. Local State - React useState

Widok wykorzystuje lokalny state (useState) dla ephemeralnych stanów UI:

```typescript
// W komponencie LocationsView
const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

// W LocationsTree
const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null>(null);

// W LocationFormDialog
const [isSubmitting, setIsSubmitting] = useState(false);
const [imageUploadProgress, setImageUploadProgress] = useState(0);
```

### 6.3. Campaign Context

Widok korzysta z globalnego **campaignStore** (Zustand) aby pobrać aktualnie wybraną kampanię:

```typescript
// src/stores/campaignStore.ts
const selectedCampaign = useCampaignStore(state => state.selectedCampaign);
```

### 6.4. Form State - React Hook Form

Formularz w LocationFormDialog wykorzystuje React Hook Form z walidacją Zod:

```typescript
const form = useForm<LocationFormData>({
  resolver: zodResolver(locationFormSchema),
  defaultValues: {
    name: '',
    location_type: 'miasto',
    parent_location_id: null,
    description_json: null,
    image_url: null,
    coordinates_json: null,
  },
});
```

**Nie jest wymagany dedykowany custom hook** dla zarządzania stanem widoku - React Query + lokalny useState są wystarczające.

## 7. Integracja API

Widok integruje się z API poprzez warstwę abstrakcji `src/lib/api/locations.ts`, która wykorzystuje **Supabase Client**.

### 7.1. API Functions

```typescript
// src/lib/api/locations.ts

/**
 * GET - Pobieranie wszystkich lokacji kampanii
 * Query parameters: location_type, parent_location_id (filters)
 */
export async function getLocations(
  campaignId: string,
  filters?: LocationFilters
): Promise<Location[]>

/**
 * GET - Pobieranie pojedynczej lokacji
 */
export async function getLocation(locationId: string): Promise<Location>

/**
 * POST - Tworzenie nowej lokacji
 */
export async function createLocation(
  campaignId: string,
  command: CreateLocationCommand
): Promise<Location>

/**
 * PATCH - Aktualizacja lokacji (partial update)
 */
export async function updateLocation(
  locationId: string,
  command: UpdateLocationCommand
): Promise<Location>

/**
 * DELETE - Usuwanie lokacji
 * Child locations będą miały parent_location_id ustawione na NULL (ON DELETE SET NULL)
 */
export async function deleteLocation(locationId: string): Promise<void>
```

### 7.2. Request/Response Types

**getLocations:**
- Request: `campaignId: string`, `filters?: LocationFilters`
- Response: `Location[]` (sortowane created_at DESC)

**getLocation:**
- Request: `locationId: string`
- Response: `Location`

**createLocation:**
- Request: `campaignId: string`, `command: CreateLocationCommand`
  ```typescript
  {
    name: string;
    location_type: string;
    description_json?: Json | null;
    parent_location_id?: string | null;
    image_url?: string | null;
    coordinates_json?: Json | null;
  }
  ```
- Response: `Location` (pełny obiekt z wygenerowanym ID)

**updateLocation:**
- Request: `locationId: string`, `command: UpdateLocationCommand`
  ```typescript
  {
    name?: string;
    location_type?: string;
    description_json?: Json | null;
    parent_location_id?: string | null;
    image_url?: string | null;
    coordinates_json?: Json | null;
  }
  ```
- Response: `Location` (zaktualizowany obiekt)

**deleteLocation:**
- Request: `locationId: string`
- Response: `void` (204 No Content)

### 7.3. Rozszerzone API Endpoints (do implementacji)

Widok będzie wymagał dodatkowych API endpoints dla breadcrumb, backlinks i children:

```typescript
/**
 * GET - Pobieranie lokacji z dodatkowymi danymi (breadcrumb, backlinks, children)
 * Query parameters: include=breadcrumb,backlinks,children
 */
export async function getLocationWithDetails(
  locationId: string,
  include?: string[]
): Promise<LocationDetailsViewModel>

/**
 * PATCH - Zmiana parent location (dla drag & drop)
 * Walidacja circular references server-side
 */
export async function moveLocation(
  locationId: string,
  newParentId: string | null
): Promise<Location>
```

### 7.4. Image Upload

Upload obrazów wykorzystuje **Supabase Storage**:

```typescript
// src/lib/api/storage.ts

/**
 * Upload obrazu do Supabase Storage z kompresją do WebP
 * Bucket: 'location-images'
 */
export async function uploadLocationImage(
  campaignId: string,
  file: File
): Promise<string> {
  // 1. Client-side kompresja do WebP (max 5 MB)
  const compressedFile = await compressImageToWebP(file, 5 * 1024 * 1024);

  // 2. Upload do Supabase Storage
  const fileName = `${campaignId}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
  const { data, error } = await supabase.storage
    .from('location-images')
    .upload(fileName, compressedFile);

  if (error) throw error;

  // 3. Zwróć public URL
  const { data: { publicUrl } } = supabase.storage
    .from('location-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Usuwanie obrazu z Supabase Storage
 */
export async function deleteLocationImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const fileName = imageUrl.split('/location-images/')[1];

  const { error } = await supabase.storage
    .from('location-images')
    .remove([fileName]);

  if (error) throw error;
}
```

### 7.5. Security - RLS

Wszystkie operacje są zabezpieczone przez **Row-Level Security (RLS)** w Supabase. User może tylko:
- Odczytywać lokacje z własnych kampanii
- Tworzyć lokacje w własnych kampaniach
- Aktualizować/usuwać lokacje z własnych kampanii

RLS policies są zdefiniowane na poziomie bazy danych (poza zakresem frontendu).

## 8. Interakcje użytkownika

### 8.1. Przeglądanie lokacji

1. **Widok początkowy (brak wybranej lokacji):**
   - User widzi empty state z gridem root locations
   - Grid wyświetla karty lokacji (obraz, nazwa, typ, liczba dzieci)
   - **Akcja:** Click na kartę → wybór lokacji → pokazanie szczegółów w prawym panelu

2. **Nawigacja w drzewie hierarchii:**
   - User widzi drzewo lokacji w lewym panelu (30%)
   - Lokacje z dziećmi mają expand/collapse button
   - **Akcja:** Click na expand button → rozwinięcie dzieci
   - **Akcja:** Click na nazwę lokacji → wybór lokacji → pokazanie szczegółów

3. **Breadcrumb navigation:**
   - W szczegółach lokacji widoczny breadcrumb (np. Faerûn > Sword Coast > Waterdeep)
   - **Akcja:** Click na parent w breadcrumb → nawigacja do parent location

### 8.2. Tworzenie nowej lokacji

1. **Otwarcie dialogu:**
   - **Akcja:** Click na "Add Location" button w header → otwarcie LocationFormDialog

2. **Wypełnienie formularza:**
   - User wprowadza nazwę (required)
   - User wybiera typ z dropdown (kontynent/królestwo/miasto/budynek/dungeon/inne)
   - User opcjonalnie wybiera parent location z hierarchical dropdown
   - User opcjonalnie pisze opis w rich text editorze (z @mentions)
   - User opcjonalnie uploaduje obraz (drag & drop lub file picker)
   - User opcjonalnie wprowadza współrzędne (lat/lng)

3. **Walidacja:**
   - Real-time walidacja pól (React Hook Form + Zod)
   - Wyświetlanie błędów walidacji pod polami
   - Submit button disabled jeśli form invalid

4. **Submit:**
   - **Akcja:** Click "Create Location" → wywołanie mutation
   - Optimistic update - lokacja od razu pojawia się w liście
   - Pokazanie loading state na przycisku
   - Toast notification po sukcesie/błędzie
   - Zamknięcie dialogu po sukcesie

### 8.3. Edycja lokacji

1. **Inline edit nazwy:**
   - **Akcja:** Click na nazwę lokacji w szczegółach → input field
   - User edytuje nazwę
   - **Akcja:** Blur z inputa (kliknięcie poza) → auto-save (mutation)
   - Toast notification po sukcesie/błędzie

2. **Edycja opisu:**
   - User edytuje opis w rich text editorze
   - **Akcja:** Blur z editora → auto-save (mutation)
   - Toast notification po sukcesie

3. **Zmiana typu/parent/coordinates:**
   - Wymaga otwarcia LocationFormDialog w trybie edit
   - Flow podobny do tworzenia, ale z pre-fill danymi

### 8.4. Upload obrazu

1. **Drag & drop:**
   - User przeciąga plik obrazu nad drag & drop zone
   - Visual feedback (highlight border)
   - **Akcja:** Drop pliku → walidacja (max 5 MB, typy) → kompresja → upload
   - Progress bar podczas uploadu
   - Preview obrazu po sukcesie

2. **File picker:**
   - **Akcja:** Click "Upload Image" → otwarcie file picker
   - User wybiera plik
   - Flow identyczny jak drag & drop

3. **Usuwanie obrazu:**
   - **Akcja:** Click delete button na preview → usunięcie obrazu
   - Confirmation dialog: "Are you sure?"
   - Usunięcie z Supabase Storage i update location (image_url = null)

### 8.5. Drag & Drop w drzewie hierarchii

1. **Rozpoczęcie drag:**
   - User przeciąga lokację w drzewie (drag handle)
   - Visual feedback - node highlighted, cursor zmienia się

2. **Drop na target:**
   - User przeciąga nad inną lokację (potencjalny parent)
   - Visual feedback - drop target highlighted
   - **Akcja:** Drop → walidacja (prevent circular reference) → mutation
   - Optimistic update - node przenosi się w drzewie
   - Toast notification po sukcesie/błędzie

3. **Drop na root:**
   - User przeciąga na specjalną "root zone" (top drzewa)
   - **Akcja:** Drop → ustawienie parent_location_id = null
   - Node staje się root location

### 8.6. @Mentions w rich text editorze

1. **Wpisanie "@":**
   - **Akcja:** User wpisuje "@" w editorze → dropdown z autocomplete
   - Dropdown pokazuje wszystkie encje kampanii (NPCs, locations, quests, etc.)

2. **Search:**
   - User wpisuje kolejne znaki (np. "@wat")
   - Fuzzy search filtruje wyniki real-time
   - Priorytetyzacja recently used entities

3. **Wybór mention:**
   - **Akcja:** Click na encję w dropdown (lub Enter) → wstawienie mention badge
   - Mention renderowany jako kolorowy badge z ikoną

4. **Interakcja z mention:**
   - **Hover:** pokazanie HoverCard z preview encji (nazwa, typ, miniatura)
   - **Click:** nawigacja do karty encji (nowa zakładka lub side panel)

### 8.7. Przeglądanie backlinks

1. **Sekcja "Mentioned In":**
   - Automatycznie wyświetlana w szczegółach lokacji
   - Lista wszystkich miejsc gdzie lokacja jest @mentioned
   - Każdy item: typ źródła (icon), nazwa źródła, link

2. **Nawigacja:**
   - **Akcja:** Click na backlink → nawigacja do źródła
   - Highlight mention w źródłowej treści (jeśli możliwe)

### 8.8. Zarządzanie dziećmi (children)

1. **Sekcja Children:**
   - Grid child locations w szczegółach parent location
   - Każde dziecko: karta z obrazem, nazwą, typem

2. **Dodawanie dziecka:**
   - **Akcja:** Click "Add Child" → otwarcie LocationFormDialog
   - Parent location automatycznie pre-fill jako parent_location_id

3. **Usuwanie dziecka:**
   - **Akcja:** Click delete na child card → confirmation → usunięcie
   - Child nie jest usuwany, tylko parent_location_id ustawiane na NULL (staje się root)

### 8.9. Usuwanie lokacji

1. **Akcja delete:**
   - **Akcja:** Click "Delete Location" (destructive button)
   - Jeśli lokacja ma dzieci → pokazanie ostrzeżenia w confirm dialog:
     - "This location has X children. Deleting it will move children to root level. Continue?"
   - **Akcja:** Confirm → mutation → usunięcie lokacji
   - Children automatycznie stają się root locations (parent_id = NULL via ON DELETE SET NULL)
   - Toast notification + nawigacja do root locations grid

## 9. Warunki i walidacja

### 9.1. Warunki walidacji formularza (client-side)

**LocationFormDialog (Zod schema):**

```typescript
const locationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  location_type: z.enum(['kontynent', 'królestwo', 'miasto', 'budynek', 'dungeon', 'inne'], {
    errorMap: () => ({ message: 'Invalid location type' }),
  }),
  parent_location_id: z.string().uuid().nullable().optional(),
  description_json: z.any().nullable().optional(), // Tiptap JSON
  image_url: z.string().url().nullable().optional(),
  coordinates_json: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
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

### 9.2. Warunki walidacji drag & drop (prevent circular references)

**W LocationsTree (client-side pre-validation):**

```typescript
function canDropLocation(draggedId: string, targetId: string | null, locations: Location[]): boolean {
  // Nie można przeciągać na siebie samą
  if (draggedId === targetId) return false;

  // Nie można przeciągać na swoje dziecko (zapobieganie circular reference)
  const isDescendant = (parentId: string, childId: string): boolean => {
    const children = locations.filter(loc => loc.parent_location_id === parentId);
    if (children.some(child => child.id === childId)) return true;
    return children.some(child => isDescendant(child.id, childId));
  };

  if (targetId && isDescendant(draggedId, targetId)) return false;

  return true;
}
```

**Server-side validation (w API):**
- Backend (Supabase funkcja lub Edge Function) waliduje circular references przy update parent_location_id
- Zwraca błąd 400 Bad Request jeśli circular reference wykryta

### 9.3. Warunki delete lokacji

**W LocationDetails (check children before delete):**

```typescript
async function handleDelete() {
  // Sprawdzenie czy lokacja ma dzieci
  const childrenCount = locationDetails.children.length;

  if (childrenCount > 0) {
    // Pokazanie confirm dialog z ostrzeżeniem
    const confirmed = await showConfirmDialog({
      title: 'Delete Location',
      message: `This location has ${childrenCount} child location(s). Deleting it will move children to root level. Continue?`,
      confirmText: 'Delete',
      confirmVariant: 'destructive',
    });

    if (!confirmed) return;
  }

  // Wywołanie mutation
  await deleteLocationMutation.mutateAsync(locationDetails.location.id);
}
```

### 9.4. Warunki dostępu (RLS)

**Row-Level Security policies (enforced server-side):**
- User może tylko czytać lokacje z kampanii, które należą do niego (user_id w campaigns table)
- User może tylko tworzyć lokacje w swoich kampaniach
- User może tylko aktualizować/usuwać lokacje z swoich kampanii

**Client-side:**
- Jeśli API zwróci 401 Unauthorized → redirect do /login
- Jeśli API zwróci 404 Not Found → pokazanie "Location not found" message
- Jeśli API zwróci 403 Forbidden → pokazanie "You don't have access to this campaign" message

### 9.5. Warunki UI

**Disabled states:**
- Submit button w formularzu disabled jeśli:
  - Form invalid (Zod validation failed)
  - Mutation w trakcie (isSubmitting = true)
- Delete button disabled jeśli mutation w trakcie
- Drag & drop disabled jeśli mutation w trakcie

**Loading states:**
- Skeleton loading dla drzewa lokacji podczas pobierania (useLocationsQuery)
- Skeleton loading dla szczegółów lokacji podczas pobierania (useLocationDetailsQuery)
- Spinner na submit button podczas mutation
- Progress bar podczas uploadu obrazu

**Empty states:**
- Jeśli brak lokacji w kampanii → pokazanie empty state z CTA "Create your first location"
- Jeśli brak children → sekcja children pusta z button "Add child location"
- Jeśli brak backlinks → sekcja backlinks pusta z message "No mentions yet"

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
  toast.error('Location not found.');
  // Nawigacja do locations list
  setSelectedLocationId(null);
}
```

**409 Conflict (circular reference):**
```typescript
if (error.code === '409') {
  toast.error('Cannot move location: circular reference detected.');
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
  const imageUrl = await uploadLocationImage(campaignId, file);
} catch (error) {
  toast.error('Failed to upload image. Please try again.');
  console.error('Upload error:', error);
}
```

### 10.4. Circular Reference Prevention

**Client-side pre-validation:**
- canDropLocation() funkcja w LocationsTree
- Disabled drop targets dla invalid moves
- Visual feedback (red border na invalid drop target)

**Server-side validation:**
- API zwraca 409 Conflict jeśli circular reference wykryta
- Toast notification z czytelnym komunikatem
- Rollback optimistic update

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
- Parent location circular reference check przed submit
- Coordinates range validation (-90 to 90 lat, -180 to 180 lng)

### 10.7. Rich Text Editor Errors

**Invalid JSON structure:**
```typescript
function isValidTiptapJson(json: any): boolean {
  return json?.type === 'doc' && Array.isArray(json?.content);
}

if (!isValidTiptapJson(descriptionJson)) {
  toast.error('Invalid description format. Please try again.');
  return;
}
```

**@Mention entity not found:**
- Server-side sprawdzenie czy mentioned entity istnieje
- Jeśli nie istnieje → usunięcie mention z description_json i toast warning
- Client-side: mention renderowany jako plain text jeśli entity nie może być pobrana

### 10.8. Logging

**Console logging dla debugowania:**
```typescript
// W każdej API funkcji
if (error) {
  console.error('Failed to create location:', error);
  throw new Error(error.message);
}
```

**Sentry (opcjonalnie, przyszłość):**
- Automatyczne logowanie błędów do Sentry
- Stack traces dla error debugging
- User context (campaign ID, location ID) dla lepszego debugowania

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików i typów

1.1. Weryfikacja typów w `src/types/locations.ts` - już zaimplementowane ✓

1.2. Weryfikacja API helpers w `src/lib/api/locations.ts` - już zaimplementowane ✓

1.3. Utworzenie Zod schema dla formularza:
- Plik: `src/lib/schemas/locations.ts`
- Schema: `locationFormSchema` (walidacja name, type, parent_id, coordinates)

1.4. Utworzenie struktury katalogów:
```
src/components/locations/
├── LocationsView.tsx
├── LocationsHeader.tsx
├── LocationsLayout.tsx
├── LocationsTree.tsx
├── LocationTreeNode.tsx
├── LocationDetailsPanel.tsx
├── LocationDetails.tsx
├── RootLocationsGrid.tsx
├── LocationCard.tsx
├── LocationFormDialog.tsx
├── ImageUpload.tsx
└── RichTextEditor.tsx (reusable, może być w src/components/shared/)
```

### Krok 2: Implementacja custom hooks (React Query)

2.1. Utworzenie `src/hooks/useLocations.ts`:
- `useLocationsQuery(campaignId, filters?)`
- `useLocationDetailsQuery(locationId)` - na razie bez breadcrumb/backlinks (TODO later)
- `useCreateLocationMutation()`
- `useUpdateLocationMutation()`
- `useDeleteLocationMutation()`

2.2. Implementacja optimistic updates w mutations:
- onMutate: cancel queries, snapshot previous data, optimistic update
- onError: rollback optimistic update, toast error
- onSuccess: invalidate queries, toast success

### Krok 3: Implementacja reusable komponentów

3.1. **RichTextEditor** (Tiptap z @mentions):
- Setup Tiptap z extensions: StarterKit, Image, Link
- Custom @mentions extension (TBD - może osobny krok)
- Toolbar z formatowaniem (bold, italic, headings, lists, etc.)
- onChange handler (emit Tiptap JSON)
- onBlur handler (auto-save)

3.2. **ImageUpload**:
- Drag & drop zone (visual feedback on drag over)
- File input (hidden) z button trigger
- Walidacja (max 5 MB, typy: jpeg/png/webp)
- Client-side kompresja do WebP (library: browser-image-compression)
- Upload do Supabase Storage via `uploadLocationImage()` helper
- Progress bar podczas uploadu
- Preview wybranego obrazu
- Delete button

3.3. **LocationTypeBadge**:
- Kolorowy badge z ikoną dla każdego typu lokacji
- Mapowanie typu → kolor + ikona (kontynent=zielony, królestwo=niebieski, etc.)

### Krok 4: Implementacja Location Form Dialog

4.1. **LocationFormDialog**:
- Shadcn Dialog component
- React Hook Form setup z zodResolver
- Inputs: name (required), type select, parent location select, coordinates (lat/lng)
- RichTextEditor dla description
- ImageUpload dla image
- Submit handler: wywołanie create/update mutation
- Loading state na przycisku podczas submission
- Zamknięcie dialogu po sukcesie

4.2. **Parent Location Select** (hierarchical dropdown):
- Fetch wszystkich lokacji kampanii
- Budowanie tree structure
- Renderowanie jako nested dropdown (lub custom tree select)
- Filtrowanie invalid parents (circular reference prevention)

### Krok 5: Implementacja LocationsTree (hierarchia z drag & drop)

5.1. **LocationsTree**:
- Fetch lokacji via `useLocationsQuery(campaignId)`
- Transformacja flat list → tree structure (pomocnicza funkcja `buildLocationTree()`)
- dnd-kit setup: DndContext, SortableContext
- Renderowanie LocationTreeNode[] dla root locations
- Obsługa onDragEnd: walidacja + wywołanie `useUpdateLocationMutation()` dla zmiany parent_id

5.2. **LocationTreeNode** (rekurencyjny):
- Icon typu lokacji + nazwa + badge z liczbą dzieci
- Expand/collapse button (jeśli ma dzieci)
- Local state: isExpanded (useState)
- Rekurencyjne renderowanie dzieci (jeśli expanded)
- dnd-kit useSortable hook dla drag & drop
- Visual feedback: highlight on drag, drop zone indicator

5.3. **buildLocationTree() helper**:
```typescript
function buildLocationTree(locations: Location[]): LocationTreeData[] {
  const map = new Map<string, LocationTreeData>();
  const roots: LocationTreeData[] = [];

  // Inicjalizacja map
  locations.forEach(loc => {
    map.set(loc.id, { location: loc, children: [], isExpanded: false, childrenCount: 0 });
  });

  // Budowanie drzewa
  locations.forEach(loc => {
    const node = map.get(loc.id)!;
    if (loc.parent_location_id) {
      const parent = map.get(loc.parent_location_id);
      if (parent) {
        parent.children.push(node);
        parent.childrenCount++;
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### Krok 6: Implementacja LocationDetailsPanel i LocationDetails

6.1. **LocationDetailsPanel**:
- Warunkowo renderuje EmptyState z RootLocationsGrid LUB LocationDetails
- Jeśli selectedLocationId === null → EmptyState + RootLocationsGrid
- Jeśli selectedLocationId !== null → fetch via `useLocationDetailsQuery()` + renderuj LocationDetails
- Loading state (skeleton) podczas fetcha

6.2. **RootLocationsGrid**:
- Grid layout (3-4 kolumny, responsive)
- Filtrowanie lokacji gdzie parent_location_id === null
- Renderowanie LocationCard[] dla każdej root lokacji
- Click handler → setSelectedLocationId()

6.3. **LocationCard**:
- Image (jeśli image_url istnieje) - wysokość 200px, object-fit: cover
- Nazwa lokacji (H3, truncate dla długich)
- LocationTypeBadge
- Badge z liczbą dzieci (jeśli > 0)
- Hover effect (border highlight, scale up slightly)
- Click handler → onLocationSelect()

6.4. **LocationDetails**:
- LocationImage (opcjonalne) - wysokość 400px
- LocationHeader:
  - EditableLocationName (inline edit): click → input, blur → auto-save mutation
  - LocationTypeBadge
  - BreadcrumbNavigation: render breadcrumb (TODO: API endpoint dla breadcrumb)
- RichTextEditor dla description_json (auto-save on blur)
- CoordinatesInput (dwa pola: lat, lng) - auto-save on blur
- BacklinksSection (TODO: API endpoint dla backlinks)
- ChildrenSection:
  - Filtrowanie lokacji gdzie parent_location_id === current location id
  - Grid LocationCard[] dla dzieci
  - AddChildButton → otwarcie LocationFormDialog z pre-fill parent_id
- DeleteLocationButton → confirm dialog → delete mutation

### Krok 7: Implementacja LocationsHeader i LocationsLayout

7.1. **LocationsHeader**:
- Breadcrumb: fetch campaign name via `useCampaignQuery(campaignId)`
- Links: "My Campaigns" → `/campaigns`, "[Campaign Name]" → `/campaigns/[id]`, "Locations" (current)
- H1: "Locations"
- Button "Add Location" → trigger setIsCreateDialogOpen(true)

7.2. **LocationsLayout**:
- Split view: flex layout
- Left panel (30%): LocationsTree
- Right panel (70%): LocationDetailsPanel
- Responsive: na tablet/mobile stack vertically (LocationsTree na górze, LocationDetailsPanel na dole)

### Krok 8: Orchestracja w LocationsView (główny widok)

8.1. **LocationsView** (page.tsx):
- Fetch campaignId z params: `const { id: campaignId } = params;`
- Local state:
  - selectedLocationId (string | null)
  - isCreateDialogOpen (boolean)
  - editingLocationId (string | null)
- Renderowanie:
  - LocationsHeader
  - LocationsLayout (pass selectedLocationId, handlers)
  - LocationFormDialog (warunkowo, jeśli isCreateDialogOpen || editingLocationId)
- Handlers:
  - onLocationSelect(locationId)
  - onOpenCreateDialog()
  - onOpenEditDialog(locationId)
  - onCloseDialog()

8.2. Integracja z routing:
- Plik: `src/app/(dashboard)/campaigns/[id]/locations/page.tsx`
- Export default LocationsView
- Dodanie linku "Locations" w campaign sidebar/navigation

### Krok 9: Image upload i Supabase Storage integration

9.1. **Utworzenie storage bucket** w Supabase:
- Bucket name: `location-images`
- Public access: true (public URLs)
- RLS policies: user może tylko uploadować do własnych kampanii (folder = campaignId)

9.2. **Implementacja upload helper** (`src/lib/api/storage.ts`):
- `uploadLocationImage(campaignId, file)` - kompresja + upload + return public URL
- `deleteLocationImage(imageUrl)` - usunięcie z storage

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
- Podczas save description_json → parse mentions → insert/update entity_mentions table
- Backlinks query: `SELECT * FROM entity_mentions WHERE target_entity_id = locationId`

### Krok 11: Walidacja circular references (server-side)

11.1. **Edge Function** dla walidacji drag & drop:
- Endpoint: `POST /api/locations/:locationId/move`
- Body: `{ newParentId: string | null }`
- Walidacja: rekurencyjne sprawdzenie czy newParentId nie jest descendant locationId
- Return: 200 OK lub 409 Conflict

11.2. Integracja w LocationsTree:
- onDragEnd → wywołanie `/api/locations/:locationId/move` zamiast bezpośrednio update
- Obsługa 409 Conflict → rollback optimistic update + toast error

### Krok 12: Styling i responsywność

13.1. **Tailwind CSS** styling:
- Konsystentny spacing (p-4, gap-6, etc.)
- Kolorystyka: emerald dla primary actions, red dla destructive
- Dark mode support (dark: variants)

13.2. **Accessibility**:
- Keyboard navigation w drzewie (Arrow keys, Enter, Tab)
- ARIA roles: tree, treeitem, dialog
- Focus management w dialogs i dropdowns

