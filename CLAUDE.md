# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## Plans
- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.

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
- Tiptap (headless rich text editor with @mentions)
- dnd-kit (drag & drop for hierarchies)
- cmdk (command palette Ctrl+K)
- react-day-picker (date picker with fantasy calendar)
- browser-image-compression (WebP compression)
- fuse.js (fuzzy search)
- Vitest (unit tests) + Playwright (e2e tests)

## Common Development Commands

- Never try to run npm run dev

### Development
```bash
npm run build                  # Production build
```

### Testing
```bash
npm run test                   # Run Vitest in watch mode

npm run test:e2e               # Run Playwright tests (starts dev server automatically)
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
│   ├── (auth)/                       # Auth routes (login, register, etc.)
│   └── (dashboard)/                  # Protected routes
├── components/                       # React components (feature-organized)
│   ├── ui/                           # Shadcn UI components
│   ├── shared/                       # Shared components (RichTextEditor, ImageUpload)
│   └── [feature]/                    # Feature-specific (auth, campaigns, combat, etc.)
├── hooks/                            # React Query hooks
├── lib/                              # Utilities and clients
│   ├── api/                          # Supabase API abstraction
│   ├── schemas/                      # Zod validation schemas
│   └── utils/                        # Helper functions
├── providers/                        # React Context providers
├── stores/                           # Zustand stores
├── types/                            # TypeScript definitions
└── test/                             # Test utilities
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

**API Helpers** (`src/lib/api/`):
- Direct Supabase abstraction layer (no Next.js API routes)
- Security via Row-Level Security (RLS) policies at database level
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

**CRITICAL - Frontend Type Rules:**
- **ALWAYS use DTO types on frontend**, NEVER raw database types (e.g., `LocationDTO` not `Location`)
- Raw types have `Json` fields that need parsing; DTOs have typed fields (e.g., `JSONContent`, `LocationCoordinates`)
- **AVOID `as any` casts** - only use if absolutely necessary with clear comment explaining why
- Prefer generic types or proper type narrowing over `any`
- API layer converts raw → DTO, components receive only DTOs

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

## Shared Feature Components (Reusable)

### Rich Text & Mentions
- **RichTextEditor** - `src/components/shared/RichTextEditor.tsx` (Tiptap with @mentions)
- **Mention Search API** - `searchCampaignEntities(campaignId, query)` in `src/lib/api/entities.ts`
  - Fuzzy search all entity types (fuse.js, threshold 0.3)
  - Returns: `{ id, label, entityType, imageUrl, excerpt }`
- **Backlinks API** - `src/lib/api/entity-mentions.ts`
  - `getMentionsOf(type, id)` - get backlinks for entity
  - `getMentionsBy(type, id, field?)` - get mentions from entity
  - `batchCreateEntityMentions()` - sync mentions (non-blocking)

**Entity Mention Pattern:**
When entity has rich text with @mentions:
1. Extract: `extractMentionsFromJson(json)` from `src/lib/utils/mentionUtils.ts`
2. On create: `batchCreateEntityMentions()` after insert
3. On update: `deleteMentionsBySource()` + re-create
4. Example: `src/lib/api/locations.ts` lines 108-127, 169-191

### Images & Storage
- **ImageUpload** - `src/components/shared/ImageUpload.tsx` (drag & drop with preview)
- **Compression** - `browser-image-compression` (5MB limit, WebP conversion)
- **Bucket naming** - `[entity-type]-images` (e.g., `location-images`, `npc-images`)
- **RLS pattern** - SELECT: authenticated, INSERT: authenticated, DELETE: owner via path check

### Combat Integration
- **ActionBuilder** - `src/components/characters/ActionBuilder.tsx`
- Props: `{ onAdd: (action: ActionDTO) => void, maxActionsReached: boolean }`
- Supports: melee/ranged/spell attacks, special actions
- Max 20 actions per entity

### Standard Patterns

**DTO Conversion (API Layer):**
- API functions MUST convert raw DB types → DTOs
- Raw: `Json` fields (`biography_json`, `coordinates_json`)
- DTO: Typed fields (`JSONContent`, `LocationCoordinates`)
- Components receive only DTOs, never raw types

**Entity Filters:**
```typescript
interface EntityFilters {
  [foreign_key]?: string | null;  // null = "no assignment"
  status?: 'active' | 'inactive' | ...;
}
```
Apply: `query.eq(key, value)` or `query.is(key, null)`

**Query Enrichment:**
Use Supabase query expansion for foreign key names:
```typescript
.select('*, factions(name), locations:location_id(name)')
```
Flattens in DTO mapper: `{ ...entity, faction_name: data.factions?.name }`
