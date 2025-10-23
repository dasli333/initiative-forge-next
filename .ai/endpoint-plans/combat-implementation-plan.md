# API Endpoint Implementation Plan: Create Combat Encounter

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia nowej walki (combat encounter) w ramach kampanii. Umożliwia dodanie uczestników z trzech źródeł:

- Postaci graczy z kampanii (player characters)
- Potworów z globalnej biblioteki SRD (monsters) - z możliwością dodania wielu kopii
- Ad-hoc NPCów zdefiniowanych bezpośrednio w żądaniu

Endpoint inicjalizuje combat ze statusem "active", rundą 1, oraz tworzy snapshot stanu zawierający wszystkich uczestników z zainicjalizowanymi wartościami HP, AC, statystykami i akcjami. Inicjatywa jest ustawiona na 0 dla wszystkich uczestników (wymaga osobnego endpointu do rzutu inicjatywy).

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/campaigns/:campaignId/combats`
- **Parametry URL**:
  - Wymagane: `campaignId` (UUID kampanii)
- **Request Body**:

```typescript
{
  "name": string,                           // Nazwa walki (np. "Goblin Ambush")
  "initial_participants": [
    // Player Character
    {
      "source": "player_character",
      "player_character_id": string         // UUID postaci z campaign
    },
    // Monster (z opcją count dla wielu kopii)
    {
      "source": "monster",
      "monster_id": string,                 // UUID potwora z globalnej biblioteki
      "count": number                       // Liczba kopii (>= 1)
    },
    // Ad-hoc NPC (zdefiniowany inline)
    {
      "source": "ad_hoc_npc",
      "display_name": string,
      "max_hp": number,
      "armor_class": number,
      "stats": {
        "str": number,
        "dex": number,
        "con": number,
        "int": number,
        "wis": number,
        "cha": number
      },
      "actions"?: ActionDTO[]              // Opcjonalne
    }
  ]
}
```

- **Headers**:
  - `Content-Type: application/json`
  - Authorization via Supabase session cookie

## 3. Wykorzystywane typy

Wszystkie typy są już zdefiniowane w `src/types.ts`:

- **CreateCombatCommand** - typ request body
- **InitialParticipantCommand** - union type dla trzech źródeł uczestników
- **CombatDTO** - typ odpowiedzi
- **CombatSnapshotDTO** - struktura state_snapshot
- **CombatParticipantDTO** - pojedynczy uczestnik w snapshot
- **StatsDTO** - struktura statystyk (str, dex, con, int, wis, cha)
- **ActionDTO** - struktura akcji

## 4. Szczegóły odpowiedzi

**Sukces (201 Created)**:

```typescript
{
  "id": string,                           // UUID utworzonego combatu
  "campaign_id": string,                  // UUID kampanii
  "name": string,                         // Nazwa walki
  "status": "active",                     // Status początkowy
  "current_round": 1,                     // Runda początkowa
  "state_snapshot": {
    "participants": [
      {
        "id": string,                     // Temp UUID dla uczestnika
        "source": "player_character" | "monster" | "ad_hoc_npc",
        "player_character_id"?: string,   // Jeśli source = player_character
        "monster_id"?: string,            // Jeśli source = monster
        "display_name": string,           // Nazwa wyświetlana
        "initiative": 0,                  // Początkowa wartość
        "current_hp": number,             // Kopiowane z max_hp
        "max_hp": number,
        "armor_class": number,
        "stats": StatsDTO,
        "actions": ActionDTO[],
        "is_active_turn": false,          // Początkowo wszyscy false
        "active_conditions": []           // Początkowo puste
      }
    ],
    "active_participant_index": null      // null = inicjatywa nie rzucona
  },
  "created_at": string,                   // ISO 8601 timestamp
  "updated_at": string                    // ISO 8601 timestamp
}
```

**Błędy**:

- **400 Bad Request**: Nieprawidłowe dane wejściowe
- **401 Unauthorized**: Brak lub nieprawidłowa autoryzacja
- **404 Not Found**: Kampania, PC lub monster nie istnieje
- **500 Internal Server Error**: Błąd serwera

## 5. Przepływ danych

1. **Walidacja żądania** (Zod schema):
   - Sprawdź strukturę CreateCombatCommand
   - Waliduj UUIDs, stats ranges, count > 0

2. **Autoryzacja**:
   - Pobierz user_id z session (Supabase auth)
   - Sprawdź czy campaign istnieje i należy do użytkownika:
     ```sql
     SELECT id FROM campaigns WHERE id = $campaignId AND user_id = $userId
     ```

3. **Rozwiązywanie uczestników** (parallel queries):
   - **Player Characters**:

     ```sql
     SELECT * FROM player_characters
     WHERE id = $pcId AND campaign_id = $campaignId
     ```

     Konwersja do CombatParticipantDTO z player_character jako source

   - **Monsters**:

     ```sql
     SELECT * FROM monsters WHERE id = $monsterId
     ```

     Dla count > 1: tworzenie N kopii z różnymi temp UUID i suffiksami nazw (#1, #2, ...)

   - **Ad-hoc NPCs**:
     Bezpośrednia konwersja z request body do CombatParticipantDTO

4. **Tworzenie snapshot**:
   - Generuj temp UUID dla każdego uczestnika (crypto.randomUUID())
   - Ustaw current_hp = max_hp
   - Ustaw initiative = 0
   - Ustaw is_active_turn = false
   - Ustaw active_conditions = []
   - Ustaw active_participant_index = null

5. **Zapis do bazy**:

   ```sql
   INSERT INTO combats (campaign_id, name, status, current_round, state_snapshot)
   VALUES ($campaignId, $name, 'active', 1, $snapshot)
   RETURNING *
   ```

6. **Zwrot odpowiedzi**:
   - Status 201 Created
   - Body: CombatDTO

## 6. Względy bezpieczeństwa

### Uwierzytelnianie

- Wymagana sesja Supabase (cookie-based auth)
- Middleware Astro sprawdza `context.locals.supabase.auth.getUser()`
- Brak sesji → 401 Unauthorized

### Autoryzacja

- **Campaign ownership**: `campaigns.user_id` musi odpowiadać authenticated user_id
- **Player character scope**: PCs muszą należeć do podanego campaignId (zapobiega cross-campaign reference)
- **Monster access**: Globalna biblioteka (read-only, bezpieczne dla wszystkich)
- Zwracaj 404 zamiast 403 dla zasobów spoza scopu użytkownika (zapobiega information disclosure)

### Walidacja danych wejściowych

- Zod schema dla całego request body
- UUID validation (format)
- Stats validation (wartości 1-30)
- HP/AC validation (> 0)
- Count validation dla monsters (>= 1)
- Sanityzacja display_name dla ad-hoc NPCs (XSS prevention)
- Limit rozmiaru tablicy initial_participants (np. max 50)

### Zapobieganie atakom

- SQL injection: Używanie parametryzowanych zapytań Supabase
- XSS: Sanityzacja wszystkich user-provided strings
- DoS: Limit liczby uczestników, timeout dla długich operacji
- CSRF: Supabase session cookies z SameSite attribute

## 7. Obsługa błędów

### 400 Bad Request

- Brakująca lub pusta nazwa: `{ "error": "Combat name is required" }`
- Pusta tablica uczestników: `{ "error": "At least one participant is required" }`
- Nieprawidłowa struktura uczestnika: `{ "error": "Invalid participant structure", "details": [...] }`
- Nieprawidłowe stats (brakujące klucze, wartości poza zakresem): `{ "error": "Invalid stats", "details": "..." }`
- Count <= 0: `{ "error": "Monster count must be at least 1" }`
- Nieprawidłowy UUID format: `{ "error": "Invalid UUID format", "field": "..." }`

### 401 Unauthorized

- Brak sesji: `{ "error": "Authentication required" }`
- Nieprawidłowy/wygasły token: `{ "error": "Invalid or expired session" }`

### 404 Not Found

- Campaign nie istnieje: `{ "error": "Campaign not found" }`
- Campaign należy do innego użytkownika: `{ "error": "Campaign not found" }` (security through obscurity)
- Player character nie istnieje w campaign: `{ "error": "Player character not found", "id": "..." }`
- Monster nie istnieje: `{ "error": "Monster not found", "id": "..." }`

### 500 Internal Server Error

- Błąd połączenia z bazą: `{ "error": "Database error" }` (bez details)
- Nieoczekiwany wyjątek: `{ "error": "Internal server error" }` (logowanie server-side)

**Logging**:

- Wszystkie błędy 500 logowane z pełnym stack trace
- Błędy 400/404 logowane z request context (bez wrażliwych danych)
- Błędy 401 logowane tylko jako metrics (częstotliwość)

## 8. Rozważania dotyczące wydajności

### Optymalizacje

- **Parallel fetching**: Jednoczesne zapytania dla wszystkich player characters i monsters
- **Batch queries**: Użycie `.in()` dla wielu player_character_ids lub monster_ids
- **Index usage**: Upewnić się, że istnieją indexy na:
  - `campaigns(id, user_id)`
  - `player_characters(id, campaign_id)`
  - `monsters(id)`

### Potencjalne wąskie gardła

- Duża liczba uczestników (np. 50+ monsters) - rozważyć streaming response
- Rozwiązywanie monster actions z JSONB - może być kosztowne dla wielu monsters
- Generowanie wielu kopii monsters (count > 10) - optymalizacja przez array operations

### Caching

- Monsters są statyczne (SRD data) - można cache'ować w pamięci lub Redis
- Player characters zmieniają się rzadko - rozważyć cache z invalidation
- Campaign ownership check - można cache'ować na czas request

### Limity

- Max 50 uczestników w initial_participants
- Max 10 kopii pojedynczego monster (count limit)
- Timeout 10s dla całego request

## 9. Etapy wdrożenia

### Krok 1: Utworzenie Zod schema

**Plik**: `src/lib/schemas/combat.schema.ts`

- Zdefiniuj schema dla `CreateCombatCommand`
- Użyj discriminated union dla `InitialParticipantCommand`
- Waliduj stats (6 kluczy, wartości 1-30)
- Waliduj actions structure
- Export schemy dla reużycia

### Krok 2: Utworzenie combat service

**Plik**: `src/lib/services/combat.service.ts`

Funkcje do implementacji:

```typescript
// Główna funkcja tworzenia combatu
async function createCombat(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string,
  command: CreateCombatCommand
): Promise<CombatDTO>;

// Weryfikacja ownership kampanii
async function verifyCampaignOwnership(supabase: SupabaseClient, userId: string, campaignId: string): Promise<void>;

// Rozwiązanie player character
async function resolvePlayerCharacter(
  supabase: SupabaseClient,
  campaignId: string,
  playerId: string
): Promise<CombatParticipantDTO>;

// Rozwiązanie monster (z count)
async function resolveMonster(
  supabase: SupabaseClient,
  monsterId: string,
  count: number
): Promise<CombatParticipantDTO[]>;

// Konwersja ad-hoc NPC
function createAdHocParticipant(
  spec: Extract<InitialParticipantCommand, { source: "ad_hoc_npc" }>
): CombatParticipantDTO;

// Mapowanie PC/Monster data do common stats
function mapToStats(source: PlayerCharacter | MonsterDataDTO): StatsDTO;

// Budowanie initial snapshot
function buildInitialSnapshot(participants: CombatParticipantDTO[]): CombatSnapshotDTO;
```

### Krok 3: Implementacja API endpoint

**Plik**: `src/pages/api/campaigns/[campaignId]/combats.ts`

```typescript
import type { APIContext } from "astro";
import { createCombat } from "@/lib/services/combat.service";
import { CreateCombatCommandSchema } from "@/lib/schemas/combat.schema";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await context.locals.supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Extract campaignId from params
  const campaignId = context.params.campaignId;
  if (!campaignId) {
    return new Response(JSON.stringify({ error: "Campaign ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Parse and validate request body
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = CreateCombatCommandSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        details: validation.error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 4. Execute service
  try {
    const combat = await createCombat(context.locals.supabase, user.id, campaignId, validation.data);

    return new Response(JSON.stringify(combat), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes("not found")) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error creating combat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

### Krok 4: Dokumentacja API

**Plik**: `docs/api/combats.md`

Udokumentować:

- Request/response examples
- Error codes i messages
- Rate limits (jeśli applicable)
- Example curl commands
