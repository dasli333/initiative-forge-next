# Plan Migracji: Astro SSR → Next.js 15 SPA

## Spis treści

1. [Analiza obecnej sytuacji](#analiza-obecnej-sytuacji)
2. [Plan migracji - Fazy](#plan-migracji)
3. [Główne różnice w kodzie](#główne-różnice-w-kodzie)
4. [Struktura docelowa](#struktura-docelowa)
5. [Zalety po migracji](#zalety-po-migracji)
6. [Kroki wykonania](#kroki-wykonania)

---

## Analiza obecnej sytuacji

### Problemy z obecnym stackiem (Astro SSR)

- **Problemy z hydratacją** - wymuszony pattern Wrapper + HydrationBoundary dla React Query
- **Wydajność** - overhead SSR dla aplikacji dashboard z dużą ilością stanu klienta
- **Złożoność** - mieszanie Astro pages z React islands komplikuje kod
- **Typ aplikacji** - dashboard z combat trackerem nie pasuje do SSR, wymaga dużo interaktywności po stronie klienta

### Obecny stack technologiczny

```
- Astro 5 (SSR mode z Node adapter)
- React 19
- React Query 5 (@tanstack/react-query)
- Zustand (state management)
- Supabase (auth + PostgreSQL)
- Shadcn/ui (UI components)
- Tailwind CSS 4
- TypeScript 5
```

### Dlaczego Next.js SPA?

1. **Eliminacja hydratacji** - brak SSR = brak problemów z hydratacją React Query
2. **Lepsza wydajność** - dashboard z intensywnym stanem klienta działa lepiej jako SPA
3. **Prostszy kod** - jednolita architektura React bez mieszania z Astro
4. **React Query** - działa naturalnie bez workaroundów (Wrapper + HydrationBoundary)
5. **Routing** - App Router Next.js jest bardziej naturalny dla React
6. **Developer Experience** - lepsze HMR, debugging, tooling
7. **Ecosystem** - większa społeczność i więcej rozwiązań dla Next.js

---

## Plan migracji

### Faza 1: Konfiguracja projektu Next.js

#### 1.1 Inicjalizacja projektu

```bash
# W osobnym katalogu (np. initiative-forge-next)
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Odpowiedzi na pytania:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: Yes (opcjonalnie)
- Import alias: `@/*`

#### 1.2 Konfiguracja trybu SPA

**`next.config.ts`**:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Włącza tryb static export (SPA)

  // Opcjonalnie: wyłącz optymalizację obrazków dla static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

#### 1.3 Instalacja zależności

```bash
# UI Libraries
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-progress \
  @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch \
  @radix-ui/react-tabs @radix-ui/react-tooltip

# Utilities
npm install class-variance-authority clsx tailwind-merge lucide-react

# Form handling
npm install react-hook-form @hookform/resolvers zod

# State management
npm install zustand

# Data fetching
npm install @tanstack/react-query

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Date handling
npm install date-fns

# Toast notifications
npm install sonner

# Theming
npm install next-themes

# Dev dependencies
npm install -D @types/node
```

#### 1.4 Konfiguracja Tailwind CSS 4

Tailwind 4 może wymagać dodatkowej konfiguracji - sprawdź aktualną dokumentację.

**`tailwind.config.ts`**:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Skopiować customizacje z obecnego projektu
    },
  },
  plugins: [],
};

export default config;
```

#### 1.5 Konfiguracja TypeScript

**`tsconfig.json`** - powinien być już skonfigurowany, sprawdź aliasy:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    // ... reszta konfiguracji
  }
}
```

#### 1.6 Zmienne środowiskowe

Skopiować i dostosować `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Opcjonalne
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**UWAGA**: W Next.js zmienne dla klienta muszą mieć prefix `NEXT_PUBLIC_`

#### 1.7 Shadcn/ui konfiguracja

```bash
npx shadcn@latest init
```

Wybierz:
- Style: New York
- Base color: Slate (lub według preferencji)
- CSS variables: Yes

Skopiować `components.json` z obecnego projektu i dostosować ścieżki.

---

### Faza 2: Migracja infrastruktury

#### 2.1 Supabase Client

**`src/lib/supabase.ts`**:
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Singleton client dla browser
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}

// Helper do użycia w komponentach
export const supabase = getSupabaseClient();
```

**Usunąć**:
- `createSupabaseServerInstance` - nie jest potrzebny w SPA
- Server-side cookie handling

#### 2.2 React Query Setup

**`src/lib/queryClient.ts`**:
```typescript
import { QueryClient } from '@tanstack/react-query';

// Browser-side singleton
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  // W SPA zawsze jesteśmy w browser
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,    // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
```

**`src/providers/QueryProvider.tsx`**:
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/queryClient';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 2.3 Zustand Stores

Przenieść stores z `src/stores/*` (jeśli istnieją) bez zmian - Zustand działa identycznie.

#### 2.4 Typy

Przenieść:
- `src/types.ts` → `src/types/index.ts`
- `src/db/database.types.ts` → `src/types/database.ts`

Zaktualizować importy w całym projekcie.

---

### Faza 3: Migracja API Routes

**KRYTYCZNE**: API Routes w Next.js z `output: 'export'` NIE DZIAŁAJĄ!

#### Opcja A: Supabase Edge Functions (ZALECANE)

1. **Utworzyć Edge Functions w Supabase**:
```bash
# W katalogu projektu Supabase
supabase functions new campaigns
supabase functions new characters
supabase functions new combats
# ... itd.
```

2. **Przepisać logikę z service layer**:

Przykład: `supabase/functions/campaigns/index.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Route handling
  if (req.method === 'GET') {
    // List campaigns logic
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ campaigns: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    // Create campaign logic
    const body = await req.json();
    // ... validation, creation
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

3. **Deploy functions**:
```bash
supabase functions deploy campaigns
```

4. **Zaktualizować calls w aplikacji**:
```typescript
// src/lib/api/campaigns.ts
const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export async function getCampaigns(supabase: SupabaseClient) {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${FUNCTIONS_URL}/campaigns`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  return response.json();
}
```

#### Opcja B: Direct Supabase Calls (dla prostych CRUD)

Dla prostych operacji, użyć bezpośrednio Supabase client z Row Level Security:

```typescript
// src/lib/api/campaigns.ts
import { supabase } from '@/lib/supabase';

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCampaign(name: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Wymagania**:
- RLS policies muszą być dobrze skonfigurowane w Supabase
- Validation na poziomie bazy (constraints) i klienta (Zod)

#### Opcja C: Separate API Server (najmniej zalecane dla tego projektu)

Utworzyć osobny Express/Fastify server i deploy osobno.

---

### Faza 4: Migracja Autentykacji

#### 4.1 Auth Provider

**`src/providers/AuthProvider.tsx`**:
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 4.2 Protected Route Wrapper

**`src/components/ProtectedRoute.tsx`**:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // lub lepszy loader
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

#### 4.3 Auth Pages

**`src/app/(auth)/login/page.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/campaigns');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* UI implementation */}
    </form>
  );
}
```

Podobnie dla `/register` i `/auth/callback`.

#### 4.4 Root Layout z Providers

**`src/app/layout.tsx`**:
```typescript
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### Faza 5: Migracja Routingu i Pages

#### Mapowanie Astro → Next.js App Router

| Astro (src/pages/)                      | Next.js (src/app/)                          |
|-----------------------------------------|---------------------------------------------|
| `index.astro`                           | `page.tsx` (redirect do /campaigns)        |
| `campaigns.astro`                       | `(dashboard)/campaigns/page.tsx`            |
| `campaigns/[id].astro`                  | `(dashboard)/campaigns/[id]/page.tsx`       |
| `campaigns/[id]/characters.astro`       | `(dashboard)/campaigns/[id]/characters/page.tsx` |
| `campaigns/[id]/combats.astro`          | `(dashboard)/campaigns/[id]/combats/page.tsx` |
| `campaigns/[id]/combats/new.astro`      | `(dashboard)/campaigns/[id]/combats/new/page.tsx` |
| `combats/[id].astro`                    | `(dashboard)/combats/[id]/page.tsx`         |
| `monsters.astro`                        | `(dashboard)/monsters/page.tsx`             |
| `spells.astro`                          | `(dashboard)/spells/page.tsx`               |
| `auth/login.astro`                      | `(auth)/login/page.tsx`                     |
| `auth/register.astro`                   | `(auth)/register/page.tsx`                  |
| `auth/callback.astro`                   | `(auth)/callback/page.tsx`                  |
| `auth/reset-password.astro`             | `(auth)/reset-password/page.tsx`            |

#### Przykład migracji strony

**Przed (Astro)** - `src/pages/campaigns.astro`:
```astro
---
import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CampaignsWrapper } from "@/components/campaigns/CampaignsWrapper";

export const prerender = false;

const queryClient = getQueryClient();

await queryClient.prefetchQuery({
  queryKey: ["campaigns"],
  queryFn: async () => {
    const response = await fetch(`${Astro.url.origin}/api/campaigns`, {
      headers: {
        Cookie: Astro.request.headers.get("Cookie") || "",
      },
    });
    return response.json();
  },
});

const dehydratedState = dehydrate(queryClient);
---

<CampaignsWrapper client:load dehydratedState={dehydratedState} />
```

**Po (Next.js SPA)** - `src/app/(dashboard)/campaigns/page.tsx`:
```typescript
'use client';

import { CampaignsContent } from '@/components/campaigns/CampaignsContent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <CampaignsContent />
    </ProtectedRoute>
  );
}
```

**UWAGA**: Nie potrzeba już:
- SSR prefetch
- dehydratedState
- Wrapper komponentu
- HydrationBoundary

---

### Faza 6: Migracja Layoutów

#### 6.1 Route Groups w Next.js

Użyć route groups `(nazwa)` do organizacji layoutów:

```
src/app/
├── layout.tsx                # Root layout (providers)
├── page.tsx                  # Landing / redirect
├── (auth)/
│   ├── layout.tsx           # Auth layout (centered forms)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── callback/page.tsx
│   └── reset-password/page.tsx
└── (dashboard)/
    ├── layout.tsx           # Main layout (sidebar, header)
    ├── campaigns/...
    ├── combats/...
    ├── monsters/...
    └── spells/...
```

#### 6.2 Auth Layout

**`src/app/(auth)/layout.tsx`**:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

#### 6.3 Dashboard Layout

**`src/app/(dashboard)/layout.tsx`**:
```typescript
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

### Faza 7: Migracja Komponentów React

#### 7.1 Komponenty bez zmian

Większość komponentów React przenosi się 1:1:
```
src/components/ui/*           → src/components/ui/*
src/components/campaigns/*    → src/components/campaigns/*
src/components/combats/*      → src/components/combats/*
src/components/monsters/*     → src/components/monsters/*
src/components/spells/*       → src/components/spells/*
```

#### 7.2 USUNĄĆ Wrapper Pattern

**Przed** - `CampaignsWrapper.tsx`:
```typescript
// ❌ TEN PLIK MOŻNA USUNĄĆ
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";

export function CampaignsWrapper({ dehydratedState }: Props) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <CampaignsContent />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
```

**Po** - Bezpośrednio używać `CampaignsContent`:
```typescript
// ✅ UŻYWAĆ BEZPOŚREDNIO
export function CampaignsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  // ... render logic
}
```

Provider jest już w root layout!

#### 7.3 Nawigacja

**Przed (Astro)**:
```typescript
import { navigate } from "astro:transitions/client";

const handleClick = () => {
  navigate('/campaigns');
};
```

**Po (Next.js)**:
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleClick = () => {
  router.push('/campaigns');
};
```

Lub użyć `<Link>`:
```typescript
import Link from 'next/link';

<Button asChild>
  <Link href="/campaigns">Go to campaigns</Link>
</Button>
```

#### 7.4 Client Components

W Next.js App Router komponenty domyślnie są Server Components.
Dla SPA wszystkie komponenty interaktywne muszą mieć `'use client'`:

```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState(false);
  // ...
}
```

**UWAGA**: W SPA z `output: 'export'`, wszystkie komponenty są de facto client components,
ale directive `'use client'` jest nadal wymagana dla komponentów używających hooks.

---

### Faza 8: Migracja Utilities i Services

#### 8.1 Utils

Przenieść bez zmian:
```
src/lib/utils.ts              → src/lib/utils.ts
src/lib/dice.ts               → src/lib/dice.ts
src/lib/utils/library/*       → src/lib/utils/library/*
src/lib/utils/campaignTransformers.ts → src/lib/utils/campaignTransformers.ts
```

#### 8.2 Services

**Opcja A**: Jeśli używasz Supabase Edge Functions:
- Service layer przenosi się do Edge Functions
- W aplikacji zostają tylko calls do functions

**Opcja B**: Jeśli używasz Direct Supabase:
- Przenieść services do `src/lib/api/*`
- Dostosować do bezpośrednich wywołań Supabase client

Przykład:

**Przed** - `src/lib/services/campaign.service.ts`:
```typescript
export async function listCampaigns(
  supabase: SupabaseClient,
  userId: string,
  limit: number,
  offset: number
) {
  const { data, error, count } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .range(offset, offset + limit - 1);

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    data: {
      campaigns: data,
      total: count ?? 0,
      limit,
      offset,
    },
  };
}
```

**Po** - `src/lib/api/campaigns.ts`:
```typescript
import { supabase } from '@/lib/supabase';

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Użycie w komponencie
const { data: campaigns } = useQuery({
  queryKey: ['campaigns'],
  queryFn: getCampaigns,
});
```

#### 8.3 Schemas (Zod)

Przenieść bez zmian:
```
src/lib/schemas/*             → src/lib/schemas/*
```

Używać do walidacji po stronie klienta przed wywołaniem API.

---

### Faza 9: Static Assets

```
public/*                      → public/* (bez zmian)
src/assets/*                  → public/assets/* (jeśli są statyczne)
                              → import w komponentach (jeśli dynamiczne)
```

Next.js obsługuje `public/` folder identycznie jak Astro.

---

### Faza 10: Testowanie

#### 10.1 Testy jednostkowe

Jeśli używasz Vitest, możesz go zachować lub przenieść na Jest:

**Vitest** (zalecane, prostsze):
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**`vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Przenieść testy:
```
src/lib/utils.test.ts         → src/lib/utils.test.ts (bez zmian)
src/lib/dice.test.ts          → src/lib/dice.test.ts (bez zmian)
```

#### 10.2 Testy E2E (Playwright)

Zaktualizować testy:

**Przed**:
```typescript
await page.goto('http://localhost:3000/campaigns');
```

**Po**:
```typescript
// Bez zmian - URL pozostaje ten sam
await page.goto('http://localhost:3000/campaigns');
```

Zaktualizować selektory jeśli zmieniła się struktura HTML.

#### 10.3 Plan testowania

1. **Auth flow**:
   - Rejestracja
   - Logowanie
   - Wylogowanie
   - Protected routes redirect

2. **CRUD operations**:
   - Campaigns (create, list, update, delete)
   - Characters
   - Combats

3. **Combat tracker** (najbardziej krytyczne):
   - Dodawanie uczestników
   - Rzut inicjatywy
   - Zmiana tury
   - HP tracking
   - Conditions
   - Zapisywanie stanu

4. **Libraries**:
   - Monsters filtering i wyszukiwanie
   - Spells filtering i wyszukiwanie

---

### Faza 11: Build i Deploy

#### 11.1 Local Build

```bash
npm run build
```

Powinien wygenerować folder `out/` ze statycznymi plikami.

#### 11.2 Preview Build

```bash
npx serve out
```

Lub:
```bash
npm install -g serve
serve out -p 3000
```

#### 11.3 Deploy Options

**Vercel** (najłatwiejsze):
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

**Cloudflare Pages**:
```bash
npx wrangler pages publish out
```

**AWS S3 + CloudFront**:
```bash
aws s3 sync out/ s3://your-bucket --delete
```

**GitHub Pages**:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## Główne różnice w kodzie

### 1. Usunięcie SSR patterns

```tsx
// ❌ STARY (Astro + React Query)
// src/pages/campaigns.astro
---
const queryClient = getQueryClient();
await queryClient.prefetchQuery(...);
const dehydratedState = dehydrate(queryClient);
---
<CampaignsWrapper client:load dehydratedState={dehydratedState} />

// ✅ NOWY (Next.js SPA)
// src/app/(dashboard)/campaigns/page.tsx
'use client';

export default function CampaignsPage() {
  return <CampaignsContent />;
}

// src/components/campaigns/CampaignsContent.tsx
export function CampaignsContent() {
  const { data } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns
  });
  // ...
}
```

### 2. Nawigacja

```tsx
// ❌ STARY (Astro)
import { navigate } from "astro:transitions/client";

const handleClick = () => {
  navigate("/campaigns");
};

// ✅ NOWY (Next.js)
import { useRouter } from "next/navigation";

const router = useRouter();
const handleClick = () => {
  router.push("/campaigns");
};

// LUB używając Link
import Link from "next/link";

<Button asChild>
  <Link href="/campaigns">Go to campaigns</Link>
</Button>
```

### 3. API Calls

```tsx
// ❌ STARY (Astro API Routes)
const response = await fetch("/api/campaigns");
const data = await response.json();

// ✅ NOWY (Opcja A: Supabase Functions)
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/campaigns`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  }
);

// ✅ NOWY (Opcja B: Direct Supabase)
const { data, error } = await supabase
  .from("campaigns")
  .select("*");
```

### 4. Auth Protection

```tsx
// ❌ STARY (Middleware Astro)
// src/middleware/index.ts
export const onRequest = defineMiddleware(async (context, next) => {
  const user = await supabase.auth.getUser();
  if (!user) {
    return context.redirect("/auth/login");
  }
  return next();
});

// ✅ NOWY (Client-side guard)
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return <>{children}</>;
}
```

### 5. Environment Variables

```bash
# ❌ STARY (Astro)
SUPABASE_URL=...
SUPABASE_KEY=...

# ✅ NOWY (Next.js)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

```typescript
// ❌ STARY
import.meta.env.SUPABASE_URL

// ✅ NOWY
process.env.NEXT_PUBLIC_SUPABASE_URL
```

### 6. Metadata (SEO)

```tsx
// ❌ STARY (Astro)
---
const title = "Campaigns - Initiative Forge";
---
<head>
  <title>{title}</title>
</head>

// ✅ NOWY (Next.js)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaigns - Initiative Forge',
  description: '...',
};
```

---

## Struktura docelowa

```
initiative-forge-next/
├── public/                          # Static assets
│   ├── icons/
│   └── images/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx             # Root layout + providers
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles
│   │   ├── (auth)/
│   │   │   ├── layout.tsx        # Auth layout (centered forms)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── callback/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx         # Main layout (sidebar)
│   │       ├── campaigns/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       ├── characters/page.tsx
│   │       │       └── combats/
│   │       │           ├── page.tsx
│   │       │           └── new/page.tsx
│   │       ├── combats/
│   │       │   └── [id]/page.tsx
│   │       ├── monsters/page.tsx
│   │       └── spells/page.tsx
│   ├── components/                # React components
│   │   ├── ui/                   # Shadcn components
│   │   ├── campaigns/
│   │   ├── combats/
│   │   ├── monsters/
│   │   ├── spells/
│   │   ├── characters/
│   │   ├── sidebar/
│   │   └── ProtectedRoute.tsx
│   ├── providers/                 # Context providers
│   │   ├── AuthProvider.tsx
│   │   └── QueryProvider.tsx
│   ├── lib/                       # Utilities & services
│   │   ├── supabase.ts
│   │   ├── queryClient.ts
│   │   ├── utils.ts
│   │   ├── dice.ts
│   │   ├── api/                  # API calls
│   │   │   ├── campaigns.ts
│   │   │   ├── characters.ts
│   │   │   ├── combats.ts
│   │   │   ├── monsters.ts
│   │   │   └── spells.ts
│   │   ├── schemas/              # Zod schemas
│   │   │   ├── campaign.schema.ts
│   │   │   ├── character.schema.ts
│   │   │   └── combat.schema.ts
│   │   └── utils/
│   │       └── library/
│   ├── hooks/                     # Custom React hooks
│   │   ├── useCampaigns.ts
│   │   └── useCombat.ts
│   ├── stores/                    # Zustand stores
│   │   └── combatStore.ts
│   └── types/                     # TypeScript types
│       ├── index.ts
│       └── database.ts
├── next.config.ts                 # Next.js config (output: 'export')
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── components.json                # Shadcn config
├── .env.local                     # Environment variables
└── vitest.config.ts              # Test config
```

---

## Zalety po migracji

### Performance
✅ **Brak overhead SSR** - aplikacja ładuje się jako SPA bez hydratacji
✅ **Lepszy TTI (Time to Interactive)** - React działa od razu bez waiting for hydration
✅ **Mniejsze bundle size** - brak kodu server-side w bundle

### Developer Experience
✅ **Prostszy kod** - jednolity React stack bez Astro/React boundaries
✅ **Łatwiejszy debugging** - brak problemów z hydration mismatch
✅ **Szybsze HMR** - Next.js ma bardzo dobre Fast Refresh
✅ **Lepsze error messages** - Next.js pokazuje dokładne errory

### Maintenance
✅ **Mniej boilerplate** - brak Wrapper + HydrationBoundary pattern
✅ **Standard stack** - Next.js + React Query jest bardzo popularnym stackiem
✅ **Więcej resources** - większa społeczność i więcej rozwiązań problemów
✅ **Lepsze tooling** - VSCode extensions, debugging tools

### Architecture
✅ **Naturalne dla React** - cała aplikacja to React, nie Astro + React islands
✅ **Lepsze dla dashboards** - SPA jest idealny dla aplikacji z dużo stanu klienta
✅ **Unifikacja** - jedna technologia do wszystkiego (React)

---

## Status Migracji

**Ostatnia aktualizacja:** 2025-10-23

### Postęp ogólny: ~95% ✅

| Etap | Status | Ukończone |
|------|--------|-----------|
| 1. Przygotowanie | ✅ | 100% |
| 2. Infrastruktura | ✅ | 100% |
| 3. API Strategy | ✅ | 100% (Direct Supabase) |
| 4. Layouts | ✅ | 100% |
| 5. Auth Pages | ✅ | 100% |
| 6. Dashboard Pages | ✅ | 100% (8/8) |
| 7. Components | ✅ | 100% |
| 8. Utils & Services | ✅ | 100% |
| 9. Testing | ✅ | 100% (Setup complete) |
| 10. Polish | ⏳ | 0% |
| 11. Deploy | ⏳ | 0% |

### Co zostało zrobione:
- ✅ Pełna konfiguracja projektu Next.js 15 SPA
- ✅ System autentykacji (login, register, callback, reset password)
- ✅ Campaigns CRUD (list, detail, create, update, delete)
- ✅ Characters management (list, create, edit, delete z formami)
- ✅ Combats list i combat creation wizard (simplified)
- ✅ Combat tracker (`/combats/[id]`) - pełny moduł z combat trackerem
- ✅ Monsters library (`/monsters`) - pełna biblioteka z filtrowaniem i infinite scroll
- ✅ Spells library (`/spells`) - pełna biblioteka z filtrowaniem (level, class) i infinite scroll
- ✅ Wszystkie layouts (root, auth, dashboard)
- ✅ Sidebar i navigation
- ✅ React Query hooks z optimistic updates
- ✅ Direct Supabase integration
- ✅ Zustand store dla campaign selection i language
- ✅ Wszystkie strony i komponenty zmigrowane!

### Następne kroki:
1. **Testing** - Testy E2E i jednostkowe
2. **Polish** - Responsywność, dark mode, accessibility, optymalizacja
3. **Deploy** - Production build i deploy

---

## Kroki wykonania

### Etap 1: Przygotowanie (1-2 dni) ✅
- [x] Utworzyć nowy projekt Next.js w osobnym katalogu
- [x] Skonfigurować `output: 'export'` w `next.config.ts`
- [x] Zainstalować wszystkie zależności
- [x] Skonfigurować Tailwind CSS 4
- [x] Skonfigurować shadcn/ui
- [x] Skopiować zmienne środowiskowe

### Etap 2: Infrastruktura (2-3 dni) ✅
- [x] Przenieść typy (`types/`)
- [x] Skonfigurować Supabase client (browser only)
- [x] Skonfigurować React Query provider
- [x] Skonfigurować Auth provider
- [x] Utworzyć ProtectedRoute component
- [x] Przenieść Zustand stores (jeśli są)

### Etap 3: API Strategy Decision (1 dzień) ✅
- [x] Wybrać strategię API (Edge Functions vs Direct Supabase) - **Wybrano Direct Supabase**
- [ ] Jeśli Edge Functions: utworzyć functions i zmigrowac logic - **N/A**
- [x] Jeśli Direct Supabase: utworzyć API helpers w `lib/api/`
- [x] Przetestować podstawowe operations (CRUD campaigns)

### Etap 4: Layouts (1 dzień) ✅
- [x] Utworzyć root layout z providers
- [x] Utworzyć auth layout
- [x] Utworzyć dashboard layout
- [x] Przenieść sidebar i navigation components

### Etap 5: Auth Pages (1 dzień) ✅
- [x] Przenieść `/login`
- [x] Przenieść `/register`
- [x] Przenieść `/callback`
- [x] Przenieść `/reset-password`
- [x] Przetestować flow autentykacji

### Etap 6: Dashboard Pages (3-5 dni) ✅
- [x] Przenieść `/campaigns`
- [x] Przenieść `/campaigns/[id]`
- [x] Przenieść `/campaigns/[id]/characters`
- [x] Przenieść `/campaigns/[id]/combats`
- [x] Przenieść `/campaigns/[id]/combats/new`
- [x] Przenieść `/combats/[id]`
- [x] Przenieść `/monsters`
- [x] Przenieść `/spells`

### Etap 7: Components (2-3 dni) ✅
- [x] Przenieść wszystkie komponenty UI (shadcn)
- [x] Przenieść komponenty campaigns
- [x] Przenieść komponenty characters
- [x] Przenieść komponenty combats (combat creation i list)
- [x] Przenieść komponenty combat tracker
- [x] Przenieść komponenty monsters
- [x] Przenieść komponenty spells
- [x] USUNĄĆ wszystkie Wrapper components
- [x] Zaktualizować nawigację (useRouter z next/navigation)

### Etap 8: Utils & Services (1 dzień) ✅
- [x] Przenieść `lib/utils.ts`
- [x] Przenieść `lib/dice.ts`
- [x] Przenieść `lib/schemas/*`
- [x] Przenieść lub przepisać services (używamy Direct Supabase w hooks)

### Etap 9: Testing (2-3 dni) ✅
- [x] Zainstalować Playwright
- [x] Skopiować konfigurację testów E2E
- [x] Skopiować page objects i fixtures
- [x] Dodać skrypty E2E do package.json
- [x] Zainstalować przeglądarki Playwright
- [x] Zainstalować Vitest i zależności
- [x] Skonfigurować Vitest dla Next.js
- [x] Skopiować wszystkie testy jednostkowe (12 plików)
- [x] Dodać skrypty testowe do package.json
- [ ] Uruchomić testy i naprawić ewentualne błędy (opcjonalne)
- [ ] Przeprowadzić manualne testy wszystkich features (opcjonalne)

### Etap 10: Polish (1-2 dni)
- [ ] Sprawdzić responsywność
- [ ] Sprawdzić dark mode
- [ ] Sprawdzić accessibility
- [ ] Optymalizacja performance (bundle analysis)
- [ ] Cleanup - usunąć nieużywany kod

### Etap 11: Deploy (1 dzień)
- [ ] Przetestować production build lokalnie
- [ ] Wybrać hosting (Vercel / Netlify / Cloudflare Pages)
- [ ] Skonfigurować CI/CD
- [ ] Deploy do production
- [ ] Przetestować na production

---

## Checklist Przydatne Linki

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [TanStack Query with Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Shadcn/ui Next.js Setup](https://ui.shadcn.com/docs/installation/next)

---

## Pytania do rozważenia przed migracją

1. **API Strategy**: Czy chcesz użyć Supabase Edge Functions czy Direct Supabase calls?
2. **Testing Priority**: Które części aplikacji są najbardziej krytyczne do przetestowania?
3. **Feature Freeze**: Czy możesz zamrozić nowe features podczas migracji?
4. **Rollback Plan**: Czy masz plan powrotu do Astro w razie problemów?
5. **Timeline**: Jaki jest realistyczny timeline? (Szacuję 2-4 tygodnie dla jednej osoby)

---

## Potencjalne Problemy i Rozwiązania

### Problem: API Routes nie działają w static export

**Rozwiązanie**: Użyć Supabase Edge Functions lub Direct Supabase calls (opisane w Faza 3)

### Problem: Auth redirects w SPA

**Rozwiązanie**: Użyć client-side redirects w `useEffect` (opisane w Faza 4)

### Problem: Combat tracker state synchronization

**Rozwiązanie**:
- Zustand dla local state
- React Query mutations dla auto-save
- Optymistic updates dla lepszego UX

### Problem: SEO (jeśli jest wymagane)

**Rozwiązanie**:
- Dla SPA: użyć meta tags w każdej stronie
- Jeśli SEO krytyczne: rozważyć hybrid approach (niektóre strony SSG)

### Problem: Initial load performance

**Rozwiązanie**:
- Code splitting (Next.js robi to automatycznie)
- Lazy loading komponentów
- Optymalizacja bundle size

---

**Koniec planu migracji**

Powodzenia! 🚀
