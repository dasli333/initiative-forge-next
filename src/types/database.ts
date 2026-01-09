export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      combats: {
        Row: {
          campaign_id: string
          created_at: string
          current_round: number
          id: string
          name: string
          state_snapshot: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_round?: number
          id?: string
          name: string
          state_snapshot?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_round?: number
          id?: string
          name?: string
          state_snapshot?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      conditions: {
        Row: {
          description: string
          id: string
          name: Json
        }
        Insert: {
          description: string
          id: string
          name: Json
        }
        Update: {
          description?: string
          id?: string
          name?: Json
        }
        Relationships: []
      }
      entity_mentions: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          mentioned_id: string
          mentioned_type: string
          source_field: string
          source_id: string
          source_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          mentioned_id: string
          mentioned_type: string
          source_field: string
          source_id: string
          source_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          mentioned_id?: string
          mentioned_type?: string
          source_field?: string
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_mentions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
      faction_relationships: {
        Row: {
          created_at: string
          description: string | null
          faction_id_1: string
          faction_id_2: string
          id: string
          relationship_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          faction_id_1: string
          faction_id_2: string
          id?: string
          relationship_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          faction_id_1?: string
          faction_id_2?: string
          id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "faction_relationships_faction_id_1_fkey"
            columns: ["faction_id_1"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faction_relationships_faction_id_2_fkey"
            columns: ["faction_id_2"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
        ]
      }
      factions: {
        Row: {
          campaign_id: string
          created_at: string
          description_json: Json | null
          goals_json: Json | null
          id: string
          image_url: string | null
          name: string
          resources_json: Json | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          description_json?: Json | null
          goals_json?: Json | null
          id?: string
          image_url?: string | null
          name: string
          resources_json?: Json | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          description_json?: Json | null
          goals_json?: Json | null
          id?: string
          image_url?: string | null
          name?: string
          resources_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          campaign_id: string
          coordinates_json: Json | null
          created_at: string
          description_json: Json | null
          id: string
          image_url: string | null
          location_type: string
          name: string
          parent_location_id: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          coordinates_json?: Json | null
          created_at?: string
          description_json?: Json | null
          id?: string
          image_url?: string | null
          location_type: string
          name: string
          parent_location_id?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          coordinates_json?: Json | null
          created_at?: string
          description_json?: Json | null
          id?: string
          image_url?: string | null
          location_type?: string
          name?: string
          parent_location_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_note_tag_assignments: {
        Row: {
          created_at: string
          id: string
          lore_note_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lore_note_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lore_note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_note_tag_assignments_lore_note_id_fkey"
            columns: ["lore_note_id"]
            isOneToOne: false
            referencedRelation: "lore_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_note_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lore_note_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_note_tags: {
        Row: {
          campaign_id: string
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          color: string
          created_at?: string
          icon: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_note_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_notes: {
        Row: {
          campaign_id: string
          category: string
          content_json: Json
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          category: string
          content_json?: Json
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          category?: string
          content_json?: Json
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_notes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      monsters: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
      npc_combat_stats: {
        Row: {
          actions_json: Json | null
          armor_class: number
          bonus_actions_json: Json | null
          charisma: number
          condition_immunities: string[] | null
          constitution: number
          created_at: string
          damage_immunities: string[] | null
          damage_resistances: string[] | null
          damage_vulnerabilities: string[] | null
          dexterity: number
          gear: string[] | null
          hp_max: number
          intelligence: number
          legendary_actions_json: Json | null
          npc_id: string
          reactions_json: Json | null
          speed: string[] | null
          strength: number
          traits_json: Json | null
          updated_at: string
          wisdom: number
        }
        Insert: {
          actions_json?: Json | null
          armor_class: number
          bonus_actions_json?: Json | null
          charisma: number
          condition_immunities?: string[] | null
          constitution: number
          created_at?: string
          damage_immunities?: string[] | null
          damage_resistances?: string[] | null
          damage_vulnerabilities?: string[] | null
          dexterity: number
          gear?: string[] | null
          hp_max: number
          intelligence: number
          legendary_actions_json?: Json | null
          npc_id: string
          reactions_json?: Json | null
          speed?: string[] | null
          strength: number
          traits_json?: Json | null
          updated_at?: string
          wisdom: number
        }
        Update: {
          actions_json?: Json | null
          armor_class?: number
          bonus_actions_json?: Json | null
          charisma?: number
          condition_immunities?: string[] | null
          constitution?: number
          created_at?: string
          damage_immunities?: string[] | null
          damage_resistances?: string[] | null
          damage_vulnerabilities?: string[] | null
          dexterity?: number
          gear?: string[] | null
          hp_max?: number
          intelligence?: number
          legendary_actions_json?: Json | null
          npc_id?: string
          reactions_json?: Json | null
          speed?: string[] | null
          strength?: number
          traits_json?: Json | null
          updated_at?: string
          wisdom?: number
        }
        Relationships: [
          {
            foreignKeyName: "npc_combat_stats_npc_id_fkey"
            columns: ["npc_id"]
            isOneToOne: true
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
        ]
      }
      npc_relationships: {
        Row: {
          created_at: string
          description: string | null
          id: string
          npc_id_1: string
          npc_id_2: string
          relationship_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id_1: string
          npc_id_2: string
          relationship_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id_1?: string
          npc_id_2?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "npc_relationships_npc_id_1_fkey"
            columns: ["npc_id_1"]
            isOneToOne: false
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "npc_relationships_npc_id_2_fkey"
            columns: ["npc_id_2"]
            isOneToOne: false
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
        ]
      }
      npc_tag_assignments: {
        Row: {
          created_at: string
          id: string
          npc_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          npc_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          npc_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "npc_tag_assignments_npc_id_fkey"
            columns: ["npc_id"]
            isOneToOne: false
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "npc_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "npc_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      npc_tags: {
        Row: {
          campaign_id: string
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          color: string
          created_at?: string
          icon: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "npc_tags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      npcs: {
        Row: {
          age: number | null
          alignment: string | null
          biography_json: Json | null
          campaign_id: string
          created_at: string
          current_location_id: string | null
          distinguishing_features: string | null
          faction_id: string | null
          id: string
          image_url: string | null
          languages: string[] | null
          name: string
          personality_json: Json | null
          race: string | null
          role: string | null
          secrets: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          alignment?: string | null
          biography_json?: Json | null
          campaign_id: string
          created_at?: string
          current_location_id?: string | null
          distinguishing_features?: string | null
          faction_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name: string
          personality_json?: Json | null
          race?: string | null
          role?: string | null
          secrets?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          alignment?: string | null
          biography_json?: Json | null
          campaign_id?: string
          created_at?: string
          current_location_id?: string | null
          distinguishing_features?: string | null
          faction_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name?: string
          personality_json?: Json | null
          race?: string | null
          role?: string | null
          secrets?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "npcs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "npcs_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "npcs_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
        ]
      }
      pc_npc_relationships: {
        Row: {
          created_at: string
          description: string | null
          id: string
          npc_id: string
          player_character_id: string
          relationship_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id: string
          player_character_id: string
          relationship_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id?: string
          player_character_id?: string
          relationship_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pc_npc_relationships_npc_id_fkey"
            columns: ["npc_id"]
            isOneToOne: false
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_npc_relationships_player_character_id_fkey"
            columns: ["player_character_id"]
            isOneToOne: false
            referencedRelation: "player_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      player_character_combat_stats: {
        Row: {
          actions_json: Json | null
          armor_class: number
          charisma: number
          constitution: number
          created_at: string
          dexterity: number
          hp_max: number
          intelligence: number
          player_character_id: string
          speed: number
          strength: number
          updated_at: string
          wisdom: number
        }
        Insert: {
          actions_json?: Json | null
          armor_class: number
          charisma: number
          constitution: number
          created_at?: string
          dexterity: number
          hp_max: number
          intelligence: number
          player_character_id: string
          speed: number
          strength: number
          updated_at?: string
          wisdom: number
        }
        Update: {
          actions_json?: Json | null
          armor_class?: number
          charisma?: number
          constitution?: number
          created_at?: string
          dexterity?: number
          hp_max?: number
          intelligence?: number
          player_character_id?: string
          speed?: number
          strength?: number
          updated_at?: string
          wisdom?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_character_combat_stats_player_character_id_fkey"
            columns: ["player_character_id"]
            isOneToOne: true
            referencedRelation: "player_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      player_characters: {
        Row: {
          age: number | null
          alignment: string | null
          background: string | null
          biography_json: Json | null
          campaign_id: string
          class: string | null
          created_at: string
          faction_id: string | null
          id: string
          image_url: string | null
          languages: string[] | null
          level: number | null
          name: string
          notes: Json | null
          personality_json: Json | null
          race: string | null
          status: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          alignment?: string | null
          background?: string | null
          biography_json?: Json | null
          campaign_id: string
          class?: string | null
          created_at?: string
          faction_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          level?: number | null
          name: string
          notes?: Json | null
          personality_json?: Json | null
          race?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          alignment?: string | null
          background?: string | null
          biography_json?: Json | null
          campaign_id?: string
          class?: string | null
          created_at?: string
          faction_id?: string | null
          id?: string
          image_url?: string | null
          languages?: string[] | null
          level?: number | null
          name?: string
          notes?: Json | null
          personality_json?: Json | null
          race?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_characters_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          campaign_id: string
          created_at: string
          deadline: string | null
          description_json: Json | null
          id: string
          notes: string | null
          objectives_json: Json | null
          quest_giver_id: string | null
          quest_type: string
          rewards_json: Json | null
          start_date: string | null
          status: string
          story_arc_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          deadline?: string | null
          description_json?: Json | null
          id?: string
          notes?: string | null
          objectives_json?: Json | null
          quest_giver_id?: string | null
          quest_type?: string
          rewards_json?: Json | null
          start_date?: string | null
          status?: string
          story_arc_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          deadline?: string | null
          description_json?: Json | null
          id?: string
          notes?: string | null
          objectives_json?: Json | null
          quest_giver_id?: string | null
          quest_type?: string
          rewards_json?: Json | null
          start_date?: string | null
          status?: string
          story_arc_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quests_quest_giver_id_fkey"
            columns: ["quest_giver_id"]
            isOneToOne: false
            referencedRelation: "npcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quests_story_arc_id_fkey"
            columns: ["story_arc_id"]
            isOneToOne: false
            referencedRelation: "story_arcs"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          in_game_date: string | null
          log_json: Json | null
          plan_json: Json | null
          session_date: string
          session_number: number
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          in_game_date?: string | null
          log_json?: Json | null
          plan_json?: Json | null
          session_date: string
          session_number: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          in_game_date?: string | null
          log_json?: Json | null
          plan_json?: Json | null
          session_date?: string
          session_number?: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      spells: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
      story_arcs: {
        Row: {
          campaign_id: string
          created_at: string
          description_json: Json | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          description_json?: Json | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          description_json?: Json | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_arcs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      story_items: {
        Row: {
          campaign_id: string
          created_at: string
          current_owner_id: string | null
          current_owner_type: string | null
          description_json: Json | null
          id: string
          image_url: string | null
          name: string
          ownership_history_json: Json | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_owner_id?: string | null
          current_owner_type?: string | null
          description_json?: Json | null
          id?: string
          image_url?: string | null
          name: string
          ownership_history_json?: Json | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_owner_id?: string | null
          current_owner_type?: string | null
          description_json?: Json | null
          id?: string
          image_url?: string | null
          name?: string
          ownership_history_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          campaign_id: string
          created_at: string
          description_json: Json | null
          event_date: string
          id: string
          sort_date: string
          source_id: string | null
          source_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          description_json?: Json | null
          event_date: string
          id?: string
          sort_date?: string
          source_id?: string | null
          source_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          description_json?: Json | null
          event_date?: string
          id?: string
          sort_date?: string
          source_id?: string | null
          source_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_mastery_properties: {
        Row: {
          description: string
          id: string
          name: Json
        }
        Insert: {
          description: string
          id: string
          name: Json
        }
        Update: {
          description?: string
          id?: string
          name?: Json
        }
        Relationships: []
      }
      weapon_properties: {
        Row: {
          description: string
          id: string
          name: Json
        }
        Insert: {
          description: string
          id: string
          name: Json
        }
        Update: {
          description?: string
          id?: string
          name?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

