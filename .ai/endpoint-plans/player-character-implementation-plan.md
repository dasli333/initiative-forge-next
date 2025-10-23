# API Endpoint Implementation Plan: Create Player Character

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia nowej postaci gracza (player character) w ramach kampanii. Umożliwia dodanie kompletnej karty postaci z atrybutami D&D 5e (6 statystyk, HP, AC, speed) oraz opcjonalną listą akcji bojowych. Endpoint waliduje unikalność nazwy postaci w ramach kampanii i zapewnia, że tylko właściciel kampanii może dodawać do niej postacie.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/campaigns/:campaignId/characters`
- **Parametry URL**:
  - Wymagane: `campaignId` (UUID kampanii)
- **Request Body**:

```typescript
{
  "name": string,              // Imię postaci (wymagane, unikalne w kampanii)
  "max_hp": number,            // Maksymalne HP (wymagane, > 0, smallint range)
  "armor_class": number,       // AC (wymagane, > 0, smallint range)
  "speed": number,             // Szybkość w stopach (wymagane, >= 0, smallint range)
  "strength": number,          // Siła (wymagane, 1-30)
  "dexterity": number,         // Zręczność (wymagane, 1-30)
  "constitution": number,      // Kondycja (wymagane, 1-30)
  "intelligence": number,      // Inteligencja (wymagane, 1-30)
  "wisdom": number,            // Mądrość (wymagane, 1-30)
  "charisma": number,          // Charyzma (wymagane, 1-30)
  "actions"?: ActionDTO[]      // Opcjonalne akcje bojowe
}
```

- **Headers**:
  - `Content-Type: application/json`
  - Authorization via Supabase session cookie

## 3. Wykorzystywane typy

Wszystkie typy już zdefiniowane w `src/types.ts`:

- **CreatePlayerCharacterCommand** - typ request body (wszystkie pola z `player_characters` minus `campaign_id`, `id`, timestamps)
- **PlayerCharacterDTO** - typ odpowiedzi (pełny obiekt postaci z typed `actions`)
- **ActionDTO** - struktura pojedynczej akcji:
  ```typescript
  {
    name: string;
    type: string;                    // np. "melee_weapon_attack", "ranged_weapon_attack"
    attack_bonus?: number;
    reach?: string;                  // np. "5 ft"
    range?: string;                  // np. "150/600 ft"
    damage_dice?: string;            // np. "1d8", "2d6"
    damage_bonus?: number;
    damage_type?: string;            // np. "piercing", "slashing"
    description?: string;
  }
  ```

## 4. Szczegóły odpowiedzi

**Sukces (201 Created)**:

```typescript
{
  "id": string,                    // UUID postaci (wygenerowany)
  "campaign_id": string,           // UUID kampanii (z URL)
  "name": string,
  "max_hp": number,
  "armor_class": number,
  "speed": number,
  "strength": number,
  "dexterity": number,
  "constitution": number,
  "intelligence": number,
  "wisdom": number,
  "charisma": number,
  "actions": ActionDTO[] | null,   // Typed actions array
  "created_at": string,            // ISO 8601 timestamp
  "updated_at": string             // ISO 8601 timestamp
}
```

**Błędy**:

- **400 Bad Request**: Nieprawidłowe dane wejściowe (walidacja Zod)
- **401 Unauthorized**: Brak lub nieprawidłowa autoryzacja
- **404 Not Found**: Kampania nie istnieje lub nie należy do użytkownika
- **409 Conflict**: Postać o tej nazwie już istnieje w kampanii

## 5. Przepływ danych

### 1. Walidacja żądania (Zod schema)

```typescript
CreatePlayerCharacterCommandSchema.parse(body);
```

Walidacja:

- `name`: string, min 1 char, max 255, trim
- `max_hp`, `armor_class`: number, > 0, <= 32767 (smallint max)
- `speed`: number, >= 0, <= 32767
- Wszystkie stats (`strength` do `charisma`): number, >= 1, <= 30
- `actions`: optional array z walidacją struktury ActionDTO

### 2. Autoryzacja

```sql
SELECT id FROM campaigns
WHERE id = $campaignId AND user_id = $userId
```

- Jeśli brak wyników → 404 Not Found
- Gwarantuje, że użytkownik jest właścicielem kampanii

### 3. Sprawdzenie unikalności nazwy

```sql
SELECT id FROM player_characters
WHERE campaign_id = $campaignId AND name = $name
```

- Jeśli istnieje → 409 Conflict
- Database constraint: UNIQUE(campaign_id, name)

### 4. Wstawienie do bazy danych

```sql
INSERT INTO player_characters (
  campaign_id, name, max_hp, armor_class, speed,
  strength, dexterity, constitution, intelligence, wisdom, charisma,
  actions
)
VALUES ($campaignId, $name, $maxHp, $armorClass, $speed,
  $strength, $dexterity, $constitution, $intelligence, $wisdom, $charisma,
  $actions::jsonb
)
RETURNING *
```

### 5. Mapowanie odpowiedzi

- Konwersja `actions` z JSONB do typed ActionDTO[]
- Zwrot PlayerCharacterDTO ze statusem 201

## 6. Względy bezpieczeństwa

### Uwierzytelnianie

- Wymagana sesja Supabase (cookie-based auth)
- Middleware Astro sprawdza `context.locals.supabase.auth.getUser()`
- Brak sesji → 401 Unauthorized

### Autoryzacja

- **Campaign ownership**: Tylko właściciel kampanii może dodawać postacie
- Query sprawdza `campaigns.user_id = authenticated_user_id`
- Zwracaj 404 zamiast 403 dla kampanii spoza scopu użytkownika (zapobiega information disclosure)

### Walidacja danych wejściowych

- **Zod schema** dla całego request body:
  - Stats validation (1-30 range)
  - HP/AC/speed validation (positive numbers, smallint range)
  - String length limits (name max 255 chars)
  - Actions array validation (structure, types, optional fields)

- **SQL Injection**: Parametryzowane zapytania Supabase (automatyczne)
- **XSS Prevention**: Sanityzacja `name` field (trim, limit length)
- **JSONB Injection**: Walidacja struktury `actions` przed zapisem

### Zapobieganie atakom

- **DoS**: Limit rozmiaru request body (np. max 1MB)
- **Rate limiting**: Rozważyć limit tworzenia postaci (np. 100 per campaign)
- **CSRF**: Supabase session cookies z SameSite attribute

### Database Constraints

- UNIQUE constraint na (campaign_id, name) zapobiega race conditions
- Foreign key constraint zapewnia, że campaign_id istnieje
- NOT NULL constraints dla wszystkich wymaganych pól

## 7. Obsługa błędów

### 400 Bad Request

```json
{
  "error": "Invalid request body",
  "details": [
    {
      "field": "strength",
      "message": "Must be between 1 and 30"
    }
  ]
}
```

Scenariusze:

- Brakujące wymagane pole: `{ "error": "Missing required field: name" }`
- Nieprawidłowy typ: `{ "error": "Field 'max_hp' must be a number" }`
- Stats poza zakresem: `{ "error": "Stat values must be between 1 and 30" }`
- HP/AC <= 0: `{ "error": "HP and AC must be greater than 0" }`
- Speed < 0: `{ "error": "Speed cannot be negative" }`
- Nieprawidłowa struktura actions: `{ "error": "Invalid action structure", "details": [...] }`
- Nazwa zbyt długa: `{ "error": "Name must be 255 characters or less" }`
- Invalid JSON: `{ "error": "Invalid JSON in request body" }`

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

Scenariusze:

- Brak sesji
- Nieprawidłowy/wygasły token

### 404 Not Found

```json
{
  "error": "Campaign not found"
}
```

Scenariusze:

- Campaign nie istnieje
- Campaign należy do innego użytkownika (security through obscurity)

### 409 Conflict

```json
{
  "error": "Character name already exists in this campaign",
  "field": "name",
  "value": "Legolas"
}
```

Scenariusze:

- Postać o tej nazwie już istnieje w kampanii
- Może wystąpić przez race condition lub bezpośrednie wywołanie

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

Scenariusze:

- Błąd połączenia z bazą danych
- Nieoczekiwany wyjątek podczas przetwarzania
- JSONB serialization error

**Logging**:

- Wszystkie błędy 500 logowane z pełnym stack trace
- Błędy 400/409 logowane z request context (bez wrażliwych danych)
- Błędy 404 logowane jako info (normalny flow)
- Błędy 401 logowane tylko jako metrics

## 8. Rozważania dotyczące wydajności

### Optymalizacje

- **Single transaction**: Cała operacja (check ownership + check uniqueness + insert) w jednej transakcji
- **Index usage**: Upewnić się, że istnieją indexy na:
  - `campaigns(id, user_id)` - dla ownership check
  - `player_characters(campaign_id, name)` - dla uniqueness check (już istnieje przez UNIQUE constraint)
- **JSONB handling**: Walidacja actions przed zapisem minimalizuje błędy database-level

### Potencjalne wąskie gardła

- Walidacja Zod dla dużych arrays actions - rozważyć limit (np. max 20 actions per character)
- JSONB serialization/deserialization może być kosztowna dla złożonych actions
- Multiple sequential queries (ownership → uniqueness → insert) - rozważyć optymalizację

### Optymalizacja queries

Można zredukować do jednego query używając CTE:

```sql
WITH campaign_check AS (
  SELECT id FROM campaigns
  WHERE id = $campaignId AND user_id = $userId
),
uniqueness_check AS (
  SELECT id FROM player_characters
  WHERE campaign_id = $campaignId AND name = $name
)
INSERT INTO player_characters (...)
SELECT $campaignId, $name, ...
FROM campaign_check
WHERE NOT EXISTS (SELECT 1 FROM uniqueness_check)
RETURNING *
```

Jeśli zwrócone 0 rows:

- Check czy campaign_check zwrócił wyniki → 404 if not
- Check czy uniqueness_check zwrócił wyniki → 409 if yes

### Caching

- Campaign ownership można cache'ować per request (jeśli użytkownik tworzy wiele postaci)
- Stats validation results nie wymagają cache'owania (szybka operacja)

### Limity

- Max 20 actions per character (walidacja Zod)
- Max 255 characters dla name field
- Request body max 1MB
- Timeout 5s dla całego request

## 9. Etapy wdrożenia

### Krok 1: Utworzenie Zod schema

**Plik**: `src/lib/schemas/player-character.schema.ts`

```typescript
import { z } from "zod";

// Action schema (reusable)
export const ActionDTOSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  attack_bonus: z.number().int().optional(),
  reach: z.string().max(20).optional(),
  range: z.string().max(50).optional(),
  damage_dice: z.string().max(20).optional(),
  damage_bonus: z.number().int().optional(),
  damage_type: z.string().max(30).optional(),
  description: z.string().max(500).optional(),
});

// Create player character command schema
export const CreatePlayerCharacterCommandSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less").trim(),
  max_hp: z.number().int().positive("Max HP must be greater than 0").max(32767, "Max HP exceeds maximum value"),
  armor_class: z
    .number()
    .int()
    .positive("Armor class must be greater than 0")
    .max(32767, "Armor class exceeds maximum value"),
  speed: z.number().int().nonnegative("Speed cannot be negative").max(32767, "Speed exceeds maximum value"),
  strength: z.number().int().min(1, "Strength must be at least 1").max(30, "Strength cannot exceed 30"),
  dexterity: z.number().int().min(1, "Dexterity must be at least 1").max(30, "Dexterity cannot exceed 30"),
  constitution: z.number().int().min(1, "Constitution must be at least 1").max(30, "Constitution cannot exceed 30"),
  intelligence: z.number().int().min(1, "Intelligence must be at least 1").max(30, "Intelligence cannot exceed 30"),
  wisdom: z.number().int().min(1, "Wisdom must be at least 1").max(30, "Wisdom cannot exceed 30"),
  charisma: z.number().int().min(1, "Charisma must be at least 1").max(30, "Charisma cannot exceed 30"),
  actions: z.array(ActionDTOSchema).max(20, "Maximum 20 actions allowed").optional(),
});
```

### Krok 2: Utworzenie player character service

**Plik**: `src/lib/services/player-character.service.ts`

```typescript
import type { SupabaseClient } from "@/db/supabase.client";
import type { CreatePlayerCharacterCommand, PlayerCharacterDTO } from "@/types";

/**
 * Creates a new player character in the campaign
 * @throws Error if campaign not found, not owned, or name conflict
 */
export async function createPlayerCharacter(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string,
  command: CreatePlayerCharacterCommand
): Promise<PlayerCharacterDTO> {
  // 1. Verify campaign ownership
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("user_id", userId)
    .single();

  if (campaignError || !campaign) {
    throw new Error("Campaign not found");
  }

  // 2. Check name uniqueness
  const { data: existing, error: existingError } = await supabase
    .from("player_characters")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("name", command.name)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Database error: ${existingError.message}`);
  }

  if (existing) {
    throw new Error("Character name already exists in this campaign");
  }

  // 3. Insert player character
  const { data: character, error: insertError } = await supabase
    .from("player_characters")
    .insert({
      campaign_id: campaignId,
      name: command.name,
      max_hp: command.max_hp,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions: command.actions || null,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create character: ${insertError.message}`);
  }

  // 4. Return typed DTO
  return {
    ...character,
    actions: character.actions as PlayerCharacterDTO["actions"],
  };
}
```

### Krok 3: Implementacja API endpoint

**Plik**: `src/pages/api/campaigns/[campaignId]/characters.ts`

```typescript
import type { APIContext } from "astro";
import { createPlayerCharacter } from "@/lib/services/player-character.service";
import { CreatePlayerCharacterCommandSchema } from "@/lib/schemas/player-character.schema";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  // 1. Authentication check
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

  // 3. Parse request body
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Validate with Zod
  const validation = CreatePlayerCharacterCommandSchema.safeParse(body);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        details: validation.error.errors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Execute service
  try {
    const character = await createPlayerCharacter(context.locals.supabase, user.id, campaignId, validation.data);

    return new Response(JSON.stringify(character), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle specific errors
    if (message === "Campaign not found") {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message === "Character name already exists in this campaign") {
      return new Response(
        JSON.stringify({
          error: "Character name already exists in this campaign",
          field: "name",
          value: validation.data.name,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log unexpected errors
    console.error("Error creating player character:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

### Krok 6: Walidacja database constraints

**SQL Script**: Upewnić się, że constraints istnieją

```sql
-- Verify UNIQUE constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'player_characters'
  AND constraint_type = 'UNIQUE';

-- Verify foreign key
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'player_characters'
  AND constraint_type = 'FOREIGN KEY';

-- Verify NOT NULL constraints
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'player_characters'
  AND is_nullable = 'NO';
```

### Krok 7: Dokumentacja API

**Plik**: `docs/api/player-characters.md`

Udokumentować:

- Request/response examples z curl
- Wszystkie error codes i messages
- Validation rules dla każdego pola
- Example actions structures dla różnych typów

Przykład curl:

```bash
curl -X POST https://api.example.com/api/campaigns/123/characters \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "name": "Legolas",
    "max_hp": 38,
    "armor_class": 17,
    "speed": 30,
    "strength": 10,
    "dexterity": 18,
    "constitution": 12,
    "intelligence": 12,
    "wisdom": 16,
    "charisma": 10,
    "actions": [...]
  }'
```
