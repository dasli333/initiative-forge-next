# Schemat Bazy Danych PostgreSQL - Initiative Forge MVP

## 1. Tabele

### 1.1. campaigns

Przechowuje kampanie użytkowników (Mistrzów Gry).

| Kolumna    | Typ                      | Ograniczenia                                          | Opis                                         |
| ---------- | ------------------------ | ----------------------------------------------------- | -------------------------------------------- |
| id         | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()                | Unikalny identyfikator kampanii              |
| user_id    | uuid                     | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Identyfikator właściciela (DM)               |
| name       | text                     | NOT NULL                                              | Nazwa kampanii                               |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now()                               | Data utworzenia                              |
| updated_at | timestamp with time zone | NOT NULL, DEFAULT now()                               | Data ostatniej modyfikacji                   |
| **UNIQUE** | (user_id, name)          |                                                       | Nazwa kampanii unikalna w ramach użytkownika |

### 1.2. player_characters

Uproszczone karty postaci graczy w kampaniach.

| Kolumna      | Typ                      | Ograniczenia                                         | Opis                                                |
| ------------ | ------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| id           | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator postaci                      |
| campaign_id  | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                              |
| name         | text                     | NOT NULL                                             | Imię postaci                                        |
| max_hp       | smallint                 | NOT NULL                                             | Maksymalne punkty życia                             |
| armor_class  | smallint                 | NOT NULL                                             | Klasa pancerza (AC)                                 |
| speed        | smallint                 | NOT NULL                                             | Szybkość poruszania się                             |
| strength     | smallint                 | NOT NULL                                             | Atrybut: Siła                                       |
| dexterity    | smallint                 | NOT NULL                                             | Atrybut: Zręczność                                  |
| constitution | smallint                 | NOT NULL                                             | Atrybut: Kondycja                                   |
| intelligence | smallint                 | NOT NULL                                             | Atrybut: Inteligencja                               |
| wisdom       | smallint                 | NOT NULL                                             | Atrybut: Mądrość                                    |
| charisma     | smallint                 | NOT NULL                                             | Atrybut: Charyzma                                   |
| actions      | jsonb                    |                                                      | Akcje dostępne dla postaci (format: array obiektów) |
| created_at   | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                     |
| updated_at   | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                          |
| **UNIQUE**   | (campaign_id, name)      |                                                      | Imię postaci unikalne w ramach kampanii             |

### 1.3. monsters

Globalna biblioteka potworów (dane SRD).

| Kolumna    | Typ                      | Ograniczenia                           | Opis                                                          |
| ---------- | ------------------------ | -------------------------------------- | ------------------------------------------------------------- |
| id         | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator potwora                                |
| name       | text                     | NOT NULL                               | Nazwa potwora (wydzielone z jsonb)                            |
| data       | jsonb                    | NOT NULL                               | Wszystkie pozostałe dane potwora (CR, statystyki, akcje itp.) |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now()                | Data utworzenia                                               |

### 1.4. spells

Globalna biblioteka czarów (dane SRD).

| Kolumna    | Typ                      | Ograniczenia                           | Opis                                                     |
| ---------- | ------------------------ | -------------------------------------- | -------------------------------------------------------- |
| id         | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator czaru                             |
| name       | text                     | NOT NULL                               | Nazwa czaru (wydzielone z jsonb)                         |
| data       | jsonb                    | NOT NULL                               | Wszystkie pozostałe dane czaru (level, klasy, opis itp.) |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now()                | Data utworzenia                                          |

### 1.5. combats

Reprezentuje pojedynczą walkę w ramach kampanii.

| Kolumna        | Typ                      | Ograniczenia                                         | Opis                                                     |
| -------------- | ------------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| id             | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator walki                             |
| campaign_id    | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                                   |
| name           | text                     | NOT NULL                                             | Nazwa walki (np. "Walka w karczmie")                     |
| status         | text                     | NOT NULL, DEFAULT 'active'                           | Status walki ('active', 'completed')                     |
| current_round  | smallint                 | NOT NULL, DEFAULT 1                                  | Numer aktualnej rundy                                    |
| state_snapshot | jsonb                    |                                                      | Snapshot stanu walki (uczestnicy, HP, inicjatywy, stany) |
| created_at     | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                          |
| updated_at     | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                               |

### 1.6. conditions

Statyczna tabela definicji stanów D&D 5e (np. "Oślepiony", "Oszołomiony").

| Kolumna     | Typ  | Ograniczenia                           | Opis                                   |
| ----------- | ---- | -------------------------------------- | -------------------------------------- |
| id          | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unikalny identyfikator stanu           |
| name        | text | NOT NULL, UNIQUE                       | Nazwa stanu (np. "Blinded", "Stunned") |
| description | text | NOT NULL                               | Pełny opis zasad działania stanu       |

## 2. Relacje między tabelami

- **auth.users → campaigns** (1:N)
  Jeden użytkownik może mieć wiele kampanii. Klucz obcy: `campaigns.user_id` → `auth.users.id` (ON DELETE CASCADE)

- **campaigns → player_characters** (1:N)
  Jedna kampania może mieć wiele postaci graczy. Klucz obcy: `player_characters.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → combats** (1:N)
  Jedna kampania może mieć wiele walk. Klucz obcy: `combats.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

## 3. Indeksy

### 3.1. Indeksy B-Tree (standardowe)

```sql
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_player_characters_campaign_id ON player_characters(campaign_id);
CREATE INDEX idx_monsters_name ON monsters(name);
CREATE INDEX idx_spells_name ON spells(name);
CREATE INDEX idx_combats_campaign_id ON combats(campaign_id);
```

### 3.2. Indeksy GIN (dla kolumn jsonb)

Umożliwiają efektywne filtrowanie po zagnieżdżonych w jsonb danych (np. challenge_rating, level) oraz wyszukiwanie w snapshots walki.

```sql
CREATE INDEX idx_monsters_data_gin ON monsters USING GIN(data);
CREATE INDEX idx_spells_data_gin ON spells USING GIN(data);
CREATE INDEX idx_combats_state_snapshot_gin ON combats USING GIN(state_snapshot);
```

## 4. Polityki Row Level Security (RLS)

### 4.1. Włączenie RLS dla tabel użytkowników

```sql
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE combats ENABLE ROW LEVEL SECURITY;
```

### 4.2. Polityki dla campaigns

```sql
-- SELECT: Użytkownik widzi tylko swoje kampanie
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Użytkownik może tworzyć tylko swoje kampanie
CREATE POLICY "Users can create own campaigns" ON campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Użytkownik może edytować tylko swoje kampanie
CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Użytkownik może usuwać tylko swoje kampanie
CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 4.3. Polityki dla player_characters

```sql
-- SELECT: Użytkownik widzi postacie tylko ze swoich kampanii
CREATE POLICY "Users can view characters from own campaigns" ON player_characters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = player_characters.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- INSERT: Użytkownik może dodawać postacie tylko do swoich kampanii
CREATE POLICY "Users can create characters in own campaigns" ON player_characters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- UPDATE: Użytkownik może edytować postacie tylko ze swoich kampanii
CREATE POLICY "Users can update characters from own campaigns" ON player_characters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = player_characters.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- DELETE: Użytkownik może usuwać postacie tylko ze swoich kampanii
CREATE POLICY "Users can delete characters from own campaigns" ON player_characters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = player_characters.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );
```

### 4.4. Polityki dla combats

```sql
-- SELECT: Użytkownik widzi walki tylko ze swoich kampanii
CREATE POLICY "Users can view combats from own campaigns" ON combats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = combats.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- INSERT: Użytkownik może tworzyć walki tylko w swoich kampaniach
CREATE POLICY "Users can create combats in own campaigns" ON combats
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- UPDATE: Użytkownik może edytować walki tylko ze swoich kampanii
CREATE POLICY "Users can update combats from own campaigns" ON combats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = combats.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- DELETE: Użytkownik może usuwać walki tylko ze swoich kampanii
CREATE POLICY "Users can delete combats from own campaigns" ON combats
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = combats.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );
```

### 4.5. Publiczny dostęp do globalnych bibliotek

Tabele `monsters`, `spells` i `conditions` są publicznie dostępne do odczytu dla wszystkich użytkowników (również niezalogowanych).

```sql
-- Włącz RLS dla bibliotek
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- Publiczny dostęp SELECT dla wszystkich
CREATE POLICY "Public read access to monsters" ON monsters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to spells" ON spells
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to conditions" ON conditions
  FOR SELECT
  TO public
  USING (true);
```

## 5. Dodatkowe uwagi i decyzje projektowe

### 5.1. Architektura Multi-Tenant

Schemat wykorzystuje model multi-tenant oparty na użytkownikach Supabase Auth (`auth.users`). Bezpieczeństwo i izolacja danych zapewniona jest przez mechanizmy RLS na poziomie wiersza w PostgreSQL.

### 5.2. Wykorzystanie typu JSONB

Decyzja o szerokim wykorzystaniu typu `jsonb` dla bibliotek (`monsters.data`, `spells.data`), akcji postaci graczy (`player_characters.actions`) oraz snapshotu stanu walki (`combats.state_snapshot`) wynika z priorytetu prostoty schematu w MVP.

Kompromis polega na niższej wydajności filtrowania po zagnieżdżonych polach (np. `challenge_rating`, `level`) w zamian za elastyczność i szybkość implementacji. Indeksy GIN umożliwiają podstawowe filtrowanie po jsonb.

**Format dla `player_characters.actions`:**

```json
[
  {
    "name": "Atak mieczem długim",
    "type": "melee_weapon_attack",
    "attack_bonus": 5,
    "reach": "5 ft",
    "damage_dice": "1d8",
    "damage_bonus": 3,
    "damage_type": "slashing"
  },
  {
    "name": "Rzut oszczepem",
    "type": "ranged_weapon_attack",
    "attack_bonus": 5,
    "range": "30/120 ft",
    "damage_dice": "1d6",
    "damage_bonus": 3,
    "damage_type": "piercing"
  }
]
```

Ten format jest spójny ze strukturą akcji w `monsters.data`, co upraszcza logikę renderowania w module walki.

### 5.3. Obliczenia po stronie klienta

Modyfikator inicjatywy (na podstawie Zręczności) oraz pasywna percepcja (na podstawie Mądrości) nie są przechowywane w bazie danych. Są dynamicznie obliczane po stronie frontendu (React), co upraszcza schemat, ale przenosi odpowiedzialność za spójność obliczeń na aplikację kliencką.

### 5.4. Model snapshot-based dla walki

Moduł walki wykorzystuje podejście hybrydowe optymalizujące wydajność dla aplikacji single-user (DM):

- **Stan w trakcie walki** zarządzany jest przez Zustand w przeglądarce (zero latencji)
- **Persystencja** realizowana przez kolumnę `state_snapshot` (jsonb) w tabeli `combats`
- **Zapis snapshot** odbywa się:
  - Manualnie (przycisk "Save Combat")
  - Automatycznie po zakończeniu każdej rundy
  - Przy zamykaniu/kończeniu walki

**Format `combats.state_snapshot`:**

```json
{
  "participants": [
    {
      "id": "temp-uuid-1",
      "source": "player_character",
      "player_character_id": "uuid",
      "display_name": "Aragorn",
      "initiative": 18,
      "current_hp": 45,
      "max_hp": 45,
      "armor_class": 16,
      "stats": { "str": 16, "dex": 14, "con": 14, "int": 10, "wis": 12, "cha": 14 },
      "actions": [...],
      "is_active_turn": false,
      "active_conditions": [
        { "condition_id": "uuid", "name": "Blessed", "duration_in_rounds": 3 }
      ]
    },
    {
      "id": "temp-uuid-2",
      "source": "monster",
      "monster_id": "uuid",
      "display_name": "Goblin #1",
      "initiative": 12,
      "current_hp": 7,
      "max_hp": 7,
      "armor_class": 15,
      "stats": { "str": 8, "dex": 14, "con": 10, "int": 10, "wis": 8, "cha": 8 },
      "actions": [...],
      "is_active_turn": true,
      "active_conditions": []
    },
    {
      "id": "temp-uuid-3",
      "source": "ad_hoc_npc",
      "display_name": "Bandit Leader",
      "initiative": 15,
      "current_hp": 25,
      "max_hp": 30,
      "armor_class": 14,
      "stats": { "str": 14, "dex": 12, "con": 12, "int": 10, "wis": 10, "cha": 14 },
      "actions": [...],
      "is_active_turn": false,
      "active_conditions": []
    }
  ],
  "active_participant_index": 1
}
```

Pole `source` określa pochodzenie uczestnika:

- `"player_character"` - postać gracza (zawiera `player_character_id`)
- `"monster"` - potwór z biblioteki (zawiera `monster_id`)
- `"ad_hoc_npc"` - NPC stworzony ad-hoc (brak FK, wszystkie dane w snapshot)

### 5.5. Zarządzanie stanami (Conditions)

Implementacja uproszczona dla MVP z wykorzystaniem JSONB:

- Tabela `conditions` przechowuje globalne definicje stanów (nazwy i opisy) i służy jako referencyjne źródło danych dla UI
- Aktywne stany uczestników walki przechowywane są w `state_snapshot` w tablicy `participants[].active_conditions`
- Format JSON: `[{"condition_id": "uuid", "name": "Blessed", "duration_in_rounds": 3}]`
- `duration_in_rounds` jako NULL oznacza stan bez określonego limitu czasowego
- Pole `name` jest denormalizowane w snapshot dla szybszego dostępu (bez potrzeby JOIN)

### 5.6. Usuwanie kaskadowe

Zastosowano reguły `ON DELETE CASCADE` dla zapewnienia integralności referencyjnej:

- Usunięcie użytkownika (`auth.users`) → usuwa wszystkie jego kampanie
- Usunięcie kampanii → usuwa wszystkie powiązane postaci graczy i walki (wraz z ich snapshots)
- Usunięcie postaci gracza → snapshot pozostaje nienaruszony (zawiera kopię danych)
- Usunięcie potwora z biblioteki → snapshot pozostaje nienaruszony (zawiera kopię danych)

### 5.7. Ograniczenia unikalności

- `campaigns`: UNIQUE(user_id, name) - nazwa kampanii musi być unikalna w ramach konta użytkownika
- `player_characters`: UNIQUE(campaign_id, name) - imię postaci musi być unikalne w ramach kampanii
- `conditions`: UNIQUE(name) - nazwy stanów są unikalne globalnie

### 5.8. Typy danych dla statystyk

Dla atrybutów postaci, punktów życia, klasy pancerza i podobnych wartości liczbowych zastosowano typ `smallint` (zakres -32,768 do 32,767), co jest wystarczające dla wartości w D&D 5e i oszczędza miejsce w porównaniu do `integer`.

### 5.9. Brak osobnej tabeli profilu użytkownika

Dla MVP nie tworzona jest osobna, publiczna tabela profili użytkowników. Wszystkie dane powiązane są bezpośrednio z `user_id` z `auth.users` w Supabase. Jeśli w przyszłości będzie potrzeba przechowywania dodatkowych danych użytkownika (np. avatar, biografia), należy stworzyć tabelę `user_profiles` z relacją 1:1 do `auth.users`.

### 5.10. Potencjalne wąskie gardła wydajnościowe

Zidentyfikowano i zaakceptowano potencjalne wąskie gardło związane z filtrowaniem bibliotek po atrybutach przechowywanych w jsonb (np. `challenge_rating` w `monsters.data`, `level` w `spells.data`). To obszar do monitorowania po wdrożeniu MVP. W razie problemów z wydajnością można rozważyć:

- Wydzielenie często filtrowanych pól do osobnych kolumn
- Użycie indeksów częściowych (partial indexes)
- Wdrożenie cache'owania po stronie aplikacji
