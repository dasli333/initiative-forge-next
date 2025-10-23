# Plan implementacji widoku Main Layout (Sidebar Navigation)

## 1. Przegląd

Main Layout to główny layout aplikacji Initiative Forge, który zawiera stały sidebar z nawigacją globalną i związaną z kampanią. Layout jest obecny na wszystkich widokach po zalogowaniu i zapewnia:

- Szybki dostęp do modułów globalnych (My Campaigns, Monsters Library, Spells Library)
- Selektor kampanii z persystencją w localStorage
- Nawigację do modułów kampanii (Combat, Player Characters) - aktywną tylko po wybraniu kampanii
- Menu użytkownika z opcją wylogowania

Głównym celem jest zapewnienie spójnej, dostępnej i intuicyjnej nawigacji w całej aplikacji.

## 2. Routing widoku

Layout nie ma własnej ścieżki - jest opakowaniem dla wszystkich widoków po zalogowaniu. Będzie używany w:

- `/campaigns` - lista kampanii
- `/campaigns/:id/characters` - lista postaci kampanii
- `/monsters` - biblioteka potworów
- `/spells` - biblioteka czarów
- `/combats/:id` - widok walki

## 3. Struktura komponentów

```
MainLayout (.astro)
├── SkipToContent (React)
└── div.layout-container
    ├── Sidebar (React, client:load)
    │   ├── AppHeader (React)
    │   ├── CampaignSelector (React)
    │   │   └── Shadcn Select
    │   │       ├── SelectTrigger
    │   │       ├── SelectContent
    │   │       │   └── SelectItem[]
    │   │       └── SelectFooter (custom)
    │   ├── nav.sidebar-nav
    │   │   ├── GlobalNav (React)
    │   │   │   └── NavItem[] (3 items)
    │   │   └── CampaignNav (React)
    │   │       └── NavItem[] (2 items, conditional)
    │   └── UserMenu (React)
    │       └── Shadcn DropdownMenu
    └── main.main-content
        └── slot (Astro content)
```

## 4. Szczegóły komponentów

### MainLayout (Astro component)

**Opis komponentu:**
Główny layout owijający wszystkie widoki po zalogowaniu. Odpowiada za strukturę strony z fixed sidebar i scrollable main content area.

**Główne elementy:**

- `<SkipToContent />` - link dla screen readerów (skip to main content)
- `div.layout-container` - flex container dla sidebar + main
- `<Sidebar client:load />` - interaktywny sidebar (React)
- `<main id="main-content">` - obszar głównej treści ze slot dla child pages

**Obsługiwane zdarzenia:**
Brak (statyczny layout)

**Walidacja:**
Brak walidacji (layout nie przyjmuje danych wejściowych)

**Typy:**

- Props: `{ title?: string }` (opcjonalny tytuł strony dla SEO)

**Propsy:**

```typescript
interface Props {
  title?: string; // Używany w <title> tagu
}
```

---

### SkipToContent (React component)

**Opis komponentu:**
Ukryty wizualnie link, który staje się widoczny po focus (Tab). Pozwala użytkownikom screen readerów pominąć nawigację i przejść bezpośrednio do głównej treści.

**Główne elementy:**

- `<a href="#main-content">` z klasami sr-only + focus:visible

**Obsługiwane zdarzenia:**

- onClick: smooth scroll do #main-content

**Walidacja:**
Brak

**Typy:**
Brak props

**Propsy:**
Brak

---

### Sidebar (React component)

**Opis komponentu:**
Fixed sidebar (240px szerokości) zawierający wszystkie sekcje nawigacyjne. Renderowany z `client:load` directive w Astro. Zarządza stanem kampanii i aktywnej walki.

**Główne elementy:**

- `<aside role="navigation">` - semantic HTML5
- `AppHeader` - logo i nazwa aplikacji
- `CampaignSelector` - dropdown wyboru kampanii
- `<nav>` - container dla sekcji nawigacyjnych
  - `GlobalNav` - moduły globalne
  - `CampaignNav` - moduły kampanii (conditional)
- `UserMenu` - avatar i logout

**Obsługiwane zdarzenia:**
Wszystkie zdarzenia delegowane do komponentów potomnych

**Walidacja:**
Brak (delegowana do dzieci)

**Typy:**

- `Campaign` (z types.ts)
- `UserViewModel`
- `ActiveCombatViewModel`

**Propsy:**
Brak - sidebar pobiera dane client-side przez custom hooks

---

### AppHeader (React component)

**Opis komponentu:**
Header sidebara zawierający logo i nazwę aplikacji "Initiative Forge" z linkiem do strony z listą kampanii.

**Główne elementy:**

- `<a href="/campaigns">` - wrapper jako link
- Logo icon (Lucide Sword icon lub custom SVG)
- `<span>` - "Initiative Forge" z emerald accent (text-emerald-500)

**Obsługiwane zdarzenia:**

- onClick: nawigacja do `/campaigns` (natywny link)

**Walidacja:**
Brak

**Typy:**
Brak

**Propsy:**
Brak

---

### CampaignSelector (React component)

**Opis komponentu:**
Dropdown (Shadcn Select) pozwalający wybrać aktywną kampanię. Wybrana kampania jest zapisywana w localStorage i używana do warunkowego renderowania CampaignNav oraz budowania linków.

**Główne elementy:**

- `<div>` container z padding i spacing
- `<label>` - "Current Campaign" (text-slate-400, text-xs, uppercase)
- `<Select>` (Shadcn/ui)
  - `<SelectTrigger>` - wyświetla nazwę wybranej kampanii lub "Select a campaign"
  - `<SelectContent>` - scrollable lista (max-h-[300px])
    - `<SelectItem>` dla każdej kampanii (z checkmark dla wybranej)
  - Custom footer div - "Manage Campaigns" link

**Obsługiwane zdarzenia:**

- `onValueChange(campaignId: string)`: zapis do localStorage, update stanu

**Walidacja:**

- Walidacja czy selectedCampaignId istnieje w liście campaigns (może być usunięta)
- Jeśli nie - clear selection

**Typy:**

- `Campaign[]` - lista kampanii
- `selectedCampaignId: string | null`

**Propsy:**

```typescript
interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  onSelectionChange: (campaignId: string | null) => void;
  isLoading: boolean;
  error: Error | null;
}
```

---

### GlobalNav (React component)

**Opis komponentu:**
Sekcja nawigacji do modułów globalnych, dostępnych niezależnie od wybranej kampanii.

**Główne elementy:**

- `<div>` wrapper
- `<h2>` - "Global" label (text-slate-500, text-xs, uppercase, mb-2)
- `<ul role="list">` - lista NavItem
  - NavItem: "My Campaigns" (FolderIcon, /campaigns)
  - NavItem: "Monsters Library" (DragonIcon, /monsters)
  - NavItem: "Spells Library" (SparklesIcon, /spells)

**Obsługiwane zdarzenia:**
Delegowane do NavItem

**Walidacja:**
Brak

**Typy:**

- `currentPath: string` - dla active link highlighting

**Propsy:**

```typescript
interface GlobalNavProps {
  currentPath: string;
}
```

---

### CampaignNav (React component)

**Opis komponentu:**
Sekcja nawigacji do modułów związanych z wybraną kampanią. Renderowana warunkowo tylko gdy użytkownik wybrał kampanię. NavItem "Combat" jest aktywny tylko jeśli istnieje aktywna walka.

**Główne elementy:**

- Conditional rendering wrapper (return null jeśli !selectedCampaignId)
- `<div>` wrapper
- `<h2>` - "Campaign" label (text-slate-500, text-xs, uppercase, mb-2)
- `<ul role="list">` - lista NavItem
  - NavItem: "Combat" (SwordsIcon, href zależy od activeCombatId)
    - Badge: "Active" (emerald, pulsing) jeśli activeCombat
    - Disabled jeśli !activeCombat
  - NavItem: "Player Characters" (UsersIcon, /campaigns/:selectedId/characters)

**Obsługiwane zdarzenia:**
Delegowane do NavItem

**Walidacja:**

- Renderowanie tylko gdy selectedCampaignId !== null
- Combat disabled state gdy !activeCombat

**Typy:**

- `selectedCampaignId: string | null`
- `activeCombat: ActiveCombatViewModel | null`
- `currentPath: string`

**Propsy:**

```typescript
interface CampaignNavProps {
  selectedCampaignId: string | null;
  activeCombat: ActiveCombatViewModel | null;
  currentPath: string;
}
```

---

### NavItem (React component)

**Opis komponentu:**
Reużywalny element nawigacji z ikoną, tekstem i opcjonalnym badge. Obsługuje stan aktywny (current page) i disabled.

**Główne elementy:**

- `<li>` wrapper
- `<a>` lub `<span>` (jeśli disabled)
  - Lucide Icon (przekazany jako prop)
  - `<span>` - label text
  - Optional Badge component (np. "Active")

**Obsługiwane zdarzenia:**

- onClick: nawigacja (jeśli !disabled)

**Walidacja:**

- Disabled state: prevent navigation, show cursor-not-allowed

**Typy:**

- `icon: LucideIcon` - component ikony
- `label: string`
- `href: string`
- `isActive: boolean`
- `isDisabled: boolean`
- `badge?: { text: string; variant: 'active' | 'default'; animate?: boolean }`

**Propsy:**

```typescript
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isDisabled?: boolean;
  badge?: {
    text: string;
    variant: "active" | "default";
    animate?: boolean;
  };
}
```

**Styling:**

- Default: `text-slate-300 hover:text-slate-100 hover:bg-slate-800`
- Active: `text-emerald-500 border-l-2 border-emerald-500 bg-slate-800/50`
- Disabled: `opacity-50 cursor-not-allowed pointer-events-none`
- Focus: `focus-visible:ring-2 focus-visible:ring-emerald-500`

---

### UserMenu (React component)

**Opis komponentu:**
Dropdown menu (Shadcn DropdownMenu) z informacjami o użytkowniku i opcją wylogowania. Znajduje się na dole sidebara.

**Główne elementy:**

- `<DropdownMenu>` (Shadcn/ui)
  - `<DropdownMenuTrigger>` - button z avatar + email
    - Avatar component (lub fallback z inicjałami)
    - Email (truncated jeśli długi)
  - `<DropdownMenuContent>` - align="start"
    - `<DropdownMenuLabel>` - email użytkownika (pełny)
    - `<DropdownMenuSeparator>`
    - `<DropdownMenuItem>` - Logout button
      - LogOutIcon (Lucide)
      - "Logout" text (text-destructive)

**Obsługiwane zdarzenia:**

- onClick Logout: wywołanie `logout()` z useAuth hook
  - Supabase signOut()
  - Clear localStorage
  - Redirect do /login

**Walidacja:**

- Komponent renderowany tylko gdy user !== null

**Typy:**

- `UserViewModel`

**Propsy:**

```typescript
interface UserMenuProps {
  user: UserViewModel;
  onLogout: () => Promise<void>;
}
```

---

### Badge (Shadcn/ui component)

**Opis komponentu:**
Komponent badge z Shadcn/ui używany dla "Active" wskaźnika przy Combat nav item.

**Główne elementy:**

- `<span>` z odpowiednimi klasami Tailwind

**Obsługiwane zdarzenia:**
Brak (czysto wizualny)

**Walidacja:**
Brak

**Typy:**

- `variant?: 'default' | 'active' | 'destructive'`
- `animate?: boolean` - dla pulsing animation

**Propsy:**

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "active" | "destructive";
  animate?: boolean;
  className?: string;
}
```

## 5. Typy

### Typy istniejące (z src/types.ts)

```typescript
// Już zdefiniowane w types.ts
export type Campaign = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export interface ListCampaignsResponseDTO {
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
}
```

### Nowe typy (do dodania w src/types.ts lub osobnym pliku view models)

```typescript
/**
 * ViewModel dla zalogowanego użytkownika w UI
 */
export interface UserViewModel {
  id: string;
  email: string;
  avatar?: string; // URL do avatara (jeśli dostępny z Supabase auth)
}

/**
 * ViewModel dla aktywnej walki
 * Używany do pokazania badge "Active" przy Combat nav item
 */
export interface ActiveCombatViewModel {
  combat_id: string;
  campaign_id: string;
  status: "active";
}

/**
 * Agregowany ViewModel dla całego Sidebar
 * (opcjonalny - można też zarządzać poszczególnymi fragmentami w hookach)
 */
export interface SidebarViewModel {
  user: UserViewModel | null;
  selectedCampaignId: string | null;
  campaigns: Campaign[];
  activeCombat: ActiveCombatViewModel | null;
  currentPath: string;
  isLoadingCampaigns: boolean;
  isLoadingActiveCombat: boolean;
  campaignsError: Error | null;
}
```

### Typy dla komponentów (w osobnych plikach komponentów)

Szczegółowe interfejsy props opisane w sekcji 4 (Szczegóły komponentów).

## 6. Zarządzanie stanem

### Stan globalny

Brak potrzeby global state management (Zustand) dla sidebara. State będzie zarządzany lokalnie w komponencie Sidebar przez custom hooks.

**Uwaga:** Zustand może być używany dla combat tracker (out of scope dla tego widoku), ale sidebar nie wymaga global state.

### Stan lokalny (w komponencie Sidebar)

Stan zarządzany przez custom hooks:

1. **useCampaigns()** - pobiera listę kampanii użytkownika
2. **useSelectedCampaign()** - zarządza wybraną kampanią (localStorage sync)
3. **useActiveCombat(selectedCampaignId)** - sprawdza czy istnieje aktywna walka
4. **useAuth()** - dostęp do danych użytkownika i funkcji logout

### Custom Hooks (szczegółowy opis)

#### useCampaigns()

**Lokalizacja:** `src/hooks/useCampaigns.ts`

**Cel:** Pobranie listy kampanii użytkownika z API i zarządzanie loading/error state.

**Zwraca:**

```typescript
interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Implementacja:**

- useEffect z fetch do GET /api/campaigns (limit=100, offset=0)
- Error handling z try/catch
- Retry mechanism (refetch)

---

#### useSelectedCampaign()

**Lokalizacja:** `src/hooks/useSelectedCampaign.ts`

**Cel:** Zarządzanie wybraną kampanią z synchronizacją do localStorage. Nasłuchuje również na storage events (zmiany w innych tabletach).

**Zwraca:**

```typescript
interface UseSelectedCampaignReturn {
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
}
```

**Implementacja:**

- useState inicjalizowany wartością z localStorage("selectedCampaignId")
- useEffect dla synchronizacji state → localStorage
- useEffect dla storage event listener (cross-tab sync)
- Walidacja czy ID istnieje w campaigns array (clear jeśli nie)

---

#### useActiveCombat(selectedCampaignId: string | null)

**Lokalizacja:** `src/hooks/useActiveCombat.ts`

**Cel:** Sprawdzenie czy dla wybranej kampanii istnieje aktywna walka.

**Zwraca:**

```typescript
interface UseActiveCombatReturn {
  activeCombat: ActiveCombatViewModel | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Implementacja:**

- useEffect z dependency na selectedCampaignId
- Jeśli selectedCampaignId === null, return { activeCombat: null, isLoading: false }
- Fetch do GET /api/combats?campaign_id={selectedCampaignId}&status=active
- AbortController dla cancel poprzedniego request przy zmianie campaign
- Parse response (array może zawierać 0 lub 1 combat, bierzemy pierwszy)

---

#### useAuth()

**Lokalizacja:** `src/hooks/useAuth.ts`

**Cel:** Dostęp do danych zalogowanego użytkownika i funkcji logout.

**Zwraca:**

```typescript
interface UseAuthReturn {
  user: UserViewModel | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}
```

**Implementacja:**

- useEffect z supabase.auth.getUser()
- Map Supabase User do UserViewModel
- logout():
  - await supabase.auth.signOut()
  - localStorage.clear() (lub removeItem dla specific keys)
  - window.location.href = '/login' (hard redirect)

## 7. Integracja API

### GET /api/campaigns

**Endpoint:** `/api/campaigns`

**Query Parameters:**

- `limit` (optional, default: 50) - dla sidebara użyjemy limit=100 żeby pobrać wszystkie
- `offset` (optional, default: 0)

**Request:**

```typescript
fetch("/api/campaigns?limit=100&offset=0", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Response Type:** `ListCampaignsResponseDTO`

```typescript
{
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
}
```

**Obsługa błędów:**

- 401 Unauthorized: Redirect do /login
- 500 Internal Server Error: Pokazanie error state w UI
- Network error: Pokazanie error state z retry button

**Użycie:** Hook `useCampaigns()`

---

### GET /api/combats

**Endpoint:** `/api/combats?campaign_id={id}&status=active`

**Query Parameters:**

- `campaign_id` (required) - UUID kampanii
- `status` (optional) - filter po statusie ("active" lub "completed")

**Request:**

```typescript
fetch(`/api/combats?campaign_id=${selectedCampaignId}&status=active`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Response Type:** `{ combats: CombatDTO[] }`

```typescript
{
  combats: [
    {
      id: string;
      campaign_id: string;
      name: string;
      status: 'active';
      current_round: number;
      state_snapshot: CombatSnapshotDTO | null;
      created_at: string;
      updated_at: string;
    }
  ]
}
```

**Obsługa błędów:**

- 401 Unauthorized: Redirect do /login
- 404 Not Found: activeCombat = null (normalny case)
- 500 Internal Server Error: activeCombat = null, log error

**Użycie:** Hook `useActiveCombat(selectedCampaignId)`

**Uwaga:** Endpoint GET /api/combats nie jest jeszcze zaimplementowany - będzie potrzebny dla tego widoku.

---

### Supabase Auth signOut

**Metoda:** `supabase.auth.signOut()`

**Request:**
Wywołanie SDK Supabase (nie bezpośredni HTTP request)

**Response:**

```typescript
{
  error: AuthError | null;
}
```

**Obsługa błędów:**

- Nawet jeśli signOut zwróci error, wykonujemy clear localStorage i redirect (force logout UX)

**Użycie:** Hook `useAuth().logout()`

## 8. Interakcje użytkownika

### 1. Kliknięcie logo/nazwy aplikacji (AppHeader)

**Trigger:** onClick na `<a>` w AppHeader

**Akcja:**

- Nawigacja do `/campaigns` (natywny link, no client-side routing)

**Rezultat:**

- Przekierowanie na stronę z listą kampanii

**Feedback wizualny:**

- Hover: `hover:text-emerald-400` na tekście

---

### 2. Wybór kampanii z dropdown (CampaignSelector)

**Trigger:** onValueChange w Shadcn Select

**Akcja:**

1. `setSelectedCampaignId(campaignId)`
2. Zapis do `localStorage.setItem('selectedCampaignId', campaignId)`
3. Trigger useActiveCombat hook (re-fetch active combat)

**Rezultat:**

- CampaignNav staje się widoczna (jeśli była ukryta)
- Link "Player Characters" aktualizowany do `/campaigns/{selectedId}/characters`
- NavItem "Combat" aktualizowany based on active combat

**Feedback wizualny:**

- Dropdown SelectItem pokazuje checkmark przy wybranej kampanii
- Trigger wyświetla nazwę wybranej kampanii

---

### 3. Kliknięcie "Manage Campaigns" (CampaignSelector footer)

**Trigger:** onClick na linku w footer dropdown

**Akcja:**

- Nawigacja do `/campaigns`

**Rezultat:**

- Przekierowanie na stronę z listą kampanii (gdzie można dodać/edytować/usunąć)

**Feedback wizualny:**

- Hover: `hover:text-emerald-400`

---

### 4. Kliknięcie nav item (GlobalNav)

**Trigger:** onClick na NavItem (My Campaigns, Monsters Library, Spells Library)

**Akcja:**

- Nawigacja do odpowiedniego route (natywny link)

**Rezultat:**

- Zmiana widoku
- Active link highlighting (emerald border + text)

**Feedback wizualny:**

- Hover: `hover:bg-slate-800 hover:text-slate-100`
- Active: `border-l-2 border-emerald-500 text-emerald-500 bg-slate-800/50`
- Focus: `focus-visible:ring-2 focus-visible:ring-emerald-500`

---

### 5. Kliknięcie "Combat" (CampaignNav, gdy aktywna walka)

**Trigger:** onClick na NavItem "Combat" (jeśli activeCombat !== null)

**Akcja:**

- Nawigacja do `/combats/{activeCombat.combat_id}`

**Rezultat:**

- Przekierowanie do widoku aktywnej walki

**Feedback wizualny:**

- Badge "Active" (emerald, pulsing) przy label
- Active link highlighting (jeśli już jesteśmy w combat view)

---

### 6. Hover na "Combat" (CampaignNav, gdy brak aktywnej walki)

**Trigger:** hover na NavItem "Combat" (jeśli activeCombat === null)

**Akcja:**

- Brak (disabled state, pointer-events-none)
- Opcjonalnie: tooltip "No active combat. Start a new combat from Campaigns page."

**Rezultat:**

- Cursor: not-allowed
- Brak nawigacji

**Feedback wizualny:**

- Opacity: 0.5
- Cursor: not-allowed
- Opcjonalny tooltip z wyjaśnieniem

---

### 7. Kliknięcie "Player Characters" (CampaignNav)

**Trigger:** onClick na NavItem "Player Characters"

**Akcja:**

- Nawigacja do `/campaigns/{selectedCampaignId}/characters`

**Rezultat:**

- Przekierowanie do widoku z listą postaci kampanii

**Feedback wizualny:**

- Standard NavItem hover/active states

---

### 8. Kliknięcie Logout (UserMenu dropdown)

**Trigger:** onClick na DropdownMenuItem "Logout"

**Akcja:**

1. Wywołanie `useAuth().logout()`
2. await supabase.auth.signOut()
3. localStorage.clear()
4. window.location.href = '/login'

**Rezultat:**

- Wylogowanie użytkownika
- Przekierowanie na stronę logowania
- Clear wszystkich localStorage data (w tym selectedCampaignId)

**Feedback wizualny:**

- Loading state podczas signOut (opcjonalnie)
- Destructive color (text-destructive) na "Logout" text
- LogOutIcon (Lucide)

---

### 9. Keyboard navigation (Tab przez sidebar)

**Trigger:** Użytkownik naciska Tab

**Akcja:**

- Focus przechodzi przez wszystkie focusable elements:
  1. Skip to main content link (jeśli pierwszy Tab po load strony)
  2. AppHeader link
  3. CampaignSelector trigger (Select)
  4. GlobalNav NavItems (3x)
  5. CampaignNav NavItems (2x, jeśli visible)
  6. UserMenu trigger (DropdownMenu)

**Rezultat:**

- Focused element ma widoczny emerald focus ring

**Feedback wizualny:**

- `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2`

---

### 10. Enter na focused nav item

**Trigger:** Użytkownik naciska Enter na focused NavItem

**Akcja:**

- Nawigacja (jak onClick)

**Rezultat:**

- Zmiana widoku (jeśli !disabled)

**Feedback wizualny:**

- Standard link behavior

---

### 11. Kliknięcie "Skip to main content"

**Trigger:** Tab po załadowaniu strony + Enter na focused link

**Akcja:**

- Smooth scroll do `#main-content`
- Focus przeniesiony do main element

**Rezultat:**

- Viewport scrolluje do main content
- Skip navigation dla screen reader users

**Feedback wizualny:**

- Link staje się widoczny po focus (z position absolute -top-40 do top-0)

## 9. Warunki i walidacja

### 1. Renderowanie CampaignNav (conditional rendering)

**Warunek:** `selectedCampaignId !== null`

**Komponent:** CampaignNav

**Weryfikacja:**

```typescript
if (!selectedCampaignId) {
  return null; // Nie renderuj sekcji Campaign
}
```

**Wpływ na UI:**

- Sekcja "Campaign" ukryta jeśli brak wybranej kampanii
- NavItems "Combat" i "Player Characters" niedostępne

---

### 2. Disabled state dla NavItem "Combat"

**Warunek:** `activeCombat === null`

**Komponent:** NavItem (Combat)

**Weryfikacja:**

```typescript
<NavItem
  isDisabled={activeCombat === null}
  // ...
/>
```

**Wpływ na UI:**

- Opacity: 0.5
- Cursor: not-allowed
- pointer-events: none (brak nawigacji)
- aria-disabled="true"

---

### 3. Pokazanie badge "Active" przy Combat

**Warunek:** `activeCombat !== null`

**Komponent:** NavItem (Combat)

**Weryfikacja:**

```typescript
<NavItem
  badge={activeCombat ? {
    text: 'Active',
    variant: 'active',
    animate: true
  } : undefined}
  // ...
/>
```

**Wpływ na UI:**

- Badge "Active" widoczny obok "Combat" label
- Emerald color + pulsing animation

---

### 4. Active link highlighting

**Warunek:** `currentPath.startsWith(navItem.href)` lub `currentPath === navItem.href`

**Komponent:** NavItem

**Weryfikacja:**

```typescript
const isActive = window.location.pathname === href || window.location.pathname.startsWith(href + "/");
```

**Wpływ na UI:**

- Emerald left border (border-l-2 border-emerald-500)
- Emerald text color (text-emerald-500)
- Subtle background (bg-slate-800/50)
- aria-current="page"

---

### 5. Walidacja selectedCampaignId w localStorage

**Warunek:** `localStorage.getItem('selectedCampaignId')` istnieje w `campaigns` array

**Komponent:** useSelectedCampaign hook

**Weryfikacja:**

```typescript
useEffect(() => {
  if (selectedCampaignId && campaigns.length > 0) {
    const exists = campaigns.some((c) => c.id === selectedCampaignId);
    if (!exists) {
      setSelectedCampaignId(null);
      localStorage.removeItem("selectedCampaignId");
    }
  }
}, [selectedCampaignId, campaigns]);
```

**Wpływ na UI:**

- Jeśli wybrana kampania została usunięta, selection zostaje cleared
- Dropdown pokazuje "Select a campaign" jako placeholder

---

### 6. Renderowanie UserMenu tylko gdy user zalogowany

**Warunek:** `user !== null`

**Komponent:** Sidebar

**Weryfikacja:**

```typescript
{user && <UserMenu user={user} onLogout={logout} />}
```

**Wpływ na UI:**

- UserMenu nie renderuje się jeśli brak zalogowanego użytkownika (edge case, nie powinno się zdarzyć)

---

### 7. Loading state dla CampaignSelector

**Warunek:** `isLoadingCampaigns === true`

**Komponent:** CampaignSelector

**Weryfikacja:**

```typescript
{isLoadingCampaigns ? (
  <SelectTrigger disabled>Loading campaigns...</SelectTrigger>
) : (
  <SelectTrigger>...</SelectTrigger>
)}
```

**Wpływ na UI:**

- Dropdown disabled podczas ładowania
- Trigger pokazuje "Loading campaigns..." jako placeholder

---

### 8. Error state dla campaigns

**Warunek:** `campaignsError !== null`

**Komponent:** CampaignSelector

**Weryfikacja:**

```typescript
{campaignsError && (
  <div className="text-destructive text-sm">
    Failed to load campaigns. <button onClick={refetch}>Retry</button>
  </div>
)}
```

**Wpływ na UI:**

- Error message z retry button
- Dropdown może być disabled lub pokazywać cached data

---

### 9. Pusta lista kampanii

**Warunek:** `campaigns.length === 0 && !isLoadingCampaigns && !campaignsError`

**Komponent:** CampaignSelector

**Weryfikacja:**

```typescript
{campaigns.length === 0 ? (
  <SelectContent>
    <div className="p-2 text-slate-400 text-sm">
      No campaigns yet.
    </div>
  </SelectContent>
) : (
  <SelectContent>
    {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
  </SelectContent>
)}
```

**Wpływ na UI:**

- Dropdown pokazuje "No campaigns yet."
- Footer "Create your first campaign" może zastąpić "Manage Campaigns"

## 10. Obsługa błędów

### 1. Błąd podczas ładowania kampanii (GET /api/campaigns)

**Przyczyna:**

- Network error (brak połączenia)
- 500 Internal Server Error
- 401 Unauthorized (brak auth)

**Obsługa:**

```typescript
// W useCampaigns hook
try {
  const response = await fetch("/api/campaigns?limit=100");

  if (response.status === 401) {
    // Redirect do login (może być handled przez middleware)
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  const data = await response.json();
  setCampaigns(data.campaigns);
} catch (error) {
  setError(error);
  console.error("Error loading campaigns:", error);
}
```

**UI feedback:**

- Error message w CampaignSelector: "Failed to load campaigns."
- Retry button dla manual refetch
- CampaignSelector dropdown disabled
- Toast notification (opcjonalnie)

---

### 2. Brak kampanii (pusta lista)

**Przyczyna:**

- Nowy użytkownik bez żadnych kampanii

**Obsługa:**

```typescript
{campaigns.length === 0 && !isLoadingCampaigns && (
  <SelectContent>
    <div className="p-4 text-center text-slate-400 text-sm">
      <p>No campaigns yet.</p>
      <a href="/campaigns" className="text-emerald-500 hover:underline">
        Create your first campaign
      </a>
    </div>
  </SelectContent>
)}
```

**UI feedback:**

- Dropdown pokazuje helpful message z linkiem do /campaigns
- CampaignNav ukryta (selectedCampaignId === null)

---

### 3. Błąd podczas sprawdzania aktywnej walki (GET /api/combats)

**Przyczyna:**

- Network error
- 500 Internal Server Error
- 404 Not Found (normalny case - brak aktywnej walki)

**Obsługa:**

```typescript
// W useActiveCombat hook
try {
  const response = await fetch(`/api/combats?campaign_id=${selectedCampaignId}&status=active`);

  if (response.status === 404) {
    // Normalny case - brak aktywnej walki
    setActiveCombat(null);
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch active combat");
  }

  const data = await response.json();
  setActiveCombat(data.combats[0] || null);
} catch (error) {
  // Silent fail - pokazujemy disabled state dla Combat nav item
  setActiveCombat(null);
  console.error("Error loading active combat:", error);
}
```

**UI feedback:**

- Silent fail (brak error message dla użytkownika)
- Combat NavItem pokazuje disabled state
- Log error w console dla debugging

**Uzasadnienie:** Błąd sprawdzania aktywnej walki nie powinien przeszkadzać w nawigacji. Bezpieczniejsze jest pokazać disabled state niż error.

---

### 4. Błąd podczas logout (Supabase signOut)

**Przyczyna:**

- Network error
- Supabase API error

**Obsługa:**

```typescript
// W useAuth hook
async logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    // Pokazanie toast error, ale nadal wykonujemy cleanup
    toast.error('Logout failed, but clearing session locally');
  } finally {
    // Force logout UX - nawet jeśli API call failed
    localStorage.clear();
    window.location.href = '/login';
  }
}
```

**UI feedback:**

- Toast error message (opcjonalnie)
- Redirect do /login (nawet jeśli signOut failed)
- localStorage.clear() (force logout)

**Uzasadnienie:** UX - użytkownik oczekuje wylogowania po kliknięciu Logout, więc wykonujemy local cleanup nawet jeśli API call fail.

---

### 5. localStorage corruption (nieprawidłowy selectedCampaignId)

**Przyczyna:**

- Kampania została usunięta, ale ID wciąż w localStorage
- Manual edit localStorage przez użytkownika
- Data corruption

**Obsługa:**

```typescript
// W useSelectedCampaign hook
useEffect(() => {
  if (selectedCampaignId && campaigns.length > 0) {
    const exists = campaigns.some((c) => c.id === selectedCampaignId);
    if (!exists) {
      // Clear invalid selection
      setSelectedCampaignId(null);
      localStorage.removeItem("selectedCampaignId");
    }
  }
}, [selectedCampaignId, campaigns]);
```

**UI feedback:**

- Dropdown automatycznie resetuje do "Select a campaign"
- CampaignNav ukrywa się
- Brak error message (silent fix)

---

### 6. User nie załadowany (useAuth loading)

**Przyczyna:**

- Inicjalizacja Supabase auth trwa
- Slow network

**Obsługa:**

```typescript
// W Sidebar component
{isLoadingUser ? (
  <div className="h-16 bg-slate-800 animate-pulse" /> // Skeleton
) : (
  user && <UserMenu user={user} onLogout={logout} />
)}
```

**UI feedback:**

- Skeleton loader dla UserMenu (bottom section sidebar)
- Rest of sidebar może się renderować normalnie

---

### 7. Długi czas ładowania kampanii (slow API response)

**Przyczyna:**

- Slow network
- Supabase performance issues

**Obsługa:**

```typescript
// Opcjonalny timeout dla fetch
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

try {
  const response = await fetch("/api/campaigns?limit=100", {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  // ... rest
} catch (error) {
  if (error.name === "AbortError") {
    setError(new Error("Request timeout - please try again"));
  } else {
    setError(error);
  }
}
```

**UI feedback:**

- Loading spinner w CampaignSelector (max 10s)
- Po timeout: error message "Request timeout" + retry button

---

### 8. Zbyt długa lista kampanii (>100 items)

**Przyczyna:**

- Power user z bardzo wieloma kampaniami
- Performance issues w dropdown

**Obsługa:**

```typescript
// Opcjonalnie: search input w dropdown
<SelectContent className="max-h-[400px]">
  <div className="sticky top-0 p-2 bg-slate-900">
    <input
      type="text"
      placeholder="Search campaigns..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full px-2 py-1 text-sm"
    />
  </div>
  {filteredCampaigns.map(c => (
    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
  ))}
</SelectContent>
```

**UI feedback:**

- Search input na top dropdown
- Scrollable lista (max-h-[400px])
- Virtualization (opcjonalnie, jeśli performance problem)

---

### 9. Race condition przy zmianie kampanii (szybkie przełączanie)

**Przyczyna:**

- Użytkownik szybko zmienia wybraną kampanię
- Request dla poprzedniej kampanii (useActiveCombat) jeszcze pending

**Obsługa:**

```typescript
// W useActiveCombat hook
useEffect(() => {
  if (!selectedCampaignId) {
    setActiveCombat(null);
    return;
  }

  const controller = new AbortController();

  async function fetchActiveCombat() {
    try {
      const response = await fetch(`/api/combats?campaign_id=${selectedCampaignId}&status=active`, {
        signal: controller.signal,
      });
      // ... rest
    } catch (error) {
      if (error.name === "AbortError") {
        // Request cancelled (zmiana kampanii) - ignore
        return;
      }
      // ... handle other errors
    }
  }

  fetchActiveCombat();

  return () => {
    controller.abort(); // Cancel request on cleanup
  };
}, [selectedCampaignId]);
```

**UI feedback:**

- Brak - transparentne dla użytkownika
- Pokazuje się stan dla ostatnio wybranej kampanii

## 11. Kroki implementacji

### Krok 1: Setup projektu i instalacja zależności

**Zadania:**

1. Sprawdzenie czy Shadcn/ui jest zainstalowany (powinien być zgodnie z CLAUDE.md)
2. Dodanie brakujących komponentów Shadcn:
   ```bash
   npx shadcn@latest add select
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add avatar
   npx shadcn@latest add badge
   ```
3. Instalacja Lucide React (jeśli nie zainstalowany):
   ```bash
   npm install lucide-react
   ```

**Rezultat:** Wszystkie wymagane zależności zainstalowane.

---

### Krok 2: Definicja nowych typów

**Zadania:**

1. Otworzyć `src/types.ts`
2. Dodać nowe interfejsy:
   - `UserViewModel`
   - `ActiveCombatViewModel`
   - `SidebarViewModel` (opcjonalnie)

**Lokalizacja:** `src/types.ts` (na końcu pliku)

**Rezultat:** Typy dostępne do importu w komponentach.

---

### Krok 3: Implementacja custom hooks

**Kolejność (od najmniej do najbardziej zależnych):**

#### 3.1. useAuth hook

**Plik:** `src/hooks/useAuth.ts`

**Implementacja:**

- useState dla user, isLoading, error
- useEffect z supabase.auth.getUser()
- logout function z signOut + redirect
- Return interface UseAuthReturn

**Test:** Console.log user po załadowaniu komponentu

---

#### 3.2. useCampaigns hook

**Plik:** `src/hooks/useCampaigns.ts`

**Implementacja:**

- useState dla campaigns, isLoading, error
- useEffect z fetch GET /api/campaigns
- refetch function
- Error handling (401 → redirect, others → set error)
- Return interface UseCampaignsReturn

**Test:** Console.log campaigns po załadowaniu

---

#### 3.3. useSelectedCampaign hook

**Plik:** `src/hooks/useSelectedCampaign.ts`

**Implementacja:**

- useState inicjalizowany z localStorage.getItem('selectedCampaignId')
- useEffect dla zapisu do localStorage przy zmianie state
- useEffect dla storage event listener (cross-tab sync)
- setSelectedCampaignId function
- Return interface UseSelectedCampaignReturn

**Test:** Zmiana kampanii + sprawdzenie localStorage w DevTools

---

#### 3.4. useActiveCombat hook

**Plik:** `src/hooks/useActiveCombat.ts`

**Implementacja:**

- useState dla activeCombat, isLoading, error
- useEffect z dependency na selectedCampaignId
- Conditional fetch (tylko jeśli selectedCampaignId !== null)
- AbortController dla cancel request
- Parse response (pierwszy combat lub null)
- Return interface UseActiveCombatReturn

**Test:** Console.log activeCombat po wybraniu kampanii

**Uwaga:** Ten hook wymaga GET /api/combats endpoint, który nie jest jeszcze zaimplementowany. Możemy:

- Zastąpić mock data na czas developmentu
- Lub zaimplementować endpoint równolegle (out of scope dla tego planu)

---

### Krok 4: Implementacja leaf components (od dołu drzewa)

#### 4.1. SkipToContent component

**Plik:** `src/components/SkipToContent.tsx`

**Implementacja:**

- Prosty `<a href="#main-content">` z Tailwind classes
- sr-only + focus:visible styles
- onClick smooth scroll (opcjonalnie)

**Styling:**

```tsx
className =
  "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded";
```

**Test:** Tab po załadowaniu strony → link powinien się pojawić

---

#### 4.2. Badge component (lub użycie Shadcn Badge)

**Opcja 1:** Użyć Shadcn Badge z custom variant

**Opcja 2:** Custom component w `src/components/ui/badge.tsx`

**Implementacja:**

- Dodanie variant 'active' (emerald color)
- Dodanie prop animate (dla pulsing)
- Tailwind animation w config (jeśli brak):
  ```js
  // tailwind.config.js
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
  ```

**Styling dla active badge:**

```tsx
className = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse-slow";
```

**Test:** Render badge z różnymi variant i animate props

---

#### 4.3. AppHeader component

**Plik:** `src/components/sidebar/AppHeader.tsx`

**Implementacja:**

- `<a href="/campaigns">` wrapper
- Lucide Icon (Sword lub Flame)
- `<span>Initiative Forge</span>`
- Tailwind styling (emerald accent, hover effects)

**Styling:**

```tsx
className = "flex items-center gap-3 px-4 py-6 text-slate-100 hover:text-emerald-400 transition-colors";
```

**Test:** Render + hover + click (should navigate)

---

#### 4.4. NavItem component

**Plik:** `src/components/sidebar/NavItem.tsx`

**Implementacja:**

- Props: icon, label, href, isActive, isDisabled, badge
- Conditional rendering `<a>` vs `<span>` (based on isDisabled)
- Icon component (Lucide)
- Label text
- Optional Badge
- ARIA attributes (aria-current, aria-disabled)
- Tailwind styling (variants for active/disabled/hover/focus)

**Styling:**

```tsx
// Base
className = "flex items-center gap-3 px-4 py-2 text-sm transition-colors relative";

// Active
{
  isActive && "border-l-2 border-emerald-500 text-emerald-500 bg-slate-800/50";
}

// Disabled
{
  isDisabled && "opacity-50 cursor-not-allowed pointer-events-none";
}

// Hover (jeśli !isActive && !isDisabled)
("hover:bg-slate-800 hover:text-slate-100");

// Focus
("focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900");
```

**Test:** Render NavItem ze wszystkimi możliwymi kombinacjami props

---

### Krok 5: Implementacja composite components

#### 5.1. GlobalNav component

**Plik:** `src/components/sidebar/GlobalNav.tsx`

**Implementacja:**

- Props: currentPath
- Section label "Global"
- `<ul role="list">` z 3x NavItem
- Określenie isActive dla każdego item (based on currentPath)

**Nav items:**

1. My Campaigns - icon: Folder, href: /campaigns
2. Monsters Library - icon: Dragon, href: /monsters
3. Spells Library - icon: Sparkles, href: /spells

**Test:** Render + sprawdzenie active highlighting dla różnych paths

---

#### 5.2. CampaignNav component

**Plik:** `src/components/sidebar/CampaignNav.tsx`

**Implementacja:**

- Props: selectedCampaignId, activeCombat, currentPath
- Conditional rendering (return null jeśli !selectedCampaignId)
- Section label "Campaign"
- `<ul role="list">` z 2x NavItem

**Nav items:**

1. Combat
   - icon: Swords
   - href: activeCombat ? `/combats/${activeCombat.combat_id}` : '#'
   - isDisabled: !activeCombat
   - badge: activeCombat ? { text: 'Active', variant: 'active', animate: true } : undefined
2. Player Characters
   - icon: Users
   - href: `/campaigns/${selectedCampaignId}/characters`

**Test:** Render z różnymi kombinacjami (selected/no selected, active combat/no active)

---

#### 5.3. UserMenu component

**Plik:** `src/components/sidebar/UserMenu.tsx`

**Implementacja:**

- Props: user, onLogout
- Shadcn DropdownMenu
- DropdownMenuTrigger: Avatar + Email (truncated)
- DropdownMenuContent:
  - Label: pełny email
  - Separator
  - MenuItem: Logout (LogOut icon, destructive text)
- onClick handler dla logout

**Avatar:**

- Jeśli user.avatar → `<img src={user.avatar} />`
- Fallback: inicjały w colored circle

**Styling:**

```tsx
// Trigger
className = "flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors w-full";

// Logout MenuItem
className = "text-destructive focus:text-destructive";
```

**Test:** Render + click logout (should call onLogout)

---

#### 5.4. CampaignSelector component

**Plik:** `src/components/sidebar/CampaignSelector.tsx`

**Implementacja:**

- Props: campaigns, selectedCampaignId, onSelectionChange, isLoading, error
- Label "Current Campaign"
- Shadcn Select
  - Trigger: wybraną nazwę lub "Select a campaign"
  - Content: scrollable lista (max-h-[300px])
    - Loading state: "Loading campaigns..."
    - Error state: error message + retry button
    - Empty state: "No campaigns yet" + link
    - Normal state: SelectItem[] z checkmark dla selected
  - Custom footer: "Manage Campaigns" link

**Styling:**

```tsx
// Container
className = "px-4 py-3 border-b border-slate-800";

// Label
className = "text-xs uppercase text-slate-400 mb-2";

// SelectContent
className = "max-h-[300px] overflow-y-auto";

// Footer
className = "sticky bottom-0 border-t border-slate-800 bg-slate-900 p-2";
```

**Test:** Wszystkie stany (loading, error, empty, populated, selection)

---

### Krok 6: Implementacja głównego Sidebar component

**Plik:** `src/components/Sidebar.tsx`

**Implementacja:**

- Brak props (standalone component, pobiera dane przez hooks)
- Użycie wszystkich custom hooks:
  - `const { user, isLoading: isLoadingUser, logout } = useAuth()`
  - `const { campaigns, isLoading: isLoadingCampaigns, error: campaignsError, refetch } = useCampaigns()`
  - `const { selectedCampaignId, setSelectedCampaignId } = useSelectedCampaign()`
  - `const { activeCombat } = useActiveCombat(selectedCampaignId)`
- Określenie currentPath: `window.location.pathname` (lub Astro.url.pathname passed as prop)
- Composition wszystkich sub-components

**Struktura:**

```tsx
<aside
  role="navigation"
  className="fixed left-0 top-0 h-screen w-60 bg-slate-900 border-r border-slate-800 flex flex-col"
>
  {/* Top Section */}
  <AppHeader />

  {/* Campaign Selector */}
  <CampaignSelector
    campaigns={campaigns}
    selectedCampaignId={selectedCampaignId}
    onSelectionChange={setSelectedCampaignId}
    isLoading={isLoadingCampaigns}
    error={campaignsError}
  />

  {/* Navigation - flex-1 for spacing */}
  <nav className="flex-1 overflow-y-auto py-4">
    <GlobalNav currentPath={currentPath} />
    <CampaignNav selectedCampaignId={selectedCampaignId} activeCombat={activeCombat} currentPath={currentPath} />
  </nav>

  {/* Bottom Section */}
  {isLoadingUser ? (
    <div className="h-16 bg-slate-800 animate-pulse" />
  ) : (
    user && <UserMenu user={user} onLogout={logout} />
  )}
</aside>
```

**Test:** Render całego sidebara + interakcje (zmiana kampanii, nav, logout)

---

### Krok 7: Implementacja MainLayout Astro component

**Plik:** `src/layouts/MainLayout.astro`

**Implementacja:**

- Props: title (optional)
- HTML structure:
  - `<html>` + `<head>` (title, meta tags)
  - `<body>`
    - `<SkipToContent client:load />`
    - `<div class="flex">`
      - `<Sidebar client:load />`
      - `<main id="main-content" class="flex-1 ml-60 bg-slate-950 min-h-screen p-4 md:p-8">`
        - `<slot />` - content z child pages
      - `</main>`
    - `</div>`
  - `</body>`
- Importy React komponentów z client:load directive

**Struktur:**

```astro
---
import Sidebar from "@/components/Sidebar";
import SkipToContent from "@/components/SkipToContent";

interface Props {
  title?: string;
}

const { title = "Initiative Forge" } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <SkipToContent client:load />

    <div class="flex">
      <Sidebar client:load />

      <main id="main-content" class="flex-1 ml-60 bg-slate-950 min-h-screen p-4 md:p-8">
        <slot />
      </main>
    </div>
  </body>
</html>
```

**Test:** Użycie layout w sample page (np. campaigns page)

## Podsumowanie kroków

1. ✅ Setup projektu i instalacja zależności
2. ✅ Definicja nowych typów
3. ✅ Implementacja custom hooks (useAuth, useCampaigns, useSelectedCampaign, useActiveCombat)
4. ✅ Implementacja leaf components (SkipToContent, Badge, AppHeader, NavItem)
5. ✅ Implementacja composite components (GlobalNav, CampaignNav, UserMenu, CampaignSelector)
6. ✅ Implementacja głównego Sidebar component
7. ✅ Implementacja MainLayout Astro component
8. ✅ Testowanie i refinement
9. ⚠️ Dodatkowe usprawnienia (opcjonalne)
10. ✅ Dokumentacja i cleanup

**Szacowany czas implementacji:** 8-12 godzin dla doświadczonego programisty frontendowego (bez opcjonalnych usprawnień).
