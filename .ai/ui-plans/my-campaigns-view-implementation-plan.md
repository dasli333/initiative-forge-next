# Plan implementacji widoku My Campaigns

## 1. Przegląd

Widok "My Campaigns" (`/campaigns`) jest głównym widokiem zarządzania kampaniami użytkownika. Jego celem jest wyświetlenie listy wszystkich kampanii należących do zalogowanego użytkownika w przejrzystym, responsywnym grid layout oraz umożliwienie podstawowych operacji: tworzenia nowych kampanii, edycji nazw istniejących kampanii oraz ich usuwania. Widok zawiera również empty state dla nowych użytkowników bez kampanii oraz skeleton loading states podczas ładowania danych.

## 2. Routing widoku

- **Ścieżka**: `/campaigns`
- **Plik**: `src/pages/campaigns.astro`
- **Typ**: Strona SSR z interaktywnymi komponentami React (client:load)

## 3. Struktura komponentów

```
campaigns.astro (Astro page)
└── MainLayout
    └── CampaignsContent (React, client:load)
        ├── CampaignsHeader
        ├── LoadingState (conditional: isLoading)
        ├── EmptyState (conditional: campaigns.length === 0)
        ├── CampaignsGrid (conditional: campaigns.length > 0)
        │   ├── CampaignCard[] (multiple instances)
        │   │   ├── Card (Shadcn)
        │   │   │   ├── CardHeader
        │   │   │   │   ├── EditableTitle (inline edit)
        │   │   │   │   └── DropdownMenu (Edit/Delete)
        │   │   │   ├── CardContent
        │   │   │   │   ├── CampaignStats (characters, combats)
        │   │   │   │   └── ActiveCombatBadge (conditional)
        │   │   │   └── CardFooter
        │   │   │       ├── LastModified
        │   │   │       └── SelectCampaignButton
        │   └── PlusTile
        ├── CreateCampaignModal (Dialog)
        │   └── CreateCampaignForm
        │       ├── Input (campaign name)
        │       └── FormActions (Cancel/Create buttons)
        └── DeleteCampaignModal (Dialog)
            └── ConfirmationContent
                ├── WarningMessage
                └── FormActions (Cancel/Delete buttons)
```

## 4. Szczegóły komponentów

### CampaignsContent

**Opis**: Główny kontener widoku zarządzający całym stanem kampanii i renderujący odpowiednie komponenty w zależności od stanu (loading, empty, success).

**Główne elementy**:
- Container div z padding i max-width
- Warunkowe renderowanie: LoadingState, EmptyState lub CampaignsHeader + CampaignsGrid
- Dwa modalne dialogi: CreateCampaignModal i DeleteCampaignModal

**Obsługiwane interakcje**:
- Montowanie komponentu → pobieranie listy kampanii (useCampaigns hook)
- Obsługa otwarcia/zamknięcia modali tworzenia i usuwania

**Obsługiwana walidacja**: Brak (walidacja w komponentach potomnych)

**Typy**:
- `ListCampaignsResponseDTO` (response z API)
- `CampaignViewModel` (rozszerzone CampaignDTO)

**Propsy**: Brak (root component)

**Hooki**:
- `useCampaigns()` - zarządzanie stanem kampanii
- `useState` dla stanów modali (isCreateModalOpen, deleteModalCampaign)

### CampaignsHeader

**Opis**: Nagłówek widoku wyświetlający tytuł strony oraz metadane o liczbie kampanii.

**Główne elementy**:
- `<h1>` z tekstem "My Campaigns"
- `<p>` z tekstem "X campaigns" (muted color)

**Obsługiwane interakcje**: Brak

**Obsługiwana walidacja**: Brak

**Typy**:
```typescript
interface CampaignsHeaderProps {
  totalCampaigns: number;
}
```

**Propsy**:
- `totalCampaigns: number` - całkowita liczba kampanii użytkownika

### LoadingState

**Opis**: Skeleton loading state wyświetlany podczas pobierania kampanii z API.

**Główne elementy**:
- CampaignsHeader z skeleton dla metadata
- Grid layout z 6 Skeleton komponentami (Card shape)

**Obsługiwane interakcje**: Brak

**Obsługiwana walidacja**: Brak

**Typy**: Brak propów

**Propsy**: Brak

### EmptyState

**Opis**: Wyświetlany gdy użytkownik nie ma żadnych kampanii. Zawiera call-to-action do utworzenia pierwszej kampanii.

**Główne elementy**:
- Ikona folderu (duża, muted) z Lucide icons
- Heading: "You don't have any campaigns yet"
- Subtext: "Create your first campaign to get started"
- Button: "Create Campaign" (emerald, z ikoną +)

**Obsługiwane interakcje**:
- onClick na buttonie → otwiera CreateCampaignModal

**Obsługiwana walidacja**: Brak

**Typy**:
```typescript
interface EmptyStateProps {
  onCreate: () => void;
}
```

**Propsy**:
- `onCreate: () => void` - callback do otwarcia modala tworzenia

### CampaignsGrid

**Opis**: Responsywny grid container dla campaign cards oraz plus tile.

**Główne elementy**:
- `<div>` z grid layout:
  - 3 kolumny (screen ≥ 1280px): `grid-cols-3`
  - 2 kolumny (1024px ≤ screen < 1280px): `lg:grid-cols-2`
  - 1 kolumna (screen < 1024px): domyślnie
- Gap między elementami: `gap-6`

**Obsługiwane interakcje**: Brak (przekazuje handlery do children)

**Obsługiwana walidacja**: Brak

**Typy**:
```typescript
interface CampaignsGridProps {
  campaigns: CampaignViewModel[];
  onCampaignSelect: (id: string) => void;
  onCampaignUpdate: (id: string, name: string) => Promise<void>;
  onCampaignDelete: (campaign: CampaignViewModel) => void;
  onCreate: () => void;
}
```

**Propsy**:
- `campaigns: CampaignViewModel[]` - lista kampanii do wyświetlenia
- `onCampaignSelect: (id: string) => void` - callback przy wyborze kampanii
- `onCampaignUpdate: (id: string, name: string) => Promise<void>` - callback przy edycji nazwy
- `onCampaignDelete: (campaign: CampaignViewModel) => void` - callback przy usuwaniu
- `onCreate: () => void` - callback do utworzenia nowej kampanii

### CampaignCard

**Opis**: Karta pojedynczej kampanii wyświetlająca wszystkie kluczowe informacje oraz umożliwiająca inline editing nazwy i usuwanie.

**Główne elementy**:
- Shadcn `Card` komponent z hover effect
- `CardHeader`:
  - `EditableTitle` - nazwa kampanii (edytowalna inline)
  - `DropdownMenu` z opcjami "Edit Name" i "Delete"
- `CardContent`:
  - Ikona 👤 + tekst "X characters"
  - Ikona ⚔️ + tekst "X combats"
  - Badge "Active combat" 🔴 (emerald, jeśli ma aktywną walkę)
- `CardFooter`:
  - Tekst "Last modified: [date]" (muted)
  - Button "Select Campaign" (emerald, full width)

**Obsługiwane interakcje**:
- Click na nazwie kampanii → przejście w tryb edycji (input)
- Enter lub blur w input → zapisanie nowej nazwy (onCampaignUpdate)
- Escape w input → anulowanie edycji
- Click "Edit Name" w dropdown → przejście w tryb edycji
- Click "Delete" w dropdown → otwarcie DeleteCampaignModal
- Click "Select Campaign" → nawigacja do szczegółów kampanii

**Obsługiwana walidacja**:
- Nazwa kampanii nie może być pusta (minLength: 1)
- Nazwa kampanii musi być unikalna dla użytkownika (sprawdzane przez API, 409 Conflict)
- W przypadku błędu 409 → revert changes + toast error
- W przypadku błędu sieciowego → revert changes + toast error

**Typy**:
```typescript
interface CampaignCardProps {
  campaign: CampaignViewModel;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (campaign: CampaignViewModel) => void;
  onSelect: (id: string) => void;
}
```

**Propsy**:
- `campaign: CampaignViewModel` - dane kampanii
- `onUpdate: (id: string, name: string) => Promise<void>` - callback przy edycji nazwy
- `onDelete: (campaign: CampaignViewModel) => void` - callback przy usuwaniu
- `onSelect: (id: string) => void` - callback przy wyborze kampanii

**Stan lokalny**:
- `isEditing: boolean` - czy jest w trybie edycji
- `editedName: string` - nazwa w trakcie edycji
- `isUpdating: boolean` - czy trwa zapisywanie

### EditableTitle

**Opis**: Podkomponent CampaignCard umożliwiający inline editing nazwy kampanii.

**Główne elementy**:
- W trybie display: `<h3>` z nazwą kampanii (cursor pointer, hover effect)
- W trybie edit: `<Input>` z autoFocus

**Obsługiwane interakcje**:
- Click na tytule → przejście w tryb edycji
- Enter → zapisanie
- Escape → anulowanie
- Blur → zapisanie (opcjonalnie: anulowanie, do ustalenia)

**Obsługiwana walidacja**:
- minLength: 1 (nie może być pusta)

**Typy**:
```typescript
interface EditableTitleProps {
  value: string;
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onSave: (newValue: string) => Promise<void>;
  onCancel: () => void;
}
```

**Propsy**:
- `value: string` - aktualna nazwa
- `isEditing: boolean` - czy w trybie edycji
- `isUpdating: boolean` - czy trwa zapisywanie
- `onEdit: () => void` - callback przy wejściu w tryb edycji
- `onSave: (newValue: string) => Promise<void>` - callback przy zapisaniu
- `onCancel: () => void` - callback przy anulowaniu

### PlusTile

**Opis**: Tile z dashed border służący do tworzenia nowej kampanii.

**Główne elementy**:
- `Card` z dashed border (`border-dashed`)
- Wyśrodkowana ikona "+" (Lucide Plus)
- Tekst "Create New Campaign"
- Hover effect: emerald glow (`hover:border-emerald-500`, `hover:shadow-emerald-500/20`)

**Obsługiwane interakcje**:
- Click → otwarcie CreateCampaignModal

**Obsługiwana walidacja**: Brak

**Typy**:
```typescript
interface PlusTileProps {
  onCreate: () => void;
}
```

**Propsy**:
- `onCreate: () => void` - callback do otwarcia modala tworzenia

### CreateCampaignModal

**Opis**: Modal dialog z formularzem do tworzenia nowej kampanii.

**Główne elementy**:
- Shadcn `Dialog` komponent
- `DialogHeader` z tytułem "Create New Campaign"
- `DialogContent`:
  - `Label` + `Input` dla nazwy kampanii
  - Error message (jeśli validation failed)
- `DialogFooter`:
  - Button "Cancel" (variant: outline)
  - Button "Create" (variant: default, emerald color, disabled podczas isCreating)

**Obsługiwane interakcje**:
- onChange w input → aktualizacja stanu nazwy
- Submit formularza (Enter lub click Create) → walidacja + POST /api/campaigns
- Click Cancel lub Escape → zamknięcie modala
- Blur poza modalem → zamknięcie modala (domyślne zachowanie Dialog)

**Obsługiwana walidacja**:
- Nazwa wymagana (required)
- minLength: 1
- maxLength: 100 (opcjonalnie)
- Unikalność nazwy sprawdzana przez API (409 Conflict)
- W przypadku 409 → wyświetlenie błędu "Campaign with this name already exists"
- W przypadku błędu sieciowego → wyświetlenie błędu "Something went wrong, please try again"

**Typy**:
```typescript
interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch campaigns
}

interface CreateCampaignFormData {
  name: string;
}
```

**Propsy**:
- `isOpen: boolean` - czy modal jest otwarty
- `onClose: () => void` - callback przy zamknięciu
- `onSuccess: () => void` - callback przy sukcesie (refetch campaigns)

**Stan lokalny**:
- `name: string` - nazwa kampanii w formularzu
- `isCreating: boolean` - czy trwa tworzenie
- `error: string | null` - błąd walidacji lub API

### DeleteCampaignModal

**Opis**: Confirmation modal dla usuwania kampanii z ostrzeżeniem o usunięciu powiązanych danych.

**Główne elementy**:
- Shadcn `Dialog` komponent
- `DialogHeader` z tytułem "Delete Campaign"
- `DialogContent`:
  - Ostrzeżenie: "This campaign has X characters and X combats. Deleting it will also delete all associated data. Are you sure?"
  - Jeśli nie ma postaci/walk: "Are you sure you want to delete this campaign?"
- `DialogFooter`:
  - Button "Cancel" (variant: outline)
  - Button "Delete" (variant: destructive, disabled podczas isDeleting)

**Obsługiwane interakcje**:
- Click Delete → DELETE /api/campaigns/:id + zamknięcie modala + optimistic update
- Click Cancel lub Escape → zamknięcie modala

**Obsługiwana walidacja**: Brak (tylko confirmation)

**Typy**:
```typescript
interface DeleteCampaignModalProps {
  campaign: CampaignViewModel | null; // null = modal closed
  onClose: () => void;
  onSuccess: () => void; // refetch campaigns
}
```

**Propsy**:
- `campaign: CampaignViewModel | null` - kampania do usunięcia (null = modal closed)
- `onClose: () => void` - callback przy zamknięciu
- `onSuccess: () => void` - callback przy sukcesie (refetch campaigns)

**Stan lokalny**:
- `isDeleting: boolean` - czy trwa usuwanie

## 5. Typy

### CampaignViewModel

Rozszerzenie `CampaignDTO` o dodatkowe dane potrzebne w UI:

```typescript
import type { CampaignDTO } from "@/types";

export interface CampaignViewModel extends CampaignDTO {
  // Dane z API (CampaignDTO)
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;

  // Dane wyliczone/pobrane dodatkowo (MVP: opcjonalne, do implementacji w przyszłości)
  characterCount?: number; // liczba postaci w kampanii
  combatCount?: number; // liczba walk w kampanii
  hasActiveCombat?: boolean; // czy kampania ma aktywną walkę
}
```

**Uwaga**: W MVP pola `characterCount`, `combatCount` i `hasActiveCombat` mogą być pomijane lub ustawione na 0/false. W przyszłych wersjach API może zostać rozszerzone o te dane lub będą pobierane oddzielnymi requestami.

### CampaignsViewState

Stan dla głównego komponentu widoku:

```typescript
interface CampaignsViewState {
  campaigns: CampaignViewModel[];
  isLoading: boolean;
  error: Error | null;
  isCreateModalOpen: boolean;
  deleteModalCampaign: CampaignViewModel | null;

  // Pagination (na przyszłość, w MVP można pominąć)
  total: number;
  limit: number;
  offset: number;
}
```

### CreateCampaignFormData

Dane formularza tworzenia kampanii:

```typescript
interface CreateCampaignFormData {
  name: string;
}
```

### UpdateCampaignFormData

Dane formularza edycji kampanii (identyczne jak Create):

```typescript
interface UpdateCampaignFormData {
  name: string;
}
```

## 6. Zarządzanie stanem

### Główny stan widoku

Stan zarządzany w komponencie `CampaignsContent` przy użyciu:

1. **useCampaigns hook** (istniejący, do rozszerzenia):
```typescript
const { campaigns, isLoading, error, refetch } = useCampaigns();
```

2. **Local state dla modali**:
```typescript
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [deleteModalCampaign, setDeleteModalCampaign] = useState<CampaignViewModel | null>(null);
```

### Rozszerzenie useCampaigns hook

Istniejący hook `useCampaigns` powinien zostać rozszerzony o funkcje CRUD:

```typescript
interface UseCampaignsReturn {
  campaigns: CampaignViewModel[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Nowe funkcje:
  createCampaign: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateCampaign: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteCampaign: (id: string) => Promise<{ success: boolean; error?: string }>;
}
```

**Implementacja CRUD operations**:

1. **createCampaign**:
   - Optimistic update: dodanie temporary campaign do listy
   - POST /api/campaigns
   - W przypadku sukcesu: refetch lub update z real ID
   - W przypadku błędu: revert + return error
   - Toast notification (sukces/błąd)

2. **updateCampaign**:
   - Optimistic update: zmiana nazwy lokalnie
   - PATCH /api/campaigns/:id
   - W przypadku sukcesu: update z API response
   - W przypadku błędu: revert + return error
   - Toast notification (sukces/błąd)

3. **deleteCampaign**:
   - Optimistic update: usunięcie z listy
   - DELETE /api/campaigns/:id
   - W przypadku sukcesu: brak akcji (już usunięto lokalnie)
   - W przypadku błędu: revert + return error
   - Toast notification (sukces/błąd)

### Stan lokalny w CampaignCard

```typescript
const [isEditing, setIsEditing] = useState(false);
const [editedName, setEditedName] = useState(campaign.name);
const [isUpdating, setIsUpdating] = useState(false);
```

### useToast hook

Do obsługi toast notifications będzie używany hook `useToast` z Shadcn:

```typescript
const { toast } = useToast();

// Example usage:
toast({
  title: "Campaign created",
  description: "Your campaign has been created successfully.",
});

toast({
  title: "Error",
  description: "Campaign with this name already exists.",
  variant: "destructive",
});
```

## 7. Integracja API

### GET /api/campaigns

**Kiedy**: onMount (useEffect w useCampaigns), po create/update/delete

**Request**:
```typescript
GET /api/campaigns?limit=100&offset=0
Headers: {
  "Content-Type": "application/json"
}
```

**Response (200 OK)**:
```typescript
{
  campaigns: CampaignDTO[];
  total: number;
  limit: number;
  offset: number;
}
```

**Typy**:
- Request: Query params (`limit?: number`, `offset?: number`)
- Response: `ListCampaignsResponseDTO`

**Error handling**:
- 401 Unauthorized → redirect do /login
- 500 Internal Server Error → toast error + umożliwienie retry

---

### POST /api/campaigns

**Kiedy**: Submit w CreateCampaignModal

**Request**:
```typescript
POST /api/campaigns
Headers: {
  "Content-Type": "application/json"
}
Body: {
  name: string
}
```

**Response (201 Created)**:
```typescript
{
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

**Typy**:
- Request body: `CreateCampaignCommand`
- Response: `CampaignDTO`

**Error handling**:
- 400 Bad Request → wyświetlenie błędów walidacji
- 401 Unauthorized → redirect do /login
- 409 Conflict → wyświetlenie błędu "Campaign with this name already exists"
- 500 Internal Server Error → toast error "Something went wrong"

---

### PATCH /api/campaigns/:id

**Kiedy**: Inline edit w CampaignCard (blur lub Enter)

**Request**:
```typescript
PATCH /api/campaigns/{campaignId}
Headers: {
  "Content-Type": "application/json"
}
Body: {
  name: string
}
```

**Response (200 OK)**:
```typescript
{
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

**Typy**:
- Request body: `UpdateCampaignCommand`
- Response: `CampaignDTO`

**Error handling**:
- 400 Bad Request → revert + toast error
- 401 Unauthorized → redirect do /login
- 404 Not Found → refetch campaigns + toast error
- 409 Conflict → revert + toast error "Campaign with this name already exists"
- 500 Internal Server Error → revert + toast error

---

### DELETE /api/campaigns/:id

**Kiedy**: Confirm w DeleteCampaignModal

**Request**:
```typescript
DELETE /api/campaigns/{campaignId}
```

**Response (204 No Content)**:
```
(empty body)
```

**Typy**:
- Request: Brak body
- Response: 204 No Content (void)

**Error handling**:
- 401 Unauthorized → redirect do /login
- 404 Not Found → ignoruj (campaign already deleted) lub refetch
- 500 Internal Server Error → revert + toast error "Failed to delete campaign"

## 8. Interakcje użytkownika

### 1. Tworzenie nowej kampanii

**Scenariusz**:
1. Użytkownik klika PlusTile lub button "Create Campaign" w EmptyState
2. Otwiera się CreateCampaignModal
3. Użytkownik wpisuje nazwę kampanii
4. Użytkownik klika "Create" lub naciska Enter
5. Modal jest zamykany
6. Kampania pojawia się na liście (optimistic update)
7. W tle wykonywany jest POST /api/campaigns
8. Toast sukcesu: "Campaign created"
9. Lista jest odświeżana z realnym ID kampanii

**Alternatywny scenariusz (błąd 409)**:
- Krok 7: API zwraca 409 Conflict
- Kampania jest usuwana z listy (revert)
- W modalu pojawia się błąd: "Campaign with this name already exists"
- Użytkownik może spróbować ponownie z inną nazwą

### 2. Edycja nazwy kampanii (inline)

**Scenariusz**:
1. Użytkownik klika na nazwę kampanii w CampaignCard
2. Nazwa zamienia się w input (focus, zaznaczony cały tekst)
3. Użytkownik modyfikuje nazwę
4. Użytkownik naciska Enter lub klika poza input (blur)
5. Input zamienia się z powrotem na tekst (optimistic update)
6. W tle wykonywany jest PATCH /api/campaigns/:id
7. Toast sukcesu: "Campaign updated"
8. Nazwa jest aktualizowana z API response

**Alternatywny scenariusz (anulowanie)**:
- Krok 4: Użytkownik naciska Escape
- Input zamienia się na tekst bez zapisywania
- Brak requestu API

**Alternatywny scenariusz (błąd 409)**:
- Krok 6: API zwraca 409 Conflict
- Nazwa jest revertowana do poprzedniej (revert)
- Toast error: "Campaign with this name already exists"

### 3. Edycja nazwy kampanii (przez dropdown)

**Scenariusz**:
1. Użytkownik klika dropdown menu (три точки) w CampaignCard
2. Otwiera się menu z opcjami "Edit Name" i "Delete"
3. Użytkownik klika "Edit Name"
4. Dalej jak w scenariuszu "Edycja nazwy kampanii (inline)" od kroku 2

### 4. Usuwanie kampanii

**Scenariusz**:
1. Użytkownik klika dropdown menu w CampaignCard
2. Użytkownik klika "Delete"
3. Otwiera się DeleteCampaignModal z ostrzeżeniem
4. Użytkownik klika "Delete"
5. Modal jest zamykany
6. Kampania znika z listy (optimistic update)
7. W tle wykonywany jest DELETE /api/campaigns/:id
8. Toast sukcesu: "Campaign deleted"

**Alternatywny scenariusz (anulowanie)**:
- Krok 4: Użytkownik klika "Cancel" lub Escape
- Modal jest zamykany bez żadnych zmian

**Alternatywny scenariusz (błąd)**:
- Krok 7: API zwraca błąd
- Kampania wraca na listę (revert)
- Toast error: "Failed to delete campaign"

### 5. Wybór kampanii (nawigacja do szczegółów)

**Scenariusz**:
1. Użytkownik klika button "Select Campaign" w CampaignCard
2. Następuje nawigacja do strony szczegółów kampanii
3. URL: `/campaigns/:id` (lub `/campaigns/:id/characters`, do ustalenia)

**Uwaga**: Routing dla szczegółów kampanii będzie częścią innego widoku. W MVP może to być placeholder strona lub przekierowanie do innego widoku (np. /campaigns/:id/characters).

## 9. Warunki i walidacja

### CreateCampaignModal

**Warunki weryfikowane przez UI**:

1. **Nazwa kampanii wymagana**:
   - Typ: required validation
   - Komponent: Input w CreateCampaignModal
   - Walidacja: przed submit, sprawdzenie czy `name.trim().length > 0`
   - Efekt: button "Create" disabled jeśli nazwa pusta
   - Błąd: "Campaign name is required"

2. **Minimalna długość nazwy**:
   - Typ: minLength validation
   - Komponent: Input w CreateCampaignModal
   - Walidacja: `name.trim().length >= 1`
   - Efekt: error message pod inputem
   - Błąd: "Campaign name must be at least 1 character"

3. **Maksymalna długość nazwy** (opcjonalnie):
   - Typ: maxLength validation
   - Komponent: Input w CreateCampaignModal
   - Walidacja: `name.length <= 100`
   - Efekt: error message pod inputem
   - Błąd: "Campaign name must be less than 100 characters"

**Warunki weryfikowane przez API**:

1. **Unikalność nazwy**:
   - Typ: uniqueness constraint
   - Endpoint: POST /api/campaigns
   - Response: 409 Conflict
   - Efekt w UI: error message w modalu, kampania nie zostaje utworzona (revert optimistic update)
   - Błąd: "Campaign with this name already exists"

2. **Autoryzacja**:
   - Typ: authentication check
   - Endpoint: wszystkie endpointy
   - Response: 401 Unauthorized
   - Efekt w UI: redirect do /login

### CampaignCard (inline edit)

**Warunki weryfikowane przez UI**:

1. **Nazwa kampanii nie może być pusta**:
   - Typ: required validation
   - Komponent: EditableTitle w CampaignCard
   - Walidacja: przed save, sprawdzenie czy `name.trim().length > 0`
   - Efekt: jeśli pusta → revert do poprzedniej nazwy, brak requestu API
   - Błąd: opcjonalnie toast "Campaign name cannot be empty"

2. **Brak zmian**:
   - Typ: change detection
   - Komponent: EditableTitle
   - Walidacja: porównanie `editedName` z `originalName`
   - Efekt: jeśli brak zmian → exit edit mode, brak requestu API

**Warunki weryfikowane przez API**:

1. **Unikalność nazwy**:
   - Typ: uniqueness constraint
   - Endpoint: PATCH /api/campaigns/:id
   - Response: 409 Conflict
   - Efekt w UI: revert do poprzedniej nazwy + toast error
   - Błąd: "Campaign with this name already exists"

2. **Kampania istnieje i należy do użytkownika**:
   - Typ: ownership check (RLS)
   - Endpoint: PATCH /api/campaigns/:id
   - Response: 404 Not Found
   - Efekt w UI: revert + toast error + refetch listy kampanii
   - Błąd: "Campaign not found"

### DeleteCampaignModal

**Warunki weryfikowane przez UI**: Brak (tylko confirmation)

**Warunki weryfikowane przez API**:

1. **Kampania istnieje i należy do użytkownika**:
   - Typ: ownership check (RLS)
   - Endpoint: DELETE /api/campaigns/:id
   - Response: 404 Not Found (lub success jeśli już usunięta)
   - Efekt w UI: jeśli 404 → ignoruj lub refetch listy

2. **Cascade delete**:
   - Typ: database constraint
   - Endpoint: DELETE /api/campaigns/:id
   - Efekt: usunięcie wszystkich powiązanych danych (characters, combats) przez CASCADE
   - UI nie weryfikuje tego warunku, ale wyświetla ostrzeżenie w modal

## 10. Obsługa błędów

### Błąd 401 Unauthorized

**Przyczyna**: Użytkownik niezalogowany lub sesja wygasła

**Gdzie**: Wszystkie endpointy API

**Obsługa**:
- Redirect do `/login`
- Zapisanie current URL do localStorage dla powrotu po logowaniu (opcjonalnie)

**Implementacja w useCampaigns**:
```typescript
if (response.status === 401) {
  window.location.href = "/login";
  return;
}
```

### Błąd 409 Conflict (duplicate name)

**Przyczyna**: Kampania o tej nazwie już istnieje dla danego użytkownika

**Gdzie**: POST /api/campaigns, PATCH /api/campaigns/:id

**Obsługa**:

1. **W CreateCampaignModal**:
   - Revert optimistic update (usunięcie kampanii z listy)
   - Wyświetlenie błędu w modalu pod inputem
   - Modal pozostaje otwarty
   - Użytkownik może spróbować z inną nazwą

2. **W CampaignCard (inline edit)**:
   - Revert do poprzedniej nazwy
   - Exit edit mode
   - Toast error: "Campaign with this name already exists"

### Błąd 404 Not Found

**Przyczyna**: Kampania nie istnieje lub użytkownik nie jest właścicielem

**Gdzie**: PATCH /api/campaigns/:id, DELETE /api/campaigns/:id

**Obsługa**:
- Revert optimistic update
- Toast error: "Campaign not found"
- Refetch listy kampanii (może została usunięta przez inną sesję)

### Błąd 500 Internal Server Error

**Przyczyna**: Problem z bazą danych lub serverem

**Gdzie**: Wszystkie endpointy

**Obsługa**:
- Revert optimistic update
- Toast error: "Something went wrong, please try again"
- W przypadku GET /api/campaigns → wyświetlenie error state z przyciskiem "Retry"

### Network error (fetch failed)

**Przyczyna**: Brak połączenia z internetem

**Gdzie**: Wszystkie requesty

**Obsługa**:
- Revert optimistic update
- Toast error: "Network error. Please check your connection."
- W przypadku GET /api/campaigns → wyświetlenie error state z przyciskiem "Retry"

**Implementacja**:
```typescript
try {
  const response = await fetch(...);
  // ...
} catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    toast({
      title: "Network error",
      description: "Please check your connection.",
      variant: "destructive",
    });
  }
}
```

### Empty state

**Przyczyna**: Użytkownik nie ma żadnych kampanii (nie jest błędem)

**Gdzie**: GET /api/campaigns zwraca pustą listę

**Obsługa**:
- Wyświetlenie EmptyState z call-to-action
- Brak error message
- Button "Create Campaign" otwiera CreateCampaignModal

### Loading state

**Przyczyna**: Pobieranie danych z API (nie jest błędem)

**Gdzie**: Initial load, refetch po CRUD operations

**Obsługa**:
- Wyświetlenie LoadingState ze skeletonami
- Skeleton cards w grid layout (6 sztuk)
- CampaignsHeader z skeleton dla metadata

## 11. Kroki implementacji

### Krok 1: Dodanie brakujących komponentów Shadcn

Dodaj wymagane komponenty UI, których obecnie brakuje:

```bash
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add toast
npx shadcn@latest add skeleton
```

**Rezultat**: Komponenty Card, Dialog, Input, Label, Toast i Skeleton dostępne w `src/components/ui/`.

---

### Krok 2: Rozszerzenie typu CampaignViewModel

Stwórz nowy plik z typami dla widoku kampanii:

**Plik**: `src/types/campaigns.ts`

**Zawartość**:
```typescript
import type { CampaignDTO } from "@/types";

export interface CampaignViewModel extends CampaignDTO {
  // Agregowane dane (MVP: opcjonalne, ustawiamy na 0/false)
  characterCount?: number;
  combatCount?: number;
  hasActiveCombat?: boolean;
}
```

**Rezultat**: Typ CampaignViewModel dostępny do użycia w komponentach.

---

### Krok 3: Rozszerzenie useCampaigns hook

Rozszerz istniejący hook `src/hooks/useCampaigns.ts` o funkcje CRUD i obsługę toastów:

**Funkcje do dodania**:
- `createCampaign(name: string): Promise<{ success: boolean; error?: string }>`
- `updateCampaign(id: string, name: string): Promise<{ success: boolean; error?: string }>`
- `deleteCampaign(id: string): Promise<{ success: boolean; error?: string }>`

**Implementacja**:
- Optimistic updates dla wszystkich operacji
- Rollback w przypadku błędów
- Integracja z useToast dla notyfikacji
- Proper error handling dla 409, 404, 500

**Rezultat**: Hook useCampaigns z pełnym CRUD API.

---

### Krok 4: Implementacja komponentu LoadingState

**Plik**: `src/components/campaigns/LoadingState.tsx`

**Zawartość**:
- CampaignsHeader z skeleton dla metadata
- Grid layout z 6 Skeleton komponentami (card shape)
- Użycie Shadcn Skeleton component

**Rezultat**: Komponent LoadingState gotowy do użycia.

---

### Krok 5: Implementacja komponentu EmptyState

**Plik**: `src/components/campaigns/EmptyState.tsx`

**Zawartość**:
- Ikona folderu (Lucide FolderOpen, duża, muted)
- Heading + subtext
- Button "Create Campaign" z ikoną Plus
- Props: `onCreate: () => void`

**Rezultat**: Komponent EmptyState gotowy do użycia.

---

### Krok 6: Implementacja komponentu CreateCampaignModal

**Plik**: `src/components/campaigns/CreateCampaignModal.tsx`

**Zawartość**:
- Dialog z form
- Input dla nazwy kampanii (autoFocus, required)
- Validation (minLength, maxLength)
- Error display dla API errors (409)
- Submit handler z wywołaniem useCampaigns.createCampaign()
- Loading state (disabled button podczas isCreating)

**Rezultat**: Modal do tworzenia kampanii z pełną walidacją.

---

### Krok 7: Implementacja komponentu DeleteCampaignModal

**Plik**: `src/components/campaigns/DeleteCampaignModal.tsx`

**Zawartość**:
- Dialog z ostrzeżeniem
- Wyświetlenie liczby postaci i walk (jeśli dostępne)
- Confirmation buttons (Cancel/Delete)
- Delete handler z wywołaniem useCampaigns.deleteCampaign()
- Loading state (disabled button podczas isDeleting)

**Rezultat**: Modal do usuwania kampanii z confirmation.

---

### Krok 8: Implementacja komponentu EditableTitle

**Plik**: `src/components/campaigns/EditableTitle.tsx`

**Zawartość**:
- Display mode: h3 z nazwą (clickable, hover effect)
- Edit mode: Input z autoFocus, zaznaczonym tekstem
- Obsługa Enter (save), Escape (cancel), Blur (save)
- Walidacja (nie może być pusta)
- Loading state (disabled podczas isUpdating)

**Props**:
- `value: string`
- `isEditing: boolean`
- `isUpdating: boolean`
- `onEdit: () => void`
- `onSave: (newValue: string) => Promise<void>`
- `onCancel: () => void`

**Rezultat**: Komponent do inline editing nazwy kampanii.

---

### Krok 9: Implementacja komponentu CampaignCard

**Plik**: `src/components/campaigns/CampaignCard.tsx`

**Zawartość**:
- Shadcn Card z hover effect
- CardHeader z EditableTitle i DropdownMenu
- CardContent z statystykami (characters, combats, active combat badge)
- CardFooter z Last Modified date i Select Campaign button
- Local state: isEditing, editedName, isUpdating
- Handlers: onNameEdit (inline), onDelete, onSelect
- Integracja z EditableTitle

**Rezultat**: Karta kampanii z pełną funkcjonalnością.

---

### Krok 10: Implementacja komponentu PlusTile

**Plik**: `src/components/campaigns/PlusTile.tsx`

**Zawartość**:
- Card z dashed border
- Centered Plus icon (Lucide)
- Text "Create New Campaign"
- Hover effect (emerald glow)
- Click handler → onCreate()

**Rezultat**: Tile do tworzenia nowej kampanii.

---

### Krok 11: Implementacja komponentu CampaignsHeader

**Plik**: `src/components/campaigns/CampaignsHeader.tsx`

**Zawartość**:
- H1: "My Campaigns"
- Metadata: "X campaigns" (muted text)

**Props**:
- `totalCampaigns: number`

**Rezultat**: Header widoku kampanii.

---

### Krok 12: Implementacja komponentu CampaignsGrid

**Plik**: `src/components/campaigns/CampaignsGrid.tsx`

**Zawartość**:
- Grid layout (responsive: 1/2/3 kolumny)
- Map campaigns → CampaignCard
- PlusTile na końcu

**Props**:
- `campaigns: CampaignViewModel[]`
- `onCampaignSelect: (id: string) => void`
- `onCampaignUpdate: (id: string, name: string) => Promise<void>`
- `onCampaignDelete: (campaign: CampaignViewModel) => void`
- `onCreate: () => void`

**Rezultat**: Grid container z kampaniami i plus tile.

---

### Krok 13: Implementacja komponentu CampaignsContent

**Plik**: `src/components/campaigns/CampaignsContent.tsx`

**Zawartość**:
- Główny kontener widoku (React component)
- Integracja z useCampaigns hook
- Local state dla modali (isCreateModalOpen, deleteModalCampaign)
- Conditional rendering: LoadingState, EmptyState lub CampaignsHeader + CampaignsGrid
- Renderowanie modali: CreateCampaignModal, DeleteCampaignModal
- Handlers dla wszystkich akcji

**Rezultat**: Główny komponent widoku z pełną logiką.

---

### Krok 14: Implementacja strony campaigns.astro

**Plik**: `src/pages/campaigns.astro`

**Zawartość**:
- Astro page component
- Użycie MainLayout
- Renderowanie CampaignsContent z client:load

**Kod**:
```astro
---
import MainLayout from "@/layouts/MainLayout.astro";
import CampaignsContent from "@/components/campaigns/CampaignsContent";
---

<MainLayout title="My Campaigns">
  <CampaignsContent client:load />
</MainLayout>
```

**Rezultat**: Strona /campaigns dostępna w aplikacji.

---

### Krok 15: Konfiguracja Toaster

Dodaj Toaster do głównego layoutu, aby toasty były widoczne globalnie:

**Plik**: `src/layouts/MainLayout.astro`

**Modyfikacja**: Dodaj Toaster component przed zamknięciem body:

```astro
---
// ... existing imports
import { Toaster } from "@/components/ui/toaster";
---

<html>
  <!-- ... -->
  <body>
    <!-- ... existing content -->
    <Toaster client:load />
  </body>
</html>
```

**Rezultat**: Toast notifications działają w całej aplikacji.


### Krok 16: Dokumentacja

Dodaj komentarze JSDoc do wszystkich komponentów i hooków:

- Opis komponentu
- Opis każdego prop
- Przykład użycia (opcjonalnie)

**Rezultat**: Kod jest dobrze udokumentowany dla innych developerów.

---

## Podsumowanie kroków

1. ✓ Dodanie komponentów Shadcn (card, dialog, input, label, toast, skeleton)
2. ✓ Rozszerzenie typu CampaignViewModel
3. ✓ Rozszerzenie useCampaigns hook (CRUD operations)
4. ✓ Implementacja LoadingState
5. ✓ Implementacja EmptyState
6. ✓ Implementacja CreateCampaignModal
7. ✓ Implementacja DeleteCampaignModal
8. ✓ Implementacja EditableTitle
9. ✓ Implementacja CampaignCard
10. ✓ Implementacja PlusTile
11. ✓ Implementacja CampaignsHeader
12. ✓ Implementacja CampaignsGrid
13. ✓ Implementacja CampaignsContent
14. ✓ Implementacja campaigns.astro
15. ✓ Konfiguracja Toaster
16. ✓ Dokumentacja
