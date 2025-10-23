# API Endpoint Implementation Plan: POST /api/campaigns

## 1. Przegląd punktu końcowego

Endpoint umożliwia zalogowanym użytkownikom utworzenie nowej kampanii. Każdy użytkownik może mieć wiele kampanii, ale nazwy kampanii muszą być unikalne w ramach użytkownika (ograniczenie UNIQUE na parze `user_id`, `name`).

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/campaigns`
- **Parametry**:
  - **Wymagane**: brak (user_id pochodzi z kontekstu autentykacji)
  - **Opcjonalne**: brak
- **Request Body**:

```json
{
  "name": "Curse of Strahd"
}
```

- **Nagłówki**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (zarządzane przez Supabase auth)

## 3. Wykorzystywane typy

### DTOs

- **CampaignDTO** (`src/types.ts:83`) - typ odpowiedzi zawierający pełny obiekt kampanii

### Command Models

- **CreateCampaignCommand** (`src/types.ts:100`) - typ request body, zawiera tylko pole `name`

### Zod Schema

Nowy schema walidacyjny do utworzenia w `src/lib/schemas/campaign.schema.ts`:

```typescript
import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name cannot be empty").max(255, "Campaign name is too long"),
});
```

## 4. Szczegóły odpowiedzi

### Sukces (201 Created)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Curse of Strahd",
  "created_at": "2025-01-15T14:20:00Z",
  "updated_at": "2025-01-15T14:20:00Z"
}
```

### Błędy

**400 Bad Request** - nieprawidłowe dane wejściowe:

```json
{
  "error": "Validation failed",
  "details": {
    "name": "Campaign name cannot be empty"
  }
}
```

**401 Unauthorized** - brak lub nieprawidłowa autentykacja:

```json
{
  "error": "Unauthorized"
}
```

**409 Conflict** - nazwa kampanii już istnieje:

```json
{
  "error": "Campaign with this name already exists"
}
```

**500 Internal Server Error** - błąd serwera:

```json
{
  "error": "Internal server error"
}
```

## 5. Przepływ danych

1. **Request** → Astro API Route (`src/pages/api/campaigns.ts`)
2. **Middleware** → Weryfikacja autentykacji (Supabase auth middleware w `src/middleware/index.ts`)
3. **Walidacja** → Zod schema waliduje request body
4. **Service Layer** → `CampaignService.createCampaign()` (`src/lib/services/campaign.service.ts`)
5. **Database** → Insert do tabeli `campaigns` z `user_id` z kontekstu i `name` z request body
6. **Response** → Zwrot utworzonego obiektu kampanii (CampaignDTO) ze statusem 201

### Interakcje z bazą danych

```sql
INSERT INTO campaigns (user_id, name)
VALUES ($1, $2)
RETURNING *;
```

W przypadku konfliktu UNIQUE constraint (user_id, name):

- PostgreSQL zwróci błąd z kodem `23505`
- Service layer przekształci to w odpowiedź HTTP 409

## 6. Względy bezpieczeństwa

### Autentykacja

- Middleware Supabase (`context.locals.supabase`) weryfikuje token JWT
- Brak tokenu lub nieprawidłowy token → 401 Unauthorized
- `user_id` jest pobierany z `context.locals.user` (nie z request body!)

### Autoryzacja

- Użytkownik może tworzyć kampanie tylko dla siebie
- `user_id` jest wymuszany przez serwer, klient nie może go podać

### Walidacja danych

- Zod schema waliduje:
  - Typ danych (`name` musi być stringiem)
  - Długość (min 1 znak po trim, max 255 znaków)
  - Brak pustych stringów
- Ochrona przed SQL injection dzięki prepared statements Supabase

### Rate Limiting

- Nie jest wymagane w specyfikacji, ale warto rozważyć w przyszłości
- Można zaimplementować na poziomie middleware lub Supabase RLS

## 7. Obsługa błędów

### Walidacja (400)

- **Przyczyna**: Brak pola `name`, pusty string, za długa nazwa
- **Akcja**: Zwróć strukturę z opisem błędu walidacji Zod

### Autentykacja (401)

- **Przyczyna**: Brak tokenu, nieprawidłowy token, token wygasł
- **Akcja**: Middleware zwraca 401 przed wykonaniem logiki endpointu

### Konflikt nazwy (409)

- **Przyczyna**: UNIQUE constraint violation (PostgreSQL error code 23505)
- **Akcja**: Service layer catch'uje błąd bazy i zwraca 409 z odpowiednim komunikatem

### Błąd bazy danych (500)

- **Przyczyna**: Problemy z połączeniem, timeout, nieoczekiwany błąd
- **Akcja**: Logowanie błędu (console.error) i zwrot generycznego komunikatu 500

### Struktura obsługi błędów w service layer

```typescript
try {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ user_id: userId, name: command.name })
    .select()
    .single();

  if (error) {
    // PostgreSQL unique violation
    if (error.code === "23505") {
      return { success: false, errorType: "conflict" };
    }
    throw error;
  }

  return { success: true, data };
} catch (error) {
  console.error("Failed to create campaign:", error);
  return { success: false, errorType: "internal" };
}
```

## 8. Rozważania dotyczące wydajności

### Zapytanie do bazy

- Pojedyncze INSERT + SELECT (Supabase `.insert().select()`)
- Czas wykonania: <50ms dla typowego przypadku
- Index na (user_id, name) już istnieje (UNIQUE constraint), co przyspiesza sprawdzanie duplikatów

### Optymalizacje

- Brak złożonych joinów - tylko jedna tabela
- RETURNING \* w PostgreSQL eliminuje potrzebę dodatkowego SELECT
- Brak paginacji (dotyczy tylko tworzenia jednej kampanii)

### Potencjalne wąskie gardła

- Nie przewiduje się problemów z wydajnością dla tego endpointu
- W przyszłości można dodać rate limiting per user

## 9. Etapy wdrożenia

### Krok 1: Utworzenie Zod schema

- Plik: `src/lib/schemas/campaign.schema.ts`
- Zawartość: `createCampaignSchema` z walidacją pola `name`

### Krok 2: Utworzenie service layer

- Plik: `src/lib/services/campaign.service.ts`
- Metoda: `createCampaign(supabase: SupabaseClient, userId: string, command: CreateCampaignCommand)`
- Zwraca: Result type z success/error handling

### Krok 3: Utworzenie API route

- Plik: `src/pages/api/campaigns.ts`
- Export: `export const prerender = false`
- Handler: `export async function POST(context: APIContext)`
- Logika:
  1. Sprawdzenie autentykacji (`context.locals.user`)
  2. Walidacja body z Zod
  3. Wywołanie `CampaignService.createCampaign()`
  4. Zwrot odpowiedzi z odpowiednim kodem statusu

### Krok 4: Dokumentacja i czyszczenie kodu

- Dodanie komentarzy JSDoc do publicznych metod
- Sprawdzenie zgodności z regułami lintingu (ESLint)
- Formatowanie kodem (Prettier)
