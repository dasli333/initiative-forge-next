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

### 1.7. locations

Hierarchiczne lokacje w kampaniach (World Building).

| Kolumna            | Typ                      | Ograniczenia                                         | Opis                                      |
| ------------------ | ------------------------ | ---------------------------------------------------- | ----------------------------------------- |
| id                 | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator lokacji            |
| campaign_id        | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                    |
| name               | text                     | NOT NULL                                             | Nazwa lokacji                             |
| location_type      | text                     | NOT NULL                                             | Typ lokacji (kontynent/miasto/budynek...) |
| description_json   | jsonb                    |                                                      | Opis (rich text z @mentions)              |
| parent_location_id | uuid                     | REFERENCES locations(id) ON DELETE SET NULL          | Lokacja nadrzędna (hierarchia)            |
| image_url          | text                     |                                                      | URL obrazu (Supabase Storage)             |
| coordinates_json   | jsonb                    |                                                      | Opcjonalne współrzędne (lat/lng)          |
| created_at         | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                           |
| updated_at         | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                |

### 1.8. npcs

Postacie niezależne w kampaniach (NPCs - dual-tab: story + optional combat).

| Kolumna             | Typ                      | Ograniczenia                                         | Opis                                           |
| ------------------- | ------------------------ | ---------------------------------------------------- | ---------------------------------------------- |
| id                  | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator NPC                     |
| campaign_id         | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                         |
| name                | text                     | NOT NULL                                             | Imię NPC                                       |
| role                | text                     |                                                      | Rola (Tavernkeeper, Quest Giver, Villain...)   |
| biography_json      | jsonb                    |                                                      | Biografia (rich text z @mentions)              |
| personality_json    | jsonb                    |                                                      | Osobowość (rich text)                          |
| image_url           | text                     |                                                      | URL obrazu (Supabase Storage)                  |
| faction_id          | uuid                     | REFERENCES factions(id) ON DELETE SET NULL           | Przynależność do frakcji                       |
| current_location_id | uuid                     | REFERENCES locations(id) ON DELETE SET NULL          | Aktualna lokacja NPC                           |
| status              | text                     | NOT NULL, DEFAULT 'alive'                            | Status (alive/dead/unknown)                    |
| created_at          | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                |
| updated_at          | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                     |

### 1.9. npc_combat_stats

Opcjonalne statystyki walki dla NPCs (zakładka Combat).

| Kolumna      | Typ                      | Ograniczenia                                  | Opis                                 |
| ------------ | ------------------------ | --------------------------------------------- | ------------------------------------ |
| npc_id       | uuid                     | PRIMARY KEY, REFERENCES npcs(id) ON DELETE CASCADE | ID NPC (relacja 1:1)                 |
| hp_max       | smallint                 | NOT NULL                                      | Maksymalne punkty życia              |
| armor_class  | smallint                 | NOT NULL                                      | Klasa pancerza                       |
| speed        | smallint                 | NOT NULL                                      | Szybkość poruszania                  |
| strength     | smallint                 | NOT NULL                                      | Atrybut: Siła                        |
| dexterity    | smallint                 | NOT NULL                                      | Atrybut: Zręczność                   |
| constitution | smallint                 | NOT NULL                                      | Atrybut: Kondycja                    |
| intelligence | smallint                 | NOT NULL                                      | Atrybut: Inteligencja                |
| wisdom       | smallint                 | NOT NULL                                      | Atrybut: Mądrość                     |
| charisma     | smallint                 | NOT NULL                                      | Atrybut: Charyzma                    |
| actions_json | jsonb                    |                                               | Lista akcji (format jak PC.actions)  |
| created_at   | timestamp with time zone | NOT NULL, DEFAULT now()                       | Data utworzenia                      |
| updated_at   | timestamp with time zone | NOT NULL, DEFAULT now()                       | Data ostatniej modyfikacji           |

### 1.10. quests

Zadania/questy w kampaniach.

| Kolumna          | Typ                      | Ograniczenia                                         | Opis                                                        |
| ---------------- | ------------------------ | ---------------------------------------------------- | ----------------------------------------------------------- |
| id               | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator questa                               |
| campaign_id      | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                                      |
| story_arc_id     | uuid                     | REFERENCES story_arcs(id) ON DELETE SET NULL         | Przypisanie do wątku fabularnego                            |
| title            | text                     | NOT NULL                                             | Tytuł questa                                                |
| description_json | jsonb                    |                                                      | Opis (rich text z @mentions)                                |
| objectives_json  | jsonb                    |                                                      | Lista celów                                                 |
| rewards_json     | jsonb                    |                                                      | Nagrody strukturalne (gold, items, XP, other)               |
| status           | text                     | NOT NULL, DEFAULT 'not_started'                      | Status (not_started/active/completed/failed)                |
| created_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                             |
| updated_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                                  |

### 1.11. story_arcs

Wątki fabularne w kampaniach.

| Kolumna          | Typ                      | Ograniczenia                                         | Opis                                            |
| ---------------- | ------------------------ | ---------------------------------------------------- | ----------------------------------------------- |
| id               | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator wątku                    |
| campaign_id      | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                          |
| title            | text                     | NOT NULL                                             | Tytuł wątku fabularnego                         |
| description_json | jsonb                    |                                                      | Opis (rich text z @mentions)                    |
| status           | text                     | NOT NULL, DEFAULT 'planning'                         | Status (planning/active/completed/abandoned)    |
| start_date       | text                     |                                                      | Data rozpoczęcia (in-game, fantasy calendar)    |
| end_date         | text                     |                                                      | Data zakończenia (in-game)                      |
| created_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                 |
| updated_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                      |

### 1.12. factions

Frakcje/organizacje w kampaniach.

| Kolumna          | Typ                      | Ograniczenia                                         | Opis                               |
| ---------------- | ------------------------ | ---------------------------------------------------- | ---------------------------------- |
| id               | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator frakcji     |
| campaign_id      | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii             |
| name             | text                     | NOT NULL                                             | Nazwa frakcji                      |
| description_json | jsonb                    |                                                      | Opis (rich text z @mentions)       |
| goals_json       | jsonb                    |                                                      | Cele (rich text)                   |
| resources_json   | jsonb                    |                                                      | Opcjonalnie zasoby (future)        |
| image_url        | text                     |                                                      | URL obrazu (Supabase Storage)      |
| created_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                    |
| updated_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji         |

### 1.13. lore_notes

Notatki o świecie kampanii (Lore).

| Kolumna      | Typ                      | Ograniczenia                                         | Opis                                                     |
| ------------ | ------------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| id           | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator notatki                           |
| campaign_id  | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                                   |
| title        | text                     | NOT NULL                                             | Tytuł notatki                                            |
| content_json | jsonb                    |                                                      | Treść (rich text z @mentions)                            |
| category     | text                     | NOT NULL                                             | Kategoria (Historia/Geografia/Religia/Kultura/Magia...) |
| tags         | text[]                   |                                                      | Tagi (array)                                             |
| created_at   | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                          |
| updated_at   | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                               |

### 1.14. story_items

Przedmioty fabularne (nie combat equipment).

| Kolumna                | Typ                      | Ograniczenia                                         | Opis                                         |
| ---------------------- | ------------------------ | ---------------------------------------------------- | -------------------------------------------- |
| id                     | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator przedmiotu            |
| campaign_id            | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                       |
| name                   | text                     | NOT NULL                                             | Nazwa przedmiotu                             |
| description_json       | jsonb                    |                                                      | Opis (rich text z @mentions)                 |
| image_url              | text                     |                                                      | URL obrazu (Supabase Storage)                |
| current_owner_type     | text                     |                                                      | Typ właściciela (npc/pc/faction/location...) |
| current_owner_id       | uuid                     |                                                      | ID właściciela (polymorphic)                 |
| ownership_history_json | jsonb                    |                                                      | Historia własności (opcjonalnie)             |
| created_at             | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                              |
| updated_at             | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                   |

### 1.15. timeline_events

Oś czasu wydarzeń w kampanii.

| Kolumna                | Typ                      | Ograniczenia                                         | Opis                                           |
| ---------------------- | ------------------------ | ---------------------------------------------------- | ---------------------------------------------- |
| id                     | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator wydarzenia              |
| campaign_id            | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                         |
| title                  | text                     | NOT NULL                                             | Tytuł wydarzenia                               |
| description_json       | jsonb                    |                                                      | Opis (rich text z @mentions)                   |
| event_date             | text                     | NOT NULL                                             | Data in-game (fantasy calendar)                |
| real_date              | date                     |                                                      | Opcjonalna data rzeczywista                    |
| related_entities_json  | jsonb                    |                                                      | Powiązane encje (npcs, locations, quests...)   |
| source_type            | text                     |                                                      | Źródło (manual/session_log)                    |
| source_id              | uuid                     |                                                      | ID źródła (np. session_id)                     |
| created_at             | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                                |
| updated_at             | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                     |

### 1.16. sessions

Plany i logi sesji (Session Prep + Journal).

| Kolumna        | Typ                      | Ograniczenia                                         | Opis                                          |
| -------------- | ------------------------ | ---------------------------------------------------- | --------------------------------------------- |
| id             | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator sesji                  |
| campaign_id    | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                        |
| session_number | integer                  | NOT NULL                                             | Numer sesji                                   |
| session_date   | date                     | NOT NULL                                             | Data rzeczywista sesji                        |
| in_game_date   | text                     |                                                      | Data in-game (fantasy calendar)               |
| title          | text                     |                                                      | Tytuł sesji                                   |
| plan_json      | jsonb                    |                                                      | Dane session prep                             |
| log_json       | jsonb                    |                                                      | Dane session journal                          |
| status         | text                     | NOT NULL, DEFAULT 'draft'                            | Status (draft/ready/in_progress/completed)    |
| created_at     | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                               |
| updated_at     | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data ostatniej modyfikacji                    |
| **UNIQUE**     | (campaign_id, session_number) |                                                 | Numer sesji unikalny w ramach kampanii        |

### 1.17. entity_mentions

Śledzenie @mentions między encjami (dla backlinks).

| Kolumna          | Typ                      | Ograniczenia                                         | Opis                                        |
| ---------------- | ------------------------ | ---------------------------------------------------- | ------------------------------------------- |
| id               | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()               | Unikalny identyfikator mention              |
| campaign_id      | uuid                     | NOT NULL, REFERENCES campaigns(id) ON DELETE CASCADE | Identyfikator kampanii                      |
| source_type      | text                     | NOT NULL                                             | Typ źródła (npc/location/quest/session...)  |
| source_id        | uuid                     | NOT NULL                                             | ID źródła                                   |
| source_field     | text                     | NOT NULL                                             | Pole źródła (biography/description...)      |
| mentioned_type   | text                     | NOT NULL                                             | Typ wspomnianej encji                       |
| mentioned_id     | uuid                     | NOT NULL                                             | ID wspomnianej encji                        |
| created_at       | timestamp with time zone | NOT NULL, DEFAULT now()                              | Data utworzenia                             |

### 1.18. npc_relationships

Relacje między NPCs (free text).

| Kolumna           | Typ                      | Ograniczenia                                  | Opis                                  |
| ----------------- | ------------------------ | --------------------------------------------- | ------------------------------------- |
| id                | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()        | Unikalny identyfikator relacji        |
| npc_id_1          | uuid                     | NOT NULL, REFERENCES npcs(id) ON DELETE CASCADE | Pierwszy NPC                          |
| npc_id_2          | uuid                     | NOT NULL, REFERENCES npcs(id) ON DELETE CASCADE | Drugi NPC                             |
| relationship_type | text                     | NOT NULL                                      | Typ relacji (free text: brother/enemy...) |
| description       | text                     |                                               | Dodatkowy opis relacji                |
| strength          | smallint                 | DEFAULT 50                                    | Siła relacji (0-100, opcjonalnie)     |
| created_at        | timestamp with time zone | NOT NULL, DEFAULT now()                       | Data utworzenia                       |
| **CHECK**         | npc_id_1 != npc_id_2     |                                               | Relacja nie może być ze sobą          |

### 1.19. faction_relationships

Relacje między frakcjami (free text).

| Kolumna           | Typ                      | Ograniczenia                                      | Opis                                         |
| ----------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------- |
| id                | uuid                     | PRIMARY KEY, DEFAULT gen_random_uuid()            | Unikalny identyfikator relacji               |
| faction_id_1      | uuid                     | NOT NULL, REFERENCES factions(id) ON DELETE CASCADE | Pierwsza frakcja                             |
| faction_id_2      | uuid                     | NOT NULL, REFERENCES factions(id) ON DELETE CASCADE | Druga frakcja                                |
| relationship_type | text                     | NOT NULL                                          | Typ relacji (alliance/war/rivalry/neutral)   |
| description       | text                     |                                                   | Dodatkowy opis relacji                       |
| created_at        | timestamp with time zone | NOT NULL, DEFAULT now()                           | Data utworzenia                              |
| **CHECK**         | faction_id_1 != faction_id_2 |                                               | Relacja nie może być ze sobą                 |

### 1.20. quest_entities

Powiązania questów z encjami (many-to-many).

| Kolumna     | Typ  | Ograniczenia                                  | Opis                                         |
| ----------- | ---- | --------------------------------------------- | -------------------------------------------- |
| quest_id    | uuid | NOT NULL, REFERENCES quests(id) ON DELETE CASCADE | ID questa                                    |
| entity_type | text | NOT NULL                                      | Typ encji (npc/location)                     |
| entity_id   | uuid | NOT NULL                                      | ID encji                                     |
| role        | text |                                               | Rola encji (quest_giver/target/location...)  |
| **PRIMARY KEY** | (quest_id, entity_type, entity_id) |                    | Composite PK                                 |

## 2. Relacje między tabelami

- **auth.users → campaigns** (1:N)
  Jeden użytkownik może mieć wiele kampanii. Klucz obcy: `campaigns.user_id` → `auth.users.id` (ON DELETE CASCADE)

- **campaigns → player_characters** (1:N)
  Jedna kampania może mieć wiele postaci graczy. Klucz obcy: `player_characters.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → combats** (1:N)
  Jedna kampania może mieć wiele walk. Klucz obcy: `combats.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → locations** (1:N)
  Jedna kampania może mieć wiele lokacji. Klucz obcy: `locations.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **locations → locations** (1:N - hierarchia)
  Lokacja może mieć lokację nadrzędną. Klucz obcy: `locations.parent_location_id` → `locations.id` (ON DELETE SET NULL)

- **campaigns → npcs** (1:N)
  Jedna kampania może mieć wiele NPCs. Klucz obcy: `npcs.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **npcs → npc_combat_stats** (1:1)
  NPC może mieć opcjonalne statystyki walki. Klucz obcy: `npc_combat_stats.npc_id` → `npcs.id` (ON DELETE CASCADE)

- **factions → npcs** (1:N)
  Frakcja może mieć wielu członków NPCs. Klucz obcy: `npcs.faction_id` → `factions.id` (ON DELETE SET NULL)

- **locations → npcs** (1:N)
  Lokacja może mieć wielu NPCs. Klucz obcy: `npcs.current_location_id` → `locations.id` (ON DELETE SET NULL)

- **campaigns → quests** (1:N)
  Jedna kampania może mieć wiele questów. Klucz obcy: `quests.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **story_arcs → quests** (1:N)
  Story arc może mieć wiele questów. Klucz obcy: `quests.story_arc_id` → `story_arcs.id` (ON DELETE SET NULL)

- **campaigns → story_arcs** (1:N)
  Jedna kampania może mieć wiele wątków fabularnych. Klucz obcy: `story_arcs.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → factions** (1:N)
  Jedna kampania może mieć wiele frakcji. Klucz obcy: `factions.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → lore_notes** (1:N)
  Jedna kampania może mieć wiele notatek lore. Klucz obcy: `lore_notes.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → story_items** (1:N)
  Jedna kampania może mieć wiele przedmiotów fabularnych. Klucz obcy: `story_items.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → timeline_events** (1:N)
  Jedna kampania może mieć wiele wydarzeń na osi czasu. Klucz obcy: `timeline_events.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → sessions** (1:N)
  Jedna kampania może mieć wiele sesji. Klucz obcy: `sessions.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **campaigns → entity_mentions** (1:N)
  Jedna kampania może mieć wiele mentions. Klucz obcy: `entity_mentions.campaign_id` → `campaigns.id` (ON DELETE CASCADE)

- **npcs → npc_relationships** (1:N dla każdego npc_id)
  NPCs mogą mieć relacje między sobą. Klucze obce: `npc_relationships.npc_id_1` i `npc_relationships.npc_id_2` → `npcs.id` (ON DELETE CASCADE)

- **factions → faction_relationships** (1:N dla każdego faction_id)
  Frakcje mogą mieć relacje między sobą. Klucze obce: `faction_relationships.faction_id_1` i `faction_relationships.faction_id_2` → `factions.id` (ON DELETE CASCADE)

- **quests → quest_entities** (1:N)
  Quest może być powiązany z wieloma encjami. Klucz obcy: `quest_entities.quest_id` → `quests.id` (ON DELETE CASCADE)

## 3. Indeksy

### 3.1. Indeksy B-Tree (standardowe)

```sql
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_player_characters_campaign_id ON player_characters(campaign_id);
CREATE INDEX idx_monsters_name ON monsters(name);
CREATE INDEX idx_spells_name ON spells(name);
CREATE INDEX idx_combats_campaign_id ON combats(campaign_id);

-- World Building indices
CREATE INDEX idx_locations_campaign_id ON locations(campaign_id);
CREATE INDEX idx_locations_parent_id ON locations(parent_location_id);
CREATE INDEX idx_npcs_campaign_id ON npcs(campaign_id);
CREATE INDEX idx_npcs_faction_id ON npcs(faction_id);
CREATE INDEX idx_npcs_location_id ON npcs(current_location_id);
CREATE INDEX idx_quests_campaign_id ON quests(campaign_id);
CREATE INDEX idx_quests_arc_id ON quests(story_arc_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_story_arcs_campaign_id ON story_arcs(campaign_id);
CREATE INDEX idx_story_arcs_status ON story_arcs(status);
CREATE INDEX idx_factions_campaign_id ON factions(campaign_id);
CREATE INDEX idx_lore_notes_campaign_id ON lore_notes(campaign_id);
CREATE INDEX idx_lore_notes_category ON lore_notes(category);
CREATE INDEX idx_story_items_campaign_id ON story_items(campaign_id);
CREATE INDEX idx_story_items_owner ON story_items(current_owner_type, current_owner_id);
CREATE INDEX idx_timeline_events_campaign_id ON timeline_events(campaign_id);
CREATE INDEX idx_timeline_events_date ON timeline_events(event_date);
CREATE INDEX idx_sessions_campaign_id ON sessions(campaign_id);
CREATE INDEX idx_sessions_number ON sessions(session_number);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_entity_mentions_source ON entity_mentions(source_type, source_id);
CREATE INDEX idx_entity_mentions_mentioned ON entity_mentions(mentioned_type, mentioned_id);
CREATE INDEX idx_entity_mentions_campaign_id ON entity_mentions(campaign_id);
```

### 3.2. Indeksy GIN (dla kolumn jsonb)

Umożliwiają efektywne filtrowanie po zagnieżdżonych w jsonb danych (np. challenge_rating, level) oraz wyszukiwanie w snapshots walki.

```sql
CREATE INDEX idx_monsters_data_gin ON monsters USING GIN(data);
CREATE INDEX idx_spells_data_gin ON spells USING GIN(data);
CREATE INDEX idx_combats_state_snapshot_gin ON combats USING GIN(state_snapshot);

-- World Building GIN indices (dla rich text i JSONB)
CREATE INDEX idx_locations_description_gin ON locations USING GIN(description_json);
CREATE INDEX idx_npcs_biography_gin ON npcs USING GIN(biography_json);
CREATE INDEX idx_quests_description_gin ON quests USING GIN(description_json);
CREATE INDEX idx_lore_notes_content_gin ON lore_notes USING GIN(content_json);
CREATE INDEX idx_lore_notes_tags_gin ON lore_notes USING GIN(tags);
CREATE INDEX idx_sessions_plan_gin ON sessions USING GIN(plan_json);
CREATE INDEX idx_sessions_log_gin ON sessions USING GIN(log_json);
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
