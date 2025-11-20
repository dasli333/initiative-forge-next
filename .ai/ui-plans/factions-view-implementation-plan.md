# Plan implementacji widoku Factions

## 1. Przegląd

Widok Factions jest częścią modułu World Building aplikacji Initiative Forge. Umożliwia Mistrzowi Gry tworzenie i zarządzanie organizacjami, gildiami i królestwami w świecie kampanii. Każda frakcja posiada nazwę, opis z możliwością formatowania rich text i @mentions, cele, obraz oraz listę członków (NPCs automatycznie przypisanych). System wspiera również definiowanie relacji między frakcjami (alliance/war/rivalry/neutral) z opcjonalnymi opisami. Widok wykorzystuje grid layout dla prezentacji kart frakcji oraz slideover panel do wyświetlania szczegółów.

## 2. Routing widoku

Ścieżka: `/campaigns/:id/factions`

Struktura routingu zgodna z wzorcem Next.js App Router:
- Page component: `src/app/(dashboard)/campaigns/[id]/factions/page.tsx`
- Client wrapper: `src/components/campaigns/FactionsPageClient.tsx`
- Main view component: `src/components/factions/FactionsView.tsx`

## 3. Struktura komponentów

```
FactionsView (główny kontener widoku)
├── FactionsHeader (breadcrumb + title + add button)
├── FactionsGrid (grid z kartami frakcji)
│   └── FactionCard[] (karta pojedynczej frakcji)
├── FactionDetailSlideover (slideover z pełnymi szczegółami)
│   ├── FactionDetailHeader (nazwa, edit/delete, close)
│   ├── FactionImageSection (obraz z możliwością edycji)
│   ├── FactionDescriptionSection (rich text description)
│   ├── FactionGoalsSection (rich text goals)
│   ├── FactionMembersSection (grid NPCs)
│   │   └── MemberMiniCard[] (avatar, name, role)
│   ├── FactionRelationshipsSection (lista relacji)
│   │   └── RelationshipItem[] (faction info, type badge, description)
│   └── BacklinksSection (mentioned in)
├── CreateFactionModal (modal tworzenia frakcji)
│   └── FactionForm (formularz z polami + rich text)
├── EditFactionModal (modal edycji frakcji)
│   └── FactionForm (reużycie formularza)
├── RelationshipModal (modal dodawania/edycji relacji)
│   └── RelationshipForm (select faction, type, description)
└── DeleteFactionDialog (alert dialog potwierdzenia)
```

## 4. Szczegóły komponentów

### FactionsView

**Opis komponentu**: Główny komponent widoku zarządzający stanem globalnym dla całej strony frakcji. Odpowiedzialny za koordynację wszystkich operacji CRUD, zarządzanie stanem modali i slideoverów oraz obsługę błędów.

**Główne elementy**:
- Container `div` z klasami `container mx-auto space-y-6 py-8`
- FactionsHeader (breadcrumb, tytuł, przycisk Add Faction)
- FactionsGrid (grid kart frakcji z loading/empty states)
- FactionDetailSlideover (szczegóły wybranej frakcji)
- CreateFactionModal (tworzenie nowej frakcji)
- EditFactionModal (edycja istniejącej frakcji)
- DeleteFactionDialog (potwierdzenie usunięcia)

**Obsługiwane interakcje**:
- Kliknięcie przycisku "Add Faction" → otwiera CreateFactionModal
- Kliknięcie karty frakcji → otwiera FactionDetailSlideover
- Kliknięcie "Edit" w slideoverze → otwiera EditFactionModal z danymi frakcji
- Kliknięcie "Delete" w slideoverze → otwiera DeleteFactionDialog
- Submit formularza create/edit → wywołuje odpowiednią mutację i zamyka modal
- Potwierdzenie delete → wywołuje mutację i zamyka slideover + dialog

**Obsługiwana walidacja**:
- Weryfikacja istnienia campaignId przed renderowaniem
- Walidacja odpowiedzi API (error states)
- Obsługa stanów loading podczas operacji CRUD
- Zabezpieczenie przed duplikacją żądań (pending states)

**Typy**:
- `Faction` (DTO z API)
- `CreateFactionCommand` (payload tworzenia)
- `UpdateFactionCommand` (payload aktualizacji)
- `FactionRelationship` (relacje między frakcjami)

**Propsy**:
```typescript
interface FactionsViewProps {
  campaignId: string;
  campaignName: string;
}
```

### FactionsHeader

**Opis komponentu**: Nagłówek widoku zawierający breadcrumb navigation, tytuł "Factions" oraz przycisk dodawania nowej frakcji. Zapewnia kontekst nawigacyjny użytkownikowi.

**Główne elementy**:
- Breadcrumb z linkami: "My Campaigns" → "[Campaign Name]" → "Factions"
- Heading `<h1>` z tekstem "Factions"
- Button "Add Faction" z klasą emerald (`bg-emerald-600 hover:bg-emerald-700`)

**Obsługiwane interakcje**:
- Kliknięcie linków breadcrumb → nawigacja Next.js router
- Kliknięcie "Add Faction" → wywołanie callback `onAddFaction`

**Obsługiwana walidacja**: Brak (komponent prezentacyjny)

**Typy**:
- `Breadcrumb` (z shadcn/ui)

**Propsy**:
```typescript
interface FactionsHeaderProps {
  campaignId: string;
  campaignName: string;
  onAddFaction: () => void;
}
```

### FactionsGrid

**Opis komponentu**: Grid kontener wyświetlający karty wszystkich frakcji w układzie responsywnym. Obsługuje stany loading i empty state. Układ: 1 kolumna na mobile, 2 na tablet, 3 na desktop (1280px+).

**Główne elementy**:
- Container `div` z klasami grid: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
- Loading state: Skeleton cards
- Empty state: EmptyState component z komunikatem "No factions yet"
- FactionCard[] dla każdej frakcji

**Obsługiwane interakcje**:
- Kliknięcie karty frakcji → wywołanie `onFactionClick(factionId)`

**Obsługiwana walidacja**:
- Weryfikacja czy factions array nie jest undefined
- Sprawdzenie czy factions.length > 0 dla conditional rendering

**Typy**:
- `Faction[]`

**Propsy**:
```typescript
interface FactionsGridProps {
  factions: Faction[];
  isLoading: boolean;
  onFactionClick: (factionId: string) => void;
}
```

### FactionCard

**Opis komponentu**: Karta pojedynczej frakcji wyświetlana w gridzie. Prezentuje obraz w stylu bannera, nazwę frakcji oraz badges z liczbą członków i relacji. Interaktywna – kliknięcie otwiera slideover ze szczegółami.

**Główne elementy**:
- Card container (shadcn Card component)
- Image (banner style, 300px width, aspect-ratio 16:9, object-fit: cover)
- Fallback image jeśli image_url === null
- H3 z nazwą frakcji
- Badge "X members" (liczba NPCs przypisanych)
- Badge "X relationships" (liczba relacji)
- Hover effect: scale, shadow

**Obsługiwane interakcje**:
- Kliknięcie karty → wywołanie `onClick(factionId)`
- Hover → visual feedback (scale, shadow)

**Obsługiwana walidacja**: Brak (otrzymuje zwalidowane dane)

**Typy**:
- `Faction`

**Propsy**:
```typescript
interface FactionCardProps {
  faction: Faction;
  membersCount: number; // z API lub computed
  relationshipsCount: number; // z API lub computed
  onClick: (factionId: string) => void;
}
```

### FactionDetailSlideover

**Opis komponentu**: Sheet (slideover) prezentujący pełne szczegóły wybranej frakcji. Szerokość 700px. Zawiera wszystkie sekcje: header, image, description, goals, members, relationships, backlinks. Umożliwia edycję i usunięcie frakcji.

**Główne elementy**:
- Sheet component (shadcn/ui, width: 700px)
- FactionDetailHeader (nazwa, edit/delete buttons, close)
- ScrollArea z zawartością:
  - FactionImageSection (obraz z drag & drop replace)
  - FactionDescriptionSection (rich text Tiptap w display mode)
  - FactionGoalsSection (rich text Tiptap w display mode)
  - FactionMembersSection (grid NPC mini cards)
  - FactionRelationshipsSection (lista relacji)
  - BacklinksSection (mentioned in)

**Obsługiwane interakcje**:
- Kliknięcie "Edit" → wywołanie `onEdit(faction)`
- Kliknięcie "Delete" → wywołanie `onDelete(factionId)`
- Kliknięcie "Close" lub overlay → zamknięcie slideovera
- Kliknięcie "Edit" w Description/Goals → przełączenie na tryb edycji (inline lub modal)
- Kliknięcie "+ Add Relationship" → otworzenie RelationshipModal

**Obsługiwana walidacja**:
- Sprawdzenie czy faction !== null przed renderowaniem
- Weryfikacja danych members (może być pusta tablica)
- Weryfikacja danych relationships (może być pusta tablica)

**Typy**:
- `Faction`
- `FactionRelationship[]`
- `NPC[]` (członkowie)
- `Backlink[]` (z entity mentions)

**Propsy**:
```typescript
interface FactionDetailSlideoverProps {
  faction: Faction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (faction: Faction) => void;
  onDelete: (factionId: string) => void;
  onImageUpdate: (factionId: string, imageUrl: string) => void;
}
```

### FactionDetailHeader

**Opis komponentu**: Header slideovera zawierający nazwę frakcji (H2), przyciski akcji (Edit, Delete) oraz przycisk zamykania (X). Sticky na górze slideovera.

**Główne elementy**:
- Container `div` z klasami flex justify-between items-center
- H2 z nazwą frakcji (truncate dla długich nazw)
- Flex container z przyciskami: Edit (emerald), Delete (destructive), Close (ghost)

**Obsługiwane interakcje**:
- Kliknięcie "Edit" → `onEdit()`
- Kliknięcie "Delete" → `onDelete()`
- Kliknięcie "Close" → `onClose()`

**Obsługiwana walidacja**: Brak (komponent prezentacyjny)

**Typy**: String (nazwa)

**Propsy**:
```typescript
interface FactionDetailHeaderProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}
```

### FactionImageSection

**Opis komponentu**: Sekcja prezentująca obraz frakcji z możliwością zmiany przez drag & drop lub file picker. Obraz w formacie banner (aspect-ratio 16:9). Wyświetla placeholder jeśli brak obrazu.

**Główne elementy**:
- Container `div` względny
- Image (width 100%, aspect-ratio 16:9, object-fit cover, rounded)
- Overlay z ikoną upload (widoczny na hover)
- Input type="file" (hidden, trigger przez overlay/button)
- Loading spinner podczas uploadu
- Error message przy błędzie uploadu

**Obsługiwane interakcje**:
- Kliknięcie overlay/button → trigger file picker
- Drag & drop pliku → preview + upload
- Po wybraniu pliku → automatyczna kompresja do WebP + upload + callback `onImageUpdate`

**Obsługiwana walidacja**:
- Walidacja rozmiaru pliku (max 5 MB)
- Walidacja typu pliku (tylko obrazy: jpg, png, webp, gif)
- Wyświetlenie błędu jeśli walidacja nie przejdzie

**Typy**:
- String (imageUrl)

**Propsy**:
```typescript
interface FactionImageSectionProps {
  imageUrl: string | null;
  factionId: string;
  onImageUpdate: (imageUrl: string) => void;
}
```

### FactionDescriptionSection

**Opis komponentu**: Sekcja wyświetlająca opis frakcji w formacie rich text. Domyślnie w trybie display (readonly Tiptap), przycisk "Edit" przełącza na tryb edycji. Obsługuje @mentions.

**Główne elementy**:
- Container `div` z sekcją
- H3 "Description"
- Tiptap editor w display mode (readonly, stylizowany jak content)
- Przycisk "Edit" (toggle do trybu edycji)
- W trybie edycji: Tiptap z toolbar + przyciski Save/Cancel

**Obsługiwane interakcje**:
- Kliknięcie "Edit" → przełączenie na tryb edycji
- Kliknięcie @mention → hover preview + link do encji
- Kliknięcie "Save" → wywołanie `onUpdate` z nowym description_json
- Kliknięcie "Cancel" → powrót do display mode bez zapisywania

**Obsługiwana walidacja**:
- Walidacja JSON rich text przed zapisem
- Sprawdzenie czy content !== null

**Typy**:
- `Json` (description_json z Tiptap)

**Propsy**:
```typescript
interface FactionDescriptionSectionProps {
  descriptionJson: Json | null;
  factionId: string;
  onUpdate: (descriptionJson: Json) => void;
}
```

### FactionGoalsSection

**Opis komponentu**: Identyczny jak FactionDescriptionSection, ale dla pola goals. Sekcja wyświetlająca cele frakcji w formacie rich text z możliwością edycji inline.

**Główne elementy**: Jak FactionDescriptionSection

**Obsługiwane interakcje**: Jak FactionDescriptionSection

**Obsługiwana walidacja**: Jak FactionDescriptionSection

**Typy**: `Json` (goals_json)

**Propsy**:
```typescript
interface FactionGoalsSectionProps {
  goalsJson: Json | null;
  factionId: string;
  onUpdate: (goalsJson: Json) => void;
}
```

### FactionMembersSection

**Opis komponentu**: Sekcja automatycznie generowana wyświetlająca listę NPCs przypisanych do danej frakcji (gdzie npc.faction_id === faction.id). Układ grid z mini kartami NPCs. Lista jest readonly, edycja przypisania odbywa się z poziomu karty NPC.

**Główne elementy**:
- Container `div` sekcji
- H3 "Members"
- Grid container (3-4 kolumny): `grid grid-cols-2 md:grid-cols-3 gap-4`
- MemberMiniCard[] dla każdego NPC
- Empty state jeśli brak członków: "No members yet"

**Obsługiwane interakcje**:
- Kliknięcie MemberMiniCard → nawigacja do karty NPC (`/campaigns/:id/npcs/:npcId`)

**Obsługiwana walidacja**:
- Sprawdzenie czy members array nie jest undefined
- Filter members gdzie faction_id === this faction id

**Typy**:
- `NPC[]` (partial, tylko id, name, avatar_url, role)

**Propsy**:
```typescript
interface FactionMembersSectionProps {
  members: NPC[];
  campaignId: string;
}
```

### MemberMiniCard

**Opis komponentu**: Miniaturowa karta członka frakcji (NPC). Prezentuje avatar, imię i rolę NPC. Interaktywna – kliknięcie prowadzi do pełnej karty NPC.

**Główne elementy**:
- Card container (compact, hover effect)
- Avatar (40x40px, rounded-full)
- Name (H4, truncate)
- Role (text-sm, text-muted-foreground)

**Obsługiwane interakcje**:
- Kliknięcie karty → nawigacja do NPC detail

**Obsługiwana walidacja**: Brak (otrzymuje zwalidowane dane)

**Typy**:
- Partial `NPC` (id, name, avatar_url, role)

**Propsy**:
```typescript
interface MemberMiniCardProps {
  npc: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string | null;
  };
  campaignId: string;
}
```

### FactionRelationshipsSection

**Opis komponentu**: Sekcja wyświetlająca listę relacji danej frakcji z innymi frakcjami. Każda relacja zawiera mini avatar + nazwę drugiej frakcji, badge typu relacji (alliance/war/rivalry/neutral), opis oraz przyciski Edit/Remove.

**Główne elementy**:
- Container `div` sekcji
- H3 "Relationships with Other Factions"
- Lista RelationshipItem[]
- Empty state jeśli brak relacji: "No relationships yet"
- Przycisk "+ Add Relationship" (secondary, pełna szerokość na dole)

**Obsługiwane interakcje**:
- Kliknięcie "+ Add Relationship" → otworzenie RelationshipModal
- Kliknięcie "Edit" przy relacji → otworzenie RelationshipModal z danymi do edycji
- Kliknięcie "Remove" → wywołanie delete mutation z potwierdzeniem

**Obsługiwana walidacja**:
- Sprawdzenie czy relationships array nie jest undefined
- Filter relationships dla bieżącej frakcji (faction_id_1 lub faction_id_2)

**Typy**:
- `FactionRelationship[]`

**Propsy**:
```typescript
interface FactionRelationshipsSectionProps {
  factionId: string;
  relationships: FactionRelationship[];
  onAddRelationship: () => void;
  onEditRelationship: (relationship: FactionRelationship) => void;
  onRemoveRelationship: (relationshipId: string) => void;
}
```

### RelationshipItem

**Opis komponentu**: Pojedynczy wiersz reprezentujący relację między dwiema frakcjami. Prezentuje drugą frakcję (avatar + nazwa), badge typu relacji, opcjonalny opis oraz przyciski akcji (Edit, Remove).

**Główne elementy**:
- Container `div` (flex, border, rounded, padding)
- Avatar drugiej frakcji (48x48px)
- Flex column: nazwa frakcji (H4) + relationship type badge
- Description (text-sm, opcjonalny)
- Przyciski akcji: Edit (ghost, small), Remove (ghost destructive, small)

**Obsługiwane interakcje**:
- Kliknięcie nazwy frakcji → nawigacja do karty drugiej frakcji (opcjonalnie)
- Kliknięcie "Edit" → wywołanie `onEdit(relationship)`
- Kliknięcie "Remove" → wywołanie `onRemove(relationship.id)`

**Obsługiwana walidacja**: Brak (otrzymuje zwalidowane dane)

**Typy**:
- `FactionRelationship`
- Extended z nazwą i avatarem drugiej frakcji (z API joined query)

**Propsy**:
```typescript
interface RelationshipItemProps {
  relationship: FactionRelationship & {
    otherFactionName: string;
    otherFactionAvatarUrl: string | null;
  };
  onEdit: (relationship: FactionRelationship) => void;
  onRemove: (relationshipId: string) => void;
}
```

### BacklinksSection

**Opis komponentu**: Sekcja "Mentioned In" wyświetlająca listę wszystkich miejsc, gdzie frakcja została wspomniana przez @mention. Lista backlinks z typem źródła, nazwą i linkiem.

**Główne elementy**:
- Container `div` sekcji
- H3 "Mentioned In"
- Lista backlinks: każdy item zawiera ikonę typu encji, nazwę źródła, link
- Empty state jeśli brak backlinks: "Not mentioned anywhere yet"

**Obsługiwane interakcje**:
- Kliknięcie backlink → nawigacja do źródła (NPC/Quest/Session/etc.)

**Obsługiwana walidacja**:
- Sprawdzenie czy backlinks array nie jest undefined

**Typy**:
- `Backlink[]` z entity_mentions

**Propsy**:
```typescript
interface BacklinksSectionProps {
  backlinks: Backlink[];
  campaignId: string;
}
```

### CreateFactionModal

**Opis komponentu**: Dialog modal do tworzenia nowej frakcji. Zawiera formularz FactionForm z wszystkimi wymaganymi polami. Szerokość max-w-2xl.

**Główne elementy**:
- Dialog component (shadcn/ui)
- DialogHeader: tytuł "Create Faction"
- DialogContent: FactionForm
- DialogFooter: przyciski Cancel + Create Faction (emerald)

**Obsługiwane interakcje**:
- Kliknięcie "Cancel" → zamknięcie modala bez zapisywania
- Submit formularza → walidacja + wywołanie `onSubmit(command)` + zamknięcie

**Obsługiwana walidacja**:
- Delegowana do FactionForm (React Hook Form + Zod)

**Typy**:
- `CreateFactionCommand`

**Propsy**:
```typescript
interface CreateFactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: CreateFactionCommand) => Promise<void>;
  isSubmitting: boolean;
}
```

### EditFactionModal

**Opis komponentu**: Identyczny jak CreateFactionModal, ale z preloaded danymi frakcji do edycji. Reużywa FactionForm.

**Główne elementy**: Jak CreateFactionModal, ale z danymi faction

**Obsługiwane interakcje**: Jak CreateFactionModal

**Obsługiwana walidacja**: Jak CreateFactionModal

**Typy**:
- `UpdateFactionCommand`
- `Faction` (do preload)

**Propsy**:
```typescript
interface EditFactionModalProps {
  isOpen: boolean;
  faction: Faction | null;
  onClose: () => void;
  onSubmit: (command: UpdateFactionCommand) => Promise<void>;
  isSubmitting: boolean;
}
```

### FactionForm

**Opis komponentu**: Formularz (reużywalny) do tworzenia i edycji frakcji. React Hook Form z walidacją Zod. Pola: name (required), description (Tiptap rich text z @mentions), goals (Tiptap rich text), image upload (drag & drop).

**Główne elementy**:
- Form (React Hook Form)
- Input "Name" (required, max 100 znaków)
- Tiptap editor "Description" (rich text z @mentions extension)
- Tiptap editor "Goals" (rich text)
- ImageUpload component (drag & drop, max 5 MB, preview)
- Hidden input z image_url po uploade

**Obsługiwane interakcje**:
- Wpisywanie w pola → walidacja na bieżąco
- @ w Tiptap → otworzenie autocomplete z encjami kampanii
- Upload obrazu → kompresja do WebP + preview + zapis URL w state
- Submit → walidacja wszystkich pól + wywołanie `onSubmit`

**Obsługiwana walidacja**:
- Zod schema:
  - name: string, min 1, max 100
  - description_json: optional Json
  - goals_json: optional Json
  - image_url: optional string URL
- Walidacja rozmiaru obrazu: max 5 MB
- Walidacja formatu obrazu: jpg, png, webp, gif

**Typy**:
- `CreateFactionCommand` lub `UpdateFactionCommand`

**Propsy**:
```typescript
interface FactionFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Faction>;
  campaignId: string;
  onSubmit: (data: CreateFactionCommand | UpdateFactionCommand) => void;
  isSubmitting: boolean;
}
```

### RelationshipModal

**Opis komponentu**: Mini modal do dodawania lub edycji relacji między frakcjami. Zawiera select drugiej frakcji (autocomplete), select typu relacji, textarea opisu.

**Główne elementy**:
- Dialog component (max-w-md, compact)
- DialogHeader: tytuł "Add Relationship" lub "Edit Relationship"
- Form z polami:
  - Select "Faction" (autocomplete, search, wyłączona bieżąca frakcja)
  - Select "Relationship Type" (alliance/war/rivalry/neutral)
  - Textarea "Description" (optional)
- DialogFooter: przyciski Cancel + Save Relationship

**Obsługiwane interakcje**:
- Wpisywanie w select Faction → fuzzy search po nazwach frakcji
- Wybór typu relacji → zmiana selected option
- Submit → walidacja + wywołanie `onSubmit` + zamknięcie

**Obsługiwana walidacja**:
- Zod schema:
  - faction_id_2: required string (uuid)
  - relationship_type: required enum (alliance/war/rivalry/neutral)
  - description: optional string max 500
- Walidacja: faction_id_1 !== faction_id_2 (frakcja nie może mieć relacji ze sobą)

**Typy**:
- `CreateFactionRelationshipCommand`
- `UpdateFactionRelationshipCommand`

**Propsy**:
```typescript
interface RelationshipModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  factionId: string; // bieżąca frakcja
  relationship?: FactionRelationship | null; // dla edit
  availableFactions: Faction[]; // wszystkie frakcje kampanii (filtered bez bieżącej)
  onClose: () => void;
  onSubmit: (command: CreateFactionRelationshipCommand | UpdateFactionRelationshipCommand) => Promise<void>;
  isSubmitting: boolean;
}
```

### DeleteFactionDialog

**Opis komponentu**: Alert dialog potwierdzający usunięcie frakcji. Wyświetla ostrzeżenie, że akcja jest nieodwracalna i NPCs przypisani do frakcji zostaną odłączeni (faction_id → NULL).

**Główne elementy**:
- AlertDialog (shadcn/ui)
- AlertDialogHeader: tytuł "Delete Faction"
- AlertDialogDescription: ostrzeżenie z nazwą frakcji
- AlertDialogFooter: Cancel + Delete (destructive)

**Obsługiwane interakcje**:
- Kliknięcie "Cancel" → zamknięcie dialogu
- Kliknięcie "Delete" → wywołanie `onConfirm()` + zamknięcie

**Obsługiwana walidacja**: Brak (confirmation dialog)

**Typy**: String (nazwa frakcji)

**Propsy**:
```typescript
interface DeleteFactionDialogProps {
  isOpen: boolean;
  factionName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}
```

## 5. Typy

### DTO Types (z API)

```typescript
// Z src/types/factions.ts
export type Faction = Tables<'factions'>;

// Database table structure:
interface FactionsTable {
  id: string; // uuid
  campaign_id: string; // uuid
  name: string; // varchar(100)
  description_json: Json | null; // jsonb (Tiptap document)
  goals_json: Json | null; // jsonb (Tiptap document)
  resources_json: Json | null; // jsonb (future use)
  image_url: string | null; // text (Supabase Storage URL)
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}
```

### Command Models

```typescript
// Create faction command
export interface CreateFactionCommand {
  name: string;
  description_json?: Json | null;
  goals_json?: Json | null;
  resources_json?: Json | null;
  image_url?: string | null;
}

// Update faction command (partial)
export interface UpdateFactionCommand {
  name?: string;
  description_json?: Json | null;
  goals_json?: Json | null;
  resources_json?: Json | null;
  image_url?: string | null;
}
```

### Faction Relationship Types

```typescript
// Z src/types/faction-relationships.ts
export type FactionRelationship = Tables<'faction_relationships'>;

// Database table structure:
interface FactionRelationshipsTable {
  id: string; // uuid
  faction_id_1: string; // uuid
  faction_id_2: string; // uuid
  relationship_type: string; // varchar(50): alliance, war, rivalry, neutral
  description: string | null; // text
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

// Create relationship command
export interface CreateFactionRelationshipCommand {
  faction_id_1: string;
  faction_id_2: string;
  relationship_type: string;
  description?: string | null;
}

// Update relationship command
export interface UpdateFactionRelationshipCommand {
  relationship_type?: string;
  description?: string | null;
}
```

### View Model Types (nowe, specyficzne dla UI)

```typescript
// Extended faction z computed fields dla UI
export interface FactionViewModel extends Faction {
  membersCount: number; // liczba NPCs z faction_id === this.id
  relationshipsCount: number; // liczba relacji (faction_id_1 lub faction_id_2)
}

// Relationship z nazwą drugiej frakcji (dla UI)
export interface FactionRelationshipViewModel extends FactionRelationship {
  otherFactionId: string; // id drugiej frakcji (nie tej bieżącej)
  otherFactionName: string;
  otherFactionImageUrl: string | null;
}

// Backlink z entity mentions
export interface Backlink {
  id: string;
  entityType: 'npc' | 'quest' | 'location' | 'session' | 'lore' | 'story_arc' | 'story_item' | 'timeline_event';
  entityId: string;
  entityName: string;
  mentionContext?: string; // snippet treści z @mention
}

// Member (partial NPC) dla FactionMembersSection
export interface FactionMember {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}
```

### Form State Types

```typescript
// State modali w FactionsView
interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingFaction: Faction | null;
}

// State slideovera
interface SlideoverState {
  isOpen: boolean;
  selectedFactionId: string | null;
}

// State relationship modala
interface RelationshipModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingRelationship: FactionRelationship | null;
}

// State delete confirmation
interface DeleteConfirmationState {
  isOpen: boolean;
  faction: Faction | null;
}
```

## 6. Zarządzanie stanem

### React Query (server state)

**Queries**:
- `useFactionsQuery(campaignId)` - pobiera listę wszystkich frakcji kampanii
- `useFactionQuery(factionId)` - pobiera szczegóły pojedynczej frakcji
- `useFactionRelationshipsQuery(factionId)` - pobiera relacje frakcji
- `useNpcsQuery(campaignId, { factionId })` - pobiera NPCs dla danej frakcji (filtrowane)

**Mutations**:
- `useCreateFactionMutation(campaignId)` - tworzy nową frakcję
  - Optimistic update: dodaje temp faction do cache
  - onSuccess: invaliduje ['factions', campaignId]
  - onError: rollback do previous state
- `useUpdateFactionMutation(campaignId)` - aktualizuje frakcję
  - Optimistic update: modyfikuje faction w cache
  - onSuccess: invaliduje ['factions', campaignId] + ['faction', factionId]
  - onError: rollback
- `useDeleteFactionMutation(campaignId)` - usuwa frakcję
  - Optimistic update: usuwa faction z cache
  - onSuccess: invaliduje queries + zamyka slideover
  - onError: rollback + toast error
- `useCreateFactionRelationshipMutation()` - dodaje relację
  - onSuccess: invaliduje ['faction-relationships', faction_id_1] + ['faction-relationships', faction_id_2]
- `useUpdateFactionRelationshipMutation()` - edytuje relację
- `useDeleteFactionRelationshipMutation()` - usuwa relację

### Local Component State

**FactionsView**:
```typescript
const [modalState, setModalState] = useState<ModalState>({
  isOpen: false,
  mode: 'create',
  editingFaction: null,
});

const [slideoverState, setSlideoverState] = useState<SlideoverState>({
  isOpen: false,
  selectedFactionId: null,
});

const [relationshipModalState, setRelationshipModalState] = useState<RelationshipModalState>({
  isOpen: false,
  mode: 'create',
  editingRelationship: null,
});

const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
  isOpen: false,
  faction: null,
});
```

**FactionForm**:
- React Hook Form state (useForm hook)
- Tiptap editor state (local, synced z form)
- Image upload state (uploading: boolean, preview: string | null)

**Nie jest wymagany custom hook** - standardowy wzorzec React Query + local state jest wystarczający.

## 7. Integracja API

### Endpoints wykorzystywane przez widok

**GET /api/campaigns/:campaignId/factions**
- Query: `include=backlinks,members,relationships` (optional)
- Response: `{ factions: Faction[], total: number }`
- Hook: `useFactionsQuery(campaignId)`
- Wywołanie: przy montowaniu FactionsView

**POST /api/campaigns/:campaignId/factions**
- Request body: `CreateFactionCommand`
- Response: `Faction` (201 Created)
- Hook: `useCreateFactionMutation(campaignId)`
- Wywołanie: submit CreateFactionModal

**GET /api/campaigns/:campaignId/factions/:id**
- Query: `include=backlinks,members,relationships`
- Response: `Faction` z joined members, relationships, backlinks
- Hook: `useFactionQuery(factionId)`
- Wywołanie: otwarcie FactionDetailSlideover

**PATCH /api/campaigns/:campaignId/factions/:id**
- Request body: `UpdateFactionCommand` (partial)
- Response: `Faction` (200 OK)
- Hook: `useUpdateFactionMutation(campaignId)`
- Wywołanie: submit EditFactionModal lub inline edycja description/goals

**DELETE /api/campaigns/:campaignId/factions/:id**
- Response: 204 No Content
- Hook: `useDeleteFactionMutation(campaignId)`
- Wywołanie: potwierdzenie DeleteFactionDialog

**Faction Relationships**:

**GET /api/campaigns/:campaignId/faction-relationships?factionId=:id**
- Response: `FactionRelationship[]`
- Hook: `useFactionRelationshipsQuery(factionId)`

**POST /api/campaigns/:campaignId/faction-relationships**
- Request body: `CreateFactionRelationshipCommand`
- Response: `FactionRelationship` (201)
- Hook: `useCreateFactionRelationshipMutation()`

**PATCH /api/campaigns/:campaignId/faction-relationships/:id**
- Request body: `UpdateFactionRelationshipCommand`
- Response: `FactionRelationship` (200)
- Hook: `useUpdateFactionRelationshipMutation()`

**DELETE /api/campaigns/:campaignId/faction-relationships/:id**
- Response: 204 No Content
- Hook: `useDeleteFactionRelationshipMutation()`

### Typy żądań i odpowiedzi

Wszystkie typy są zdefiniowane w:
- `src/types/factions.ts` - Faction, CreateFactionCommand, UpdateFactionCommand
- `src/types/faction-relationships.ts` - FactionRelationship, Create/UpdateRelationshipCommand

API helpers w:
- `src/lib/api/factions.ts` - getFactions, getFaction, createFaction, updateFaction, deleteFaction
- `src/lib/api/faction-relationships.ts` - get/create/update/delete relationship functions

Hooki React Query w:
- `src/hooks/useFactions.ts` - useFactionsQuery, useFactionQuery, mutations
- `src/hooks/useFactionRelationships.ts` - relationships queries + mutations

## 8. Interakcje użytkownika

### Przeglądanie frakcji

1. Użytkownik wchodzi na `/campaigns/:id/factions`
2. System pobiera listę frakcji (GET /factions) i NPCs (dla members count)
3. Wyświetla FactionsGrid z kartami frakcji
4. Użytkownik widzi każdą frakcję z obrazem, nazwą, badges (members count, relationships count)

### Tworzenie nowej frakcji

1. Użytkownik klika "Add Faction" w headerze
2. Otwiera się CreateFactionModal
3. Użytkownik wypełnia formularz:
   - Name (required)
   - Description (Tiptap, optional, z @mentions)
   - Goals (Tiptap, optional)
   - Image (upload, optional, max 5 MB)
4. System waliduje dane (Zod schema)
5. Użytkownik klika "Create Faction"
6. System:
   - Kompresuje obraz do WebP (jeśli uploaded)
   - Wysyła POST /factions z CreateFactionCommand
   - Optimistic update: dodaje temp faction do cache
   - Toast: "Faction created"
   - Zamyka modal
   - Invaliduje queries
7. Nowa frakcja pojawia się w gridzie

### Przeglądanie szczegółów frakcji

1. Użytkownik klika kartę frakcji w gridzie
2. System:
   - Otwiera FactionDetailSlideover (slideover z prawej, 700px)
   - Pobiera szczegóły frakcji (GET /factions/:id?include=members,relationships,backlinks)
3. Slideover wyświetla:
   - Header z nazwą, Edit, Delete, Close
   - Obraz (banner)
   - Description (rich text, display mode)
   - Goals (rich text, display mode)
   - Members (grid NPC mini cards, auto z NPCs gdzie faction_id === this.id)
   - Relationships (lista z drugą frakcją, type badge, description, Edit/Remove)
   - Backlinks ("Mentioned In")
4. Użytkownik może:
   - Kliknąć NPC mini card → nawigacja do NPC
   - Kliknąć backlink → nawigacja do źródła
   - Hover @mention → preview card
   - Kliknąć Edit w sekcji → inline edycja lub modal
   - Kliknąć "+ Add Relationship" → otwiera RelationshipModal

### Edycja frakcji

1. Użytkownik klika "Edit" w FactionDetailSlideover header
2. Otwiera się EditFactionModal z preloaded danymi
3. Użytkownik modyfikuje pola (np. zmienia description, dodaje goals)
4. Klika "Save"
5. System:
   - Waliduje (Zod)
   - Wysyła PATCH /factions/:id z UpdateFactionCommand
   - Optimistic update: modyfikuje faction w cache
   - Toast: "Faction updated"
   - Zamyka modal
   - Invaliduje queries
6. Slideover odświeża się z nowymi danymi

### Inline edycja description/goals

1. Użytkownik klika "Edit" w FactionDescriptionSection
2. Sekcja przełącza się na tryb edycji (Tiptap editor editable + toolbar)
3. Użytkownik edytuje treść, używa @mentions
4. Klika "Save"
5. System:
   - Wysyła PATCH /factions/:id z tylko { description_json: newJson }
   - Optimistic update
   - Toast: "Description updated"
   - Przełącza z powrotem na display mode
6. Alternatywa: kliknięcie "Cancel" → discard changes, powrót do display mode

### Dodawanie relacji między frakcjami

1. Użytkownik klika "+ Add Relationship" w FactionRelationshipsSection
2. Otwiera się RelationshipModal
3. Formularz zawiera:
   - Select "Faction" (autocomplete, search po nazwach, wyłączona bieżąca frakcja)
   - Select "Relationship Type" (alliance/war/rivalry/neutral)
   - Textarea "Description" (optional)
4. Użytkownik wybiera drugą frakcję, typ relacji, wpisuje opis
5. Klika "Save Relationship"
6. System:
   - Waliduje: faction_id_1 !== faction_id_2
   - Wysyła POST /faction-relationships z CreateFactionRelationshipCommand
   - Toast: "Relationship created"
   - Zamyka modal
   - Invaliduje ['faction-relationships', faction_id_1] + ['faction-relationships', faction_id_2]
7. Nowa relacja pojawia się w liście relationships w slideoverze

### Edycja relacji

1. Użytkownik klika "Edit" przy RelationshipItem
2. Otwiera się RelationshipModal w trybie edit z preloaded danymi
3. Użytkownik modyfikuje typ relacji lub opis
4. Klika "Save"
5. System:
   - Wysyła PATCH /faction-relationships/:id
   - Toast: "Relationship updated"
   - Invaliduje queries
6. Lista relacji odświeża się

### Usuwanie relacji

1. Użytkownik klika "Remove" przy RelationshipItem
2. System wyświetla inline confirmation (opcjonalnie alert dialog)
3. Użytkownik potwierdza
4. System:
   - Wysyła DELETE /faction-relationships/:id
   - Optimistic update: usuwa z cache
   - Toast: "Relationship removed"
   - Invaliduje queries
5. Relacja znika z listy

### Usuwanie frakcji

1. Użytkownik klika "Delete" w FactionDetailSlideover header
2. Otwiera się DeleteFactionDialog z ostrzeżeniem
3. Dialog wyświetla: "Are you sure you want to delete [Faction Name]? NPCs assigned to this faction will be unassigned."
4. Użytkownik klika "Delete"
5. System:
   - Wysyła DELETE /factions/:id
   - Optimistic update: usuwa faction z cache
   - Toast: "Faction deleted"
   - Zamyka slideover + dialog
   - Invaliduje queries
6. Frakcja znika z gridu
7. NPCs z faction_id === deleted.id mają faction_id → NULL (ON DELETE SET NULL)

### Zmiana obrazu frakcji (inline w slideoverze)

1. Użytkownik widzi FactionImageSection w slideoverze
2. Hover nad obrazem → pojawia się overlay z ikoną upload
3. Użytkownik:
   - Klika overlay → otwiera file picker, wybiera obraz
   - Lub: drag & drop obrazu na sekcję
4. System:
   - Waliduje: max 5 MB, tylko obrazy
   - Kompresuje do WebP
   - Uploaduje do Supabase Storage
   - Wysyła PATCH /factions/:id z { image_url: newUrl }
   - Optimistic update: zmienia image_url w cache
   - Toast: "Image updated"
5. Nowy obraz wyświetla się w slideoverze i karcie w gridzie

### Nawigacja do członka frakcji (NPC)

1. Użytkownik klika MemberMiniCard w FactionMembersSection
2. System nawiguje Next.js router do `/campaigns/:id/npcs/:npcId`
3. Otwiera się pełna karta NPC (w nowym widoku lub slideoverze, zgodnie z architekturą NPCs view)

### Kliknięcie @mention

1. Użytkownik hover nad @mention w description/goals
2. System wyświetla HoverCard z quick preview encji (nazwa, typ, miniatura info)
3. Użytkownik klika @mention
4. System nawiguje do pełnej karty encji (NPC/Quest/Location/etc.)

### Przeglądanie backlinks

1. Użytkownik scrolluje do BacklinksSection w slideoverze
2. Widzi listę wszystkich miejsc, gdzie frakcja została @mentioned
3. Każdy backlink pokazuje: ikonę typu, nazwę źródła, snippet (opcjonalnie)
4. Użytkownik klika backlink
5. System nawiguje do źródła (NPC/Quest/Session Log/etc.) i podświetla @mention (opcjonalnie)

## 9. Warunki i walidacja

### Warunki weryfikowane przez API (RLS Supabase)

**Factions table RLS policies**:
- SELECT: user_id = campaign.user_id (tylko właściciel kampanii widzi frakcje)
- INSERT: user_id = campaign.user_id (tylko właściciel może tworzyć)
- UPDATE: user_id = campaign.user_id (tylko właściciel może edytować)
- DELETE: user_id = campaign.user_id (tylko właściciel może usuwać)

**Faction Relationships RLS**:
- SELECT/INSERT/UPDATE/DELETE: user_id = campaign.user_id (dla obu frakcji)

### Warunki weryfikowane na poziomie frontendu

**FactionsView**:
- `campaignId` nie może być null/undefined przed renderowaniem (guard w parent)
- Jeśli `isLoading === true` → wyświetl loading state (skeleton cards)
- Jeśli `error !== null` → wyświetl error state z komunikatem
- Jeśli `factions.length === 0` → wyświetl empty state "No factions yet"

**FactionCard**:
- Jeśli `faction.image_url === null` → wyświetl placeholder image
- Jeśli `membersCount === 0` → badge "0 members" (ale widoczny)
- Jeśli `relationshipsCount === 0` → badge "0 relationships"

**FactionDetailSlideover**:
- `faction !== null` przed renderowaniem zawartości (conditional rendering)
- Jeśli `faction === null` → nie renderuj slideovera (isOpen=false)

**FactionDescriptionSection**:
- Jeśli `descriptionJson === null` → wyświetl placeholder "No description yet"
- W trybie display: Tiptap readonly, toolbar hidden

**FactionGoalsSection**:
- Jeśli `goalsJson === null` → placeholder "No goals defined"

**FactionMembersSection**:
- Jeśli `members.length === 0` → empty state "No members yet. Assign NPCs to this faction from their character cards."
- Filter NPCs gdzie `npc.faction_id === faction.id` (verification)

**FactionRelationshipsSection**:
- Jeśli `relationships.length === 0` → empty state "No relationships yet"
- Filter relationships gdzie `faction_id_1 === faction.id` OR `faction_id_2 === faction.id`

**BacklinksSection**:
- Jeśli `backlinks.length === 0` → empty state "Not mentioned anywhere yet"

**FactionForm walidacja (Zod schema)**:
```typescript
const factionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description_json: z.any().nullable().optional(), // Json type
  goals_json: z.any().nullable().optional(),
  resources_json: z.any().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});
```

- `name`: wymagane, min 1 znak, max 100 znaków
- Real-time validation: onChange
- Submit validation: przed wywołaniem API
- Jeśli validation fails → wyświetl error messages pod polami

**Image upload walidacja**:
- Max size: 5 MB
- Allowed types: image/jpeg, image/png, image/webp, image/gif
- Jeśli validation fails → toast error "Image too large (max 5 MB)" lub "Invalid file type"

**RelationshipModal walidacja**:
```typescript
const relationshipSchema = z.object({
  faction_id_2: z.string().uuid('Invalid faction'),
  relationship_type: z.enum(['alliance', 'war', 'rivalry', 'neutral']),
  description: z.string().max(500).nullable().optional(),
});
```

- `faction_id_2`: wymagane, uuid
- Custom validation: `faction_id_1 !== faction_id_2`
  - Jeśli fail → error "Cannot create relationship with itself"
- `relationship_type`: wymagane, jeden z 4 typów
- `description`: optional, max 500 znaków

**Delete confirmation**:
- Wyświetl ostrzeżenie: "This action cannot be undone. NPCs assigned to this faction will be unassigned."
- Użytkownik musi kliknąć "Delete" (nie wystarczy Enter)

### Warunki wpływające na stan UI

**Przyciski disabled states**:
- "Add Faction" disabled jeśli `isLoading === true` (podczas ładowania kampanii)
- "Create Faction" / "Save" disabled jeśli `isSubmitting === true` lub validation fails
- "Delete" disabled jeśli `isDeleting === true`
- "Save Relationship" disabled jeśli `isSubmitting === true` lub validation fails

**Loading states**:
- FactionsGrid: skeleton cards podczas `isLoading`
- FactionDetailSlideover: spinner podczas ładowania szczegółów frakcji
- Image upload: spinner overlay podczas uploadu

**Error states**:
- Jeśli API error → toast error z komunikatem
- Jeśli network error (Failed to fetch) → toast "Network error. Please check your connection."
- Jeśli 404 Not Found → redirect do /campaigns lub wyświetl error "Faction not found"
- Jeśli 401 Unauthorized → redirect do /login

**Optimistic updates**:
- Create: temp faction pojawia się w gridzie natychmiast
- Update: zmiany widoczne natychmiast w slideoverze
- Delete: faction znika z gridu natychmiast
- Jeśli API error → rollback do previous state + toast error

## 10. Obsługa błędów

### Błędy API

**401 Unauthorized**:
- Przyczyna: user not authenticated lub session expired
- Obsługa: redirect do /login (useRouter)
- Toast: "Session expired. Please log in again."

**403 Forbidden**:
- Przyczyna: user nie jest właścicielem kampanii (RLS policy fail)
- Obsługa: toast error "You don't have permission to access this campaign"
- Optional: redirect do /campaigns

**404 Not Found**:
- Przyczyna: faction doesn't exist lub campaign doesn't exist
- Obsługa: toast error "Faction not found"
- Zamknięcie slideovera jeśli był otwarty
- Invalidate queries

**409 Conflict** (circular relationship):
- Przyczyna: próba utworzenia relationship gdzie faction_id_1 === faction_id_2
- Obsługa: validation na frontendzie zapobiega, ale jeśli przejdzie:
  - Toast error "Cannot create relationship with itself"
  - Form errors

**500 Internal Server Error**:
- Przyczyna: błąd serwera/bazy danych
- Obsługa: toast error "Something went wrong. Please try again later."
- Rollback optimistic update

### Błędy sieciowe

**Network Error (Failed to fetch)**:
- Przyczyna: brak internetu, serwer niedostępny
- Detection: `error instanceof TypeError && error.message === 'Failed to fetch'`
- Obsługa:
  - Toast error "Network error. Please check your connection."
  - Rollback optimistic update
  - Retry button w toast (opcjonalnie)

**Timeout**:
- Przyczyna: request trwa zbyt długo
- Obsługa: abort request + toast error "Request timed out"

### Błędy walidacji

**Form validation errors** (Zod):
- Wyświetlenie error messages pod polami w czasie rzeczywistym
- Zablokowanie submit button gdy validation fails
- Przykłady:
  - "Name is required"
  - "Name too long (max 100 characters)"
  - "Invalid image format"
  - "Image too large (max 5 MB)"

**Image upload errors**:
- File size > 5 MB → toast "Image too large. Maximum size is 5 MB."
- Invalid file type → toast "Invalid file type. Please upload an image (JPG, PNG, WebP, GIF)."
- Upload failed → toast "Image upload failed. Please try again."

### Przypadki brzegowe

**Pusta lista frakcji**:
- Wyświetl EmptyState component:
  - Ikona (empty box)
  - Heading "No factions yet"
  - Description "Create your first faction to start tracking organizations in your campaign"
  - Button "Add Faction" (primary action)

**Brak członków frakcji**:
- W FactionMembersSection empty state:
  - "No members yet. Assign NPCs to this faction from their character cards."

**Brak relacji**:
- W FactionRelationshipsSection empty state:
  - "No relationships yet. Add relationships to track alliances and conflicts."

**Brak backlinks**:
- W BacklinksSection empty state:
  - "Not mentioned anywhere yet."

**Frakcja bez obrazu**:
- Wyświetl placeholder image (generic faction icon/pattern)
- Zachowaj aspect-ratio (16:9)

**Long names (truncate)**:
- FactionCard: truncate name jeśli > 50 znaków (`truncate` class)
- FactionDetailHeader: truncate jeśli > 80 znaków

**Usunięcie frakcji która jest mentioned**:
- System nie blokuje delete
- Backlinks w innych encjach: @mention pozostaje, ale kliknięcie → 404 (graceful handling: toast "Referenced faction no longer exists")
- Alternatywa: przed delete wyświetl warning "This faction is mentioned in X places" (advanced)

**Próba dodania relationship z frakcją, która już ma relationship**:
- Backend może zablokować duplikaty (unique constraint na faction_id_1 + faction_id_2)
- Frontend: przed submit sprawdź czy relationship już istnieje
- Jeśli istnieje → toast "Relationship already exists"

**NPC przypisany do usuniętej frakcji**:
- ON DELETE SET NULL: npc.faction_id → NULL
- W karcie NPC: faction field pusty, można przypisać nową

**Równoczesna edycja (race condition)**:
- React Query automatycznie handleuje poprzez invalidation
- Jeśli dwa users edytują jednocześnie → last write wins
- Optimistic update może zostać overwritten przy następnym fetch

**Offline mode**:
- React Query retry logic (1 retry)
- Jeśli fail → toast "No internet connection. Changes will sync when you're back online." (opcjonalne, w MVP może być tylko error)

### Logging i debugging

**Console.error dla wszystkich API errors**:
```typescript
catch (error) {
  console.error('Failed to create faction:', error);
  // toast user-facing message
}
```

**Error boundaries** (opcjonalne dla MVP):
- React Error Boundary wrapper dla FactionsView
- Fallback UI: "Something went wrong. Please refresh the page."

## 11. Kroki implementacji

### Krok 1: Setup routingu i struktury podstawowej

**Cel**: Utworzenie struktury plików i podstawowego routingu.

**Zadania**:
1. Utwórz folder `src/app/(dashboard)/campaigns/[id]/factions/`
2. Utwórz plik `page.tsx` z async server component (pattern jak w characters page)
3. Utwórz folder `src/components/campaigns/`
4. Utwórz `FactionsPageClient.tsx` (wrapper component, pattern jak CharactersPageClient)
5. Utwórz folder `src/components/factions/`
6. Utwórz `FactionsView.tsx` (główny view component, szkielet)
7. Przetestuj routing: `/campaigns/:id/factions` powinien wyświetlić podstawowy komponent

**Pliki do utworzenia**:
- `src/app/(dashboard)/campaigns/[id]/factions/page.tsx`
- `src/components/campaigns/FactionsPageClient.tsx`
- `src/components/factions/FactionsView.tsx`

### Krok 2: Implementacja hooków React Query

**Cel**: Utworzenie wszystkich hooków do komunikacji z API.

**Zadania**:
1. Sprawdź czy `src/hooks/useFactions.ts` już istnieje (w pliku wejściowym wskazany jako istniejący)
2. Sprawdź czy `src/hooks/useFactionRelationships.ts` istnieje
3. Jeśli nie istnieją, utwórz je zgodnie ze wzorcem z useCharacters:
   - `useFactionsQuery(campaignId)` - fetch list
   - `useFactionQuery(factionId)` - fetch single
   - `useCreateFactionMutation(campaignId)` - create z optimistic update
   - `useUpdateFactionMutation(campaignId)` - update z optimistic update
   - `useDeleteFactionMutation(campaignId)` - delete z optimistic update
4. Utwórz hooki dla relationships:
   - `useFactionRelationshipsQuery(factionId)`
   - `useCreateFactionRelationshipMutation()`
   - `useUpdateFactionRelationshipMutation()`
   - `useDeleteFactionRelationshipMutation()`
5. Dodaj error handling (network errors, auth errors)
6. Dodaj toast notifications (Sonner) dla success/error
7. Przetestuj hooki w isolation (wywołaj w FactionsView)

**Pliki do sprawdzenia/utworzenia**:
- `src/hooks/useFactions.ts` (prawdopodobnie już istnieje)
- `src/hooks/useFactionRelationships.ts` (prawdopodobnie już istnieje)

### Krok 3: Implementacja FactionsView state management

**Cel**: Zarządzanie stanem modali, slideoverów i operacji CRUD w głównym komponencie.

**Zadania**:
1. W `FactionsView.tsx` dodaj local state:
   - `modalState` (create/edit modal)
   - `slideoverState` (faction detail)
   - `relationshipModalState`
   - `deleteConfirmation`
2. Zaimportuj hooki z kroku 2
3. Dodaj handlery:
   - `handleAddFaction()` - otwiera create modal
   - `handleFactionClick(id)` - otwiera slideover
   - `handleEditFaction(faction)` - otwiera edit modal
   - `handleDeleteFaction(id)` - otwiera delete dialog
   - `handleSubmitCreate(command)` - wywołuje mutation
   - `handleSubmitUpdate(command)` - wywołuje mutation
   - `handleConfirmDelete()` - wywołuje delete mutation
4. Dodaj warunkowe renderowanie dla loading/error states
5. Przetestuj flow: kliknięcie "Add" → otwarcie modala (nawet jeśli modal jest pusty)

**Plik**:
- `src/components/factions/FactionsView.tsx`

### Krok 4: Implementacja FactionsHeader

**Cel**: Header z breadcrumb i przyciskiem Add Faction.

**Zadania**:
1. Utwórz `src/components/factions/FactionsHeader.tsx`
2. Dodaj Breadcrumb (shadcn/ui):
   - Link "My Campaigns" → /campaigns
   - Link "[Campaign Name]" → /campaigns/:id
   - Span "Factions" (current)
3. Dodaj H1 "Factions"
4. Dodaj Button "Add Faction" (emerald, callback onAddFaction)
5. Style: flex justify-between, responsive
6. Zaimportuj i użyj w FactionsView
7. Przetestuj: kliknięcie "Add Faction" powinno wywołać handler

**Plik**:
- `src/components/factions/FactionsHeader.tsx`

### Krok 5: Implementacja FactionsGrid i FactionCard

**Cel**: Grid z kartami frakcji.

**Zadania**:
1. Utwórz `src/components/factions/FactionsGrid.tsx`
2. Dodaj grid layout: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
3. Dodaj conditional rendering:
   - Loading state: skeleton cards (3-6 cards)
   - Empty state: EmptyState component (reuse z characters jeśli istnieje lub utwórz)
   - Success: map factions → FactionCard
4. Utwórz `src/components/factions/FactionCard.tsx`
5. Dodaj strukturę karty:
   - Card (shadcn/ui)
   - Image (banner, aspect-ratio 16:9, fallback placeholder)
   - H3 nazwa frakcji (truncate)
   - Badge "X members" (secondary)
   - Badge "X relationships" (secondary)
6. Dodaj hover effects: scale-105, shadow-lg transition
7. Dodaj onClick handler → wywołanie callback onFactionClick(id)
8. Zaimportuj FactionsGrid w FactionsView, podaj factions z query
9. Przetestuj: grid powinien wyświetlić karty, kliknięcie karty → console.log(id)

**Pliki**:
- `src/components/factions/FactionsGrid.tsx`
- `src/components/factions/FactionCard.tsx`
- `src/components/factions/EmptyState.tsx` (jeśli nie istnieje, reuse pattern)

### Krok 6: Implementacja CreateFactionModal i FactionForm

**Cel**: Modal tworzenia frakcji z formularzem.

**Zadania**:
1. Utwórz `src/components/factions/CreateFactionModal.tsx`
2. Użyj Dialog (shadcn/ui), szerokość max-w-2xl
3. DialogHeader: tytuł "Create Faction"
4. DialogContent: osadź FactionForm
5. DialogFooter: Cancel + "Create Faction" (emerald, disabled gdy isSubmitting)
6. Utwórz `src/components/factions/FactionForm.tsx`
7. Setup React Hook Form + Zod validation:
   - Schema: name (required, max 100), description_json (optional), goals_json (optional), image_url (optional)
8. Dodaj pola formularza:
   - Input "Name" (label + error message)
   - Placeholder dla Tiptap "Description" (na razie Textarea, Tiptap w następnym kroku)
   - Placeholder dla Tiptap "Goals" (Textarea)
   - Placeholder dla Image Upload (Input file, na razie basic)
9. Dodaj submit handler → wywołanie onSubmit(command)
10. Zaimportuj CreateFactionModal w FactionsView
11. Podmień state modalState.isOpen → isOpen prop
12. Przetestuj: wypełnienie formularza → submit → mutation → toast "Faction created" → zamknięcie modala → frakcja w gridzie

**Pliki**:
- `src/components/factions/CreateFactionModal.tsx`
- `src/components/factions/FactionForm.tsx`

### Krok 7: Integracja Tiptap rich text editor

**Cel**: Zastąpienie Textarea na Tiptap w FactionForm dla Description i Goals.

**Zadania**:
1. Sprawdź czy w projekcie istnieje komponent Tiptap wrapper (np. `RichTextEditor.tsx`)
2. Jeśli nie, utwórz `src/components/ui/RichTextEditor.tsx`:
   - Setup Tiptap z extensions: StarterKit, Placeholder, @mentions (custom extension)
   - Toolbar z przyciskami: bold, italic, heading, lists, etc.
   - Props: content (Json), onChange, placeholder, editable
3. Dodaj @mentions extension:
   - Suggestion plugin z autocomplete
   - Fetch entities z kampanii (NPCs, locations, quests, etc.)
   - Renderowanie jako badge z kolorem zależnym od typu
4. W FactionForm zamień Textarea "Description" na RichTextEditor
5. Zamień Textarea "Goals" na RichTextEditor
6. Sync Tiptap content z React Hook Form (controller)
7. Przetestuj:
   - Formatowanie tekstu (bold, lists)
   - Wpisanie @ → autocomplete z encjami
   - Wybór encji → wstawienie @mention badge
   - Submit → description_json i goals_json zapisane jako Tiptap JSON

**Pliki**:
- `src/components/ui/RichTextEditor.tsx` (jeśli nie istnieje)
- `src/components/factions/FactionForm.tsx` (update)

### Krok 8: Implementacja Image Upload w FactionForm

**Cel**: Drag & drop upload obrazu z kompresją do WebP.

**Zadania**:
1. Utwórz `src/components/ui/ImageUpload.tsx` (lub reuse jeśli istnieje)
2. Funkcjonalność:
   - Drag & drop area (border-dashed, hover effect)
   - File picker (hidden input, trigger przez button)
   - Walidacja: max 5 MB, tylko obrazy (jpg, png, webp, gif)
   - Preview wybranego obrazu (before upload)
   - Kompresja do WebP (library: browser-image-compression lub canvas API)
   - Upload do Supabase Storage
   - Return imageUrl → callback onChange(url)
3. Dodaj ImageUpload do FactionForm
4. Sync image_url z React Hook Form
5. Przetestuj:
   - Drag & drop → preview → upload → imageUrl w form state
   - Submit → faction utworzona z image_url → obraz w FactionCard

**Pliki**:
- `src/components/ui/ImageUpload.tsx`
- `src/components/factions/FactionForm.tsx` (update)

### Krok 9: Implementacja FactionDetailSlideover - struktura podstawowa

**Cel**: Slideover z szczegółami frakcji, podstawowa struktura.

**Zadania**:
1. Utwórz `src/components/factions/FactionDetailSlideover.tsx`
2. Użyj Sheet (shadcn/ui), side="right", width 700px
3. Dodaj SheetHeader z FactionDetailHeader (osobny komponent)
4. Dodaj ScrollArea z zawartością (na razie placeholdery):
   - Sekcja Image
   - Sekcja Description
   - Sekcja Goals
   - Sekcja Members
   - Sekcja Relationships
   - Sekcja Backlinks
5. Utwórz `src/components/factions/FactionDetailHeader.tsx`:
   - H2 nazwa frakcji (truncate)
   - Przyciski: Edit (secondary), Delete (destructive), Close (X icon)
   - Handlery: onEdit, onDelete, onClose (propsy)
6. Zaimportuj FactionDetailSlideover w FactionsView
7. Podmień slideoverState.isOpen → isOpen prop
8. Fetch faction details przy otwarciu: useFactionQuery(selectedFactionId)
9. Przetestuj: kliknięcie karty → otwarcie slideovera → wyświetlenie nazwy → kliknięcie Close → zamknięcie

**Pliki**:
- `src/components/factions/FactionDetailSlideover.tsx`
- `src/components/factions/FactionDetailHeader.tsx`

### Krok 10: Implementacja sekcji w FactionDetailSlideover

**Cel**: Wypełnienie slideovera rzeczywistymi sekcjami.

**Zadania**:
1. Utwórz `src/components/factions/FactionImageSection.tsx`:
   - Wyświetlenie obrazu (banner, aspect-ratio 16:9)
   - Overlay z ikoną upload na hover
   - Kliknięcie → file picker → upload → onImageUpdate callback
   - Reuse ImageUpload logic z kroku 8
2. Utwórz `src/components/factions/FactionDescriptionSection.tsx`:
   - H3 "Description"
   - Tiptap w display mode (readonly, bez toolbar)
   - Przycisk "Edit" → toggle edit mode
   - W edit mode: Tiptap editable + toolbar + Save/Cancel
   - Save → PATCH /factions/:id z { description_json }
3. Utwórz `src/components/factions/FactionGoalsSection.tsx`:
   - Identyczny jak FactionDescriptionSection, ale dla goals
4. Dodaj wszystkie sekcje do FactionDetailSlideover
5. Przetestuj:
   - Slideover wyświetla obraz, description, goals
   - Kliknięcie "Edit" → edycja inline → Save → update → odświeżenie

**Pliki**:
- `src/components/factions/FactionImageSection.tsx`
- `src/components/factions/FactionDescriptionSection.tsx`
- `src/components/factions/FactionGoalsSection.tsx`

### Krok 11: Implementacja FactionMembersSection

**Cel**: Sekcja z listą NPCs przypisanych do frakcji.

**Zadania**:
1. Utwórz `src/components/factions/FactionMembersSection.tsx`
2. Fetch NPCs dla kampanii: useNpcsQuery(campaignId)
3. Filter NPCs: `npcs.filter(npc => npc.faction_id === factionId)`
4. Grid layout: `grid grid-cols-2 md:grid-cols-3 gap-4`
5. Utwórz `src/components/factions/MemberMiniCard.tsx`:
   - Avatar (40x40px, rounded-full)
   - Name (H4, truncate)
   - Role (text-sm, muted)
   - Hover effect + cursor-pointer
   - onClick → nawigacja do `/campaigns/:id/npcs/:npcId`
6. Empty state jeśli brak członków
7. Dodaj FactionMembersSection do FactionDetailSlideover
8. Przetestuj:
   - Slideover wyświetla członków (jeśli są NPCs z faction_id)
   - Kliknięcie NPC → nawigacja do karty NPC (może być placeholder page na razie)

**Pliki**:
- `src/components/factions/FactionMembersSection.tsx`
- `src/components/factions/MemberMiniCard.tsx`

### Krok 12: Implementacja FactionRelationshipsSection i RelationshipModal

**Cel**: Sekcja z listą relacji + modal dodawania/edycji relacji.

**Zadania**:
1. Utwórz `src/components/factions/FactionRelationshipsSection.tsx`
2. Fetch relationships: useFactionRelationshipsQuery(factionId)
3. Dla każdej relacji: determine "other faction" (jeśli faction_id_1 === this, to other = faction_id_2)
4. Fetch factions list dla kampanii (potrzebne dla names/avatars drugiej frakcji)
5. Map relationships → RelationshipItem components
6. Przycisk "+ Add Relationship" (pełna szerokość, secondary)
7. Utwórz `src/components/factions/RelationshipItem.tsx`:
   - Avatar drugiej frakcji
   - Nazwa drugiej frakcji (H4)
   - Badge typu relacji (alliance=green, war=red, rivalry=orange, neutral=gray)
   - Description (text-sm, opcjonalny)
   - Przyciski: Edit (ghost, small), Remove (ghost destructive, small)
8. Utwórz `src/components/factions/RelationshipModal.tsx`:
   - Dialog (max-w-md, compact)
   - Select "Faction" (autocomplete z search, wyłączona bieżąca frakcja)
   - Select "Relationship Type" (dropdown: alliance/war/rivalry/neutral)
   - Textarea "Description" (optional, max 500)
   - React Hook Form + Zod validation
   - Submit → create lub update relationship mutation
9. Handlery w FactionDetailSlideover:
   - `handleAddRelationship()` → otwiera RelationshipModal (mode: create)
   - `handleEditRelationship(rel)` → otwiera modal (mode: edit, preloaded data)
   - `handleRemoveRelationship(id)` → inline confirmation + delete mutation
10. Dodaj FactionRelationshipsSection do slideovera
11. Przetestuj:
    - Wyświetlenie relacji (jeśli istnieją)
    - Kliknięcie "+ Add" → modal → wypełnienie → submit → relacja utworzona
    - Kliknięcie "Edit" → modal → edycja → submit → relacja zaktualizowana
    - Kliknięcie "Remove" → confirmation → delete → relacja usunięta

**Pliki**:
- `src/components/factions/FactionRelationshipsSection.tsx`
- `src/components/factions/RelationshipItem.tsx`
- `src/components/factions/RelationshipModal.tsx`

### Krok 13: Implementacja BacklinksSection

**Cel**: Sekcja "Mentioned In" z backlinks z entity mentions.

**Zadania**:
1. Utwórz `src/components/factions/BacklinksSection.tsx`
2. Fetch backlinks: query do entity_mentions table gdzie mentioned_entity_type = 'faction' AND mentioned_entity_id = factionId
3. Backend powinien zwracać: source entity type, id, name
4. Dla każdego backlink:
   - Ikona typu encji (NPC, Quest, Location, etc.)
   - Nazwa źródła
   - Link → nawigacja do źródła
5. Empty state jeśli brak backlinks
6. Dodaj BacklinksSection do FactionDetailSlideover (na dole, przed zamknięciem)
7. Przetestuj:
   - Jeśli frakcja jest @mentioned w NPC bio → backlink pojawia się
   - Kliknięcie backlink → nawigacja do NPC

**Plik**:
- `src/components/factions/BacklinksSection.tsx`

### Krok 14: Implementacja EditFactionModal

**Cel**: Modal edycji frakcji (reuse FactionForm).

**Zadania**:
1. Utwórz `src/components/factions/EditFactionModal.tsx`
2. Struktura identyczna jak CreateFactionModal
3. Tytuł: "Edit Faction"
4. Przycisk submit: "Save Changes"
5. Pass faction do FactionForm jako defaultValues (preload)
6. FactionForm w mode='edit'
7. Submit → wywołanie useUpdateFactionMutation
8. Zaimportuj w FactionsView
9. Handler: kliknięcie "Edit" w slideoverze → otwiera EditFactionModal
10. Przetestuj: edycja name, description → submit → faction zaktualizowana → slideover odświeżony

**Plik**:
- `src/components/factions/EditFactionModal.tsx`

### Krok 15: Implementacja DeleteFactionDialog

**Cel**: Alert dialog potwierdzenia usunięcia frakcji.

**Zadania**:
1. Utwórz `src/components/factions/DeleteFactionDialog.tsx`
2. Użyj AlertDialog (shadcn/ui)
3. AlertDialogTitle: "Delete Faction"
4. AlertDialogDescription: ostrzeżenie z nazwą frakcji + "NPCs assigned to this faction will be unassigned. This action cannot be undone."
5. AlertDialogFooter: Cancel + "Delete" (destructive, disabled gdy isDeleting)
6. Submit → wywołanie useDeleteFactionMutation
7. Zaimportuj w FactionsView
8. Handler: kliknięcie "Delete" w slideoverze → otwiera DeleteFactionDialog
9. Potwierdzenie → delete mutation → toast → zamknięcie slideovera + dialogu → frakcja znika z gridu
10. Przetestuj: usunięcie frakcji → NPCs z faction_id === deleted.id powinny mieć faction_id NULL

**Plik**:
- `src/components/factions/DeleteFactionDialog.tsx`

### Krok 16: Obsługa @mentions - integracja z autocomplete

**Cel**: Pełna integracja @mentions w Tiptap z fetched entities.

**Zadania**:
1. W RichTextEditor dodaj Mention extension (Tiptap)
2. Setup suggestion plugin:
   - onStart: fetch wszystkich entities kampanii (NPCs, locations, quests, factions, story arcs, items, sessions)
   - onFilter: fuzzy search po query
   - onRender: dropdown z listą entities (ikona typu + nazwa)
3. Renderowanie mention w treści:
   - Badge z kolorem zależnym od typu (NPC=blue, Location=green, Quest=purple, Faction=yellow, etc.)
   - Hover → HoverCard z quick preview (nazwa, typ, miniatura info)
   - Click → nawigacja do karty encji
4. Backend: zapisywanie mentions do entity_mentions table (automatyczne przy save description/goals)
5. Przetestuj:
   - Wpisanie @ w description → autocomplete z NPCs/locations/etc.
   - Wybór encji → mention badge wstawiony
   - Submit → mention zapisany w JSON
   - Wyświetlenie w display mode → badge klikalny
   - Backlinks: frakcja pojawia się w "Mentioned In" drugiej encji

**Pliki**:
- `src/components/ui/RichTextEditor.tsx` (update)
- Backend: trigger lub API helper do zapisywania entity_mentions

### Krok 17: Responsywność i polish UI

**Cel**: Dopracowanie responsywności i UX.

**Zadania**:
1. Test na różnych rozdzielczościach:
   - Mobile (375px): grid 1 kolumna, slideover full width
   - Tablet (768px): grid 2 kolumny
   - Desktop (1280px+): grid 3 kolumny
2. Breadcrumb: responsywne (collapse na mobile z dropdown)
3. FactionCard: hover effects, transitions smooth
4. Slideover: scroll behavior (sticky header)
5. Modals: max height + scroll jeśli za dużo contentu
6. Loading states: skeleton placeholders vs spinners (consistency)
7. Empty states: ilustracje/ikony (reuse z innych views)
8. Accessibility:
   - ARIA labels na przyciskach
   - Keyboard navigation (Tab, Enter, Escape)
   - Focus management (po zamknięciu modala → focus na trigger button)
9. Dark mode: sprawdź czy wszystkie kolory są poprawne (jeśli projekt obsługuje)
10. Przetestuj UX flow end-to-end: create → view → edit → add relationship → delete

**Pliki**: wszystkie komponenty (update)

### Krok 18: Testy jednostkowe i integracyjne

**Cel**: Pokrycie kluczowych komponentów testami.

**Zadania**:
1. Setup test utils (jeśli nie istnieją): render z React Query provider, router mock
2. Testy jednostkowe:
   - FactionCard: renderowanie, onClick
   - FactionsGrid: empty state, loading state, success state
   - FactionForm: walidacja (Zod), submit
   - RelationshipModal: walidacja (circular relationship prevention)
3. Testy integracyjne:
   - FactionsView: full CRUD flow (mock API)
   - Create faction → pojawienie się w gridzie
   - Delete faction → zniknięcie z gridu
4. Testy e2e (Playwright - opcjonalne dla MVP):
   - Full user flow: login → create campaign → add faction → view details → edit → delete
5. Przetestuj edge cases:
   - Pusta lista frakcji
   - Brak obrazu
   - Long names (truncate)
   - Brak członków/relacji/backlinks (empty states)

**Pliki**:
- `src/components/factions/*.test.tsx`

### Krok 19: Dokumentacja i finalizacja

**Cel**: Dokumentacja i code review przed mergem.

**Zadania**:
1. Dodaj JSDoc comments do głównych komponentów (purpose, props)
2. Update README (jeśli dotyczy): nowa sekcja Factions w features list
3. Update CHANGELOG (jeśli projekt używa): "Added Factions view for world building"
4. Code review:
   - Sprawdź consistency z resztą codebase (naming, patterns)
   - Sprawdź czy wszystkie TODOs są resolved
   - Sprawdź error handling (czy wszystkie API calls mają try-catch)
   - Sprawdź TypeScript errors (npm run tsc)
5. Lint: `npm run lint` → fix wszystkie warningi
6. Format: prettier (jeśli używany)
7. Commit: commit message zgodny z conventional commits (feat: add factions view)
8. Przetestuj full flow na staging/dev environment
9. Merge PR po review

**Pliki**: wszystkie (finalizacja)

### Krok 20: Optymalizacja i future enhancements (post-MVP)

**Cel**: Potencjalne ulepszenia po MVP (opcjonalne, low priority).

**Zadania**:
1. Infinite scroll dla dużej liczby frakcji (zamiast load all)
2. Bulk operations: select multiple factions → delete/export
3. Search bar w FactionsHeader (filter po nazwie, fuzzy search)
4. Sortowanie: alphabetically, by members count, by created date
5. Relationship graph visualization (D3.js, Cytoscape) - wizualizacja relacji jako graf
6. Export do PDF: faction report z description, members, relationships
7. Duplicate faction (szablon)
8. Faction templates (pre-defined organizations)
9. Advanced filtering: by relationship type, by members count
10. Notifications: jeśli faction jest mentioned w nowym session log → badge "new mention"

**Pliki**: nowe komponenty (opcjonalne)
