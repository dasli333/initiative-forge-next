# API Endpoint Implementation Plan: List Monsters

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania filtrowanej i paginowanej listy potworów z globalnej biblioteki SRD (System Reference Document). Umożliwia wyszukiwanie potworów po nazwie, filtrowani według Challenge Rating (CR) oraz paginację wyników. Endpoint jest publiczny (nie wymaga uwierzytelnienia) zgodnie z polityką RLS, ponieważ biblioteka potworów jest globalnym zasobem read-only.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/monsters`
- **Parametry URL**: Brak
- **Query Parameters**:
  - Opcjonalne:
    - `name` (string): Filtrowanie po nazwie potwora (case-insensitive, partial match)
    - `cr` (string): Filtrowanie po dokładnym Challenge Rating (np. "1", "1/2", "5", "1/4")
    - `cr_min` (number): Minimalne CR (włącznie)
    - `cr_max` (number): Maksymalne CR (włącznie)
    - `limit` (number): Maksymalna liczba wyników (default: 20, max: 100)
    - `offset` (number): Przesunięcie dla paginacji (default: 0, min: 0)
- **Request Body**: N/A (GET request)
- **Headers**: Brak wymaganych (publiczny endpoint)

**Przykłady użycia**:

- `/api/monsters` - pierwsze 20 potworów
- `/api/monsters?name=goblin` - potwory zawierające "goblin" w nazwie
- `/api/monsters?cr=1/4` - potwory z CR równym 1/4
- `/api/monsters?cr_min=1&cr_max=5` - potwory z CR między 1 a 5
- `/api/monsters?limit=50&offset=100` - wyniki 101-150

## 3. Wykorzystywane typy

Już zdefiniowane w `src/types.ts`:

- **MonsterDTO** - pojedynczy potwór z typed `data` field:

  ```typescript
  {
    id: string; // UUID
    name: string; // Wydzielona nazwa (dla szybkiego query)
    data: MonsterDataDTO; // Pełne dane JSONB
    created_at: string; // ISO 8601 timestamp
  }
  ```

- **MonsterDataDTO** - typed struktura JSONB `data`:

  ```typescript
  {
    name: { en: string; pl: string };
    size: string;
    type: string;
    category: string;
    alignment: string;
    senses: string[];
    languages: string[];
    abilityScores: {
      strength: { score: number; modifier: number; save: number };
      dexterity: { score: number; modifier: number; save: number };
      // ... pozostałe
    };
    speed: string[];
    hitPoints: { average: number; formula: string };
    armorClass: number;
    challengeRating: {
      rating: string;           // "1/4", "1/2", "1", "5", etc.
      experiencePoints: number;
      proficiencyBonus: number;
    };
    skills: string[];
    damageVulnerabilities: string[];
    damageResistances: string[];
    damageImmunities: string[];
    conditionImmunities: string[];
    gear: string[];
    traits: MonsterTrait[];
    actions: MonsterAction[];
    bonusActions: MonsterAction[];
    reactions: MonsterAction[];
    initiative: { modifier: number; total: number };
    legendaryActions?: LegendaryActions;
    id: string;
  }
  ```

- **ListMonstersResponseDTO** - odpowiedź z paginacją:
  ```typescript
  {
    monsters: MonsterDTO[];
    total: number;      // Całkowita liczba wyników (przed paginacją)
    limit: number;      // Użyty limit
    offset: number;     // Użyte offset
  }
  ```

## 4. Szczegóły odpowiedzi

**Sukces (200 OK)**:

```typescript
{
  "monsters": MonsterDTO[],
  "total": number,        // Całkowita liczba potworów spełniających filtry
  "limit": number,        // Użyty limit (20 lub z query)
  "offset": number        // Użyte offset (0 lub z query)
}
```

**Błąd (400 Bad Request)**:

```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "limit",
      "message": "Must be between 1 and 100"
    }
  ]
}
```

## 5. Przepływ danych

### 1. Walidacja Query Parameters (Zod schema)

```typescript
ListMonstersQuerySchema.parse(queryParams);
```

Walidacja:

- `name`: optional string, trim, max 255 chars
- `cr`: optional string, validate format (liczby lub frakcje: "1/2", "1/4", etc.)
- `cr_min`: optional number, >= 0, <= 30
- `cr_max`: optional number, >= 0, <= 30, >= cr_min (jeśli oba podane)
- `limit`: optional number, >= 1, <= 100, default 20
- `offset`: optional number, >= 0, default 0

### 2. Budowanie Query

Supabase query z dynamicznymi filtrami:

```typescript
let query = supabase.from("monsters").select("*", { count: "exact" });

// Filtrowanie po nazwie (case-insensitive LIKE)
if (name) {
  query = query.ilike("name", `%${name}%`);
}

// Filtrowanie po dokładnym CR
if (cr) {
  query = query.eq("data->>challengeRating->>rating", cr);
}

// Filtrowanie po CR range (wymaga cast string -> numeric)
// CR może być "1/4", "1/2", więc trzeba konwertować:
// 1/4 = 0.25, 1/2 = 0.5, 1 = 1.0, etc.
if (cr_min !== undefined || cr_max !== undefined) {
  // Użyć funkcji PostgreSQL do konwersji CR string na numeric
  // Wymaga custom function lub obsługi w service layer
}

// Paginacja
query = query.range(offset, offset + limit - 1).order("name", { ascending: true });
```

### 3. Wykonanie Query

```typescript
const { data, error, count } = await query;
```

### 4. Mapowanie do DTO

```typescript
const monsters: MonsterDTO[] = data.map((row) => ({
  id: row.id,
  name: row.name,
  data: row.data as MonsterDataDTO, // Type assertion dla JSONB
  created_at: row.created_at,
}));
```

### 5. Zwrot Response

```typescript
return {
  monsters,
  total: count ?? 0,
  limit,
  offset,
};
```

## 6. Względy bezpieczeństwa

### Uwierzytelnianie

- **Brak wymagania**: Endpoint publiczny zgodnie z RLS policy
- Biblioteka potworów jest globalnym zasobem read-only
- Nie ujawnia wrażliwych danych użytkowników

### Autoryzacja

- Brak (publiczny dostęp read-only)
- RLS policy na tabeli `monsters` pozwala na SELECT dla wszystkich

### Walidacja danych wejściowych

- **Zod schema** dla query parameters:
  - Limity numeryczne (limit 1-100, offset >= 0)
  - String length limits (name max 255)
  - CR format validation
  - CR range consistency (cr_min <= cr_max)

- **SQL Injection**:
  - Parametryzowane zapytania Supabase (automatyczne)
  - LIKE pattern sanitization dla `name` (escape `%`, `_`)
  - JSONB path injection prevention

### Zapobieganie atakom

- **DoS**:
  - Max limit 100 (zapobiega zbyt dużym response)
  - Offset validation (zapobiega ekstremalnym wartościom)
  - Query timeout (Supabase default)

- **Cache poisoning**:
  - Walidacja wszystkich parametrów przed cache key generation

- **Information disclosure**:
  - Brak wrażliwych danych w monsters table (publiczne SRD)

### Performance & Security

- Index na kolumnie `name` (dla LIKE queries)
- Index na JSONB path `data->challengeRating->rating` (dla CR filters)
- Rate limiting na poziomie API gateway (np. 100 req/min per IP)

## 7. Obsługa błędów

### 400 Bad Request

**Scenariusze**:

1. **Nieprawidłowy limit**:

```json
{
  "error": "Invalid query parameters",
  "details": [{ "field": "limit", "message": "Must be between 1 and 100" }]
}
```

2. **Nieprawidłowy offset**:

```json
{
  "error": "Invalid query parameters",
  "details": [{ "field": "offset", "message": "Must be greater than or equal to 0" }]
}
```

3. **Nieprawidłowy format CR**:

```json
{
  "error": "Invalid query parameters",
  "details": [{ "field": "cr", "message": "Invalid Challenge Rating format" }]
}
```

4. **Niespójny range CR**:

```json
{
  "error": "Invalid query parameters",
  "details": [{ "field": "cr_max", "message": "Must be greater than or equal to cr_min" }]
}
```

5. **Nazwa zbyt długa**:

```json
{
  "error": "Invalid query parameters",
  "details": [{ "field": "name", "message": "Name must be 255 characters or less" }]
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

**Scenariusze**:

- Błąd połączenia z bazą danych
- JSONB deserialization error
- Nieoczekiwany wyjątek podczas query

**Logging**:

- Wszystkie błędy 500 logowane z pełnym stack trace
- Błędy 400 logowane jako info z query params
- Query performance logowane (slow query detection > 1s)

### Pusta lista

Nie jest błędem - zwracamy 200 OK z pustą tablicą:

```json
{
  "monsters": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacje

1. **Database Indexes**:

```sql
-- Index dla name search (case-insensitive)
CREATE INDEX idx_monsters_name_lower ON monsters (LOWER(name));

-- Index dla CR filtering
CREATE INDEX idx_monsters_cr ON monsters
  USING GIN ((data->'challengeRating'));

-- Composite index dla sortowania
CREATE INDEX idx_monsters_name_asc ON monsters (name ASC);
```

2. **Query Optimization**:

- Użycie `.select("*")` z `count: "exact"` dla jednoczesnego pobrania count
- Range query zamiast LIMIT/OFFSET dla lepszej wydajności
- Order by indexed column (name)

3. **Response Caching**:

- Cache results per unique query combination (name, cr, cr_min, cr_max, limit, offset)
- Cache TTL: 1 godzina (dane statyczne SRD)
- Cache key: hash query params
- Implementacja: Redis lub in-memory cache

4. **JSONB Optimization**:

- Extracted `name` column dla szybkiego filtrowania (już zrobione w schema)
- GIN index dla JSONB queries
- Partial indexes dla popularnych CR values

### Potencjalne wąskie gardła

1. **LIKE Query Performance**:

- `ILIKE '%term%'` nie może użyć zwykłego B-tree index
- Rozważyć Full-Text Search (tsvector) dla name
- Lub limit LIKE do prefix match (`name ILIKE 'term%'`) dla lepszej wydajności

2. **CR Range Filtering**:

- CR jako string ("1/4", "1/2") utrudnia range queries
- Opcje:
  - Dodać numeric `cr_numeric` column (computed/generated)
  - Konwersja w query: `CASE WHEN ... END`
  - Pre-compute podczas insert/update

3. **Large Result Sets**:

- Nawet z limit 100, response może być duży (JSONB data)
- Compression (gzip) na HTTP response
- Rozważyć field selection: `?fields=id,name,data.challengeRating`

4. **Count Query Performance**:

- `count: "exact"` może być wolne dla dużych tabel
- Rozważyć `count: "estimated"` dla lepszej wydajności
- Lub cache total count per filter combination

### Optymalizacja CR Range Query

Dodać generated column dla numeric CR:

```sql
ALTER TABLE monsters
ADD COLUMN cr_numeric DECIMAL GENERATED ALWAYS AS (
  CASE
    WHEN data->'challengeRating'->>'rating' = '0' THEN 0
    WHEN data->'challengeRating'->>'rating' = '1/8' THEN 0.125
    WHEN data->'challengeRating'->>'rating' = '1/4' THEN 0.25
    WHEN data->'challengeRating'->>'rating' = '1/2' THEN 0.5
    ELSE (data->'challengeRating'->>'rating')::DECIMAL
  END
) STORED;

CREATE INDEX idx_monsters_cr_numeric ON monsters (cr_numeric);
```

Następnie w query:

```typescript
if (cr_min !== undefined) {
  query = query.gte("cr_numeric", cr_min);
}
if (cr_max !== undefined) {
  query = query.lte("cr_numeric", cr_max);
}
```

### Caching Strategy

```typescript
// Cache key generation
const cacheKey = `monsters:${JSON.stringify({ name, cr, cr_min, cr_max, limit, offset })}`;

// Check cache
const cached = await cache.get(cacheKey);
if (cached) {
  return cached;
}

// Execute query
const result = await fetchMonstersFromDB(...);

// Store in cache (1 hour TTL)
await cache.set(cacheKey, result, 3600);

return result;
```

### Performance Targets

- p50 latency: < 100ms
- p95 latency: < 500ms
- p99 latency: < 1000ms
- Max response size: 5MB (compressed)
- Cache hit rate: > 80% (dla popularnych queries)

## 9. Etapy wdrożenia

### Krok 1: Utworzenie Zod schema

**Plik**: `src/lib/schemas/monster.schema.ts`

```typescript
import { z } from "zod";

// CR format validation (fraction or number)
const crRegex = /^(\d+|\d+\/\d+)$/;

export const ListMonstersQuerySchema = z
  .object({
    name: z.string().max(255, "Name must be 255 characters or less").trim().optional(),

    cr: z.string().regex(crRegex, "Invalid Challenge Rating format").optional(),

    cr_min: z.coerce.number().nonnegative("CR min must be non-negative").max(30, "CR min cannot exceed 30").optional(),

    cr_max: z.coerce.number().nonnegative("CR max must be non-negative").max(30, "CR max cannot exceed 30").optional(),

    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),

    offset: z.coerce.number().int().nonnegative("Offset must be non-negative").default(0),
  })
  .refine(
    (data) => {
      // Validate cr_min <= cr_max if both provided
      if (data.cr_min !== undefined && data.cr_max !== undefined) {
        return data.cr_min <= data.cr_max;
      }
      return true;
    },
    {
      message: "cr_max must be greater than or equal to cr_min",
      path: ["cr_max"],
    }
  );

export type ListMonstersQuery = z.infer<typeof ListMonstersQuerySchema>;
```

**Note**: `z.coerce.number()` automatycznie konwertuje string query params na number.

### Krok 2: Utworzenie monster service

**Plik**: `src/lib/services/monster.service.ts`

```typescript
import type { SupabaseClient } from "@/db/supabase.client";
import type { ListMonstersResponseDTO, MonsterDTO, MonsterDataDTO } from "@/types";
import type { ListMonstersQuery } from "@/lib/schemas/monster.schema";

/**
 * Converts CR string to numeric value for range filtering
 */
function crToNumeric(cr: string): number {
  if (cr.includes("/")) {
    const [numerator, denominator] = cr.split("/").map(Number);
    return numerator / denominator;
  }
  return Number(cr);
}

/**
 * Sanitizes LIKE pattern to prevent injection
 */
function sanitizeLikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, "\\$&");
}

/**
 * Fetches filtered and paginated list of monsters
 */
export async function listMonsters(
  supabase: SupabaseClient,
  filters: ListMonstersQuery
): Promise<ListMonstersResponseDTO> {
  const { name, cr, cr_min, cr_max, limit, offset } = filters;

  // Build query
  let query = supabase.from("monsters").select("*", { count: "exact" });

  // Apply name filter (case-insensitive partial match)
  if (name) {
    const sanitized = sanitizeLikePattern(name);
    query = query.ilike("name", `%${sanitized}%`);
  }

  // Apply exact CR filter
  if (cr) {
    query = query.eq("data->challengeRating->>rating", cr);
  }

  // Apply CR range filters
  // Note: This requires cr_numeric column (see migration step)
  if (cr_min !== undefined && !cr) {
    query = query.gte("cr_numeric", cr_min);
  }
  if (cr_max !== undefined && !cr) {
    query = query.lte("cr_numeric", cr_max);
  }

  // Apply pagination and sorting
  query = query.order("name", { ascending: true }).range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // Map to DTOs
  const monsters: MonsterDTO[] = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    data: row.data as MonsterDataDTO,
    created_at: row.created_at,
  }));

  return {
    monsters,
    total: count ?? 0,
    limit,
    offset,
  };
}
```

### Krok 3: Database migration dla cr_numeric

**Plik**: `supabase/migrations/YYYYMMDD_add_cr_numeric_to_monsters.sql`

```sql
-- Add computed column for numeric CR filtering
ALTER TABLE monsters
ADD COLUMN IF NOT EXISTS cr_numeric DECIMAL GENERATED ALWAYS AS (
  CASE
    WHEN data->'challengeRating'->>'rating' = '0' THEN 0
    WHEN data->'challengeRating'->>'rating' = '1/8' THEN 0.125
    WHEN data->'challengeRating'->>'rating' = '1/4' THEN 0.25
    WHEN data->'challengeRating'->>'rating' = '1/2' THEN 0.5
    ELSE (data->'challengeRating'->>'rating')::DECIMAL
  END
) STORED;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_monsters_name_lower
  ON monsters (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_monsters_cr_numeric
  ON monsters (cr_numeric);

CREATE INDEX IF NOT EXISTS idx_monsters_cr_rating
  ON monsters ((data->'challengeRating'->>'rating'));

-- Add GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_monsters_data_gin
  ON monsters USING GIN (data);
```

### Krok 4: Implementacja API endpoint

**Plik**: `src/pages/api/monsters.ts`

```typescript
import type { APIContext } from "astro";
import { listMonsters } from "@/lib/services/monster.service";
import { ListMonstersQuerySchema } from "@/lib/schemas/monster.schema";

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  // Parse query parameters
  const url = new URL(context.request.url);
  const queryParams = {
    name: url.searchParams.get("name") || undefined,
    cr: url.searchParams.get("cr") || undefined,
    cr_min: url.searchParams.get("cr_min") || undefined,
    cr_max: url.searchParams.get("cr_max") || undefined,
    limit: url.searchParams.get("limit") || undefined,
    offset: url.searchParams.get("offset") || undefined,
  };

  // Validate query parameters
  const validation = ListMonstersQuerySchema.safeParse(queryParams);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid query parameters",
        details: validation.error.errors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Execute service
  try {
    const result = await listMonsters(context.locals.supabase, validation.data);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error listing monsters:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

### Krok 5: Dokumentacja API

**Plik**: `docs/api/monsters.md`

Sekcje:

- Opis endpointa
- Query parameters z przykładami
- Response structure
- Error codes
- Przykłady curl commands
- Rate limits (jeśli applicable)
- Caching policy

Przykłady curl:

```bash
# List first 20 monsters
curl https://api.example.com/api/monsters

# Search by name
curl "https://api.example.com/api/monsters?name=goblin"

# Filter by exact CR
curl "https://api.example.com/api/monsters?cr=1/4"

# Filter by CR range
curl "https://api.example.com/api/monsters?cr_min=1&cr_max=5"

# Pagination
curl "https://api.example.com/api/monsters?limit=50&offset=100"
```
