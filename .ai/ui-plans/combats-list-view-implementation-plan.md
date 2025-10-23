# Plan implementacji widoku Combats List

## 1. Przegląd

Widok Combats List wyświetla listę walk w ramach wybranej kampanii. Użytkownik (DM) może przeglądać zapisane walki, wznowić aktywną walkę, przeglądać zakończone walki lub rozpocząć nową walkę. Widok wyraźnie rozróżnia walki aktywne (status "active") od zakończonych (status "completed") za pomocą kolorowych badge'ów i odpowiednich akcji.

Główne funkcjonalności:
- Wyświetlanie listy walk w formie responsive grid (2-3 kolumny)
- Tworzenie nowej walki (przycisk w nagłówku)
- Wznowienie aktywnej walki
- Przeglądanie zakończonej walki
- Usuwanie walki z confirmation modal
- Empty state gdy brak walk
- Skeleton loading podczas pobierania danych

## 2. Routing widoku

**Ścieżka:** `/campaigns/:id/combats`

**Plik strony Astro:** `src/pages/campaigns/[id]/combats.astro`

**Parametry URL:**
- `id` (required) - ID kampanii

**Nawigacja:**
- Z widoku kampanii: kliknięcie "Combats" w menu bocznym
- Z breadcrumb: "My Campaigns > [Campaign Name] > Combats"

## 3. Struktura komponentów

```
CombatsListPage (Astro)
└── CombatsListView (React)
    ├── CombatsHeader (React)
    │   ├── Breadcrumb (Shadcn)
    │   └── Button (Shadcn)
    ├── [Conditional Rendering]
    │   ├── SkeletonLoader (React) [if loading]
    │   ├── ErrorState (React) [if error]
    │   ├── EmptyState (React) [if no combats]
    │   └── CombatsGrid (React) [if has combats]
    │       └── CombatCard (React) [multiple]
    │           ├── Card (Shadcn)
    │           ├── Badge (Shadcn)
    │           ├── Button (Shadcn)
    │           └── DropdownMenu (Shadcn)
    └── DeleteConfirmationDialog (React)
        └── AlertDialog (Shadcn)
```

## 4. Szczegóły komponentów

### CombatsListPage (Astro)

**Opis:** Strona Astro odpowiedzialna za routing i server-side rendering. Pobiera campaignId z parametrów URL, weryfikuje istnienie kampanii i pobiera jej nazwę, a następnie renderuje główny komponent React.

**Główne elementy:**
- Layout wrapper (MainLayout)
- CombatsListView component (React)
- Sprawdzenie autentykacji (middleware)
- Pobranie campaignName z API server-side

**Obsługiwane interakcje:** brak (statyczna strona)

**Obsługiwana walidacja:**
- Sprawdzenie czy campaignId jest prawidłowym UUID
- Sprawdzenie czy kampania istnieje i należy do zalogowanego użytkownika
- Redirect do `/campaigns` jeśli kampania nie istnieje (404)

**Typy:**
- `campaignId: string` (z URL params)
- `campaignName: string` (z API)

**Propsy:** N/A (Astro page)

---

### CombatsListView (React)

**Opis:** Główny kontener widoku listy walk. Zarządza stanem aplikacji, wykonuje fetching danych z API, obsługuje interakcje użytkownika i orchestruje renderowanie podkomponentów w zależności od stanu (loading, error, empty, data).

**Główne elementy:**
- `<div>` container z odpowiednim padding i layout
- CombatsHeader - nagłówek z breadcrumb i przyciskiem
- Conditional rendering:
  - SkeletonLoader (podczas ładowania)
  - ErrorState (w przypadku błędu)
  - EmptyState (gdy brak walk)
  - CombatsGrid (gdy są walki)
- DeleteConfirmationDialog - modal potwierdzenia usunięcia

**Obsługiwane interakcje:**
- `handleCreateNew()` - nawigacja do `/campaigns/:id/combats/new`
- `handleResume(combatId)` - nawigacja do `/combats/:id`
- `handleView(combatId)` - nawigacja do `/combats/:id`
- `handleDeleteClick(combat)` - otwarcie confirmation modal
- `handleDeleteConfirm()` - wywołanie mutacji usuwania walki
- `handleDeleteCancel()` - zamknięcie modal

**Obsługiwana walidacja:**
- Sprawdzenie czy campaignId jest przekazany
- Warunkowe renderowanie w zależności od stanu query (isLoading, isError, isEmpty)

**Typy:**
- `CombatsListViewProps`
- `CombatSummaryDTO[]` (z API)
- Local state: `deleteDialogOpen: boolean`, `combatToDelete: CombatSummaryDTO | null`

**Propsy:**
```typescript
export interface CombatsListViewProps {
  campaignId: string;
  campaignName: string;
}
```

---

### CombatsHeader (React)

**Opis:** Nagłówek strony zawierający breadcrumb navigation oraz przycisk tworzenia nowej walki. Breadcrumb pokazuje pełną ścieżkę: "My Campaigns > [Campaign Name] > Combats".

**Główne elementy:**
- `<div>` flex container z justify-between
- Breadcrumb component (Shadcn):
  - Link "My Campaigns" → `/campaigns`
  - Link "[Campaign Name]" → `/campaigns/:id`
  - Text "Combats" (current, non-clickable)
- `<h1>` z tekstem "Combats"
- Button "Start New Combat" (emerald, Plus icon z Lucide)

**Obsługiwane interakcje:**
- `onCreateNew()` - callback wywoływany przy kliknięciu przycisku

**Obsługiwana walidacja:** brak

**Typy:**
- `CombatsHeaderProps`

**Propsy:**
```typescript
export interface CombatsHeaderProps {
  campaignId: string;
  campaignName: string;
  onCreateNew: () => void;
}
```

---

### CombatsGrid (React)

**Opis:** Responsive grid wyświetlający karty walk. Grid adaptuje się do rozmiaru ekranu: 1 kolumna na mobile, 2 kolumny na tablet (≥1024px), 3 kolumny na desktop (≥1280px).

**Główne elementy:**
- `<div>` z klasami Tailwind:
  - `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6`
- CombatCard components (wiele, map przez combats array)

**Obsługiwane interakcje:**
- Przekazuje callbacks (onResume, onView, onDelete) do CombatCard

**Obsługiwana walidacja:**
- Sprawdzenie czy combats array nie jest pusty (powinno być obsłużone w rodzicu)

**Typy:**
- `CombatsGridProps`
- `CombatSummaryDTO[]`

**Propsy:**
```typescript
export interface CombatsGridProps {
  combats: CombatSummaryDTO[];
  onResume: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

### CombatCard (React)

**Opis:** Karta pojedynczej walki wyświetlająca kluczowe informacje: nazwę, status, rundę (jeśli aktywna), liczbę uczestników, datę. Karta zawiera akcje dostosowane do statusu walki (Resume dla active, View dla completed) oraz menu dropdown z opcją Delete.

**Główne elementy:**
- Card (Shadcn) - kontener
- CardHeader:
  - Flex row z justify-between
  - CardTitle (nazwa walki, text-ellipsis)
  - Badge (status: "Active" emerald / "Completed" muted)
- CardContent:
  - Round indicator (tylko dla active): "Round X" z Circle icon
  - Participants count: "X participants" z Users icon
  - Date: "Started [date]" (active) lub "Completed [date]" (completed)
    - Format: formatDistanceToNow z date-fns (np. "3 hours ago")
- CardFooter:
  - Flex row z gap-2
  - Button (primary action):
    - "Resume Combat" (emerald) dla active → wywołuje onResume
    - "View Combat" (secondary) dla completed → wywołuje onView
  - DropdownMenu (Shadcn):
    - Trigger: MoreVertical icon button
    - Menu items:
      - "Delete" z Trash2 icon (red text) → wywołuje onDelete

**Obsługiwane interakcje:**
- Kliknięcie "Resume Combat" / "View Combat" - wywołuje odpowiedni callback
- Kliknięcie "Delete" w menu - wywołuje onDelete callback

**Obsługiwana walidacja:**
- Jeśli `status === "active"`:
  - Badge "Active" z emerald color
  - Wyświetl "Round X"
  - Przycisk "Resume Combat" (emerald)
  - Date label: "Started"
- Jeśli `status === "completed"`:
  - Badge "Completed" z muted color
  - Nie wyświetlaj rundy
  - Przycisk "View Combat" (secondary)
  - Date label: "Completed"
- Jeśli `participant_count === 0`:
  - Wyświetl "No participants"
- Jeśli `participant_count === 1`:
  - Wyświetl "1 participant"
- Jeśli `participant_count > 1`:
  - Wyświetl "X participants"

**Typy:**
- `CombatCardProps`
- `CombatSummaryDTO`

**Propsy:**
```typescript
export interface CombatCardProps {
  combat: CombatSummaryDTO;
  onResume: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

### EmptyState (React)

**Opis:** Wyświetlany gdy użytkownik nie ma jeszcze żadnych walk w kampanii. Pokazuje dużą ikonę, tekst zachęcający i przycisk do utworzenia pierwszej walki.

**Główne elementy:**
- `<div>` flex column container (centered, min-height)
- Swords icon (Lucide) - duży rozmiar, muted color
- `<h2>` "No combats yet"
- `<p>` "Start your first combat to track initiative and manage encounters" (muted color)
- Button "Start New Combat" (emerald, Plus icon)

**Obsługiwane interakcje:**
- `onCreateNew()` - callback wywoływany przy kliknięciu przycisku

**Obsługiwana walidacja:** brak

**Typy:**
- `EmptyStateProps`

**Propsy:**
```typescript
export interface EmptyStateProps {
  onCreateNew: () => void;
}
```

---

### ErrorState (React)

**Opis:** Wyświetlany gdy wystąpi błąd podczas pobierania listy walk. Pokazuje komunikat o błędzie i przycisk Retry.

**Główne elementy:**
- `<div>` flex column container (centered)
- AlertCircle icon (Lucide) - red color
- `<h2>` "Failed to load combats"
- `<p>` "There was an error loading the combats list. Please try again."
- Button "Retry" - wywołuje refetch

**Obsługiwane interakcje:**
- `onRetry()` - callback do ponownego pobrania danych

**Obsługiwana walidacja:** brak

**Typy:**
- `ErrorStateProps`

**Propsy:**
```typescript
export interface ErrorStateProps {
  onRetry: () => void;
}
```

---

### SkeletonLoader (React)

**Opis:** Skeleton loading state wyświetlany podczas pobierania danych z API. Pokazuje grid z placeholder kartami.

**Główne elementy:**
- `<div>` grid container (same classes as CombatsGrid)
- Card placeholders (domyślnie 6):
  - Card (Shadcn)
  - Skeleton (Shadcn) components imitujące layout CombatCard:
    - Header skeleton (tytuł + badge)
    - Content skeletons (3 linie)
    - Footer skeleton (przyciski)

**Obsługiwane interakcje:** brak

**Obsługiwana walidacja:** brak

**Typy:**
- `SkeletonLoaderProps`

**Propsy:**
```typescript
export interface SkeletonLoaderProps {
  count?: number; // default: 6
}
```

---

### DeleteConfirmationDialog (React)

**Opis:** Modal potwierdzenia usunięcia walki. Używa AlertDialog z Shadcn. Wyświetla ostrzeżenie o nieodwracalności akcji i wymaga potwierdzenia.

**Główne elementy:**
- AlertDialog (Shadcn):
  - AlertDialogContent
  - AlertDialogHeader:
    - AlertDialogTitle: "Delete this combat?"
    - AlertDialogDescription: "This action cannot be undone. Combat '[name]' will be permanently deleted."
  - AlertDialogFooter:
    - AlertDialogCancel: "Cancel" → wywołuje onCancel
    - AlertDialogAction: "Delete" (destructive red) → wywołuje onConfirm
      - Disabled jeśli isDeleting
      - Pokazuje Loader2 icon (spinning) jeśli isDeleting

**Obsługiwane interakcje:**
- Kliknięcie "Cancel" - zamyka dialog bez akcji
- Kliknięcie "Delete" - wywołuje onConfirm
- Escape / Click outside - zamyka dialog (wywołuje onCancel)

**Obsługiwana walidacja:**
- Disable przycisku "Delete" podczas isDeleting
- Prevent closing podczas isDeleting (opcjonalne)

**Typy:**
- `DeleteConfirmationDialogProps`

**Propsy:**
```typescript
export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  combatName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
```

## 5. Typy

### Typy do dodania w `src/types.ts`:

```typescript
/**
 * Combat summary for list view (without full state snapshot)
 * Used in the combats list to display basic information without loading
 * the entire combat state which can be large.
 */
export interface CombatSummaryDTO {
  id: string;
  campaign_id: string;
  name: string;
  status: "active" | "completed";
  current_round: number;
  participant_count: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * List combats response with pagination metadata
 */
export interface ListCombatsResponseDTO extends PaginationMetadataDTO {
  combats: CombatSummaryDTO[];
}
```

### Typy komponentów (w plikach komponentów):

Wszystkie interfejsy props opisane w sekcji 4 powinny być zdefiniowane w odpowiednich plikach komponentów.

## 6. Zarządzanie stanem

### TanStack Query (React Query)

Widok używa TanStack Query do zarządzania stanem serwera, cache'owania i synchronizacji danych.

**Query Keys:**
- `['combats', campaignId]` - lista walk dla kampanii
- `['campaign', campaignId]` - dane kampanii (nazwa, opcjonalne)

**Konfiguracja Query Client:**
```typescript
// src/lib/queryClient.ts (lub w root layout)
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Custom Hooks

#### `useCombatsList(campaignId: string)`

**Lokalizacja:** `src/components/hooks/useCombatsList.ts`

**Odpowiedzialność:** Pobieranie listy walk dla kampanii z cache'owaniem i automatycznym refetch.

**Implementacja:**
```typescript
import { useQuery } from '@tanstack/react-query';
import type { ListCombatsResponseDTO } from '@/types';

export function useCombatsList(campaignId: string) {
  return useQuery({
    queryKey: ['combats', campaignId],
    queryFn: async (): Promise<ListCombatsResponseDTO> => {
      const response = await fetch(`/api/campaigns/${campaignId}/combats`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch combats');
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
}
```

**Return type:**
```typescript
{
  data: ListCombatsResponseDTO | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

---

#### `useDeleteCombat(campaignId: string)`

**Lokalizacja:** `src/components/hooks/useDeleteCombat.ts`

**Odpowiedzialność:** Usuwanie walki z optimistic update i invalidacją cache.

**Implementacja:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteCombat(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (combatId: string): Promise<void> => {
      const response = await fetch(
        `/api/campaigns/${campaignId}/combats/${combatId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete combat');
      }
    },

    // Optimistic update
    onMutate: async (combatId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['combats', campaignId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ListCombatsResponseDTO>([
        'combats',
        campaignId,
      ]);

      // Optimistically update to remove combat
      if (previousData) {
        queryClient.setQueryData<ListCombatsResponseDTO>(
          ['combats', campaignId],
          {
            ...previousData,
            combats: previousData.combats.filter((c) => c.id !== combatId),
            total: previousData.total - 1,
          }
        );
      }

      return { previousData };
    },

    // Rollback on error
    onError: (error, combatId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['combats', campaignId],
          context.previousData
        );
      }
      toast.error('Failed to delete combat');
    },

    // Success notification
    onSuccess: () => {
      toast.success('Combat deleted successfully');
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['combats', campaignId] });
    },
  });
}
```

**Return type:**
```typescript
{
  mutate: (combatId: string) => void;
  mutateAsync: (combatId: string) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

### Local State w CombatsListView

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [combatToDelete, setCombatToDelete] = useState<CombatSummaryDTO | null>(null);
```

**Zarządzanie:**
- `handleDeleteClick(combat)` - ustawia combatToDelete i otwiera dialog
- `handleDeleteCancel()` - zamyka dialog i czyści combatToDelete
- `handleDeleteConfirm()` - wywołuje mutation, po sukcesie zamyka dialog

## 7. Integracja API

### Endpoint: GET /api/campaigns/:campaignId/combats

**⚠️ UWAGA:** Ten endpoint NIE JEST JESZCZE ZAIMPLEMENTOWANY. Należy go stworzyć.

**Lokalizacja implementacji:**
1. Service: `src/lib/services/combat.service.ts` - dodać funkcję `listCombats`
2. Endpoint: `src/pages/api/campaigns/[campaignId]/combats.ts` - dodać handler GET

#### Service Function

**Dodać w `src/lib/services/combat.service.ts`:**

```typescript
/**
 * Lists all combats for a campaign with summary information
 */
export async function listCombats(
  supabase: SupabaseClient<Database>,
  userId: string,
  campaignId: string,
  options?: {
    status?: "active" | "completed";
    limit?: number;
    offset?: number;
  }
): Promise<ListCombatsResponseDTO> {
  // Verify campaign ownership
  await verifyCampaignOwnership(supabase, userId, campaignId);

  const { status, limit = 50, offset = 0 } = options || {};

  // Build query
  let query = supabase
    .from("combats")
    .select("*", { count: "exact" })
    .eq("campaign_id", campaignId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply status filter if provided
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing combats:", error);
    throw new Error("Failed to list combats");
  }

  // Transform to CombatSummaryDTO
  const combats: CombatSummaryDTO[] = (data || []).map((combat) => {
    const snapshot = combat.state_snapshot as unknown as CombatSnapshotDTO | null;
    const participantCount = snapshot?.participants?.length || 0;

    return {
      id: combat.id,
      campaign_id: combat.campaign_id,
      name: combat.name,
      status: combat.status as "active" | "completed",
      current_round: combat.current_round || 1,
      participant_count: participantCount,
      created_at: combat.created_at,
      updated_at: combat.updated_at || combat.created_at,
    };
  });

  return {
    combats,
    total: count || 0,
    limit,
    offset,
  };
}
```

#### API Endpoint

**Dodać w `src/pages/api/campaigns/[campaignId]/combats.ts`:**

```typescript
/**
 * GET /api/campaigns/:campaignId/combats
 * Returns all combats in a campaign
 */
export async function GET(context: APIContext): Promise<Response> {
  const userId = DEFAULT_USER_ID; // TODO: Replace with real auth

  // Extract params
  const campaignId = context.params.campaignId;
  if (!campaignId) {
    return new Response(JSON.stringify({ error: "Campaign ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse query params
  const url = new URL(context.request.url);
  const status = url.searchParams.get("status") as "active" | "completed" | null;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  // Validate query params
  if (status && !["active", "completed"].includes(status)) {
    return new Response(
      JSON.stringify({ error: "Invalid status. Must be 'active' or 'completed'" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const result = await listCombats(context.locals.supabase, userId, campaignId, {
      status: status || undefined,
      limit,
      offset,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error listing combats:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**Request:**
```
GET /api/campaigns/550e8400-e29b-41d4-a716-446655440000/combats
GET /api/campaigns/550e8400-e29b-41d4-a716-446655440000/combats?status=active
GET /api/campaigns/550e8400-e29b-41d4-a716-446655440000/combats?limit=20&offset=0
```

**Response 200 OK:**
```json
{
  "combats": [
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "name": "Goblin Ambush",
      "status": "active",
      "current_round": 3,
      "participant_count": 7,
      "created_at": "2025-01-16T15:00:00Z",
      "updated_at": "2025-01-16T15:45:00Z"
    },
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "name": "Dragon Fight",
      "status": "completed",
      "current_round": 12,
      "participant_count": 5,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T11:30:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Invalid status. Must be 'active' or 'completed'"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Campaign not found"
}
```

---

### Endpoint: DELETE /api/campaigns/:campaignId/combats/:id

**✅ Ten endpoint jest już zaimplementowany** w `src/pages/api/campaigns/[campaignId]/combats/[id].ts`

**Request:**
```
DELETE /api/campaigns/550e8400-e29b-41d4-a716-446655440000/combats/660e8400-e29b-41d4-a716-446655440000
```

**Response 204 No Content:** (bez body)

**Response 404 Not Found:**
```json
{
  "error": "Combat not found"
}
```

## 8. Interakcje użytkownika

### 1. Wejście na stronę listy walk

**Akcja:** Użytkownik klika "Combats" w menu kampanii lub wpisuje URL `/campaigns/:id/combats`

**Przebieg:**
1. Astro page renderuje się server-side
2. Pobiera campaignName z API (opcjonalnie)
3. Przekazuje props do CombatsListView
4. CombatsListView montuje się i uruchamia useCombatsList hook
5. Podczas ładowania: wyświetla SkeletonLoader (6 placeholder cards)
6. Po otrzymaniu danych:
   - Jeśli combats.length === 0: wyświetla EmptyState
   - Jeśli combats.length > 0: wyświetla CombatsGrid z kartami
7. W przypadku błędu: wyświetla ErrorState z przyciskiem Retry

**Rezultat:** Lista walk lub odpowiedni stan (empty/error/loading)

---

### 2. Kliknięcie przycisku "Start New Combat"

**Akcja:** Użytkownik klika przycisk "Start New Combat" w nagłówku lub w EmptyState

**Przebieg:**
1. Wywołanie `handleCreateNew()`
2. Nawigacja do `/campaigns/${campaignId}/combats/new` (używając Astro navigate lub window.location)

**Rezultat:** Przekierowanie do strony tworzenia nowej walki

---

### 3. Kliknięcie "Resume Combat" (aktywna walka)

**Akcja:** Użytkownik klika przycisk "Resume Combat" na karcie aktywnej walki

**Przebieg:**
1. Wywołanie `handleResume(combat.id)`
2. Nawigacja do `/combats/${combatId}`

**Rezultat:** Przekierowanie do strony trackerа walki

---

### 4. Kliknięcie "View Combat" (zakończona walka)

**Akcja:** Użytkownik klika przycisk "View Combat" na karcie zakończonej walki

**Przebieg:**
1. Wywołanie `handleView(combat.id)`
2. Nawigacja do `/combats/${combatId}` (w trybie read-only)

**Rezultat:** Przekierowanie do strony przeglądania zakończonej walki

---

### 5. Kliknięcie "Delete" w dropdown menu

**Akcja:** Użytkownik otwiera dropdown menu na karcie i klika "Delete"

**Przebieg:**
1. Wywołanie `handleDeleteClick(combat)`
2. Ustawienie `combatToDelete` na wybraną walkę
3. Ustawienie `deleteDialogOpen` na `true`
4. Otwarcie DeleteConfirmationDialog z nazwą walki

**Rezultat:** Modal potwierdzenia jest widoczny

---

### 6. Potwierdzenie usunięcia w modal

**Akcja:** Użytkownik klika "Delete" w confirmation modal

**Przebieg:**
1. Wywołanie `handleDeleteConfirm()`
2. Wywołanie `deleteComba t.mutate(combatToDelete.id)`
3. **Optimistic update:** karta znika natychmiast z listy
4. API call DELETE `/api/campaigns/:campaignId/combats/:id`
5. W przypadku sukcesu:
   - Toast notification: "Combat deleted successfully" (zielony)
   - Modal zamyka się
   - Query cache invalidation (refetch listy)
6. W przypadku błędu:
   - **Rollback:** karta wraca na listę
   - Toast notification: "Failed to delete combat" (czerwony)
   - Modal pozostaje otwarty
   - Przycisk "Delete" wraca do normalnego stanu

**Rezultat:** Walka usunięta z listy (lub rollback w przypadku błędu)

---

### 7. Anulowanie usunięcia w modal

**Akcja:** Użytkownik klika "Cancel", Escape lub poza modal

**Przebieg:**
1. Wywołanie `handleDeleteCancel()`
2. Ustawienie `deleteDialogOpen` na `false`
3. Wyczyszczenie `combatToDelete` (null)

**Rezultat:** Modal zamyka się, żadne zmiany na liście

---

### 8. Retry po błędzie ładowania

**Akcja:** Użytkownik klika przycisk "Retry" w ErrorState

**Przebieg:**
1. Wywołanie `refetch()` z useQuery
2. Wyświetlenie SkeletonLoader
3. Ponowne wywołanie API
4. Wyświetlenie wyników lub błędu

**Rezultat:** Próba ponownego załadowania danych

## 9. Warunki i walidacja

### Walidacja server-side (już zaimplementowana)

**Campaign ID validation:**
- W każdym endpoint: sprawdzenie czy campaignId jest UUID
- Sprawdzenie czy kampania istnieje
- Sprawdzenie czy kampania należy do zalogowanego użytkownika (RLS)
- Response: 404 Not Found jeśli nie spełnione

**Combat ID validation:**
- Sprawdzenie czy combatId jest UUID
- Sprawdzenie czy walka istnieje
- Sprawdzenie czy walka należy do kampanii użytkownika
- Response: 404 Not Found jeśli nie spełnione

**Query params validation (GET /combats):**
- `status`: jeśli podany, musi być "active" lub "completed"
- `limit`: liczba całkowita, domyślnie 50
- `offset`: liczba całkowita, domyślnie 0
- Response: 400 Bad Request jeśli nieprawidłowe

### Walidacja client-side

#### CombatsListView

**Warunki renderowania:**
```typescript
if (isLoading) {
  return <SkeletonLoader count={6} />;
}

if (isError) {
  return <ErrorState onRetry={refetch} />;
}

if (data && data.combats.length === 0) {
  return <EmptyState onCreateNew={handleCreateNew} />;
}

if (data && data.combats.length > 0) {
  return <CombatsGrid combats={data.combats} {...handlers} />;
}
```

**Wpływ na UI:**
- `isLoading === true` → Skeleton loading state
- `isError === true` → Error message z przyciskiem Retry
- `data.combats.length === 0` → Empty state z przyciskiem tworzenia
- `data.combats.length > 0` → Grid z kartami

#### CombatCard

**Warunki renderowania w zależności od statusu:**

```typescript
// Status badge
if (combat.status === "active") {
  badge = <Badge variant="emerald">Active</Badge>;
} else {
  badge = <Badge variant="secondary">Completed</Badge>;
}

// Round indicator
if (combat.status === "active") {
  roundIndicator = (
    <div className="flex items-center gap-2">
      <Circle className="h-4 w-4" />
      <span>Round {combat.current_round}</span>
    </div>
  );
}

// Primary action button
if (combat.status === "active") {
  primaryButton = (
    <Button onClick={() => onResume(combat.id)} variant="default" className="bg-emerald-600">
      Resume Combat
    </Button>
  );
} else {
  primaryButton = (
    <Button onClick={() => onView(combat.id)} variant="secondary">
      View Combat
    </Button>
  );
}

// Date label
const dateLabel = combat.status === "active" ? "Started" : "Completed";
const formattedDate = formatDistanceToNow(new Date(combat.updated_at), {
  addSuffix: true,
});
```

**Participants count:**
```typescript
let participantsText: string;
if (combat.participant_count === 0) {
  participantsText = "No participants";
} else if (combat.participant_count === 1) {
  participantsText = "1 participant";
} else {
  participantsText = `${combat.participant_count} participants`;
}
```

**Wpływ na UI:**
- Różne kolory badge (emerald vs muted)
- Obecność/brak wskaźnika rundy
- Różne przyciski akcji (Resume vs View, emerald vs secondary)
- Różne etykiety dat (Started vs Completed)
- Poprawna gramatyka liczby uczestników

#### DeleteConfirmationDialog

**Warunki:**
```typescript
// Disable "Delete" button podczas usuwania
<AlertDialogAction
  onClick={onConfirm}
  disabled={isDeleting}
  className="bg-destructive text-destructive-foreground"
>
  {isDeleting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Deleting...
    </>
  ) : (
    "Delete"
  )}
</AlertDialogAction>
```

**Wpływ na UI:**
- Przycisk disabled podczas usuwania (zapobieganie double-click)
- Spinner i tekst "Deleting..." podczas operacji
- Tekst "Delete" w stanie normalnym

## 10. Obsługa błędów

### Scenariusze błędów i ich obsługa

#### 1. Błąd pobierania listy walk (API Error)

**Przyczyny:**
- Server error (500)
- Network error
- Timeout
- Campaign not found (404)

**Obsługa:**
- `useQuery` ustawia `isError: true`
- CombatsListView renderuje ErrorState
- ErrorState wyświetla:
  - AlertCircle icon (red)
  - Heading: "Failed to load combats"
  - Message: "There was an error loading the combats list. Please try again."
  - Button "Retry" → wywołuje `refetch()`

**Retry logic:**
- TanStack Query automatycznie retry 2 razy z exponential backoff
- Po 3 nieudanych próbach: wyświetlenie ErrorState
- Użytkownik może ręcznie wywołać retry przyciskiem

---

#### 2. Błąd usuwania walki (DELETE Error)

**Przyczyny:**
- Server error (500)
- Combat not found (404)
- Network error
- Unauthorized (401)

**Obsługa:**
- `useMutation` wywołuje `onError` callback
- **Rollback optimistic update:** przywrócenie karty na liście
- Toast notification (czerwony): "Failed to delete combat"
- Modal pozostaje otwarty
- Przycisk "Delete" wraca do stanu enabled
- Użytkownik może spróbować ponownie

**Kod:**
```typescript
onError: (error, combatId, context) => {
  // Rollback optimistic update
  if (context?.previousData) {
    queryClient.setQueryData(['combats', campaignId], context.previousData);
  }

  // Show error toast
  toast.error('Failed to delete combat');

  // Log error for debugging
  console.error('Delete combat error:', error);
}
```

---

#### 3. Network offline

**Przyczyny:**
- Brak połączenia z internetem

**Obsługa:**
- TanStack Query wykrywa offline state
- Query nie wykonuje się, pozostaje w loading/stale state
- Po przywróceniu połączenia: automatyczny refetch (refetchOnReconnect)
- Jeśli użytkownik próbuje usunąć walkę offline:
  - Mutation nie wykona się
  - Wyświetlenie error toast
  - Rollback optimistic update

---

#### 4. Campaign not found (404)

**Przyczyny:**
- Nieprawidłowy campaignId w URL
- Kampania usunięta
- Brak dostępu (nie należy do użytkownika)

**Obsługa server-side:**
- Astro page pobiera campaign przed renderowaniem
- Jeśli kampania nie istnieje: redirect do `/campaigns`
- Kod w Astro page:

```typescript
// src/pages/campaigns/[id]/combats.astro
---
const { id } = Astro.params;
const supabase = Astro.locals.supabase;

// Fetch campaign
const { data: campaign, error } = await supabase
  .from('campaigns')
  .select('id, name')
  .eq('id', id)
  .single();

if (error || !campaign) {
  return Astro.redirect('/campaigns');
}
---
```

---

#### 5. Unauthorized (401)

**Przyczyny:**
- Brak sesji użytkownika
- Sesja wygasła

**Obsługa:**
- Middleware Astro sprawdza autentykację
- Jeśli brak sesji: redirect do `/login`
- Kod middleware już zaimplementowany w projekcie

---

#### 6. Invalid JSON response

**Przyczyny:**
- Błąd w API endpoint (zwraca niepoprawny JSON)
- Proxy/middleware modyfikuje response

**Obsługa:**
- `fetch().json()` rzuca błąd
- Przechwytywany w queryFn
- Traktowany jako Error w useQuery
- Wyświetlenie ErrorState

---

### Przypadki brzegowe

#### 1. Pusta lista walk

**Warunek:** `data.combats.length === 0`

**Obsługa:**
- Renderowanie EmptyState
- Duża ikona Swords (muted)
- Tekst: "No combats yet"
- Subtext: "Start your first combat to track initiative and manage encounters"
- Przycisk "Start New Combat"

---

#### 2. Bardzo długa nazwa walki

**Warunek:** `combat.name.length > 50`

**Obsługa:**
- Tailwind utility classes w CardTitle:
  ```tsx
  <CardTitle className="text-lg font-semibold truncate">
    {combat.name}
  </CardTitle>
  ```
- Tekst obcina się z ellipsis (...)
- Opcjonalnie: Tooltip z pełną nazwą (hover)

---

#### 3. Walka z 0 uczestników

**Warunek:** `combat.participant_count === 0`

**Obsługa:**
- Wyświetl "No participants" zamiast "0 participants"
- Kod:
  ```typescript
  const participantsText =
    combat.participant_count === 0
      ? "No participants"
      : combat.participant_count === 1
      ? "1 participant"
      : `${combat.participant_count} participants`;
  ```

---

#### 4. Bardzo duża liczba uczestników

**Warunek:** `combat.participant_count > 100`

**Obsługa:**
- Wyświetl normalnie (np. "127 participants")
- Brak specjalnego traktowania, liczba wyświetla się poprawnie

---

#### 5. Stara data created_at/updated_at

**Warunek:** Walka utworzona >30 dni temu

**Obsługa:**
- Użycie `formatDistanceToNow` z `date-fns`:
  ```typescript
  import { formatDistanceToNow } from 'date-fns';

  const formattedDate = formatDistanceToNow(
    new Date(combat.updated_at),
    { addSuffix: true }
  );
  // Output: "3 months ago", "about 1 year ago", etc.
  ```
- Alternatywnie: Dla dat >7 dni, użyć absolute format:
  ```typescript
  import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

  const date = new Date(combat.updated_at);
  const daysAgo = differenceInDays(new Date(), date);

  const formattedDate = daysAgo > 7
    ? format(date, 'MMM d, yyyy') // "Jan 15, 2025"
    : formatDistanceToNow(date, { addSuffix: true }); // "3 days ago"
  ```

---

#### 6. Równoczesne usuwanie tej samej walki

**Warunek:** Dwóch użytkowników próbuje usunąć tę samą walkę jednocześnie (edge case w single-user app, ale możliwy przy multi-tab)

**Obsługa:**
- Pierwszy request: 204 No Content, optimistic update, sukces
- Drugi request: 404 Not Found (walka już nie istnieje)
- Optimistic update już usunął kartę, więc UI jest spójny
- Error toast dla drugiego requesta można zignorować lub wyświetlić generyczny komunikat
- Query invalidation zapewnia spójność po refetch

---

#### 7. Brak pola participant_count w response

**Warunek:** Backend nie zwrócił `participant_count` (błąd w implementacji)

**Obsługa:**
- TypeScript type guard w listCombats service:
  ```typescript
  const participantCount = snapshot?.participants?.length || 0;
  ```
- Zawsze fallback do 0
- UI wyświetli "No participants"

---

#### 8. Invalid date format

**Warunek:** Backend zwrócił niepoprawny format daty

**Obsługa:**
- `new Date(combat.updated_at)` zwróci Invalid Date
- `formatDistanceToNow` rzuci błąd
- Wrap w try-catch:
  ```typescript
  let formattedDate: string;
  try {
    formattedDate = formatDistanceToNow(new Date(combat.updated_at), {
      addSuffix: true,
    });
  } catch (error) {
    console.error('Invalid date format:', combat.updated_at);
    formattedDate = 'Unknown date';
  }
  ```

## 11. Kroki implementacji

### Krok 1: Przygotowanie typów i API backend

1.1. **Dodać typy w `src/types.ts`:**
- `CombatSummaryDTO`
- `ListCombatsResponseDTO`

1.2. **Dodać funkcję `listCombats` w `src/lib/services/combat.service.ts`:**
- Pobieranie walk z bazy danych
- Filtrowanie po statusie (opcjonalne)
- Paginacja (limit, offset)
- Obliczanie participant_count z state_snapshot
- Zwracanie ListCombatsResponseDTO

1.3. **Dodać endpoint GET w `src/pages/api/campaigns/[campaignId]/combats.ts`:**
- Handler GET obok istniejącego POST
- Parsing query params (status, limit, offset)
- Walidacja params
- Wywołanie listCombats service
- Error handling (404, 400, 500)

1.4. **Testowanie endpoint:**
- Użyć narzędzia (Postman/curl) do przetestowania GET endpoint
- Sprawdzić różne scenariusze (empty list, with combats, filters, pagination)

---

### Krok 2: Instalacja dependencies

2.1. **Dodać dependencies:**
```bash
npm install @tanstack/react-query
npm install date-fns
npm install sonner
```

2.2. **Sprawdzić czy Shadcn components są zainstalowane:**
- Card, Button, Badge, Breadcrumb, DropdownMenu, AlertDialog, Skeleton
- Jeśli nie:
  ```bash
  npx shadcn@latest add card button badge breadcrumb dropdown-menu alert-dialog skeleton
  ```

---

### Krok 3: Setup Query Client

3.1. **Utworzyć `src/lib/queryClient.ts`:**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

3.2. **Dodać QueryClientProvider w root layout lub wrapper:**
- Opcja 1: Dodać w głównym layout Astro (pass queryClient do React)
- Opcja 2: Utworzyć wrapper component CombatsListViewWithProvider

---

### Krok 4: Utworzenie custom hooks

4.1. **Utworzyć `src/components/hooks/useCombatsList.ts`:**
- Implementacja useQuery hook
- Query key: `['combats', campaignId]`
- Fetch function wywołująca GET endpoint
- Error handling

4.2. **Utworzyć `src/components/hooks/useDeleteCombat.ts`:**
- Implementacja useMutation hook
- Mutation function wywołująca DELETE endpoint
- Optimistic update logic
- Rollback on error
- Toast notifications
- Query invalidation

4.3. **Testowanie hooks:**
- Utworzyć temporary test component
- Sprawdzić czy fetching działa
- Sprawdzić czy delete z optimistic update działa

---

### Krok 5: Implementacja komponentów UI (od dołu do góry)

5.1. **Utworzyć `src/components/combats/CombatCard.tsx`:**
- Import wymaganych Shadcn components
- Import Lucide icons (Circle, Users, MoreVertical, Trash2)
- Implementacja interfejsu CombatCardProps
- Renderowanie Card z warunkowymi elementami (status badge, round, actions)
- Format daty z date-fns
- Implementacja dropdown menu z Delete action
- Styling z Tailwind (emerald for active, muted for completed)

5.2. **Utworzyć `src/components/combats/EmptyState.tsx`:**
- Import Lucide icon (Swords, Plus)
- Implementacja interfejsu EmptyStateProps
- Layout: centered flex column
- Button "Start New Combat"

5.3. **Utworzyć `src/components/combats/ErrorState.tsx`:**
- Import Lucide icon (AlertCircle)
- Implementacja interfejsu ErrorStateProps
- Layout: centered flex column
- Button "Retry"

5.4. **Utworzyć `src/components/combats/SkeletonLoader.tsx`:**
- Import Shadcn Skeleton
- Implementacja interfejsu SkeletonLoaderProps
- Grid layout (same as CombatsGrid)
- Placeholder cards (default 6)

5.5. **Utworzyć `src/components/combats/DeleteConfirmationDialog.tsx`:**
- Import Shadcn AlertDialog
- Import Lucide icon (Loader2)
- Implementacja interfejsu DeleteConfirmationDialogProps
- AlertDialog structure (Title, Description, Actions)
- Conditional rendering (loading state)

5.6. **Utworzyć `src/components/combats/CombatsGrid.tsx`:**
- Implementacja interfejsu CombatsGridProps
- Grid layout z Tailwind (responsive: 1/2/3 columns)
- Map przez combats array, render CombatCard dla każdego

5.7. **Utworzyć `src/components/combats/CombatsHeader.tsx`:**
- Import Shadcn Breadcrumb, Button
- Import Lucide icon (Plus)
- Implementacja interfejsu CombatsHeaderProps
- Breadcrumb navigation
- H1 heading
- Button "Start New Combat"

---

### Krok 6: Implementacja głównego komponentu widoku

6.1. **Utworzyć `src/components/combats/CombatsListView.tsx`:**
- Import wszystkich sub-components
- Import custom hooks (useCombatsList, useDeleteCombat)
- Import sonner (toast)
- Implementacja CombatsListViewProps
- Setup local state (deleteDialogOpen, combatToDelete)
- Implementacja handlers:
  - handleCreateNew
  - handleResume
  - handleView
  - handleDeleteClick
  - handleDeleteConfirm
  - handleDeleteCancel
- Conditional rendering logic (loading/error/empty/data)
- Przekazanie props do sub-components

6.2. **Testowanie CombatsListView:**
- Standalone test w Storybook lub test page
- Sprawdzić różne stany (loading, error, empty, with data)
- Sprawdzić interakcje (delete, navigate)

---

### Krok 7: Utworzenie Astro page

7.1. **Utworzyć `src/pages/campaigns/[id]/combats.astro`:**
- Import CombatsListView
- Import MainLayout (lub odpowiedni layout)
- Extract campaignId z Astro.params
- Fetch campaign z API (server-side):
  ```typescript
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    return Astro.redirect('/campaigns');
  }
  ```
- Render CombatsListView z props:
  ```astro
  <CombatsListView
    client:load
    campaignId={campaignId}
    campaignName={campaign.name}
  />
  ```

7.2. **Dodać Toaster w layout:**
- Import Toaster z sonner
- Dodać `<Toaster />` w głównym layout (przed closing body tag)

---

### Krok 8: Setup Sonner toast notifications

8.1. **Dodać Toaster w głównym layout:**
```astro
---
// src/layouts/MainLayout.astro
import { Toaster } from 'sonner';
---
<html>
  <body>
    <slot />
    <Toaster position="bottom-right" />
  </body>
</html>
```

8.2. **Sprawdzić czy toast działa:**
- Wywołać toast.success i toast.error w komponencie
- Sprawdzić styling i positioning

---

### Krok 9: Styling i responsywność

9.1. **Sprawdzić responsive grid:**
- 1 kolumna na mobile (<1024px)
- 2 kolumny na tablet (≥1024px)
- 3 kolumny na desktop (≥1280px)
- Tailwind classes: `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`

9.2. **Sprawdzić styling komponentów:**
- Badge colors (emerald dla active, muted dla completed)
- Button variants (emerald dla Resume, secondary dla View, destructive dla Delete)
- Card hover states
- Spacing i padding

9.3. **Sprawdzić dark mode (jeśli aplikacja wspiera):**
- Shadcn components mają wbudowane dark mode
- Sprawdzić czy wszystkie custom style są kompatybilne

---

### Krok 10: Accessibility

10.1. **Dodać ARIA labels:**
- Icon buttons w dropdown: `aria-label="Open menu"`
- Delete button: `aria-label="Delete combat"`

10.2. **Sprawdzić keyboard navigation:**
- Wszystkie przyciski dostępne przez Tab
- Dropdown menu nawigacja strzałkami (wbudowane w Shadcn)
- Modal focus trap (wbudowane w AlertDialog)
- Escape zamyka modal

10.3. **Dodać aria-live dla loading state:**
```tsx
<div role="status" aria-live="polite" aria-label="Loading combats">
  <SkeletonLoader />
</div>
```

10.4. **Testowanie z keyboard-only navigation:**
- Sprawdzić czy wszystkie interakcje są dostępne
- Sprawdzić focus indicators

### Krok 11: Optymalizacja i polish

12.1. **Performance optimization:**
- React.memo dla CombatCard (jeśli wiele kart)
- useCallback dla handlers w CombatsListView

12.2. **Loading states polish:**
- Smooth transitions (Tailwind transition classes)
- Skeleton animations

12.3. **Error messages polish:**
- Bardziej szczegółowe komunikaty błędów jeśli możliwe
- User-friendly language

12.4. **Code review:**
- Sprawdzić console.log (usunąć lub zamienić na logger)
- Sprawdzić type safety
- Sprawdzić prop types
- Dodać JSDoc comments do komponentów

