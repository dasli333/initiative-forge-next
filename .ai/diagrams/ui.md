# Diagram Architektury UI - Autentykacja Initiative Forge

Ten diagram przedstawia architekturę komponentów UI dla modułu autentykacji w aplikacji Initiative Forge, pokazując strukturę stron Next.js, komponentów React, przepływ danych oraz zależności między elementami systemu.

**UWAGA:** Ten diagram został pierwotnie stworzony dla architektury Astro SSR i został zachowany dla referencji historycznej. Po migracji do Next.js SPA:
- Zamiast Astro pages → Next.js App Router pages
- Zamiast middleware → client-side ProtectedRoute guard
- Wszystkie komponenty są React client-side (`'use client'`)
- Brak hydration pattern - pełna aplikacja SPA

## Opis diagramu

Diagram pokazuje:
- **Strukturę stron Next.js** - auth pages i główna aplikacja (App Router)
- **Layouts** - dedykowane layouty dla różnych sekcji
- **Komponenty React** - formularze autentykacji i UI współdzielone
- **Hooks i Store** - zarządzanie stanem (Context API + Zustand)
- **Auth Guard** - client-side ochrona tras (ProtectedRoute)
- **Przepływ danych** - komunikacja między warstwami
- **Direct Supabase** - bezpośrednie wywołania z przeglądarki

## Legenda

- **Prostokąty** - Strony Next.js i komponenty React
- **Zaokrąglone prostokąty** - Layouts i providers
- **Romby** - Punkty decyzyjne (middleware)
- **Grube strzałki** `==>` - Główny przepływ renderowania
- **Cienkie strzałki** `-->` - Zależności i użycie
- **Kropkowane strzałki** `-.->` - Komunikacja API
- **Subgrafy** - Grupowanie funkcjonalne

<mermaid_diagram>

```mermaid
flowchart TD
    subgraph "Backend Layer"
        MW{Middleware}
        SBC[Supabase Client Server]
        SBB[Supabase Browser Client]

        subgraph "API Endpoints (MODYFIKACJA - userId)"
            API_C["/api/campaigns"]
            API_CH["/api/characters"]
            API_CO["/api/combats"]
        end

        subgraph "Public API (bez zmian)"
            API_M["/api/monsters"]
            API_S["/api/spells"]
        end
    end

    subgraph "State Management"
        UA[useAuth Hook]
        CS[campaignStore]
        AS[authStore opcjonalny]
    end

    subgraph "Auth Pages (NOWE)"
        direction TB

        AL(AuthLayout)

        LP["login.astro"]
        RP["register.astro"]
        PP["reset-password.astro"]
        CB["callback.astro"]

        LP ==> LF[LoginForm]
        RP ==> RF[RegisterForm]
        PP ==> PRF[PasswordResetForm]

        LP -.-> AL
        RP -.-> AL
        PP -.-> AL
        CB -.-> AL
    end

    subgraph "Main App Pages (CHRONIONE)"
        direction TB

        ML(MainLayout MODYFIKACJA)

        CAP["campaigns.astro"]
        CDP["campaigns/[id].astro"]
        MOP["monsters.astro"]
        SPP["spells.astro"]
        COP["combat/[id].astro"]

        CAP -.-> ML
        CDP -.-> ML
        MOP -.-> ML
        SPP -.-> ML
        COP -.-> ML
    end

    subgraph "Shared Components"
        direction LR

        SC["SidebarContent MODYFIKACJA"]
        UM["UserMenu NOWY"]
        AH["AppHeader"]
        GN["GlobalNav"]
        AG["AuthGuard NOWY"]

        SC --> UM
        SC --> AH
        SC --> GN
    end

    subgraph "Shadcn UI Components"
        direction LR
        BTN[Button]
        INP[Input]
        FRM[Form]
        DRP[DropdownMenu]
        AVT[Avatar]
    end

    %% Middleware Flow
    MW -->|"Sprawdza sesję"| SBC
    MW -->|"Sesja OK"| ML
    MW -->|"Brak sesji + chroniona"| LP

    %% Auth Forms Flow
    LF --> UA
    RF --> UA
    PRF --> UA

    UA --> SBB
    SBB -.->|"signIn/signUp/resetPassword"| SUPA[Supabase Auth]

    %% Callback handling
    CB -->|"Weryfikuje token"| SBC
    CB -.->|"Po weryfikacji"| LP

    %% Main Layout Components
    ML ==> SC

    %% UserMenu dependencies
    UM --> UA
    UM --> BTN
    UM --> DRP
    UM --> AVT

    %% Auth Forms dependencies
    LF --> BTN
    LF --> INP
    LF --> FRM

    RF --> BTN
    RF --> INP
    RF --> FRM

    PRF --> BTN
    PRF --> INP
    PRF --> FRM

    %% Pages using state
    CAP --> UA
    CAP --> CS

    CDP --> UA

    %% API calls from pages
    CAP -.->|"GET/POST userId"| API_C
    CDP -.->|"PATCH/DELETE userId"| API_CH
    COP -.->|"Combat data userId"| API_CO

    MOP -.->|"Public read"| API_M
    SPP -.->|"Public read"| API_S

    %% API using Supabase
    API_C --> SBC
    API_CH --> SBC
    API_CO --> SBC
    API_M --> SBC
    API_S --> SBC

    %% AuthGuard usage
    AG --> UA
    AG -.->|"Przekierowanie"| LP

    %% Auth Store (optional)
    UA -.->|"Opcjonalnie"| AS

    %% Styling
    classDef newComponent fill:#90EE90,stroke:#228B22,stroke-width:2px
    classDef modifiedComponent fill:#FFD700,stroke:#FF8C00,stroke-width:2px
    classDef layoutComponent fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    classDef middleware fill:#FFB6C1,stroke:#C71585,stroke-width:2px
    classDef stateComponent fill:#DDA0DD,stroke:#8B008B,stroke-width:2px

    class LP,RP,PP,CB,LF,RF,PRF,UM,AG,AS newComponent
    class SC,ML,MW,API_C,API_CH,API_CO modifiedComponent
    class AL,ML layoutComponent
    class MW middleware
    class UA,CS,AS stateComponent
```

</mermaid_diagram>

## Szczegółowy opis komponentów

### 1. Backend Layer

#### Middleware (`middleware/index.ts`) - MODYFIKACJA
- **Funkcja:** Sprawdzanie sesji użytkownika przy każdym żądaniu
- **Odpowiedzialność:**
  - Tworzenie klienta Supabase z obsługą cookies
  - Weryfikacja sesji przez `getUser()`
  - Udostępnienie `context.locals.supabase` i `session`
  - Przekierowanie niezalogowanych z chronionych tras do `/auth/login`
- **Modyfikacja:** Dodanie logiki ochrony tras i przekierowań

#### Klienty Supabase
- **`supabase.client.ts`** - Klient server-side dla API endpoints
- **`supabase.browser.ts`** - Klient dla komponentów React w przeglądarce
- **Funkcja:** Komunikacja z Supabase Auth i Database

#### API Endpoints - MODYFIKACJA
- **`/api/campaigns`**, `/api/characters`, `/api/combats` - Wymagają aktualizacji
- **Zmiana:** Pobieranie `userId` z sesji zamiast hardkodowanego `DEFAULT_USER_ID`
- **Ochrona:** RLS policies w Supabase + weryfikacja userId
- **Publiczne API:** `/api/monsters`, `/api/spells` - bez zmian (dane SRD)

### 2. State Management

#### `useAuth()` Hook - ROZSZERZENIE
- **Obecna funkcjonalność:**
  - `user: UserViewModel | null` - Dane zalogowanego użytkownika
  - `isLoading: boolean` - Stan ładowania
  - `error: Error | null` - Błędy
  - `logout()` - Wylogowanie użytkownika
- **Planowane rozszerzenie:**
  - `login(email, password)` - Logowanie
  - `register(email, password)` - Rejestracja
  - `resetPassword(email)` - Reset hasła
- **Źródło danych:** `supabase.browser.ts` → Supabase Auth

#### `campaignStore.ts` (Zustand)
- **Funkcja:** Zarządzanie aktualnie wybraną kampanią
- **Persist:** localStorage
- **Bez zmian** w kontekście autentykacji

#### `authStore.ts` (Zustand) - OPCJONALNY
- **Funkcja:** Globalne przechowywanie stanu użytkownika
- **Alternatywa:** Można polegać tylko na `useAuth()` hook
- **Korzyści:** Synchronizacja stanu między komponentami

### 3. Auth Pages (NOWE)

#### Layouts

**`src/app/(auth)/layout.tsx`** - NOWY
- **Funkcja:** Dedykowany layout dla stron autentykacji
- **Cechy:**
  - Bez sidebara
  - Wycentrowana zawartość
  - Logo aplikacji
  - Dark theme zgodny z aplikacją
- **Używany przez:** login, register, reset-password, callback

**`src/app/(dashboard)/layout.tsx`** - Layout główny
- **Funkcja:** Layout dla zalogowanych użytkowników
- **Zawiera:**
  - ProtectedRoute guard (sprawdzanie sesji client-side)
  - Sidebar z nawigacją
- **Komponenty:** `SidebarContent.tsx` z `UserMenu.tsx`

#### Strony Next.js (App Router)

**`src/app/(auth)/login/page.tsx`**
- **Funkcja:** Strona logowania
- **Client-side:**
  - Sprawdzenie sesji przez useAuth (jeśli zalogowany → redirect do `/campaigns`)
  - Obsługa parametru `?redirect` dla przekierowań po zalogowaniu
- **Renderuje:** `LoginForm.tsx`

**`src/app/(auth)/register/page.tsx`**
- **Funkcja:** Strona rejestracji
- **Client-side:** Sprawdzenie sesji (przekierowanie zalogowanych)
- **Renderuje:** `RegisterForm.tsx`

**`src/app/(auth)/reset-password/page.tsx`**
- **Funkcja:** Strona resetu hasła
- **Strona publiczna:** Bez sprawdzania sesji
- **Renderuje:** `PasswordResetForm.tsx`

**`src/app/(auth)/callback/page.tsx`**
- **Funkcja:** Obsługa callbacków z emaili
- **Typy callbacków:**
  - Weryfikacja emaila (confirmation)
  - Reset hasła (recovery)
- **Logika:**
  - Weryfikacja tokenu z URL przez Supabase Auth
  - Wyświetlenie statusu operacji
  - Przekierowanie do odpowiedniej strony

#### Komponenty React

**`LoginForm.tsx`** - NOWY
- **Funkcja:** Formularz logowania
- **Pola:** Email, Hasło
- **Walidacja:** Format email, wymagane pola
- **Akcje:**
  - Wywołanie `useAuth().login(email, password)`
  - Obsługa błędów (email niezweryfikowany, nieprawidłowe dane)
  - Przekierowanie po sukcesie przez `navigate()`
- **Link:** "Zapomniałem hasła" → `/auth/reset-password`
- **UI:** Wykorzystuje Shadcn Form, Input, Button

**`RegisterForm.tsx`** - NOWY
- **Funkcja:** Formularz rejestracji
- **Pola:** Email, Hasło, Potwierdzenie hasła
- **Walidacja:**
  - Format email
  - Zgodność haseł
  - Siła hasła (delegowana do Supabase)
- **Akcje:**
  - Wywołanie `useAuth().register(email, password)`
  - Obsługa błędów (email zajęty, słabe hasło)
  - Komunikat o wysłaniu emaila weryfikacyjnego
- **UI:** Wykorzystuje Shadcn Form, Input, Button

**`PasswordResetForm.tsx`** - NOWY
- **Funkcja:** Formularz żądania resetu hasła
- **Pola:** Email
- **Akcje:**
  - Wywołanie `useAuth().resetPassword(email)`
  - Komunikat o wysłaniu emaila z linkiem
- **UI:** Wykorzystuje Shadcn Form, Input, Button

**`ProtectedRoute.tsx`** - NOWY (główny guard)
- **Funkcja:** Wrapper sprawdzający sesję użytkownika
- **Użycie:** Ochrona wszystkich chronionych tras (dashboard layout)
- **Logika:**
  - Sprawdzenie `useAuth().user`
  - Jeśli brak → przekierowanie do `/auth/login`
  - Jeśli loading → wyświetlenie loadera
- **Uwaga:** W Next.js SPA to jest główny mechanizm ochrony tras

### 4. Main App Pages (CHRONIONE)

#### Strony aplikacji głównej (Next.js Pages)
- **`src/app/(dashboard)/campaigns/page.tsx`** - Lista kampanii użytkownika
- **`src/app/(dashboard)/campaigns/[id]/page.tsx`** - Szczegóły kampanii
- **`src/app/(dashboard)/monsters/page.tsx`** - Biblioteka potworów
- **`src/app/(dashboard)/spells/page.tsx`** - Biblioteka czarów
- **`src/app/(dashboard)/combats/[id]/page.tsx`** - Moduł walki

**Wspólne cechy:**
- Używają `(dashboard)` layout z ProtectedRoute
- Chronione przez ProtectedRoute guard (client-side)
- Wszystkie są `'use client'` komponentami React
- Direct Supabase calls z RLS security

### 5. Shared Components

#### `SidebarContent.tsx` - MODYFIKACJA
- **Obecna funkcja:** Główny sidebar z nawigacją
- **Modyfikacja:**
  - Dodanie sekcji użytkownika w górnej części
  - Integracja `UserMenu.tsx`
  - Użycie `useAuth()` do pobrania danych użytkownika
  - Stan loading podczas pobierania danych
- **Zawiera:** `AppHeader`, `GlobalNav`, `UserMenu`

#### `UserMenu.tsx` - NOWY
- **Funkcja:** Menu użytkownika
- **Wyświetla:**
  - Email użytkownika
  - Avatar (inicjały jako fallback)
  - Przycisk wylogowania
- **Akcje:**
  - Wywołanie `useAuth().logout()`
  - Przekierowanie do `/auth/login`
- **UI:** Wykorzystuje Shadcn DropdownMenu, Avatar, Button
- **Dane:** `useAuth().user`

#### `AppHeader.tsx`, `GlobalNav.tsx`
- **Funkcja:** Nagłówek i nawigacja sidebara
- **Bez zmian** w kontekście autentykacji

### 6. Shadcn UI Components

Wykorzystywane komponenty z biblioteki Shadcn/ui:
- **Button** - Przyciski w formularzach i menu
- **Input** - Pola formularzy
- **Form** - Zarządzanie formularzami (React Hook Form)
- **DropdownMenu** - Menu użytkownika
- **Avatar** - Avatar użytkownika
- **Card, Label, Alert** - Dodatkowe komponenty UI

## Przepływ danych

### Scenariusz 1: Logowanie (Next.js SPA)

1. User → `/login` → strona Next.js ładuje się
2. `LoginForm.tsx` sprawdza `useAuth().user` → jeśli zalogowany → redirect
3. User wypełnia formularz → `LoginForm` wywołuje `useAuth().login()`
4. `useAuth()` → `getSupabaseClient()` → Supabase Auth API
5. Supabase Auth → weryfikuje dane → ustawia secure cookies
6. `LoginForm` → `router.push('/campaigns')`
7. Next.js router nawiguje → `/campaigns` page ładuje się
8. ProtectedRoute w dashboard layout → sprawdza sesję → OK
9. `campaigns/page.tsx` → renderuje z sidebar → `UserMenu` → wyświetla dane użytkownika

### Scenariusz 2: Dostęp do chronionej strony (niezalogowany)

1. User → `/campaigns` (bezpośredni link)
2. Next.js ładuje page component
3. ProtectedRoute guard → sprawdza `useAuth().user` → BRAK
4. ProtectedRoute → `router.push('/login?redirect=/campaigns')`
5. User loguje się
6. Po sukcesie → redirect do `/campaigns` (z parametru)

### Scenariusz 3: Wywołanie Supabase z RLS

1. `campaigns/page.tsx` (client-side) → wywołuje `useCampaignsQuery()`
2. React Query hook → wywołuje `getCampaigns()` z API helper
3. API helper → `getSupabaseClient()` → bezpośrednie wywołanie Supabase
4. Supabase Database → RLS policy sprawdza `auth.uid()`
5. Zwraca dane tylko dla zalogowanego użytkownika (automatic filtering)
6. React Query cache'uje wynik

### Scenariusz 4: Wylogowanie

1. User klika "Wyloguj" w `UserMenu`
2. `UserMenu` → `useAuth().logout()`
3. `useAuth()` → `supabase.browser.ts.signOut()`
4. Supabase → usuwa sesję i cookies
5. `useAuth()` → `localStorage.clear()`
6. `useAuth()` → `navigate('/auth/login')`
7. User przekierowany do strony logowania

## Komponenty według statusu

### ZAIMPLEMENTOWANE komponenty (po migracji)

- ✅ `src/app/(auth)/layout.tsx` - Auth layout
- ✅ `src/app/(auth)/login/page.tsx` - Strona logowania
- ✅ `src/app/(auth)/register/page.tsx` - Strona rejestracji
- ✅ `src/app/(auth)/reset-password/page.tsx` - Reset hasła
- ✅ `src/app/(auth)/callback/page.tsx` - OAuth callback
- ✅ `LoginForm.tsx` - Formularz logowania
- ✅ `RegisterForm.tsx` - Formularz rejestracji
- ✅ `PasswordResetForm.tsx` - Formularz resetu
- ✅ `UserMenu.tsx` - Menu użytkownika
- ✅ `ProtectedRoute.tsx` - Auth guard
- ✅ `AuthProvider.tsx` - Context provider

### ZAKTUALIZOWANE komponenty

- ✅ `src/app/(dashboard)/layout.tsx` - Dashboard layout z ProtectedRoute
- ✅ `src/app/layout.tsx` - Root layout z providers
- ✅ `SidebarContent.tsx` - Sidebar z UserMenu
- ✅ `useAuth()` hook - Context API z login, register, resetPassword
- ✅ Direct Supabase calls - `src/lib/api/*` zamiast API routes
- ✅ React Query hooks - `src/hooks/*` z direct Supabase

### BEZ ZMIAN

- ✓ Komponenty walki, kampanii, postaci (tylko `'use client'` dodane)
- ✓ `campaignStore.ts`, `useCombatStore.ts` (Zustand)
- ✓ Komponenty Shadcn/ui
- ✓ Supabase RLS policies
- ✓ Database schema

## Zależności między modułami

### Autentykacja → Reszta aplikacji (Next.js SPA)

1. **ProtectedRoute** → Chroni wszystkie strony w (dashboard) layout
2. **AuthProvider** → Dostarcza stan autentykacji do całej aplikacji
3. **useAuth()** → Używany przez wszystkie komponenty (sidebar, pages)
4. **Direct Supabase** → RLS automatycznie filtruje dane per user

### Aplikacja główna → Autentykacja

1. **Wszystkie dashboard pages** → Wrapped w ProtectedRoute
2. **Direct Supabase calls** → RLS sprawdza auth.uid()
3. **UserMenu w sidebarze** → Wyświetla dane użytkownika i opcję logout
4. **Przekierowania** → Brak sesji → client-side redirect do `/login`

## Architektura warstwowa

```
┌─────────────────────────────────────────────┐
│          PRESENTATION LAYER                 │
│  (Next.js Pages + React Components)         │
│  - Auth Pages (login, register, etc.)       │
│  - Dashboard Pages (campaigns, combat, etc.)│
│  - Shared Components (Sidebar, UserMenu)    │
│  - All components: 'use client'             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          STATE MANAGEMENT LAYER             │
│  - AuthProvider (React Context)             │
│  - useAuth() Hook                           │
│  - campaignStore (Zustand)                  │
│  - useCombatStore (Zustand)                 │
│  - React Query (TanStack Query v5)          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          CLIENT-SIDE GUARD LAYER            │
│  - ProtectedRoute Component                 │
│  - useAuth() check & redirect               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          API HELPERS LAYER                  │
│  - src/lib/api/* (Direct Supabase calls)    │
│  - getSupabaseClient() (browser singleton)  │
│  - React Query hooks (useCampaigns, etc.)   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          BACKEND SERVICES                   │
│  - Supabase Auth (session management)       │
│  - Supabase Database (PostgreSQL + RLS)     │
│  - Row Level Security (auto user filtering) │
└─────────────────────────────────────────────┘
```

## Uwagi implementacyjne (po migracji do Next.js SPA)

1. **Architektura:**
   - Wszystkie komponenty są client-side (`'use client'`)
   - Brak server-side middleware - ochrona przez ProtectedRoute
   - Direct Supabase calls z przeglądarki
   - RLS policies zapewniają bezpieczeństwo

2. **Next.js Router:**
   - Wszystkie przekierowania przez `useRouter()` z `next/navigation`
   - Używać `router.push()` zamiast `window.location.href`
   - Link component dla nawigacji

3. **Bezpieczeństwo:**
   - ProtectedRoute jako pierwsza linia obrony (client-side)
   - RLS policies w Supabase jako główna warstwa bezpieczeństwa
   - AuthProvider zapewnia globalny stan sesji
   - Automatic token refresh przez Supabase SDK

4. **UX:**
   - Loading states w formularzach i ProtectedRoute
   - Toast notifications (Sonner) dla błędów/sukcesu
   - Czytelne komunikaty błędów
   - Redirect do docelowej strony po zalogowaniu (`?redirect` parameter)

5. **Performance:**
   - React Query cache'uje dane Supabase
   - Zustand dla ephemeral state (combat, campaign selection)
   - Optimistic updates w mutacjach
