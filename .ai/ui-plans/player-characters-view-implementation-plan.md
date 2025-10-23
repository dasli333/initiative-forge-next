# Plan implementacji widoku Player Characters

## 1. Przegląd

Widok Player Characters służy do zarządzania postaciami graczy w ramach wybranej kampanii. Umożliwia dodawanie nowych postaci z podstawowymi statystykami D&D 5e, edycję istniejących postaci oraz ich usuwanie. Widok automatycznie oblicza modyfikator inicjatywy (na podstawie Zręczności) oraz pasywną percepcję (na podstawie Mądrości), co usprawnia przygotowanie do sesji i walki. Lista postaci jest wyświetlana w formie tabeli z przejrzystym widokiem kluczowych statystyk.

## 2. Routing widoku

**Ścieżka**: `/campaigns/:id/characters`

- Parametr `:id` to UUID kampanii
- Widok dostępny tylko dla zalogowanych użytkowników (po implementacji autentykacji)
- Jeśli kampania nie istnieje lub użytkownik nie jest jej właścicielem, następuje przekierowanie do listy kampanii z komunikatem o błędzie

## 3. Struktura komponentów

```
src/pages/campaigns/[id]/characters.astro (Astro page - SSR)
├── PlayerCharactersView.tsx (React root component)
    ├── CharacterListHeader.tsx
    │   ├── Breadcrumb (shadcn)
    │   └── Button (Add Player Character)
    ├── CharacterList.tsx
    │   ├── CharacterListTable.tsx (when characters exist)
    │   │   ├── Table (shadcn)
    │   │   └── DropdownMenu (shadcn - actions per row)
    │   └── CharacterListEmpty.tsx (when no characters)
    └── CharacterFormModal.tsx
        ├── Dialog (shadcn)
        └── CharacterForm.tsx
            ├── BasicInfoSection.tsx
            ├── AbilityScoresSection.tsx
            ├── AutoCalculatedDisplays.tsx
            └── ActionsSection.tsx
                ├── ActionsList.tsx
                └── ActionBuilder.tsx
```

## 4. Szczegóły komponentów

### 4.1. PlayerCharactersView (główny komponent React)

**Opis**: Komponent główny widoku, zarządza stanem modalu i orkiestruje komunikację między komponentami. Odpowiada za pobieranie danych z API i przekazywanie ich do komponentów potomnych.

**Główne elementy**:
- `CharacterListHeader` - nagłówek z breadcrumb i przyciskiem dodawania
- `CharacterList` - lista/tabela postaci lub empty state
- `CharacterFormModal` - modal z formularzem tworzenia/edycji

**Obsługiwane interakcje**:
- Otwarcie modalu w trybie tworzenia (przekazuje `null` jako `editingCharacter`)
- Otwarcie modalu w trybie edycji (przekazuje wybraną postać)
- Zamknięcie modalu po zapisaniu lub anulowaniu
- Obsługa usuwania postaci z potwierdzeniem

**Obsługiwana walidacja**: Nie dotyczy (deleguje do formularza)

**Typy**:
- `PlayerCharacterDTO[]` - lista postaci z API
- `PlayerCharacterDTO | null` - postać do edycji (null = tryb tworzenia)
- `boolean` - stan otwarcia modalu

**Propsy**:
```typescript
interface PlayerCharactersViewProps {
  campaignId: string;
  initialCampaignName?: string; // dla breadcrumb
}
```

### 4.2. CharacterListHeader

**Opis**: Komponent nagłówka zawierający breadcrumb nawigacyjny oraz przycisk dodawania nowej postaci. Zapewnia kontekst użytkownikowi, pokazując jego położenie w hierarchii aplikacji.

**Główne elementy**:
- `Breadcrumb` (shadcn) z trzema poziomami: "My Campaigns" > "[Campaign Name]" > "Characters"
- `h1` z tytułem "Player Characters"
- `Button` (shadcn) w wariancie emerald z ikoną "+" i tekstem "Add Player Character"

**Obsługiwane interakcje**:
- `onClick` na przycisku "Add Player Character" wywołuje callback do otwarcia modalu

**Obsługiwana walidacja**: Nie dotyczy

**Typy**:
- `string` - nazwa kampanii dla breadcrumb

**Propsy**:
```typescript
interface CharacterListHeaderProps {
  campaignName: string;
  onAddCharacter: () => void;
}
```

### 4.3. CharacterList

**Opis**: Komponent warunkowy, który renderuje tabelę postaci jeśli lista nie jest pusta, lub komponent empty state jeśli nie ma żadnych postaci w kampanii.

**Główne elementy**:
- Warunek: jeśli `characters.length > 0` renderuj `CharacterListTable`, w przeciwnym razie `CharacterListEmpty`

**Obsługiwane interakcje**:
- Przekazuje callbacks do komponentów potomnych (edit, delete)

**Obsługiwana walidacja**: Nie dotyczy

**Typy**:
- `PlayerCharacterDTO[]` - lista postaci
- `boolean` - stan ładowania

**Propsy**:
```typescript
interface CharacterListProps {
  characters: PlayerCharacterDTO[];
  isLoading: boolean;
  onEdit: (character: PlayerCharacterDTO) => void;
  onDelete: (characterId: string) => void;
}
```

### 4.4. CharacterListTable

**Opis**: Tabela z shadcn/ui wyświetlająca listę postaci w kampanii. Każdy wiersz zawiera podstawowe statystyki postaci oraz dropdown z akcjami (Edit, Delete). Kolumny: Name, Max HP, AC, Initiative Mod, Passive Perception, Actions.

**Główne elementy**:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (shadcn)
- `DropdownMenu` (shadcn) w ostatniej kolumnie z akcjami:
  - "Edit" z ikoną ołówka
  - "Delete" z ikoną kosza (wariant destructive)

**Obsługiwane interakcje**:
- Kliknięcie "Edit" wywołuje `onEdit(character)`
- Kliknięcie "Delete" wywołuje `onDelete(characterId)` z opcjonalnym dialogiem potwierdzenia

**Obsługiwana walidacja**: Nie dotyczy

**Typy**:
- `PlayerCharacterDTO[]` - lista postaci
- `CharacterTableRow` - ViewModel z obliczonymi polami:
  ```typescript
  interface CharacterTableRow {
    id: string;
    name: string;
    max_hp: number;
    armor_class: number;
    initiativeModifier: number; // obliczony z dexterity
    passivePerception: number; // obliczony z wisdom
  }
  ```

**Propsy**:
```typescript
interface CharacterListTableProps {
  characters: PlayerCharacterDTO[];
  onEdit: (character: PlayerCharacterDTO) => void;
  onDelete: (characterId: string) => void;
}
```

**Transformacja danych**:
```typescript
const toTableRow = (char: PlayerCharacterDTO): CharacterTableRow => ({
  id: char.id,
  name: char.name,
  max_hp: char.max_hp,
  armor_class: char.armor_class,
  initiativeModifier: Math.floor((char.dexterity - 10) / 2),
  passivePerception: 10 + Math.floor((char.wisdom - 10) / 2),
});
```

### 4.5. CharacterListEmpty

**Opis**: Komponent wyświetlany gdy w kampanii nie ma jeszcze żadnych postaci. Zawiera ikonę, komunikat oraz przycisk zachęcający do dodania pierwszej postaci.

**Główne elementy**:
- Ikona postaci (Lucide icon: `Users` lub `UserPlus`)
- Nagłówek: "No characters yet"
- Opisowy tekst: "Add your first player character to get started"
- `Button` (shadcn): "Add Character" w wariancie emerald

**Obsługiwane interakcje**:
- Kliknięcie przycisku wywołuje `onAddCharacter()`

**Obsługiwana walidacja**: Nie dotyczy

**Typy**: Nie dotyczy

**Propsy**:
```typescript
interface CharacterListEmptyProps {
  onAddCharacter: () => void;
}
```

### 4.6. CharacterFormModal

**Opis**: Modal (Dialog z shadcn/ui) zawierający formularz tworzenia/edycji postaci. Obsługuje focus trap, zamykanie przez Escape (z potwierdzeniem jeśli są zmiany), oraz auto-focus na pierwszym polu. Max-width: 600px.

**Główne elementy**:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` (shadcn)
- `CharacterForm` - główny formularz
- Przyciski w stopce:
  - "Cancel" (wariant secondary)
  - "Create Character" lub "Save Changes" (wariant emerald, disabled jeśli validacja nie przechodzi)

**Obsługiwane interakcje**:
- Otwarcie/zamknięcie modalu
- Zamknięcie przez Escape lub kliknięcie backdrop
- Potwierdzenie zamknięcia jeśli formularz ma niezapisane zmiany
- Submit formularza

**Obsługiwana walidacja**: Deleguje do `CharacterForm`

**Typy**:
- `boolean` - stan otwarcia
- `"create" | "edit"` - tryb formularza
- `PlayerCharacterDTO | null` - dane postaci do edycji

**Propsy**:
```typescript
interface CharacterFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  character: PlayerCharacterDTO | null;
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

### 4.7. CharacterForm

**Opis**: Główny formularz z React Hook Form i Zod validation. Składa się z trzech sekcji: Basic Info, Ability Scores, oraz Actions (accordion). Wyświetla real-time obliczone wartości inicjatywy i percepcji.

**Główne elementy**:
- `form` element z `react-hook-form`
- `BasicInfoSection` - sekcja z podstawowymi informacjami
- `AbilityScoresSection` - sekcja z atrybutami
- `AutoCalculatedDisplays` - wyświetlacz obliczonych wartości
- `ActionsSection` - sekcja z akcjami (accordion, opcjonalna)

**Obsługiwane interakcje**:
- Real-time walidacja wszystkich pól
- Obliczanie inicjatywy i percepcji przy zmianie DEX/WIS
- Submit formularza
- Reset formularza przy zmianie trybu

**Obsługiwana walidacja**:
- Wszystkie pola według `CreatePlayerCharacterCommandSchema` lub `UpdatePlayerCharacterCommandSchema`
- Inline error messages dla każdego pola
- Disabled submit button do czasu poprawnej walidacji

**Typy**:
- `CreatePlayerCharacterCommand` lub `UpdatePlayerCharacterCommand`
- `UseFormReturn` z react-hook-form

**Propsy**:
```typescript
interface CharacterFormProps {
  mode: "create" | "edit";
  defaultValues?: PlayerCharacterDTO;
  campaignId: string;
  onSubmit: (data: CreatePlayerCharacterCommand | UpdatePlayerCharacterCommand) => Promise<void>;
  onCancel: () => void;
}
```

### 4.8. BasicInfoSection

**Opis**: Pierwsza sekcja formularza w układzie grid 2x2. Zawiera pola: Name, Max HP, AC, Speed. Pola są renderowane jako Input z shadcn/ui z odpowiednimi labelami i error messages.

**Główne elementy**:
- 4x `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `FormMessage` (shadcn + react-hook-form)
- Layout: `grid grid-cols-2 gap-4`

**Obsługiwane interakcje**:
- Wpisywanie wartości w pola
- Auto-focus na pole Name przy otwarciu formularza

**Obsługiwana walidacja**:
- **Name**: wymagane, min 1 znak, max 255 znaków
- **Max HP**: wymagane, liczba całkowita, min 1, max 32767
- **AC**: wymagane, liczba całkowita, min 0, max 32767
- **Speed**: wymagane, liczba całkowita, min 0, max 32767, domyślnie 30

**Typy**:
- Pola formularza kontrolowane przez react-hook-form
- `UseFormReturn` przekazywany z rodzica

**Propsy**:
```typescript
interface BasicInfoSectionProps {
  form: UseFormReturn<CreatePlayerCharacterCommand>;
}
```

### 4.9. AbilityScoresSection

**Opis**: Druga sekcja formularza w układzie grid 2x3. Zawiera 6 pól dla atrybutów D&D: STR, DEX, CON, INT, WIS, CHA. Każde pole ma domyślną wartość 10. Zmiana DEX i WIS powoduje przeliczenie inicjatywy i percepcji.

**Główne elementy**:
- 6x `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `FormMessage`
- Layout: `grid grid-cols-2 md:grid-cols-3 gap-4`
- Labele: "Strength (STR)", "Dexterity (DEX)", etc.

**Obsługiwane interakcje**:
- Wpisywanie wartości atrybutów (1-30)
- Zmiana DEX/WIS wyzwala przeliczenie w `AutoCalculatedDisplays`

**Obsługiwana walidacja**:
- Każdy atrybut: wymagany, liczba całkowita, min 1, max 30, domyślnie 10

**Typy**:
- Pola formularza kontrolowane przez react-hook-form
- `UseFormReturn` przekazywany z rodzica

**Propsy**:
```typescript
interface AbilityScoresSectionProps {
  form: UseFormReturn<CreatePlayerCharacterCommand>;
}
```

### 4.10. AutoCalculatedDisplays

**Opis**: Komponent wyświetlający obliczone wartości inicjatywy i percepcji w czasie rzeczywistym. Wartości są prezentowane w wyróżniający sposób (emerald badge) i aktualizują się automatycznie przy zmianie DEX i WIS.

**Główne elementy**:
- 2x `Badge` (shadcn) w kolorze emerald
- Layout: `flex gap-4`
- Tekst: "Initiative Modifier: +X" i "Passive Perception: X"

**Obsługiwane interakcje**:
- Automatyczna aktualizacja przy zmianie wartości DEX i WIS
- Aria-live region dla ogłaszania zmian (accessibility)

**Obsługiwana walidacja**: Nie dotyczy (tylko wyświetlanie)

**Typy**:
- `number` - dexterity
- `number` - wisdom
- `CalculatedStats`:
  ```typescript
  interface CalculatedStats {
    initiativeModifier: number; // Math.floor((dex - 10) / 2)
    passivePerception: number; // 10 + Math.floor((wis - 10) / 2)
  }
  ```

**Propsy**:
```typescript
interface AutoCalculatedDisplaysProps {
  dexterity: number;
  wisdom: number;
}
```

**Formuły**:
```typescript
const initiativeModifier = Math.floor((dexterity - 10) / 2);
const passivePerception = 10 + Math.floor((wisdom - 10) / 2);
```

### 4.11. ActionsSection

**Opis**: Trzecia sekcja formularza w postaci collapsible accordion. Zawiera listę dodanych akcji oraz builder do dodawania nowych. Sekcja jest opcjonalna - postać może nie mieć żadnych akcji.

**Główne elementy**:
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (shadcn)
- Nagłówek: "Actions (optional)"
- `ActionsList` - lista dodanych akcji
- `ActionBuilder` - formularz dodawania akcji
- Button: "+ Add Action"

**Obsługiwane interakcje**:
- Rozwijanie/zwijanie accordion
- Dodawanie nowej akcji
- Usuwanie istniejącej akcji

**Obsługiwana walidacja**:
- Maksymalnie 20 akcji na postać
- Walidacja pól akcji przez `PlayerCharacterActionSchema`

**Typy**:
- `ActionDTO[]` - tablica akcji
- `UseFieldArrayReturn` z react-hook-form

**Propsy**:
```typescript
interface ActionsSectionProps {
  form: UseFormReturn<CreatePlayerCharacterCommand>;
}
```

### 4.12. ActionsList

**Opis**: Lista dodanych akcji wyświetlana w postaci kart lub wierszy. Każda akcja zawiera nazwę, typ oraz przycisk usuwania.

**Główne elementy**:
- Lista elementów akcji
- Dla każdej akcji: nazwa, typ, badge z typem akcji, button "Remove"
- Komunikat jeśli brak akcji: "No actions added yet"

**Obsługiwane interakcje**:
- Kliknięcie "Remove" usuwa akcję z listy

**Obsługiwana walidacja**: Nie dotyczy

**Typy**:
- `ActionDTO[]`

**Propsy**:
```typescript
interface ActionsListProps {
  actions: ActionDTO[];
  onRemove: (index: number) => void;
}
```

### 4.13. ActionBuilder

**Opis**: Formularz do budowania akcji postaci. Zawiera wszystkie pola niezbędne do zdefiniowania akcji: nazwa, typ, bonus do ataku, zasięg, kości obrażeń, bonus do obrażeń, typ obrażeń.

**Główne elementy**:
- `Input` dla Name
- `Select` dla Type (melee_weapon_attack, ranged_weapon_attack, spell_attack, special)
- `Input` dla Attack Bonus (opcjonalny)
- `Input` dla Reach (dla melee) lub Range (dla ranged)
- `Input` dla Damage Dice (np. "1d8", "2d6")
- `Input` dla Damage Bonus (opcjonalny)
- `Select` lub `Input` dla Damage Type (slashing, piercing, bludgeoning, fire, cold, etc.)
- `Button` "Add Action"

**Obsługiwane interakcje**:
- Wypełnianie pól akcji
- Walidacja przy dodawaniu
- Reset pól po dodaniu akcji
- Warunkowo pokazywanie Reach/Range w zależności od typu

**Obsługiwana walidacja**:
- **Name**: wymagane, min 1 znak
- **Type**: wymagane, jeden z dozwolonych typów
- **Attack Bonus**: opcjonalny, liczba całkowita
- **Reach/Range**: opcjonalny, string
- **Damage Dice**: opcjonalny, string (można dodać regex dla formatu kości)
- **Damage Bonus**: opcjonalny, liczba całkowita
- **Damage Type**: opcjonalny, string

**Typy**:
- `ActionDTO`
- Local state dla budowania akcji przed dodaniem do listy

**Propsy**:
```typescript
interface ActionBuilderProps {
  onAdd: (action: ActionDTO) => void;
  maxActionsReached: boolean;
}
```

## 5. Typy

### 5.1. Typy z API (już istniejące w `src/types.ts`)

```typescript
// Encja z bazy danych
type PlayerCharacter = Tables<"player_characters">;

// DTO z typowanymi akcjami
type PlayerCharacterDTO = Omit<PlayerCharacter, "actions"> & {
  actions: ActionDTO[] | null;
};

// Command dla tworzenia postaci
type CreatePlayerCharacterCommand = Omit<
  TablesInsert<"player_characters">,
  "campaign_id" | "id" | "created_at" | "updated_at" | "actions"
> & {
  actions?: ActionDTO[];
};

// Command dla aktualizacji postaci
type UpdatePlayerCharacterCommand = Omit<
  TablesUpdate<"player_characters">,
  "campaign_id" | "id" | "created_at" | "updated_at" | "actions"
> & {
  actions?: ActionDTO[];
};

// Struktura akcji
interface ActionDTO {
  name: string;
  type: string;
  attack_bonus?: number;
  reach?: string;
  range?: string;
  damage_dice?: string;
  damage_bonus?: number;
  damage_type?: string;
  description?: string;
}

// Response dla listy postaci
interface ListPlayerCharactersResponseDTO {
  characters: PlayerCharacterDTO[];
}
```

### 5.2. Nowe ViewModels dla UI

```typescript
// ViewModel dla wiersza tabeli z obliczonymi wartościami
interface CharacterTableRow {
  id: string;
  name: string;
  max_hp: number;
  armor_class: number;
  initiativeModifier: number; // obliczony z dexterity
  passivePerception: number; // obliczony z wisdom
}

// Obliczone statystyki
interface CalculatedStats {
  initiativeModifier: number;
  passivePerception: number;
}

// Tryb formularza
type CharacterFormMode = "create" | "edit";

// Stan modalu
interface CharacterModalState {
  isOpen: boolean;
  mode: CharacterFormMode;
  editingCharacter: PlayerCharacterDTO | null;
}
```

### 5.3. Schemat walidacji Zod (już istniejący w `src/lib/schemas/player-character.schema.ts`)

```typescript
const CreatePlayerCharacterCommandSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  max_hp: z.number().int().positive().max(32767),
  armor_class: z.number().int().positive().max(32767),
  speed: z.number().int().nonnegative().max(32767),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
  actions: z.array(PlayerCharacterActionSchema).max(20).optional(),
});

const PlayerCharacterActionSchema = z.object({
  name: z.string(),
  type: z.string(),
  attack_bonus: z.number().int().optional(),
  reach: z.string().optional(),
  range: z.string().optional(),
  damage_dice: z.string().optional(),
  damage_bonus: z.number().int().optional(),
  damage_type: z.string().optional(),
  description: z.string().optional(),
});
```

## 6. Zarządzanie stanem

### 6.1. Stan serwera (TanStack Query)

Widok używa TanStack Query do zarządzania stanem serwerowym (lista postaci, operacje CRUD).

**Query dla listy postaci**:
```typescript
const useCharacters = (campaignId: string) => {
  return useQuery({
    queryKey: ["campaigns", campaignId, "characters"],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`);
      if (!response.ok) throw new Error("Failed to fetch characters");
      const data: ListPlayerCharactersResponseDTO = await response.json();
      return data.characters;
    },
  });
};
```

**Mutation dla tworzenia postaci**:
```typescript
const useCreateCharacter = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlayerCharacterCommand) => {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "characters"]
      });
    },
  });
};
```

**Mutation dla aktualizacji postaci**:
```typescript
const useUpdateCharacter = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      characterId,
      data
    }: {
      characterId: string;
      data: UpdatePlayerCharacterCommand
    }) => {
      const response = await fetch(
        `/api/campaigns/${campaignId}/characters/${characterId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "characters"]
      });
    },
  });
};
```

**Mutation dla usuwania postaci**:
```typescript
const useDeleteCharacter = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => {
      const response = await fetch(
        `/api/campaigns/${campaignId}/characters/${characterId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "characters"]
      });
    },
  });
};
```

### 6.2. Stan lokalny (React useState)

**Stan modalu w PlayerCharactersView**:
```typescript
const [modalState, setModalState] = useState<CharacterModalState>({
  isOpen: false,
  mode: "create",
  editingCharacter: null,
});

// Otwarcie modalu w trybie tworzenia
const handleAddCharacter = () => {
  setModalState({
    isOpen: true,
    mode: "create",
    editingCharacter: null,
  });
};

// Otwarcie modalu w trybie edycji
const handleEditCharacter = (character: PlayerCharacterDTO) => {
  setModalState({
    isOpen: true,
    mode: "edit",
    editingCharacter: character,
  });
};

// Zamknięcie modalu
const handleCloseModal = () => {
  setModalState({
    isOpen: false,
    mode: "create",
    editingCharacter: null,
  });
};
```

### 6.3. Stan formularza (React Hook Form)

```typescript
const useCharacterForm = (
  mode: CharacterFormMode,
  defaultValues?: PlayerCharacterDTO
) => {
  const schema = mode === "create"
    ? CreatePlayerCharacterCommandSchema
    : UpdatePlayerCharacterCommandSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      max_hp: 1,
      armor_class: 10,
      speed: 30,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      actions: [],
    },
  });

  // Watch dexterity i wisdom dla obliczeń
  const dexterity = form.watch("dexterity");
  const wisdom = form.watch("wisdom");

  const calculatedStats: CalculatedStats = {
    initiativeModifier: Math.floor((dexterity - 10) / 2),
    passivePerception: 10 + Math.floor((wisdom - 10) / 2),
  };

  return { form, calculatedStats };
};
```

### 6.4. Custom hook dla obliczeń

```typescript
const useCharacterCalculations = (dexterity: number, wisdom: number) => {
  return useMemo(() => ({
    initiativeModifier: Math.floor((dexterity - 10) / 2),
    passivePerception: 10 + Math.floor((wisdom - 10) / 2),
  }), [dexterity, wisdom]);
};
```

## 7. Integracja API

### 7.1. Endpoint: Pobieranie listy postaci

**Request**:
- Method: `GET`
- Path: `/api/campaigns/:campaignId/characters`
- Headers: Brak (auth przez cookies po implementacji)
- Body: Brak

**Response** (200 OK):
```typescript
{
  "characters": PlayerCharacterDTO[]
}
```

**Typy Request/Response**:
- Request: Brak body
- Response: `ListPlayerCharactersResponseDTO`

**Obsługa błędów**:
- 401 Unauthorized: Brak autentykacji (redirect do logowania)
- 404 Not Found: Kampania nie istnieje lub brak dostępu (redirect do listy kampanii)
- 500 Internal Server Error: Toast z komunikatem "Failed to load characters"

### 7.2. Endpoint: Tworzenie postaci

**Request**:
- Method: `POST`
- Path: `/api/campaigns/:campaignId/characters`
- Headers: `Content-Type: application/json`
- Body: `CreatePlayerCharacterCommand`

**Response** (201 Created):
```typescript
PlayerCharacterDTO
```

**Typy Request/Response**:
- Request: `CreatePlayerCharacterCommand`
- Response: `PlayerCharacterDTO`

**Obsługa błędów**:
- 400 Bad Request: Błędy walidacji (wyświetl inline errors z details)
- 404 Not Found: Kampania nie istnieje (redirect)
- 409 Conflict: Nazwa postaci już istnieje (inline error na polu name)
- 500 Internal Server Error: Toast "Failed to create character"

### 7.3. Endpoint: Aktualizacja postaci

**Request**:
- Method: `PATCH`
- Path: `/api/campaigns/:campaignId/characters/:id`
- Headers: `Content-Type: application/json`
- Body: `UpdatePlayerCharacterCommand` (partial update)

**Response** (200 OK):
```typescript
PlayerCharacterDTO
```

**Typy Request/Response**:
- Request: `UpdatePlayerCharacterCommand`
- Response: `PlayerCharacterDTO`

**Obsługa błędów**:
- 400 Bad Request: Błędy walidacji
- 404 Not Found: Postać lub kampania nie istnieje
- 409 Conflict: Nowa nazwa już istnieje
- 500 Internal Server Error: Toast "Failed to update character"

### 7.4. Endpoint: Usuwanie postaci

**Request**:
- Method: `DELETE`
- Path: `/api/campaigns/:campaignId/characters/:id`
- Headers: Brak
- Body: Brak

**Response** (204 No Content):
Brak body

**Typy Request/Response**:
- Request: Brak body
- Response: Brak body

**Obsługa błędów**:
- 404 Not Found: Postać lub kampania nie istnieje
- 500 Internal Server Error: Toast "Failed to delete character"

## 8. Interakcje użytkownika

### 8.1. Dodawanie nowej postaci

1. Użytkownik klika przycisk "Add Player Character" w nagłówku
2. Otwiera się modal z pustym formularzem
3. Tytuł modalu: "Add Player Character"
4. Automatyczny focus na polu "Name"
5. Domyślne wartości: speed=30, wszystkie atrybuty=10
6. Initiative Modifier i Passive Perception pokazują wartości dla atrybutów=10 (inicjatywa: +0, percepcja: 10)
7. Użytkownik wypełnia pola (name, HP, AC są wymagane)
8. Przy zmianie DEX lub WIS, obliczone wartości aktualizują się w czasie rzeczywistym
9. Sekcja Actions jest opcjonalna i domyślnie zwinięta
10. Po wypełnieniu wymaganych pól, przycisk "Create Character" staje się aktywny
11. Kliknięcie "Create Character" wysyła POST request
12. Podczas wysyłania: przycisk pokazuje spinner i jest disabled
13. Po sukcesie: modal zamyka się, lista odświeża się, pojawia się toast "Character created successfully"
14. Po błędzie: modal pozostaje otwarty, wyświetlane są odpowiednie komunikaty błędów

### 8.2. Edycja istniejącej postaci

1. Użytkownik klika "Edit" w dropdown menu przy postaci
2. Otwiera się modal z formularzem wypełnionym danymi postaci
3. Tytuł modalu: "Edit Character"
4. Wszystkie pola są edytowalne
5. Automatyczny focus na polu "Name"
6. Initiative Modifier i Passive Perception pokazują wartości obliczone z bieżących atrybutów
7. Użytkownik modyfikuje wybrane pola
8. Przy zmianie DEX lub WIS, obliczone wartości aktualizują się
9. Przycisk "Save Changes" staje się aktywny po wprowadzeniu zmian i przejściu walidacji
10. Kliknięcie "Save Changes" wysyła PATCH request
11. Po sukcesie: modal zamyka się, lista odświeża się, toast "Character updated successfully"
12. Po błędzie: modal pozostaje otwarty z komunikatami błędów

### 8.3. Usuwanie postaci

1. Użytkownik klika "Delete" w dropdown menu przy postaci
2. (Opcjonalnie) Pojawia się dialog potwierdzenia: "Are you sure you want to delete [Character Name]?"
3. Po potwierdzeniu wysyłany jest DELETE request
4. Podczas usuwania: wiersz z postacią jest przyciemniony lub pokazuje spinner
5. Po sukcesie: postać znika z listy, toast "Character deleted successfully"
6. Po błędzie: postać pozostaje na liście, toast z komunikatem błędu

### 8.4. Dodawanie akcji do postaci

1. Użytkownik otwiera sekcję "Actions" w formularzu (accordion)
2. Jeśli brak akcji: komunikat "No actions added yet"
3. Użytkownik klika "+ Add Action"
4. Pojawia się formularz ActionBuilder
5. Użytkownik wypełnia: Name (wymagane), Type (wymagane), oraz opcjonalne pola
6. W zależności od wybranego typu (melee/ranged) pokazuje się odpowiednie pole (Reach/Range)
7. Kliknięcie "Add" dodaje akcję do listy
8. Nowa akcja pojawia się jako karta z nazwą, typem i przyciskiem "Remove"
9. Pola ActionBuilder resetują się dla następnej akcji
10. Jeśli osiągnięto limit 20 akcji, przycisk "Add Action" jest disabled

### 8.5. Obsługa pustego stanu (brak postaci)

1. Jeśli kampania nie ma żadnych postaci, wyświetlany jest `CharacterListEmpty`
2. Użytkownik widzi ikonę, komunikat "No characters yet" oraz przycisk "Add Character"
3. Kliknięcie przycisku otwiera modal w trybie tworzenia
4. Po dodaniu pierwszej postaci, widok przełącza się na tabelę

### 8.6. Anulowanie zmian

1. Użytkownik klika "Cancel" w stopce modalu
2. Jeśli formularz ma niezapisane zmiany (form.formState.isDirty), pojawia się potwierdzenie:
   "You have unsaved changes. Are you sure you want to close?"
3. Po potwierdzeniu: modal zamyka się, zmiany są odrzucane
4. Użytkownik może również zamknąć modal przez Escape lub kliknięcie backdrop (z tym samym potwierdzeniem)

### 8.7. Ładowanie danych

1. Przy pierwszym wejściu na stronę widoczny jest stan ładowania:
   - Skeleton loaders dla tabeli lub spinner
2. Po załadowaniu danych: wyświetla się tabela lub empty state
3. Jeśli wystąpił błąd podczas ładowania: wyświetla się komunikat błędu z przyciskiem "Retry"

## 9. Warunki i walidacja

### 9.1. Walidacja pól formularza (wykonywana przez Zod + React Hook Form)

**Pole Name**:
- Warunek: wymagane, min 1 znak, max 255 znaków
- Komponent: `BasicInfoSection`
- Komunikat błędu:
  - Puste: "Name is required"
  - Za długie: "Name must be 255 characters or less"
- Wpływ: przycisk submit disabled jeśli niepoprawne

**Pole Max HP**:
- Warunek: wymagane, liczba całkowita, min 1, max 32767
- Komponent: `BasicInfoSection`
- Komunikat błędu:
  - Puste/0: "Max HP must be greater than 0"
  - Za duże: "Max HP exceeds maximum value"
- Wpływ: przycisk submit disabled

**Pole Armor Class**:
- Warunek: wymagane, liczba całkowita, min 0, max 32767
- Komponent: `BasicInfoSection`
- Komunikat błędu:
  - Ujemne: "Armor class must be greater than 0"
  - Za duże: "Armor class exceeds maximum value"
- Wpływ: przycisk submit disabled

**Pole Speed**:
- Warunek: wymagane, liczba całkowita, min 0, max 32767, domyślnie 30
- Komponent: `BasicInfoSection`
- Komunikat błędu:
  - Ujemne: "Speed cannot be negative"
  - Za duże: "Speed exceeds maximum value"
- Wpływ: przycisk submit disabled

**Pola atrybutów (STR, DEX, CON, INT, WIS, CHA)**:
- Warunek: wymagane, liczba całkowita, min 1, max 30, domyślnie 10
- Komponent: `AbilityScoresSection`
- Komunikat błędu:
  - Poniżej 1: "[Attribute] must be at least 1"
  - Powyżej 30: "[Attribute] cannot exceed 30"
- Wpływ: przycisk submit disabled, automatyczna aktualizacja Initiative/Perception dla DEX/WIS

**Pole Actions (tablica)**:
- Warunek: opcjonalne, max 20 elementów
- Komponent: `ActionsSection`
- Komunikat błędu: "Maximum 20 actions allowed"
- Wpływ: przycisk "Add Action" disabled po osiągnięciu limitu

**Pola pojedynczej akcji**:
- Name: wymagane, min 1 znak
- Type: wymagane, jeden z: "melee_weapon_attack", "ranged_weapon_attack", "spell_attack", "special"
- Pozostałe pola: opcjonalne

### 9.2. Walidacja na poziomie API (backend)

**Unikalność nazwy postaci w kampanii**:
- Warunek: nazwa postaci musi być unikalna w ramach kampanii
- Endpoint: POST/PATCH `/api/campaigns/:campaignId/characters`
- Response: 409 Conflict
- Obsługa w UI:
  - Inline error na polu "Name"
  - Komunikat: "Character name already exists in this campaign"
  - Modal pozostaje otwarty
  - Focus automatycznie przeniesiony na pole Name

**Weryfikacja dostępu do kampanii**:
- Warunek: użytkownik musi być właścicielem kampanii (RLS w Supabase)
- Endpoint: wszystkie endpointy w `/api/campaigns/:campaignId/characters`
- Response: 404 Not Found
- Obsługa w UI:
  - Redirect do listy kampanii
  - Toast: "Campaign not found"

### 9.3. Walidacja stanu UI

**Wyłączenie przycisku Submit**:
- Warunek: `!form.formState.isValid || form.formState.isSubmitting`
- Komponent: `CharacterFormModal`
- Wpływ: przycisk "Create Character"/"Save Changes" jest disabled

**Wyłączenie przycisku Add Action**:
- Warunek: `actions.length >= 20`
- Komponent: `ActionsSection`
- Wpływ: przycisk "+ Add Action" jest disabled
- Komunikat: "Maximum 20 actions reached"

**Wyświetlenie Empty State**:
- Warunek: `characters.length === 0 && !isLoading`
- Komponent: `CharacterList`
- Wpływ: zamiast tabeli renderuje się `CharacterListEmpty`

### 9.4. Accessibility validation

**Focus trap w modalu**:
- Warunek: modal jest otwarty
- Komponent: `Dialog` (shadcn obsługuje automatycznie)
- Wpływ: focus pozostaje wewnątrz modalu, Tab/Shift+Tab nawigują tylko po elementach modalu

**Auto-focus na pierwszym polu**:
- Warunek: modal został otwarty
- Komponent: `CharacterForm`
- Wpływ: pole "Name" otrzymuje focus automatycznie

**Aria-live dla obliczeń**:
- Warunek: zmiana DEX lub WIS
- Komponent: `AutoCalculatedDisplays`
- Wpływ: screen reader ogłasza nowe wartości inicjatywy i percepcji

## 10. Obsługa błędów

### 10.1. Błędy sieciowe

**Scenariusz**: Brak połączenia z internetem lub timeout

**Obsługa**:
- Wyświetlenie toast notification: "Network error. Please check your connection and try again."
- Formularz pozostaje otwarty z wypełnionymi danymi
- Przycisk submit wraca do stanu aktywnego (po zakończeniu próby)
- Opcja: przycisk "Retry" w toast

**Implementacja**:
```typescript
onError: (error) => {
  if (error instanceof TypeError || error.message.includes("fetch")) {
    toast.error("Network error. Please check your connection.");
  }
}
```

### 10.2. Błędy walidacji (400 Bad Request)

**Scenariusz**: Dane nie przeszły walidacji na backendzie

**Obsługa**:
- Parsowanie `error.details` z odpowiedzi
- Wyświetlenie inline errors przy konkretnych polach
- Modal pozostaje otwarty
- Focus na pierwszym niepoprawnym polu

**Implementacja**:
```typescript
if (error.status === 400 && error.details) {
  error.details.forEach((detail) => {
    form.setError(detail.path, { message: detail.message });
  });
}
```

### 10.3. Konflikt nazwy (409 Conflict)

**Scenariusz**: Postać o podanej nazwie już istnieje w kampanii

**Obsługa**:
- Inline error na polu "Name"
- Komunikat: "Character name already exists in this campaign"
- Modal pozostaje otwarty
- Focus na polu "Name"
- Podpowiedź: użytkownik może dodać numer lub przydomek

**Implementacja**:
```typescript
if (error.status === 409) {
  form.setError("name", {
    message: "Character name already exists in this campaign"
  });
  form.setFocus("name");
}
```

### 10.4. Brak dostępu (404 Not Found)

**Scenariusz**: Kampania nie istnieje lub użytkownik nie jest właścicielem

**Obsługa**:
- Natychmiastowe zamknięcie modalu (jeśli otwarty)
- Redirect do `/campaigns`
- Toast: "Campaign not found or you don't have access"

**Implementacja**:
```typescript
if (error.status === 404) {
  toast.error("Campaign not found");
  navigate("/campaigns");
}
```

### 10.5. Błąd serwera (500 Internal Server Error)

**Scenariusz**: Nieoczekiwany błąd na serwerze

**Obsługa**:
- Toast: "Something went wrong. Please try again later."
- Logowanie błędu do konsoli dla debugowania
- Modal pozostaje otwarty z danymi
- Opcja "Retry" w toast

**Implementacja**:
```typescript
if (error.status === 500) {
  console.error("Server error:", error);
  toast.error("Something went wrong. Please try again later.");
}
```

### 10.6. Błąd ładowania listy postaci

**Scenariusz**: Nie udało się pobrać listy postaci przy wejściu na stronę

**Obsługa**:
- Wyświetlenie error state zamiast tabeli/empty state
- Komunikat: "Failed to load characters"
- Przycisk "Retry" do ponownej próby
- Opcjonalnie: link "Go back to campaigns"

**Implementacja**:
```typescript
if (error && !isLoading) {
  return (
    <div className="error-state">
      <p>Failed to load characters</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}
```

### 10.7. Optimistic update rollback

**Scenariusz**: Optimistic update (natychmiastowe dodanie do listy) ale request się nie powiódł

**Obsługa**:
- TanStack Query automatycznie cofa zmiany (rollback)
- Wyświetlenie toast z odpowiednim błędem
- Lista wraca do stanu sprzed operacji

**Implementacja**:
```typescript
useMutation({
  // ... mutation config
  onMutate: async (newCharacter) => {
    // Optimistic update
    await queryClient.cancelQueries(queryKey);
    const previousCharacters = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old) => [...old, newCharacter]);
    return { previousCharacters };
  },
  onError: (err, newCharacter, context) => {
    // Rollback
    queryClient.setQueryData(queryKey, context.previousCharacters);
    toast.error("Failed to create character");
  },
});
```

### 10.8. Timeout podczas zapisu

**Scenariusz**: Request trwa zbyt długo (timeout)

**Obsługa**:
- Po 30 sekundach wyświetlenie toast: "Request is taking longer than expected..."
- Opcja anulowania operacji
- Modal pozostaje otwarty
- Po otrzymaniu odpowiedzi (nawet późnej) - standardowa obsługa

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików i routingu

1.1. Utwórz strukturę katalogów:
```
src/pages/campaigns/[id]/characters.astro
src/components/characters/
  ├── PlayerCharactersView.tsx
  ├── CharacterListHeader.tsx
  ├── CharacterList.tsx
  ├── CharacterListTable.tsx
  ├── CharacterListEmpty.tsx
  ├── CharacterFormModal.tsx
  ├── CharacterForm.tsx
  ├── BasicInfoSection.tsx
  ├── AbilityScoresSection.tsx
  ├── AutoCalculatedDisplays.tsx
  ├── ActionsSection.tsx
  ├── ActionsList.tsx
  └── ActionBuilder.tsx
```

1.2. Utwórz plik Astro page `src/pages/campaigns/[id]/characters.astro`:
- Zaimportuj layout
- Pobierz `id` kampanii z `Astro.params`
- Renderuj komponent React `PlayerCharactersView` z `campaignId` jako props

### Krok 2: Implementacja custom hooks dla API

2.1. Utwórz `src/components/characters/hooks/useCharacters.ts`:
- Hook `useCharacters(campaignId)` z TanStack Query
- Query key: `["campaigns", campaignId, "characters"]`
- Fetch function: GET `/api/campaigns/:campaignId/characters`
- Return: `{ characters, isLoading, error, refetch }`

2.2. Utwórz `src/components/characters/hooks/useCreateCharacter.ts`:
- Hook `useCreateCharacter(campaignId)` z useMutation
- POST `/api/campaigns/:campaignId/characters`
- onSuccess: invalidate query + close modal + toast
- onError: obsługa błędów (409, 400, 500)

2.3. Utwórz `src/components/characters/hooks/useUpdateCharacter.ts`:
- Hook `useUpdateCharacter(campaignId)` z useMutation
- PATCH `/api/campaigns/:campaignId/characters/:id`
- onSuccess: invalidate query + close modal + toast
- onError: obsługa błędów

2.4. Utwórz `src/components/characters/hooks/useDeleteCharacter.ts`:
- Hook `useDeleteCharacter(campaignId)` z useMutation
- DELETE `/api/campaigns/:campaignId/characters/:id`
- onSuccess: invalidate query + toast
- onError: obsługa błędów

2.5. Utwórz `src/components/characters/hooks/useCharacterCalculations.ts`:
- Hook `useCharacterCalculations(dexterity, wisdom)`
- useMemo dla obliczeń
- Return: `{ initiativeModifier, passivePerception }`

### Krok 3: Implementacja komponentu głównego PlayerCharactersView

3.1. Utwórz `src/components/characters/PlayerCharactersView.tsx`:
- Props: `campaignId`, opcjonalnie `initialCampaignName`
- Użyj `useCharacters(campaignId)` do pobrania listy
- Stan modalu: `useState<CharacterModalState>`
- Funkcje: `handleAddCharacter`, `handleEditCharacter`, `handleCloseModal`
- Użyj `useDeleteCharacter` dla operacji usuwania

3.2. Renderuj strukturę:
- `CharacterListHeader` z callbackiem do otwierania modalu
- `CharacterList` z listą postaci i callbackami (edit, delete)
- `CharacterFormModal` z odpowiednimi propsami

3.3. Dodaj obsługę stanów ładowania i błędów

### Krok 4: Implementacja CharacterListHeader

4.1. Utwórz `src/components/characters/CharacterListHeader.tsx`:
- Props: `campaignName`, `onAddCharacter`
- Zaimportuj `Breadcrumb` z shadcn/ui
- Breadcrumb levels: "My Campaigns" → `campaignName` → "Characters"
- Dodaj `h1` z tytułem "Player Characters"
- Button "Add Player Character" z ikoną Plus (Lucide) i wariantem emerald

4.2. Stylowanie:
- Flexbox layout z justify-between
- Breadcrumb po lewej, Button po prawej na większych ekranach
- Stack layout na mobile

### Krok 5: Implementacja CharacterList

5.1. Utwórz `src/components/characters/CharacterList.tsx`:
- Props: `characters`, `isLoading`, `onEdit`, `onDelete`
- Warunek: jeśli `isLoading` → skeleton loaders
- Warunek: jeśli `characters.length === 0` → `CharacterListEmpty`
- Warunek: jeśli `characters.length > 0` → `CharacterListTable`

### Krok 6: Implementacja CharacterListTable

6.1. Utwórz `src/components/characters/CharacterListTable.tsx`:
- Props: `characters`, `onEdit`, `onDelete`
- Zaimportuj komponenty Table z shadcn/ui
- Dodaj komponent `npx shadcn@latest add table` jeśli nie istnieje

6.2. Funkcja transformacji `toTableRow`:
```typescript
const toTableRow = (char: PlayerCharacterDTO): CharacterTableRow => ({
  id: char.id,
  name: char.name,
  max_hp: char.max_hp,
  armor_class: char.armor_class,
  initiativeModifier: Math.floor((char.dexterity - 10) / 2),
  passivePerception: 10 + Math.floor((char.wisdom - 10) / 2),
});
```

6.3. Kolumny tabeli:
- Name
- Max HP
- AC
- Initiative Modifier (z formatowaniem znaku +/-)
- Passive Perception
- Actions (DropdownMenu)

6.4. Dodaj `DropdownMenu` z shadcn/ui dla akcji:
- Item "Edit" z ikoną Pencil
- Separator
- Item "Delete" z ikoną Trash (wariant destructive)

### Krok 7: Implementacja CharacterListEmpty

7.1. Utwórz `src/components/characters/CharacterListEmpty.tsx`:
- Props: `onAddCharacter`
- Wycentrowany layout
- Ikona Users lub UserPlus z Lucide (duży rozmiar, przyciemniona)
- Heading: "No characters yet"
- Description: "Add your first player character to get started"
- Button "Add Character" (wariant emerald)

### Krok 8: Implementacja CharacterFormModal

8.1. Utwórz `src/components/characters/CharacterFormModal.tsx`:
- Props: `isOpen`, `mode`, `character`, `campaignId`, `onClose`, `onSuccess`
- Dodaj komponenty Dialog: `npx shadcn@latest add dialog`
- Użyj `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`

8.2. Logika submit:
- Użyj odpowiedniego hooka (create/update) na podstawie `mode`
- Submit form data
- onSuccess: wywołaj `onSuccess()` callback

8.3. Dialogowanie przy zamykaniu z niezapisanymi zmianami:
- Sprawdź `form.formState.isDirty`
- Jeśli true, pokaż AlertDialog z potwierdzeniem
- Dodaj `npx shadcn@latest add alert-dialog`

### Krok 9: Implementacja CharacterForm i sekcji

9.1. Utwórz `src/components/characters/CharacterForm.tsx`:
- Props: `mode`, `defaultValues`, `campaignId`, `onSubmit`, `onCancel`
- Użyj `useForm` z `@hookform/resolvers/zod`
- Schemat: `CreatePlayerCharacterCommandSchema` lub `UpdatePlayerCharacterCommandSchema`
- Watch `dexterity` i `wisdom` dla obliczeń
- Renderuj wszystkie sekcje formularza

9.2. Utwórz `src/components/characters/BasicInfoSection.tsx`:
- Props: `form` (UseFormReturn)
- Grid 2x2 layout
- 4 pola: Name, Max HP, AC, Speed
- Użyj `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `FormMessage`
- Auto-focus na polu Name: `autoFocus` prop

9.3. Utwórz `src/components/characters/AbilityScoresSection.tsx`:
- Props: `form`
- Grid 2x3 layout (responsive: 2 cols mobile, 3 cols desktop)
- 6 pól: STR, DEX, CON, INT, WIS, CHA
- Labele z pełną nazwą i skrótem: "Strength (STR)"
- Type: number, min 1, max 30

9.4. Utwórz `src/components/characters/AutoCalculatedDisplays.tsx`:
- Props: `dexterity`, `wisdom`
- Użyj hooka `useCharacterCalculations`
- 2 Badge komponenty (shadcn) w kolorze emerald
- Aria-live="polite" dla accessibility
- Format: "Initiative Modifier: +X", "Passive Perception: X"

### Krok 10: Implementacja sekcji Actions

10.1. Utwórz `src/components/characters/ActionsSection.tsx`:
- Props: `form`
- Użyj `useFieldArray` z react-hook-form dla `actions`
- Dodaj Accordion z shadcn: `npx shadcn@latest add accordion`
- Nagłówek: "Actions (optional)"

10.2. Utwórz `src/components/characters/ActionsList.tsx`:
- Props: `actions`, `onRemove`
- Mapuj przez actions i renderuj karty
- Każda karta: Name (bold), Type (badge), Button Remove
- Jeśli brak akcji: "No actions added yet"

10.3. Utwórz `src/components/characters/ActionBuilder.tsx`:
- Props: `onAdd`, `maxActionsReached`
- Local state dla budowanej akcji
- Pola: Name, Type (Select), Attack Bonus, Reach/Range (conditional), Damage Dice, Damage Bonus, Damage Type
- Dodaj Select: `npx shadcn@latest add select`
- Button "Add Action" disabled jeśli `maxActionsReached`
- Reset pól po dodaniu

### Krok 11: Stylowanie i accessibility

11.1. Dodaj globalne style dla formularza:
- Focus visible states
- Error states (czerwone obramowanie)
- Disabled states (przyciemnione)

11.2. ARIA labels:
- Wszystkie inputs mają powiązane labele
- Error messages powiązane przez `aria-describedby`
- Dialog ma `aria-labelledby` wskazujący na tytuł

11.3. Keyboard navigation:
- Tab order logiczny
- Enter submituje formularz
- Escape zamyka modal (z potwierdzeniem)
- Focus trap w modalu (obsługiwane przez shadcn Dialog)

### Krok 12: Toast notifications

12.1. Dodaj Toaster z shadcn: `npx shadcn@latest add toast`

12.2. Skonfiguruj toasty dla operacji:
- Success: "Character created successfully", "Character updated successfully", "Character deleted successfully"
- Error: odpowiednie komunikaty z sekcji 10 (obsługa błędów)
- Position: bottom-right
- Duration: 5 sekund (error: 7 sekund)

### Krok 13: Testy manualne i edge cases

13.1. Test flows:
- Dodawanie postaci z minimalnymi danymi (tylko wymagane pola)
- Dodawanie postaci z wszystkimi polami i akcjami
- Edycja postaci (zmiana pojedynczych pól)
- Usuwanie postaci
- Konflikt nazwy (dodanie postaci o istniejącej nazwie)
- Anulowanie formularza z niezapisanymi zmianami
- Dodanie 20 akcji (max limit)
- Zmiana atrybutów i obserwacja obliczeń
- Empty state → dodanie pierwszej postaci → wyświetlenie tabeli

13.2. Test responsywności:
- Mobile (stacked layout)
- Tablet (grid 2 cols)
- Desktop (grid 3 cols dla atrybutów)

13.3. Test accessibility:
- Nawigacja klawiaturą (Tab, Shift+Tab, Enter, Escape)
- Focus trap w modalu
- Screen reader announcements (aria-live)
- Labele i error messages

### Krok 14: Optymalizacje

14.1. Memoizacja:
- `React.memo` dla komponentów, które re-renderują się często (table rows)
- `useMemo` dla transformacji danych (toTableRow)
- `useCallback` dla event handlerów przekazywanych do dzieci

14.2. Code splitting:
- Lazy load modalu jeśli nie jest otwarty
- Dynamic imports dla dużych komponentów

14.3. Optimistic updates:
- Dodaj optimistic update dla create/update (opcjonalne)
- Rollback przy błędzie

### Krok 15: Dokumentacja i cleanup

15.1. Dodaj JSDoc comments do wszystkich komponentów i hooków

15.2. Sprawdź i popraw TypeScript errors/warnings

15.3. Uruchom linter: `npm run lint` i popraw problemy

15.4. Sformatuj kod: `npm run format`

### Krok 16: Integracja z resztą aplikacji

16.1. Dodaj link do widoku w nawigacji/sidebar:
- Path: `/campaigns/:id/characters`
- Label: "Characters"
- Icon: Users (Lucide)

16.2. Breadcrumb integration:
- Pobierz nazwę kampanii z query lub Zustand store
- Jeśli brak, fetch `/api/campaigns/:id` dla nazwy

16.3. Test integracyjny:
- Przejście z listy kampanii do widoku postaci
- Przejście z widoku postaci do modułu walki (w przyszłości)

---

**Koniec planu implementacji**

Ten plan stanowi kompletny przewodnik do implementacji widoku Player Characters. Każdy krok zawiera szczegółowe instrukcje, a architektura została zaprojektowana z myślą o skalowalności, dostępności i dobrych praktykach React/TypeScript.
