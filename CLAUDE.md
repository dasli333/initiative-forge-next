# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Initiative Forge** is a web application designed as a command center for Dungeon Masters running D&D 5e RPG sessions. It streamlines campaign management and combat tracking through centralized information and automation of repetitive tasks. The app provides global libraries of monsters and spells, a campaign management system, and a dedicated real-time combat tracking module.

**Tech Stack:**
- Next.js 16 (App Router with dynamic routing)
- React 19 with TypeScript 5
- Supabase (PostgreSQL with RLS for backend/auth)
- Tailwind CSS 4
- Zustand (state management)
- TanStack React Query v5 (server state)
- React Hook Form + Zod (forms/validation)
- Radix UI + shadcn/ui (component primitives)
- Vitest (unit tests) + Playwright (e2e tests)

## Common Development Commands

### Development
```bash
npm run dev                    # Start Next.js dev server (http://localhost:3000)
npm run build                  # Production build
npm start                      # Start production server
```

### Testing
```bash
npm run test                   # Run Vitest in watch mode
npm run test:unit              # Run unit tests once
npm run test:unit:watch        # Run unit tests in watch mode
npm run test:unit:ui           # Open Vitest UI
npm run test:unit:coverage     # Generate coverage report

npm run test:e2e               # Run Playwright tests (starts dev server automatically)
npm run test:e2e:ui            # Open Playwright UI
npm run test:e2e:headed        # Run tests with visible browser
npm run test:e2e:debug         # Debug Playwright tests
npm run test:e2e:report        # View last test report
npm run test:cleanup           # Clean up test data (runs e2e/test-cleanup.ts)
```

### Linting
```bash
npm run lint                   # Run ESLint
```

### Running Single Test
```bash
# Vitest
npx vitest run src/path/to/file.test.ts
npx vitest -t "test name pattern"

# Playwright
npx playwright test e2e/specific.spec.ts
npx playwright test -g "test name pattern"
```

## Architecture Overview

### Project Structure
```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group (login, register, reset-password, callback)
│   └── (dashboard)/                  # Protected routes (campaigns, combats, monsters, spells)
├── components/                       # React components (feature-organized)
│   ├── ui/                           # Shadcn UI components
│   ├── auth/                         # Auth-specific components
│   ├── campaigns/                    # Campaign management
│   ├── campaign-dashboard/           # Dashboard view
│   ├── combat/                       # Combat tracking (initiative, character-sheet, wizard)
│   ├── combats/                      # Combat list
│   ├── characters/                   # Character management
│   ├── monsters/                     # Monster library
│   ├── spells/                       # Spell library
│   └── sidebar/                      # Navigation
├── hooks/                            # React Query hooks (useCampaigns, useCombat, etc.)
├── lib/                              # Utilities and clients
│   ├── api/                          # Supabase API abstraction (campaigns.ts, combats.ts, etc.)
│   ├── schemas/                      # Zod validation schemas
│   ├── utils/                        # Helper functions
│   ├── supabase.ts                   # Browser Supabase client (singleton)
│   ├── supabase.server.ts            # Server Supabase client (with cookies)
│   ├── queryClient.ts                # React Query configuration
│   ├── dice.ts                       # D&D dice mechanics
│   └── utils.ts                      # General utilities
├── providers/                        # React Context providers
│   ├── AuthProvider.tsx              # Auth context with session management
│   └── QueryProvider.tsx             # React Query wrapper
├── stores/                           # Zustand stores
│   ├── campaignStore.ts              # Selected campaign (persisted)
│   ├── useCombatStore.ts             # Real-time combat state
│   └── languageStore.ts              # Language preferences
├── types/                            # TypeScript definitions
│   ├── database.ts                   # Supabase auto-generated types
│   ├── index.ts                      # Main domain types
│   ├── combat-view.types.ts          # Combat-specific types
│   └── campaigns.ts                  # Campaign types
└── test/                             # Test utilities
    └── setup.ts                      # Testing library setup
```

### Routing Pattern
- **Route Groups**: `(auth)` for public routes, `(dashboard)` for protected routes
- **Dynamic Routes**: `campaigns/[id]`, `combats/[id]` for resource-specific pages
- **Client-Side Only**: All components use `"use client"` directive (SPA pattern with Next.js routing benefits)

### Authentication Flow
1. `AuthProvider` wraps app in root layout
2. Creates Supabase browser client on mount
3. Listens to auth state changes with `onAuthStateChange`
4. `ProtectedRoute` component guards dashboard routes (redirects to `/login` if unauthenticated)
5. Supabase handles OAuth callbacks via `/callback` route

**Key Files:**
- `src/providers/AuthProvider.tsx` - Auth context provider
- `src/components/auth/ProtectedRoute.tsx` - Route guard component
- `src/lib/supabase.ts` - Browser client (singleton)
- `src/lib/supabase.server.ts` - Server client (with cookie management)

### Data Fetching Pattern
**Layered approach:** Component → React Query Hook → API Helper → Supabase Client

**Example:** `useCampaigns.ts`
- `useCampaignsQuery()` - Fetch campaigns
- `useCreateCampaignMutation()` - Create with optimistic updates
- `useUpdateCampaignMutation()` - Update with rollback on error
- `useDeleteCampaignMutation()` - Delete with cleanup

**React Query Configuration** (`src/lib/queryClient.ts`):
- Stale time: 10 minutes
- GC time: 15 minutes
- Single retry on failure
- Refetch on reconnect, but not on window focus

**API Helpers** (`src/lib/api/`):
- Direct Supabase abstraction layer (no Next.js API routes)
- Security via Row-Level Security (RLS) policies at database level
- Pattern: `export async function getCampaigns(): Promise<Campaign[]> { ... }`
- All functions use `getSupabaseClient()` for browser client

### State Management Strategy
**Zustand for ephemeral/UI state:**

1. **campaignStore** - Selected campaign (persisted to localStorage)
2. **useCombatStore** - Real-time combat state (participants, initiative, HP, conditions)
   - Zero-latency UI updates
   - Snapshots saved to Supabase via `saveSnapshot()` method
   - Tracks dirty/saving state for optimistic updates
3. **languageStore** - Language preferences

**React Query for server state:**
- Automatic caching and synchronization
- Optimistic updates with rollback on error
- Error handling via toast notifications (Sonner)

### Type Safety
- **TypeScript Strict Mode** enabled
- **Zod Schemas** (`src/lib/schemas/`) for runtime validation
- **Auto-generated Database Types** from Supabase (`src/types/database.ts`)
- **DTO Pattern**: Separate request/response types from domain types
- **Path Alias**: `@/` → `./src/`

### Form Handling
```typescript
// React Hook Form + Zod validation pattern
const form = useForm<CreateCampaignInput>({
  resolver: zodResolver(createCampaignSchema),
});
```

### Error Handling
- Console logging for debugging
- User-facing messages via Sonner toast notifications
- Network errors detected: `error instanceof TypeError && error.message === 'Failed to fetch'`
- Auth errors trigger redirect to `/login`

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Optional
```

For e2e tests, also create `.env.test` with test database credentials.

## Testing Strategy

### Unit Tests (Vitest)
- **Environment**: jsdom for DOM testing
- **Setup File**: `src/test/setup.ts` (testing-library configuration)
- **Location**: Colocated with source (`*.test.ts`, `*.spec.tsx`)
- **Coverage**: Configured with v8 provider; excludes `node_modules`, `src/test/`, `dist/`, `.next/`, `**/*.d.ts`, `**/*.config.*`, `**/mockData/`

**Key Principles:**
- Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions
- Place `vi.mock()` factory functions at top level
- Inline snapshots for readable assertions: `expect(value).toMatchInlineSnapshot()`
- Structure tests: Arrange-Act-Assert pattern
- Use descriptive `describe` blocks and explicit assertion messages

### E2E Tests (Playwright)
- **Browser**: Chromium/Desktop Chrome only (1920x1080)
- **Workers**: 1 (sequential execution to avoid race conditions)
- **Location**: `e2e/` directory
- **Configuration**: `playwright.config.ts`
- **Setup/Teardown**: `e2e/global.setup.ts`, `e2e/global.teardown.ts`
- **Cleanup**: `npm run test:cleanup` to remove test data

**Key Principles:**
- Page Object Model for maintainable tests
- Use locators for resilient element selection
- Leverage `expect(page).toHaveScreenshot()` for visual comparison
- Trace on first retry, screenshots only on failure

## Coding Conventions

### General Guidelines
- **Error Handling**: Handle errors and edge cases at the beginning of functions
- **Early Returns**: Use for error conditions to avoid deeply nested if statements
- **Happy Path Last**: Place the happy path last in the function for improved readability
- **Guard Clauses**: Handle preconditions and invalid states early
- **No Unnecessary Else**: Use if-return pattern instead

### Frontend
- **Static vs Dynamic**: Use Astro components (.astro) for static content, React for interactivity (note: this project uses Next.js, but principle applies - minimize client-side JavaScript when possible)
- **Tailwind CSS**:
  - Use `@layer` directive for organizing styles
  - Arbitrary values with square brackets: `w-[123px]`
  - Responsive variants: `sm:`, `md:`, `lg:`
  - State variants: `hover:`, `focus-visible:`, `active:`
  - Dark mode: `dark:` variant

### Accessibility
- Use ARIA landmarks (main, navigation, search)
- Apply appropriate ARIA roles to custom elements
- Use `aria-expanded`, `aria-controls` for expandable content
- Implement `aria-live` regions for dynamic updates
- Apply `aria-label`/`aria-labelledby` for elements without visible labels
- Use `aria-describedby` for associating descriptive text
- Avoid redundant ARIA that duplicates native HTML semantics

### Backend/Database
- **Supabase Integration**: Always use Supabase for backend services
- **Type Safety**: Use `SupabaseClient` type from `src/lib/supabase.ts`, not from `@supabase/supabase-js`
- **Validation**: Use Zod schemas to validate data exchanged with backend
- **RLS Policies**: Security enforced at database level; use `verifyCampaignOwnership()`, `verifyCombatOwnership()` helpers

## Key Architectural Decisions

1. **SPA with Next.js Routing**: All components use `"use client"` directive; benefits of both patterns (no static export)
2. **Direct Supabase from Client**: RLS provides security; no Next.js API routes needed
3. **Zustand for Ephemeral State**: Lightweight alternative to Redux for real-time UI updates (e.g., combat)
4. **React Query for Server State**: Automatic caching, synchronization, and refetching
5. **Colocation Pattern**: Components grouped by feature with their hooks, styles, and tests
6. **Type-First with Zod**: Runtime validation ensures type safety at boundaries

## Common Patterns

### Creating a New Feature
1. Define types in `src/types/`
2. Create Zod schema in `src/lib/schemas/`
3. Add API functions in `src/lib/api/`
4. Create React Query hooks in `src/hooks/`
5. Build components in `src/components/[feature]/`
6. Add route in `src/app/(dashboard)/`

### Adding a New API Function
```typescript
// src/lib/api/campaigns.ts
export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }

  return data;
}
```

### Adding a New React Query Hook
```typescript
// src/hooks/useCampaigns.ts
export function useCampaignsQuery() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onMutate: async (newCampaign) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });
      const previousCampaigns = queryClient.getQueryData(['campaigns']);
      queryClient.setQueryData(['campaigns'], (old: Campaign[]) => [...old, newCampaign]);
      return { previousCampaigns };
    },
    onError: (err, newCampaign, context) => {
      // Rollback
      queryClient.setQueryData(['campaigns'], context?.previousCampaigns);
      toast.error('Failed to create campaign');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created!');
    },
  });
}
```

### Using Zustand Store
```typescript
// src/stores/campaignStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface CampaignState {
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign | null) => void;
}

export const useCampaignStore = create<CampaignState>()(
  devtools(
    persist(
      (set) => ({
        selectedCampaign: null,
        setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
      }),
      {
        name: 'campaign-storage',
        partialize: (state) => ({ selectedCampaign: state.selectedCampaign }),
      }
    )
  )
);
```

## Combat System Details

The combat system is a core feature with real-time state management:

**Combat Store** (`src/stores/useCombatStore.ts`):
- Manages participants, initiative order, rounds, turns
- Tracks HP, conditions, and combat state
- Methods: `rollInitiative()`, `nextTurn()`, `updateHP()`, `addCondition()`, `removeCondition()`
- Direct Supabase updates via `saveSnapshot()` for persistence
- Optimistic UI updates with dirty/saving state tracking

**Dice Mechanics** (`src/lib/dice.ts`):
- D&D 5e dice rolling functions
- Supports advantage/disadvantage
- Attack rolls, damage rolls, ability checks

**Combat Wizard** (`src/components/combat/wizard/`):
- Multi-step form for creating combats
- Add player characters, monsters, NPCs
- Supports multiple instances of same monster type
- Auto-generates initiative after setup

## Quick Onboarding

1. Clone repo and run `npm install`
2. Copy `.env.example` to `.env.local` and add Supabase credentials
3. Run `npm run dev` to start development server
4. Review `src/providers/AuthProvider.tsx` to understand auth flow
5. Check `src/hooks/useCampaigns.ts` as example of React Query pattern
6. Review `src/stores/useCombatStore.ts` for Zustand + Supabase pattern
7. Explore `src/lib/api/campaigns.ts` for Supabase abstraction layer
8. Run `npm run test:unit` and `npm run test:e2e` to verify setup