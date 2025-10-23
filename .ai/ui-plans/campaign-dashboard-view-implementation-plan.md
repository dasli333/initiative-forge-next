# Plan implementacji widoku Campaign Dashboard

## 1. Przegląd

Widok Campaign Dashboard służy jako centrum dowodzenia dla wybranej kampanii. Umożliwia Mistrzowi Gry szybki dostęp do kluczowych informacji (nazwa kampanii, data utworzenia, liczba postaci) oraz zapewnia natychmiastowy dostęp do głównych funkcji aplikacji poprzez sekcję Quick Actions. Widok jest punktem wyjścia do zarządzania postaciami i rozpoczynania walk w ramach wybranej kampanii.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką:

```
/campaigns/:id
```

gdzie `:id` to UUID kampanii.

**Plik**: `src/pages/campaigns/[id].astro`

## 3. Struktura komponentów

Hierarchia komponentów widoku Campaign Dashboard:

```
CampaignDashboardPage (Astro) [/campaigns/[id].astro]
└── CampaignDashboardContent (React) [client:load]
    ├── Breadcrumb (Shadcn/ui)
    ├── CampaignHeader (React)
    │   ├── EditableHeading (React - nowy, bazowany na EditableTitle)
    │   └── CampaignMetadata (React)
    ├── StatsOverview (React)
    │   └── StatCard[] (React)
    └── QuickActionsSection (React)
        └── ActionCard[] (React)
```

**Uwagi do struktury:**
- Komponent główny (Astro page) odpowiada za server-side rendering i obsługę błędów (404)
- Komponent `CampaignDashboardContent` (React) zarządza całą interaktywnością i stanem
- Wykorzystuje istniejący wzorzec z `EditableTitle` do inline edycji nazwy

## 4. Szczegóły komponentów

### 4.1. CampaignDashboardPage (Astro)

**Opis komponentu:**
Główny widok strony zbudowany w Astro. Odpowiada za server-side fetching danych kampanii i liczby postaci, obsługę błędów 404, oraz renderowanie layoutu z React komponentem jako klienckim ostrowem interaktywności.

**Główne elementy:**
- `MainLayout` - wrapper z nawigacją
- Logika SSR do pobrania danych kampanii (GET `/api/campaigns/:id`)
- Logika SSR do pobrania liczby postaci (GET `/api/campaigns/:id/characters`)
- Warunki renderowania: loading, error (404), success
- `<CampaignDashboardContent client:load />` - główny komponent React

**Obsługiwane zdarzenia:**
Brak - komponent nie obsługuje zdarzeń (server-rendered)

**Warunki walidacji:**
1. `:id` parametr musi być obecny w URL
2. Kampania musi istnieć (API zwróci 404 jeśli nie)
3. Kampania musi należeć do zalogowanego użytkownika (RLS w Supabase)

**Typy:**
- `CampaignDTO` - DTO kampanii z API
- `ListPlayerCharactersResponseDTO` - response z listą postaci

**Propsy:**
Brak - Astro page nie przyjmuje propsów, używa `Astro.params.id`

---

### 4.2. CampaignDashboardContent (React)

**Opis komponentu:**
Główny komponent React zarządzający całą interaktywnością widoku Dashboard. Orchestrator dla wszystkich podkomponentów. Zarządza stanem kampanii, obsługuje aktualizację nazwy kampanii z optimistic updates, oraz koordynuje komunikację z API.

**Główne elementy:**
- `<Breadcrumb>` - nawigacja breadcrumb
- `<CampaignHeader>` - nagłówek z edytowalną nazwą i metadanymi
- `<StatsOverview>` - sekcja ze statystykami
- `<QuickActionsSection>` - sekcja z quick actions

**Obsługiwane zdarzenia:**
- Aktualizacja nazwy kampanii (delegowane do hooka `useCampaignDashboard`)
- Focus na heading po pierwszym załadowaniu (accessibility)

**Warunki walidacji:**
1. Nazwa kampanii nie może być pusta podczas zapisywania
2. Nazwa kampanii po trim() musi mieć długość > 0
3. Nowa nazwa musi być różna od poprzedniej (bez sensu zapisywać tę samą)

**Typy:**
- `CampaignDashboardContentProps` - propsy komponentu
- `CampaignDTO` - dane kampanii
- `useCampaignDashboard` hook return type

**Propsy:**
```typescript
interface CampaignDashboardContentProps {
  initialCampaign: CampaignDTO;
  initialCharactersCount: number;
}
```

---

### 4.3. Breadcrumb (Shadcn/ui)

**Opis komponentu:**
Komponent nawigacji breadcrumb wykorzystujący Shadcn/ui. Wyświetla ścieżkę nawigacyjną: "My Campaigns" z linkiem powrotnym do listy kampanii.

**Główne elementy:**
- `<Breadcrumb>` - wrapper
- `<BreadcrumbList>` - lista elementów
- `<BreadcrumbItem>` - "My Campaigns" jako link
- `<BreadcrumbSeparator>` - separator
- `<BreadcrumbItem>` - nazwa aktualnej kampanii (current page)

**Obsługiwane zdarzenia:**
- Kliknięcie na "My Campaigns" → navigate do `/campaigns`

**Warunki walidacji:**
Brak

**Typy:**
Wbudowane typy Shadcn/ui

**Propsy:**
Brak (może korzystać z context lub otrzymać `campaignName` jako prop)

---

### 4.4. CampaignHeader (React)

**Opis komponentu:**
Nagłówek widoku Dashboard zawierający edytowalną nazwę kampanii (H1) oraz metadane (data utworzenia). Deleguje logikę edycji do komponentu `EditableHeading`.

**Główne elementy:**
- `<header>` - semantic HTML
- `<EditableHeading>` - edytowalna nazwa kampanii (H1)
- `<CampaignMetadata>` - metadata (data utworzenia)

**Obsługiwane zdarzenia:**
- Kliknięcie w nazwę → tryb edycji
- Blur lub Enter → zapis nowej nazwy
- Escape → anulowanie edycji

**Warunki walidacji:**
1. Nowa nazwa nie może być pusta (trim)
2. Nowa nazwa musi być różna od poprzedniej

**Typy:**
```typescript
interface CampaignHeaderProps {
  campaign: CampaignDTO;
  isUpdating: boolean;
  onUpdateName: (newName: string) => Promise<void>;
}
```

**Propsy:**
- `campaign: CampaignDTO` - dane kampanii
- `isUpdating: boolean` - czy trwa aktualizacja
- `onUpdateName: (newName: string) => Promise<void>` - callback do aktualizacji nazwy

---

### 4.5. EditableHeading (React)

**Opis komponentu:**
Komponent odpowiedzialny za inline editing nazwy kampanii w formie H1. Wzorowany na istniejącym `EditableTitle` z komponentów campaigns, ale dostosowany do użycia jako semantic heading. Obsługuje keyboard shortcuts (Enter, Escape), auto-save przy blur, oraz loading state.

**Główne elementy:**
- W trybie wyświetlania: `<h1>` jako button (focus, hover states)
- W trybie edycji: `<Input>` z focus i select
- Loading indicator (Loader2 icon) podczas zapisywania

**Obsługiwane zdarzenia:**
- Click na H1 → wejście w tryb edycji
- Blur na input → zapis
- Enter na input → zapis
- Escape na input → anulowanie
- Change na input → aktualizacja lokalnego state

**Warunki walidacji:**
1. Wartość po trim() nie może być pusta
2. Wartość musi być różna od początkowej (inaczej cancel)

**Typy:**
```typescript
interface EditableHeadingProps {
  value: string;
  isUpdating: boolean;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
}
```

**Propsy:**
- `value: string` - aktualna nazwa kampanii
- `isUpdating: boolean` - czy trwa zapisywanie
- `onSave: (newValue: string) => Promise<void>` - callback do zapisu
- `className?: string` - opcjonalne klasy CSS

---

### 4.6. CampaignMetadata (React)

**Opis komponentu:**
Wyświetla metadane kampanii (data utworzenia) w formacie czytelnym dla użytkownika. Używa muted styling dla subtelnego wyglądu.

**Główne elementy:**
- `<p className="text-sm text-muted-foreground">` - paragraph z datą

**Obsługiwane zdarzenia:**
Brak

**Warunki walidacji:**
Brak

**Typy:**
```typescript
interface CampaignMetadataProps {
  createdAt: string; // ISO date string
}
```

**Propsy:**
- `createdAt: string` - ISO date string z API

---

### 4.7. StatsOverview (React)

**Opis komponentu:**
Sekcja zawierająca grid ze statystykami kampanii. Obecnie wyświetla jedną statystykę (liczba postaci), ale struktura jest przygotowana na przyszłe rozszerzenia (liczba sesji, zadań, etc.).

**Główne elementy:**
- `<section>` - semantic wrapper
- `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">` - responsywny grid
- `<StatCard>[]` - karty statystyk

**Obsługiwane zdarzenia:**
Brak

**Warunki walidacji:**
Brak

**Typy:**
```typescript
interface StatsOverviewProps {
  charactersCount: number;
}
```

**Propsy:**
- `charactersCount: number` - liczba postaci w kampanii

---

### 4.8. StatCard (React)

**Opis komponentu:**
Reużywalny komponent karty statystyki. Wyświetla ikonę, label i wartość liczbową. Używa Shadcn/ui Card components.

**Główne elementy:**
- `<Card>` - wrapper z Shadcn/ui
- `<CardHeader>` - header z ikoną i labelem
- `<CardContent>` - wartość (duża, kolorowa liczba)

**Obsługiwane zdarzenia:**
Brak

**Warunki walidacji:**
Brak

**Typy:**
```typescript
interface StatCardProps {
  icon: React.ReactNode; // Lucide icon component
  label: string;
  value: number;
  colorClass?: string; // np. "text-emerald-600"
}
```

**Propsy:**
- `icon: React.ReactNode` - ikona (np. `<Users className="w-5 h-5" />`)
- `label: string` - etykieta (np. "Player Characters")
- `value: number` - wartość liczbowa
- `colorClass?: string` - opcjonalna klasa koloru dla wartości

---

### 4.9. QuickActionsSection (React)

**Opis komponentu:**
Sekcja zawierająca grid z kartami quick actions prowadzącymi do głównych funkcji kampanii. Obecnie dwie karty: "Player Characters" i "Combats".

**Główne elementy:**
- `<section>` - semantic wrapper
- `<h2>` - nagłówek sekcji "Quick Actions"
- `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">` - responsywny grid
- `<ActionCard>[]` - karty akcji

**Obsługiwane zdarzenia:**
Brak (zdarzenia są w ActionCard)

**Warunki walidacji:**
Brak

**Typy:**
```typescript
interface QuickActionsSectionProps {
  campaignId: string;
}
```

**Propsy:**
- `campaignId: string` - ID kampanii do konstruowania linków

---

### 4.10. ActionCard (React)

**Opis komponentu:**
Karta akcji prowadząca do konkretnej funkcji w kampanii. Wyświetla ikonę, tytuł, opis, oraz przycisk CTA. Używa Shadcn/ui Card components.

**Główne elementy:**
- `<Card className="hover:border-emerald-600 transition-colors">` - interaktywny hover
- `<CardHeader>` - ikona w kółku + tytuł
- `<CardContent>` - opis akcji
- `<CardFooter>` - przycisk CTA

**Obsługiwane zdarzenia:**
- Kliknięcie przycisku → navigate do odpowiedniej ścieżki

**Warunki walidacji:**
Brak

**Typy:**
```typescript
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: "default" | "success"; // success = emerald background
  href: string;
}
```

**Propsy:**
- `icon: React.ReactNode` - ikona (Lucide)
- `title: string` - tytuł akcji
- `description: string` - opis akcji
- `buttonLabel: string` - tekst na przycisku
- `buttonVariant?: "default" | "success"` - wariant przycisku (default = default, success = emerald)
- `href: string` - URL do nawigacji

---

## 5. Typy

### 5.1. Istniejące typy (z src/types.ts)

```typescript
// Campaign entity
export type Campaign = Tables<"campaigns">;

// Campaign DTO (used in API responses)
export type CampaignDTO = Campaign;

// Update campaign command
export type UpdateCampaignCommand = Pick<TablesUpdate<"campaigns">, "name">;

// Player character DTO
export type PlayerCharacterDTO = Omit<PlayerCharacter, "actions"> & {
  actions: ActionDTO[] | null;
};

// List characters response
export interface ListPlayerCharactersResponseDTO {
  characters: PlayerCharacterDTO[];
}
```

### 5.2. Nowe typy do dodania

**Lokalizacja**: `src/types/campaign-dashboard.ts` (nowy plik)

```typescript
import type { CampaignDTO } from "@/types";

/**
 * Props for CampaignDashboardContent component
 */
export interface CampaignDashboardContentProps {
  initialCampaign: CampaignDTO;
  initialCharactersCount: number;
}

/**
 * Props for CampaignHeader component
 */
export interface CampaignHeaderProps {
  campaign: CampaignDTO;
  isUpdating: boolean;
  onUpdateName: (newName: string) => Promise<void>;
}

/**
 * Props for EditableHeading component
 */
export interface EditableHeadingProps {
  value: string;
  isUpdating: boolean;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
}

/**
 * Props for CampaignMetadata component
 */
export interface CampaignMetadataProps {
  createdAt: string; // ISO date string
}

/**
 * Props for StatsOverview component
 */
export interface StatsOverviewProps {
  charactersCount: number;
}

/**
 * Props for StatCard component
 */
export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass?: string;
}

/**
 * Props for QuickActionsSection component
 */
export interface QuickActionsSectionProps {
  campaignId: string;
}

/**
 * Props for ActionCard component
 */
export interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: "default" | "success";
  href: string;
}

/**
 * Return type for useCampaignDashboard hook
 */
export interface UseCampaignDashboardReturn {
  campaign: CampaignDTO;
  charactersCount: number;
  isUpdating: boolean;
  error: string | null;
  updateCampaignName: (newName: string) => Promise<void>;
}
```

---

## 6. Zarządzanie stanem

### 6.1. Custom Hook: `useCampaignDashboard`

**Lokalizacja**: `src/hooks/useCampaignDashboard.ts`

**Cel**: Zarządzanie stanem kampanii, aktualizacja nazwy z optimistic updates, obsługa błędów.

**Stan wewnętrzny:**
```typescript
const [campaign, setCampaign] = useState<CampaignDTO>(initialCampaign);
const [charactersCount, setCharactersCount] = useState<number>(initialCharactersCount);
const [isUpdating, setIsUpdating] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

**Funkcje:**

1. **updateCampaignName(newName: string): Promise<void>**
   - Waliduje nową nazwę (trim, not empty, different)
   - Wykonuje optimistic update stanu `campaign`
   - Wysyła PATCH request do `/api/campaigns/:id` z body `{ name: newName }`
   - Obsługuje odpowiedzi:
     - 200 OK → success, toast success
     - 404 Not Found → revert, toast error, możliwe redirect do listy kampanii
     - 409 Conflict → revert, toast error z komunikatem o duplikacie
     - Network error → revert, toast error
   - Ustawia `isUpdating` podczas operacji
   - Przy błędzie wykonuje rollback do poprzedniego stanu

**Zwracane wartości:**
```typescript
return {
  campaign,
  charactersCount,
  isUpdating,
  error,
  updateCampaignName,
};
```

### 6.2. Zarządzanie focus (accessibility)

W komponencie `CampaignDashboardContent`:

```typescript
const headingRef = useRef<HTMLHeadingElement>(null);

useEffect(() => {
  // Focus na heading po pierwszym załadowaniu dla accessibility
  if (headingRef.current) {
    headingRef.current.focus();
  }
}, []);
```

Przekazanie ref do `EditableHeading` dla zarządzania focusem.

---

## 7. Integracja API

### 7.1. Server-Side Fetching (w Astro page)

**1. Pobierz dane kampanii**

```typescript
// GET /api/campaigns/:id
const campaignId = Astro.params.id;
const response = await fetch(`${Astro.url.origin}/api/campaigns/${campaignId}`);

if (!response.ok) {
  if (response.status === 404) {
    // Render 404 error state
  }
  // Render error state
}

const campaign: CampaignDTO = await response.json();
```

**Typy:**
- Request: Brak body
- Response: `CampaignDTO`

**2. Pobierz liczbę postaci**

```typescript
// GET /api/campaigns/:campaignId/characters
const charactersResponse = await fetch(
  `${Astro.url.origin}/api/campaigns/${campaignId}/characters`
);

if (charactersResponse.ok) {
  const data: ListPlayerCharactersResponseDTO = await charactersResponse.json();
  const charactersCount = data.characters.length;
}
```

**Typy:**
- Request: Brak body
- Response: `ListPlayerCharactersResponseDTO`

### 7.2. Client-Side Update (w useCampaignDashboard hook)

**Aktualizacja nazwy kampanii**

```typescript
// PATCH /api/campaigns/:id
const response = await fetch(`/api/campaigns/${campaign.id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: newName } as UpdateCampaignCommand),
});
```

**Typy:**
- Request body: `UpdateCampaignCommand` = `{ name: string }`
- Response: `CampaignDTO`

**Możliwe odpowiedzi:**
- 200 OK → success
- 400 Bad Request → validation error (pusta nazwa)
- 404 Not Found → kampania nie istnieje lub nie należy do użytkownika
- 409 Conflict → kampania o tej nazwie już istnieje dla tego użytkownika

---

## 8. Interakcje użytkownika

### 8.1. Wyświetlenie Dashboard

**Ścieżka**: Użytkownik klika w kartę kampanii na liście `/campaigns` lub wpisuje URL `/campaigns/:id`

**Przebieg:**
1. Astro page wykonuje SSR - fetch danych kampanii i liczby postaci
2. Jeśli kampania nie istnieje (404) → render error state z komunikatem i linkiem do listy
3. Jeśli sukces → render `CampaignDashboardContent` z `initialCampaign` i `initialCharactersCount`
4. Po załadowaniu komponentu → focus na H1 (accessibility)

**Wynik**: Użytkownik widzi dashboard z nazwą kampanii, datą utworzenia, statystykami i quick actions

---

### 8.2. Edycja nazwy kampanii

**Trigger**: Użytkownik klika w nazwę kampanii (H1)

**Przebieg:**
1. Kliknięcie w H1 → stan `isEditing = true`
2. H1 zamienia się w `<Input>` z aktualną nazwą
3. Input otrzymuje focus i wszystko jest zaznaczone (select)
4. Użytkownik edytuje nazwę
5. **Zapis (Enter lub Blur)**:
   - Walidacja: trim, not empty, different
   - Jeśli walidacja fail → cancel (powrót do poprzedniej nazwy)
   - Jeśli OK → wywołanie `updateCampaignName()`
   - Optimistic update → nazwa zmienia się natychmiast
   - Loading indicator (spinner obok nazwy)
   - PATCH request do API
   - **Sukces (200)**:
     - Toast: "Campaign updated"
     - Stan pozostaje zaktualizowany
   - **Błąd (409 Conflict)**:
     - Rollback nazwy do poprzedniej
     - Toast error: "Campaign with this name already exists"
     - Input pozostaje w trybie edycji z focus (możliwość poprawy)
   - **Błąd (404 Not Found)**:
     - Rollback
     - Toast error: "Campaign not found"
     - Możliwy redirect do `/campaigns`
   - **Błąd sieci**:
     - Rollback
     - Toast error: "Network error. Please check your connection."
6. **Anulowanie (Escape)**:
   - Przywrócenie poprzedniej nazwy
   - Powrót do trybu wyświetlania (H1)

**Wynik**: Nazwa kampanii została zaktualizowana (lub nie, jeśli wystąpił błąd)

---

### 8.3. Nawigacja do zarządzania postaciami

**Trigger**: Użytkownik klika przycisk "Manage Characters" w karcie Player Characters

**Przebieg:**
1. Kliknięcie przycisku
2. Nawigacja do `/campaigns/:id/characters`

**Wynik**: Użytkownik jest przekierowany do widoku zarządzania postaciami

---

### 8.4. Nawigacja do rozpoczęcia walki

**Trigger**: Użytkownik klika przycisk "Start New Combat" w karcie Combats

**Przebieg:**
1. Kliknięcie przycisku (emerald, wyróżniony)
2. Nawigacja do `/campaigns/:id/combats/new`

**Wynik**: Użytkownik jest przekierowany do widoku tworzenia nowej walki

---

### 8.5. Nawigacja do listy kampanii

**Trigger**: Użytkownik klika "My Campaigns" w breadcrumb

**Przebieg:**
1. Kliknięcie linka
2. Nawigacja do `/campaigns`

**Wynik**: Użytkownik wraca do listy kampanii

---

## 9. Warunki i walidacja

### 9.1. Warunki weryfikowane w Astro page (SSR)

| Warunek | Komponent | Weryfikacja | Akcja przy niepowodzeniu |
|---------|-----------|-------------|--------------------------|
| Campaign ID present | Astro page | `Astro.params.id !== undefined` | Render error state (400) |
| Campaign exists | Astro page | GET `/api/campaigns/:id` → 200 OK | Render 404 error state |
| Campaign belongs to user | Astro page | RLS w Supabase (transparentne) | GET zwraca 404 |
| Characters fetch succeeds | Astro page | GET `/api/campaigns/:id/characters` → 200 OK | Fallback do 0 postaci |

### 9.2. Warunki weryfikowane w UI (Client-side)

| Warunek | Komponent | Weryfikacja | Akcja przy niepowodzeniu |
|---------|-----------|-------------|--------------------------|
| Name not empty | EditableHeading | `newName.trim().length > 0` | Cancel edit, nie wysyłaj request |
| Name changed | EditableHeading | `newName.trim() !== value` | Cancel edit (optymalizacja) |
| Name unique | useCampaignDashboard | PATCH → 409 Conflict | Rollback, toast error |
| Campaign still exists | useCampaignDashboard | PATCH → 404 Not Found | Rollback, toast error, możliwy redirect |
| Network available | useCampaignDashboard | Try-catch TypeError | Rollback, toast error |

### 9.3. Walidacja nazwy kampanii

**Reguły walidacji** (zgodne z API i istniejącym kodem):

1. **Nie może być pusta** - `name.trim().length > 0`
2. **Maksymalna długość** - prawdopodobnie 255 znaków (standard DB varchar)
3. **Unikalna w ramach użytkownika** - weryfikowane przez API (409 Conflict)

**Implementacja w EditableHeading:**

```typescript
const handleSave = async () => {
  const trimmed = editedValue.trim();

  // Validation: not empty
  if (!trimmed) {
    onCancel(); // Revert to previous value
    return;
  }

  // Validation: changed
  if (trimmed === value) {
    onCancel(); // No changes, just exit edit mode
    return;
  }

  // Validation: max length (optional, for better UX)
  if (trimmed.length > 255) {
    toast.error("Error", {
      description: "Campaign name is too long (max 255 characters)",
    });
    return;
  }

  // Save
  await onSave(trimmed);
};
```

---

## 10. Obsługa błędów

### 10.1. Błąd 404 - Kampania nie istnieje

**Lokalizacja**: Astro page (SSR)

**Scenariusz**: Użytkownik wpisał nieprawidłowy ID lub kampania została usunięta

**Obsługa**:
1. Detect: `response.status === 404` podczas fetch w Astro page
2. Render dedykowany error state:
   ```tsx
   <div className="container mx-auto px-4 py-8 max-w-7xl">
     <div className="text-center py-12">
       <h1 className="text-3xl font-bold mb-2">Campaign not found</h1>
       <p className="text-muted-foreground mb-6">
         This campaign doesn't exist or you don't have access to it.
       </p>
       <Button asChild>
         <a href="/campaigns">Back to My Campaigns</a>
       </Button>
     </div>
   </div>
   ```

**UX**: Jasny komunikat + łatwy powrót do listy kampanii

---

### 10.2. Błąd 409 Conflict - Duplikat nazwy

**Lokalizacja**: `useCampaignDashboard` hook, podczas update nazwy

**Scenariusz**: Użytkownik próbuje zmienić nazwę na taką, która już istnieje w jego kampaniach

**Obsługa**:
1. Detect: `response.status === 409` w `updateCampaignName()`
2. Rollback optimistic update → przywrócenie poprzedniej nazwy
3. Wyświetl toast error:
   ```typescript
   toast.error("Error", {
     description: "Campaign with this name already exists",
   });
   ```
4. Input pozostaje w trybie edycji z focus → użytkownik może od razu poprawić

**UX**: Natychmiastowy feedback, możliwość szybkiej korekty

---

### 10.3. Błąd sieci - Brak połączenia

**Lokalizacja**:
- `useCampaignDashboard` hook (client-side update)
- Astro page (SSR fetch, ale rzadki przypadek)

**Scenariusz**: Brak internetu lub serwer nie odpowiada

**Obsługa w hook**:
1. Detect: `TypeError: Failed to fetch` w try-catch
2. Rollback optimistic update
3. Wyświetl toast error:
   ```typescript
   toast.error("Network Error", {
     description: "Please check your connection and try again.",
   });
   ```

**Obsługa w Astro page**:
1. Render error state z przyciskiem retry
2. Komunikat: "Failed to load campaign. Please try again."

**UX**: Jasny komunikat o problemie, możliwość retry

---

### 10.4. Błąd walidacji - Pusta nazwa

**Lokalizacja**: `EditableHeading` komponent

**Scenariusz**: Użytkownik usuwa całą nazwę i próbuje zapisać

**Obsługa**:
1. Detect: `trimmedValue.length === 0` przed wysłaniem request
2. Cancel edit → przywrócenie poprzedniej nazwy
3. Wyjście z trybu edycji
4. Brak toasta (silent cancel - przywrócenie do stanu wyjściowego)

**UX**: Nazwa wraca do poprzedniej bez błędu - intuicyjne zachowanie

---

### 10.5. Błąd 404 podczas update - Kampania usunięta

**Lokalizacja**: `useCampaignDashboard` hook

**Scenariusz**: Kampania została usunięta (np. z innego urządzenia) podczas gdy użytkownik ma otwarty dashboard

**Obsługa**:
1. Detect: `response.status === 404` w `updateCampaignName()`
2. Rollback optimistic update
3. Wyświetl toast error:
   ```typescript
   toast.error("Error", {
     description: "Campaign not found. It may have been deleted.",
   });
   ```
4. Opcjonalnie: redirect do `/campaigns` po 2 sekundach

**UX**: Informacja o problemie + automatyczny redirect do bezpiecznego miejsca

---

### 10.6. Błąd pobierania liczby postaci

**Lokalizacja**: Astro page (SSR)

**Scenariusz**: Fetch kampanii sukces, ale fetch postaci fail

**Obsługa**:
1. Try-catch wokół fetch postaci
2. W przypadku błędu: fallback do `charactersCount = 0`
3. Render dashboardu z zerowymi statystykami
4. Opcjonalnie: log błędu (nie pokazuj użytkownikowi - nieistotne)

**UX**: Dashboard się renderuje, brak niepotrzebnego error state

---

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury typów

**Zadanie**: Stworzyć plik z typami dla Campaign Dashboard

**Plik**: `src/types/campaign-dashboard.ts`

**Działania**:
1. Skopiować definicje interfejsów z sekcji 5.2 tego planu
2. Zaimportować `CampaignDTO` z `@/types`
3. Upewnić się, że wszystkie typy są poprawnie wyeksportowane

---

### Krok 2: Implementacja custom hook `useCampaignDashboard`

**Zadanie**: Stworzyć hook zarządzający stanem kampanii i aktualizacją nazwy

**Plik**: `src/hooks/useCampaignDashboard.ts`

**Działania**:
1. Stworzyć hook przyjmujący `initialCampaign` i `initialCharactersCount`
2. Zdefiniować stan: `campaign`, `charactersCount`, `isUpdating`, `error`
3. Zaimplementować funkcję `updateCampaignName()`:
   - Walidacja (trim, not empty, different)
   - Optimistic update
   - PATCH request do API
   - Obsługa odpowiedzi (200, 404, 409, network error)
   - Rollback przy błędzie
   - Toast notifications (success/error)
4. Wzorować się na istniejącym `useCampaigns` hook
5. Zwrócić wszystkie potrzebne wartości i funkcje

**Zależności**:
- `useState`, `useCallback` z React
- `toast` z Sonner
- Typy z `@/types` i `@/types/campaign-dashboard`

---

### Krok 3: Implementacja komponentu `EditableHeading`

**Zadanie**: Stworzyć komponent do inline edycji nazwy kampanii jako H1

**Plik**: `src/components/campaign-dashboard/EditableHeading.tsx`

**Działania**:
1. Stworzyć katalog `src/components/campaign-dashboard/`
2. Skopiować logikę z `EditableTitle` (`src/components/campaigns/EditableTitle.tsx`)
3. Dostosować do użycia jako `<h1>` zamiast `<button>`:
   - W trybie wyświetlania: `<h1>` jako klikalna (button role, keyboard accessible)
   - W trybie edycji: `<Input>` z ref, focus i select
4. Dodać obsługę keyboard shortcuts (Enter, Escape)
5. Dodać loading indicator (Loader2 icon) podczas `isUpdating`
6. Dodać walidację przed zapisem (trim, not empty, different)
7. Stylizacja: focus states, hover states, transitions

**Zależności**:
- `Input` z `@/components/ui/input`
- `Loader2` z `lucide-react`
- Typy z `@/types/campaign-dashboard`

---

### Krok 4: Implementacja komponentu `CampaignMetadata`

**Zadanie**: Komponent wyświetlający datę utworzenia kampanii

**Plik**: `src/components/campaign-dashboard/CampaignMetadata.tsx`

**Działania**:
1. Stworzyć prosty komponent przyjmujący `createdAt: string`
2. Sformatować datę w czytelny sposób (np. "Created on January 15, 2025")
3. Użyć `new Date(createdAt).toLocaleDateString()` lub biblioteki date-fns
4. Stylizacja: `text-sm text-muted-foreground`

**Zależności**:
- Typy z `@/types/campaign-dashboard`
- Opcjonalnie: `date-fns` dla lepszego formatowania dat

---

### Krok 5: Implementacja komponentu `CampaignHeader`

**Zadanie**: Nagłówek z edytowalną nazwą i metadanymi

**Plik**: `src/components/campaign-dashboard/CampaignHeader.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `campaign`, `isUpdating`, `onUpdateName`
2. Zintegrować `EditableHeading` i `CampaignMetadata`
3. Semantic HTML: `<header>` wrapper
4. Layout: flex column, gap
5. Przekazać właściwe propsy do `EditableHeading`

**Zależności**:
- `EditableHeading` i `CampaignMetadata` z tego samego katalogu
- Typy z `@/types/campaign-dashboard`

---

### Krok 6: Implementacja komponentu `StatCard`

**Zadanie**: Reużywalny komponent karty statystyki

**Plik**: `src/components/campaign-dashboard/StatCard.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `icon`, `label`, `value`, `colorClass`
2. Użyć Shadcn/ui `Card`, `CardHeader`, `CardContent`
3. Layout:
   - Header: flex row z ikoną i labelem
   - Content: duża liczba z opcjonalną klasą koloru
4. Stylizacja: hover states, transitions

**Zależności**:
- `Card`, `CardHeader`, `CardContent` z `@/components/ui/card`
- Typy z `@/types/campaign-dashboard`

---

### Krok 7: Implementacja komponentu `StatsOverview`

**Zadanie**: Sekcja ze statystykami w gridzie

**Plik**: `src/components/campaign-dashboard/StatsOverview.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `charactersCount`
2. Semantic HTML: `<section>` wrapper
3. Responsywny grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
4. Render `<StatCard>` dla "Player Characters" z:
   - Icon: `<Users>` z lucide-react
   - Label: "Player Characters"
   - Value: `charactersCount`
   - Color: `"text-emerald-600"`
5. Przygotować strukturę na przyszłe karty (sesje, zadania)

**Zależności**:
- `StatCard` z tego samego katalogu
- `Users` z `lucide-react`
- Typy z `@/types/campaign-dashboard`

---

### Krok 8: Implementacja komponentu `ActionCard`

**Zadanie**: Karta quick action prowadząca do funkcji

**Plik**: `src/components/campaign-dashboard/ActionCard.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `icon`, `title`, `description`, `buttonLabel`, `buttonVariant`, `href`
2. Użyć Shadcn/ui `Card`, `CardHeader`, `CardContent`, `CardFooter`
3. Layout:
   - Header: ikona w kółku (background muted) + tytuł
   - Content: opis (text-muted-foreground)
   - Footer: przycisk CTA jako link
4. Hover effect na całej karcie (border color change)
5. Wariant "success" dla przycisku → emerald background

**Zależności**:
- `Card`, `CardHeader`, `CardContent`, `CardFooter` z `@/components/ui/card`
- `Button` z `@/components/ui/button`
- Typy z `@/types/campaign-dashboard`

---

### Krok 9: Implementacja komponentu `QuickActionsSection`

**Zadanie**: Sekcja z quick actions

**Plik**: `src/components/campaign-dashboard/QuickActionsSection.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `campaignId`
2. Semantic HTML: `<section>` wrapper
3. Nagłówek: `<h2>Quick Actions</h2>`
4. Responsywny grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
5. Render dwóch `<ActionCard>`:
   - **Player Characters**:
     - Icon: `<Users>`
     - Title: "Player Characters"
     - Description: "Manage your player characters, add new heroes, or update stats"
     - Button: "Manage Characters" (variant: default)
     - Href: `/campaigns/${campaignId}/characters`
   - **Combats**:
     - Icon: `<Swords>` (lub podobna ikona z lucide-react)
     - Title: "Combats"
     - Description: "Start a new combat encounter and track initiative"
     - Button: "Start New Combat" (variant: success)
     - Href: `/campaigns/${campaignId}/combats/new`

**Zależności**:
- `ActionCard` z tego samego katalogu
- `Users`, `Swords` z `lucide-react`
- Typy z `@/types/campaign-dashboard`

---

### Krok 10: Implementacja głównego komponentu `CampaignDashboardContent`

**Zadanie**: Główny orchestrator React dla całego widoku

**Plik**: `src/components/campaign-dashboard/CampaignDashboardContent.tsx`

**Działania**:
1. Stworzyć komponent przyjmujący `initialCampaign`, `initialCharactersCount`
2. Użyć hooka `useCampaignDashboard` z initial values
3. useRef + useEffect dla focus na heading (accessibility)
4. Layout wrapper: `<div className="container mx-auto px-4 py-8 max-w-7xl">`
5. Render w kolejności:
   - `<Breadcrumb>` (Shadcn/ui) - link "My Campaigns" → `/campaigns`
   - `<CampaignHeader>` z propsami z hooka
   - `<StatsOverview>` z `charactersCount`
   - `<QuickActionsSection>` z `campaignId`
6. Error handling: jeśli `error` z hooka, wyświetl inline error message
7. Gap między sekcjami: `space-y-8` lub podobne

**Zależności**:
- Wszystkie komponenty z `campaign-dashboard` katalogu
- Hook `useCampaignDashboard`
- Shadcn/ui `Breadcrumb` components
- Typy z `@/types/campaign-dashboard`

---

### Krok 11: Implementacja Astro page

**Zadanie**: Główny widok strony z SSR i error handling

**Plik**: `src/pages/campaigns/[id].astro`

**Działania**:
1. Stworzyć katalog `src/pages/campaigns/`
2. Stworzyć plik `[id].astro` z dynamicznym parametrem
3. Dodać `export const prerender = false;` (SSR mode)
4. W frontmatter:
   - Pobrać `id` z `Astro.params.id`
   - Fetch campaign: GET `/api/campaigns/${id}`
   - Obsłużyć 404 → render error state
   - Fetch characters: GET `/api/campaigns/${id}/characters`
   - Obsłużyć błąd → fallback do 0 postaci
   - Przygotować `initialCampaign` i `initialCharactersCount`
5. W template:
   - `<MainLayout title={campaign.name}>`
   - Conditional rendering:
     - Jeśli 404 → render error component
     - Jeśli success → `<CampaignDashboardContent client:load />`
6. Przekazać initial props do React komponentu

**Zależności**:
- `MainLayout` z `@/layouts/MainLayout.astro`
- `CampaignDashboardContent` z `@/components/campaign-dashboard/CampaignDashboardContent`
- Typy z `@/types`

### Krok 14: Integracja z resztą aplikacji

**Zadanie**: Upewnić się, że widok jest dostępny z innych miejsc w aplikacji

**Działania**:
1. Sprawdzić, czy karta kampanii na liście `/campaigns` linkuje do `/campaigns/:id`
2. Sprawdzić, czy sidebar (jeśli istnieje) ma link do aktualnej kampanii
3. Sprawdzić, czy breadcrumb w innych widokach (np. `/campaigns/:id/characters`) linkuje do dashboard
4. Upewnić się, że nawigacja jest spójna w całej aplikacji

---

## Podsumowanie

Ten plan implementacji dostarcza kompletny, szczegółowy przewodnik do stworzenia widoku Campaign Dashboard zgodnego z wymaganiami PRD i User Stories. Plan uwzględnia wszystkie aspekty implementacji: od typów i zarządzania stanem, przez komponenty UI, po integrację API i obsługę błędów.

Kluczowe cechy implementacji:
- **Architektura**: Astro SSR + React islands dla interaktywności
- **State management**: Custom hook z optimistic updates
- **UX**: Inline editing z keyboard shortcuts, loading states, error handling
- **Accessibility**: Focus management, ARIA labels, keyboard navigation
- **Error handling**: Graceful degradation, informative error messages, retry mechanisms
- **Responsywność**: Mobile-first grid layout z breakpoints
- **Code quality**: TypeScript, reużywalne komponenty, pattern matching z resztą aplikacji

Implementacja powinna zająć około 6-8 godzin pracy dla doświadczonego frontend developera.
