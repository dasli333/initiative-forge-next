# REST API Plan - Initiative Forge MVP

## 1. Resources

The API exposes the following main resources mapped to database tables:

- **Campaigns** → `campaigns` table
- **Player Characters** → `player_characters` table
- **Monsters** → `monsters` table (read-only global library)
- **Spells** → `spells` table (read-only global library)
- **Conditions** → `conditions` table (read-only global library)
- **Combats** → `combats` table

**Note on Authentication**: User authentication is handled by Supabase Auth SDK (client-side) using email/password. Session management uses Supabase cookies. All API endpoints require valid authentication except for the read-only global libraries.

## 2. Endpoints

### 2.1. Campaigns

#### List User's Campaigns

- **Method**: GET
- **Path**: `/api/campaigns`
- **Description**: Returns all campaigns owned by the authenticated user
- **Query Parameters**:
  - `limit` (optional, number): Maximum number of results (default: 50)
  - `offset` (optional, number): Offset for pagination (default: 0)
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "campaigns": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Lost Mines of Phandelver",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication

#### Create Campaign

- **Method**: POST
- **Path**: `/api/campaigns`
- **Description**: Creates a new campaign for the authenticated user
- **Query Parameters**: N/A
- **Request Body**:

```json
{
  "name": "Curse of Strahd"
}
```

- **Response**: 201 Created

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Curse of Strahd",
  "created_at": "2025-01-15T14:20:00Z",
  "updated_at": "2025-01-15T14:20:00Z"
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid input (missing name, empty name)
  - 401 Unauthorized: Missing or invalid authentication
  - 409 Conflict: Campaign name already exists for this user

#### Get Campaign

- **Method**: GET
- **Path**: `/api/campaigns/:id`
- **Description**: Returns a single campaign by ID
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Curse of Strahd",
  "created_at": "2025-01-15T14:20:00Z",
  "updated_at": "2025-01-15T14:20:00Z"
}
```

- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it

#### Update Campaign

- **Method**: PATCH
- **Path**: `/api/campaigns/:id`
- **Description**: Updates campaign name
- **Query Parameters**: N/A
- **Request Body**:

```json
{
  "name": "Curse of Strahd - Season 2"
}
```

- **Response**: 200 OK

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Curse of Strahd - Season 2",
  "created_at": "2025-01-15T14:20:00Z",
  "updated_at": "2025-01-16T09:15:00Z"
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it
  - 409 Conflict: New campaign name already exists for this user

#### Delete Campaign

- **Method**: DELETE
- **Path**: `/api/campaigns/:id`
- **Description**: Deletes a campaign and all associated player characters and combats (CASCADE)
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 204 No Content
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it

### 2.2. Player Characters

#### List Campaign Characters

- **Method**: GET
- **Path**: `/api/campaigns/:campaignId/characters`
- **Description**: Returns all player characters in a campaign
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "characters": [
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "name": "Aragorn",
      "max_hp": 45,
      "armor_class": 16,
      "speed": 30,
      "strength": 16,
      "dexterity": 14,
      "constitution": 14,
      "intelligence": 10,
      "wisdom": 12,
      "charisma": 14,
      "actions": [
        {
          "name": "Longsword Attack",
          "type": "melee_weapon_attack",
          "attack_bonus": 5,
          "reach": "5 ft",
          "damage_dice": "1d8",
          "damage_bonus": 3,
          "damage_type": "slashing"
        }
      ],
      "created_at": "2025-01-15T14:30:00Z",
      "updated_at": "2025-01-15T14:30:00Z"
    }
  ]
}
```

- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it

#### Create Player Character

- **Method**: POST
- **Path**: `/api/campaigns/:campaignId/characters`
- **Description**: Creates a new player character in the campaign
- **Query Parameters**: N/A
- **Request Body**:

```json
{
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
  "actions": [
    {
      "name": "Longbow Attack",
      "type": "ranged_weapon_attack",
      "attack_bonus": 7,
      "range": "150/600 ft",
      "damage_dice": "1d8",
      "damage_bonus": 4,
      "damage_type": "piercing"
    }
  ]
}
```

- **Response**: 201 Created

```json
{
  "id": "uuid",
  "campaign_id": "uuid",
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
  "actions": [
    {
      "name": "Longbow Attack",
      "type": "ranged_weapon_attack",
      "attack_bonus": 7,
      "range": "150/600 ft",
      "damage_dice": "1d8",
      "damage_bonus": 4,
      "damage_type": "piercing"
    }
  ],
  "created_at": "2025-01-16T10:00:00Z",
  "updated_at": "2025-01-16T10:00:00Z"
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid input (missing required fields, invalid stat values)
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it
  - 409 Conflict: Character name already exists in this campaign

#### Get Player Character

- **Method**: GET
- **Path**: `/api/campaigns/:campaignId/characters/:id`
- **Description**: Returns a single player character
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK (same structure as Create response)
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Character or campaign does not exist, or user doesn't own campaign

#### Update Player Character

- **Method**: PATCH
- **Path**: `/api/campaigns/:campaignId/characters/:id`
- **Description**: Updates player character fields
- **Query Parameters**: N/A
- **Request Body**: (partial update, all fields optional)

```json
{
  "name": "Legolas Greenleaf",
  "max_hp": 42,
  "actions": [...]
}
```

- **Response**: 200 OK (full character object)
- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Character or campaign does not exist, or user doesn't own campaign
  - 409 Conflict: New character name already exists in this campaign

#### Delete Player Character

- **Method**: DELETE
- **Path**: `/api/campaigns/:campaignId/characters/:id`
- **Description**: Deletes a player character
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 204 No Content
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Character or campaign does not exist, or user doesn't own campaign

### 2.3. Monsters (Global Library)

#### List Monsters

- **Method**: GET
- **Path**: `/api/monsters`
- **Description**: Returns filtered and paginated list of monsters from the global SRD library
- **Query Parameters**:
  - `name` (optional, string): Filter by monster name (case-insensitive partial match)
  - `cr` (optional, string): Filter by exact Challenge Rating (e.g., "1", "1/2", "5")
  - `cr_min` (optional, number): Filter by minimum CR
  - `cr_max` (optional, number): Filter by maximum CR
  - `limit` (optional, number): Maximum results (default: 20, max: 100)
  - `offset` (optional, number): Offset for pagination (default: 0)
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "monsters": [
    {
      "id": "uuid",
      "name": "Goblin",
      "data": {
        "name": {
          "en": "Goblin",
          "pl": "Goblin"
        },
        "size": "Small",
        "type": "humanoid",
        "category": "Goblin",
        "alignment": "Neutral Evil",
        "senses": ["Darkvision 60 ft.", "Passive Perception 9"],
        "languages": ["Common", "Goblin"],
        "abilityScores": {
          "strength": { "score": 8, "modifier": -1, "save": -1 },
          "dexterity": { "score": 14, "modifier": 2, "save": 2 },
          "constitution": { "score": 10, "modifier": 0, "save": 0 },
          "intelligence": { "score": 10, "modifier": 0, "save": 0 },
          "wisdom": { "score": 8, "modifier": -1, "save": -1 },
          "charisma": { "score": 8, "modifier": -1, "save": -1 }
        },
        "speed": ["30 ft."],
        "hitPoints": {
          "average": 7,
          "formula": "2d6"
        },
        "armorClass": 15,
        "challengeRating": {
          "rating": "1/4",
          "experiencePoints": 50,
          "proficiencyBonus": 2
        },
        "skills": ["Stealth +6"],
        "damageVulnerabilities": [],
        "damageResistances": [],
        "damageImmunities": [],
        "conditionImmunities": [],
        "gear": [],
        "traits": [],
        "actions": [
          {
            "name": "Scimitar",
            "description": "Melee Attack Roll: +4, reach 5 ft. Hit: 5 (1d6 + 2) Slashing damage.",
            "type": "melee",
            "attackRoll": {
              "type": "melee",
              "bonus": 4
            },
            "damage": [
              {
                "average": 5,
                "formula": "1d6 + 2",
                "type": "Slashing"
              }
            ]
          }
        ],
        "bonusActions": [],
        "reactions": [],
        "initiative": {
          "modifier": 2,
          "total": 12
        },
        "id": "goblin"
      },
      "created_at": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid query parameters

**Note**: Public read access (no authentication required per RLS policy)

#### Get Monster

- **Method**: GET
- **Path**: `/api/monsters/:id`
- **Description**: Returns a single monster's full details
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK (single monster object from above)
- **Error Responses**:
  - 404 Not Found: Monster does not exist

**Note**: Public read access (no authentication required)

### 2.4. Spells (Global Library)

#### List Spells

- **Method**: GET
- **Path**: `/api/spells`
- **Description**: Returns filtered and paginated list of spells from the global SRD library
- **Query Parameters**:
  - `name` (optional, string): Filter by spell name (case-insensitive partial match)
  - `level` (optional, number): Filter by spell level (0-9)
  - `class` (optional, string): Filter by class (e.g., "wizard", "cleric")
  - `limit` (optional, number): Maximum results (default: 20, max: 100)
  - `offset` (optional, number): Offset for pagination (default: 0)
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "spells": [
    {
      "id": "uuid",
      "name": "Fireball",
      "data": {
        "name": {
          "en": "Fireball",
          "pl": "Kula ognia"
        },
        "level": 3,
        "school": "Evocation",
        "isCantrip": false,
        "classes": ["Sorcerer", "Wizard"],
        "castingTime": {
          "time": "Action",
          "isRitual": false
        },
        "range": "150 feet",
        "components": {
          "verbal": true,
          "somatic": true,
          "material": true,
          "materialDescription": "a tiny ball of bat guano and sulfur"
        },
        "duration": {
          "durationType": "Instantaneous",
          "concentration": false
        },
        "description": "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame...",
        "attackType": "saving_throw",
        "ritual": false,
        "tags": [],
        "damage": [
          {
            "formula": "8d6",
            "damageType": "Fire",
            "average": 28
          }
        ],
        "savingThrow": {
          "ability": "Dexterity",
          "success": "half"
        },
        "higherLevels": "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
        "id": "fireball"
      },
      "created_at": "2025-01-10T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid query parameters

**Note**: Public read access (no authentication required)

#### Get Spell

- **Method**: GET
- **Path**: `/api/spells/:id`
- **Description**: Returns a single spell's full details
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK (single spell object from above)
- **Error Responses**:
  - 404 Not Found: Spell does not exist

**Note**: Public read access (no authentication required)

### 2.5. Conditions (Global Library)

#### List Conditions

- **Method**: GET
- **Path**: `/api/conditions`
- **Description**: Returns all D&D 5e condition definitions
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "conditions": [
    {
      "id": "uuid",
      "name": "Blinded",
      "description": "A blinded creature can't see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage."
    },
    {
      "id": "uuid",
      "name": "Stunned",
      "description": "A stunned creature is incapacitated, can't move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage."
    }
  ]
}
```

- **Error Responses**: None expected

**Note**: Public read access (no authentication required)

#### Get Condition

- **Method**: GET
- **Path**: `/api/conditions/:id`
- **Description**: Returns a single condition's details
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK (single condition object from above)
- **Error Responses**:
  - 404 Not Found: Condition does not exist

**Note**: Public read access (no authentication required)

### 2.6. Combats

**Architecture Note**: The combat module uses a hybrid approach:

- Real-time state is managed client-side with Zustand (zero latency)
- Persistence is handled via `state_snapshot` (jsonb) in the database
- API endpoints are for creating, loading, saving, and completing combats
- All turn-by-turn operations (initiative rolls, next turn, damage, healing, conditions) happen client-side

#### List Campaign Combats

- **Method**: GET
- **Path**: `/api/campaigns/:campaignId/combats`
- **Description**: Returns all combats in a campaign
- **Query Parameters**:
  - `status` (optional, string): Filter by status ("active" or "completed")
  - `limit` (optional, number): Maximum results (default: 50)
  - `offset` (optional, number): Offset for pagination (default: 0)
- **Request Body**: N/A
- **Response**: 200 OK

```json
{
  "combats": [
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "name": "Goblin Ambush",
      "status": "active",
      "current_round": 3,
      "participant_count": 7,
      "created_at": "2025-01-16T15:00:00Z",
      "updated_at": "2025-01-16T15:45:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign does not exist or user doesn't own it

#### Create Combat

- **Method**: POST
- **Path**: `/api/campaigns/:campaignId/combats`
- **Description**: Creates a new combat encounter in a campaign
- **Query Parameters**: N/A
- **Request Body**:

```json
{
  "name": "Goblin Ambush",
  "initial_participants": [
    {
      "source": "player_character",
      "player_character_id": "uuid"
    },
    {
      "source": "monster",
      "monster_id": "uuid",
      "count": 3
    },
    {
      "source": "ad_hoc_npc",
      "display_name": "Bandit Leader",
      "max_hp": 30,
      "armor_class": 14,
      "stats": {
        "str": 14,
        "dex": 12,
        "con": 12,
        "int": 10,
        "wis": 10,
        "cha": 14
      },
      "actions": [
        {
          "name": "Scimitar",
          "type": "melee_weapon_attack",
          "attack_bonus": 4,
          "reach": "5 ft",
          "damage_dice": "1d6",
          "damage_bonus": 2,
          "damage_type": "slashing"
        }
      ]
    }
  ]
}
```

- **Response**: 201 Created

```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "name": "Goblin Ambush",
  "status": "active",
  "current_round": 1,
  "state_snapshot": {
    "participants": [
      {
        "id": "temp-uuid-1",
        "source": "player_character",
        "player_character_id": "uuid",
        "display_name": "Aragorn",
        "initiative": 0,
        "current_hp": 45,
        "max_hp": 45,
        "armor_class": 16,
        "stats": {
          "str": 16,
          "dex": 14,
          "con": 14,
          "int": 10,
          "wis": 12,
          "cha": 14
        },
        "actions": [...],
        "is_active_turn": false,
        "active_conditions": []
      },
      {
        "id": "temp-uuid-2",
        "source": "monster",
        "monster_id": "uuid",
        "display_name": "Goblin #1",
        "initiative": 0,
        "current_hp": 7,
        "max_hp": 7,
        "armor_class": 15,
        "stats": {...},
        "actions": [...],
        "is_active_turn": false,
        "active_conditions": []
      }
    ],
    "active_participant_index": null
  },
  "created_at": "2025-01-16T15:00:00Z",
  "updated_at": "2025-01-16T15:00:00Z"
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid input (missing name, invalid participants)
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Campaign, player character, or monster references don't exist

#### Get Combat

- **Method**: GET
- **Path**: `/api/campaigns/:campaignId/combats/:id`
- **Description**: Returns combat details with current state snapshot
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 200 OK (same structure as Create response)
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Combat does not exist or user doesn't own the campaign

#### Update Combat Snapshot

- **Method**: PATCH
- **Path**: `/api/campaigns/:campaignId/combats/:id/snapshot`
- **Description**: Saves the current combat state (called periodically from client)
- **Query Parameters**: N/A
- **Request Body**:

```json
{
  "state_snapshot": {
    "participants": [...],
    "active_participant_index": 2
  },
  "current_round": 3
}
```

- **Response**: 200 OK

```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "name": "Goblin Ambush",
  "status": "active",
  "current_round": 3,
  "state_snapshot": {...},
  "created_at": "2025-01-16T15:00:00Z",
  "updated_at": "2025-01-16T15:45:00Z"
}
```

- **Error Responses**:
  - 400 Bad Request: Invalid snapshot structure
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Combat does not exist or user doesn't own the campaign

#### Update Combat Status

- **Method**: PATCH
- **Path**: `/api/campaigns/:campaignId/combats/:id/status`
- **Description**: Updates combat status (e.g., mark as completed)
- **Query Parameters**: N/A
- **Request Body**:

```json
{
  "status": "completed"
}
```

- **Response**: 200 OK (full combat object)
- **Error Responses**:
  - 400 Bad Request: Invalid status value (must be "active" or "completed")
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Combat does not exist or user doesn't own the campaign

#### Delete Combat

- **Method**: DELETE
- **Path**: `/api/campaigns/:campaignId/combats/:id`
- **Description**: Deletes a combat encounter
- **Query Parameters**: N/A
- **Request Body**: N/A
- **Response**: 204 No Content
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid authentication
  - 404 Not Found: Combat does not exist or user doesn't own the campaign

## 3. Authentication and Authorization

### 3.1. Authentication Mechanism

**Supabase Auth** is used for all authentication:

- **Sign Up**: Client-side using Supabase SDK

  ```typescript
  supabase.auth.signUp({ email, password });
  ```

- **Sign In**: Client-side using Supabase SDK

  ```typescript
  supabase.auth.signInWithPassword({ email, password });
  ```

- **Session Management**: Handled automatically by Supabase via HTTP-only cookies
  - Access token stored in cookie
  - Refresh token rotation
  - Auto-refresh before expiration

- **Sign Out**: Client-side using Supabase SDK
  ```typescript
  supabase.auth.signOut();
  ```

### 3.2. Authorization

**Row Level Security (RLS)** enforces authorization at the database level:

#### Multi-Tenant Isolation

All user-owned resources (`campaigns`, `player_characters`, `combats`) are automatically filtered by `user_id` using RLS policies. This ensures:

- Users can only see their own campaigns
- Users can only modify player characters and combats in their own campaigns
- No additional application-level checks needed

#### Global Libraries

The `monsters`, `spells`, and `conditions` tables have public read access:

- No authentication required for GET operations
- Write operations not exposed via API (data seeded from SRD files)

#### Direct Supabase Integration

Next.js SPA mode uses direct Supabase client calls with RLS:

```typescript
// Direct Supabase client usage from browser
import { getSupabaseClient } from '@/lib/supabase';

export async function getCampaigns() {
  const supabase = getSupabaseClient();

  // RLS automatically filters queries by authenticated user
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

**Authentication:** Handled via Supabase Auth SDK with browser client. Session managed automatically via cookies.

## 4. Validation and Business Logic

### 4.1. Request Validation

All endpoints use **Zod schemas** for input validation:

#### Example: Create Campaign Schema

```typescript
import { z } from "zod";

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(255),
});
```

#### Example: Create Player Character Schema

```typescript
const ActionSchema = z.object({
  name: z.string(),
  type: z.string(),
  attack_bonus: z.number().optional(),
  reach: z.string().optional(),
  range: z.string().optional(),
  damage_dice: z.string().optional(),
  damage_bonus: z.number().optional(),
  damage_type: z.string().optional(),
});

const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(255),
  max_hp: z.number().int().min(1).max(999),
  armor_class: z.number().int().min(0).max(99),
  speed: z.number().int().min(0).max(999),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
  actions: z.array(ActionSchema).optional(),
});
```

### 4.2. Database Constraints

Database-level constraints enforced by PostgreSQL:

| Table             | Constraint                        | Validation                                  |
| ----------------- | --------------------------------- | ------------------------------------------- |
| campaigns         | UNIQUE(user_id, name)             | Campaign names must be unique per user      |
| player_characters | UNIQUE(campaign_id, name)         | Character names must be unique per campaign |
| player_characters | NOT NULL on stats                 | All six ability scores required             |
| combats           | status IN ('active', 'completed') | Status must be valid enum value             |
| conditions        | UNIQUE(name)                      | Condition names globally unique             |

### 4.3. Business Logic Implementation

#### Client-Side Calculations

The following calculations are performed **client-side** to minimize API round-trips:

1. **Initiative Modifier**

   ```typescript
   const initiativeModifier = Math.floor((dexterity - 10) / 2);
   ```

2. **Passive Perception**

   ```typescript
   const passivePerception = 10 + Math.floor((wisdom - 10) / 2);
   ```

3. **Initiative Rolls** (when combat starts)

   ```typescript
   const initiativeRoll = rollD20() + initiativeModifier;
   ```

4. **Attack Rolls**

   ```typescript
   // Normal
   const attackRoll = rollD20() + attackBonus;

   // Advantage
   const attackRoll = Math.max(rollD20(), rollD20()) + attackBonus;

   // Disadvantage
   const attackRoll = Math.min(rollD20(), rollD20()) + attackBonus;
   ```

5. **Damage Rolls**
   ```typescript
   const damage = rollDice(damageDice) + damageBonus;
   ```

#### Server-Side Logic

1. **Combat State Management**
   - State stored in `combats.state_snapshot` as JSONB
   - Auto-save triggers:
     - Manual save (user clicks "Save")
     - End of each round (client-side timer)
     - On combat completion
     - On browser beforeunload event

2. **Cascade Deletion**
   - Deleting a campaign cascades to all player_characters and combats
   - Deleting a player_character does NOT affect combat snapshots (data is denormalized)
   - Deleting a monster from library does NOT affect combat snapshots

3. **Uniqueness Checks**
   - Campaign names checked per user before insert/update
   - Character names checked per campaign before insert/update
   - Database UNIQUE constraints provide final guarantee

### 4.4. Error Handling

All endpoints return consistent error responses:

```typescript
// 400 Bad Request
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// 404 Not Found
{
  "error": "Not found",
  "message": "Campaign not found"
}

// 409 Conflict
{
  "error": "Conflict",
  "message": "A campaign with this name already exists"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### 4.5. JSONB Query Patterns

For filtering global libraries by nested JSONB fields:

#### Monsters by Challenge Rating

```typescript
// Exact CR match (rating is nested in challengeRating object)
supabase.from("monsters").select("*").eq("data->challengeRating->>rating", "1/2");

// CR range (requires casting to numeric, handle fractions)
// Note: This requires custom logic to handle fractional CRs like "1/4", "1/2"
supabase
  .from("monsters")
  .select("*")
  .gte("(data->challengeRating->experiencePoints)::numeric", 100)
  .lte("(data->challengeRating->experiencePoints)::numeric", 1800);
```

#### Spells by Level and Class

```typescript
// By level (direct numeric field)
supabase.from("spells").select("*").eq("(data->level)::int", 3);

// By class (array contains check - case sensitive)
supabase.from("spells").select("*").contains("data->classes", ["Wizard"]);
```

**Note**: GIN indexes on `data` columns enable efficient JSONB queries.

## 5. Additional Implementation Details

### 5.1. Pagination Pattern

All list endpoints support limit/offset pagination:

```typescript
// Request
GET /api/monsters?limit=20&offset=40

// Response includes metadata
{
  "monsters": [...],
  "total": 327,
  "limit": 20,
  "offset": 40
}
```

Clients can calculate:

- `hasMore = offset + limit < total`
- `currentPage = Math.floor(offset / limit) + 1`
- `totalPages = Math.ceil(total / limit)`

### 5.2. Rate Limiting

Consider implementing rate limiting for:

- Authentication endpoints (prevent brute force)
- Create operations (prevent spam)

Recommended implementation: Cloudflare rate limiting or Supabase Edge Functions with rate limit middleware.

### 5.3. CORS Configuration

**Note:** In Next.js SPA mode with direct Supabase calls, CORS is handled by Supabase:

- Supabase handles CORS for all database and auth requests
- Configure allowed origins in Supabase dashboard
- For local development: `http://localhost:3000`
- For production: Your deployed domain (e.g., `https://initiative-forge.vercel.app`)

### 5.4. Combat State Snapshot Format

The `state_snapshot` JSONB field follows this structure:

```typescript
interface CombatSnapshot {
  participants: Array<{
    id: string; // Temporary UUID for this combat
    source: "player_character" | "monster" | "ad_hoc_npc";

    // Reference IDs (if applicable)
    player_character_id?: string;
    monster_id?: string;

    // Denormalized data
    display_name: string;
    initiative: number;
    current_hp: number;
    max_hp: number;
    armor_class: number;
    stats: {
      str: number;
      dex: number;
      con: number;
      int: number;
      wis: number;
      cha: number;
    };
    actions: Array<Action>;

    // Combat-specific state
    is_active_turn: boolean;
    active_conditions: Array<{
      condition_id: string;
      name: string; // Denormalized for quick access
      duration_in_rounds: number | null; // null = indefinite
    }>;
  }>;

  active_participant_index: number | null; // null = initiative not rolled yet
}
```

### 5.5. Monitoring and Observability

Recommended metrics to track:

- API response times (especially for JSONB queries)
- Authentication success/failure rates
- Combat snapshot save frequency
- Database connection pool usage
- Error rates by endpoint

### 5.6. Future Enhancements

Out of scope for MVP but worth planning for:

1. **WebSocket Support** for real-time multi-user combat (allow players to see their own character)
2. **Advanced Search** with full-text search on monster/spell descriptions
3. **Bulk Operations** for creating multiple player characters at once
4. **Export/Import** for campaigns (JSON backup/restore)
5. **Combat History** separate from active combats
6. **GraphQL API** as alternative to REST for more flexible queries
