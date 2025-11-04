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
      lore_notes: {
        Row: {
          campaign_id: string
          category: string
          content_json: Json | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          category: string
          content_json?: Json | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          category?: string
          content_json?: Json | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
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
          charisma: number
          constitution: number
          created_at: string
          dexterity: number
          hp_max: number
          intelligence: number
          npc_id: string
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
          npc_id: string
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
          npc_id?: string
          speed?: number
          strength?: number
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
          strength: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id_1: string
          npc_id_2: string
          relationship_type: string
          strength?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          npc_id_1?: string
          npc_id_2?: string
          relationship_type?: string
          strength?: number | null
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
      npcs: {
        Row: {
          biography_json: Json | null
          campaign_id: string
          created_at: string
          current_location_id: string | null
          faction_id: string | null
          id: string
          image_url: string | null
          name: string
          personality_json: Json | null
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          biography_json?: Json | null
          campaign_id: string
          created_at?: string
          current_location_id?: string | null
          faction_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          personality_json?: Json | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          biography_json?: Json | null
          campaign_id?: string
          created_at?: string
          current_location_id?: string | null
          faction_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          personality_json?: Json | null
          role?: string | null
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
      player_characters: {
        Row: {
          actions: Json | null
          armor_class: number
          campaign_id: string
          charisma: number
          constitution: number
          created_at: string
          dexterity: number
          id: string
          intelligence: number
          max_hp: number
          name: string
          speed: number
          strength: number
          updated_at: string
          wisdom: number
        }
        Insert: {
          actions?: Json | null
          armor_class: number
          campaign_id: string
          charisma: number
          constitution: number
          created_at?: string
          dexterity: number
          id?: string
          intelligence: number
          max_hp: number
          name: string
          speed: number
          strength: number
          updated_at?: string
          wisdom: number
        }
        Update: {
          actions?: Json | null
          armor_class?: number
          campaign_id?: string
          charisma?: number
          constitution?: number
          created_at?: string
          dexterity?: number
          id?: string
          intelligence?: number
          max_hp?: number
          name?: string
          speed?: number
          strength?: number
          updated_at?: string
          wisdom?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_entities: {
        Row: {
          entity_id: string
          entity_type: string
          quest_id: string
          role: string | null
        }
        Insert: {
          entity_id: string
          entity_type: string
          quest_id: string
          role?: string | null
        }
        Update: {
          entity_id?: string
          entity_type?: string
          quest_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quest_entities_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          campaign_id: string
          created_at: string
          description_json: Json | null
          id: string
          objectives_json: Json | null
          rewards_json: Json | null
          status: string
          story_arc_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          description_json?: Json | null
          id?: string
          objectives_json?: Json | null
          rewards_json?: Json | null
          status?: string
          story_arc_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          description_json?: Json | null
          id?: string
          objectives_json?: Json | null
          rewards_json?: Json | null
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
          real_date: string | null
          related_entities_json: Json | null
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
          real_date?: string | null
          related_entities_json?: Json | null
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
          real_date?: string | null
          related_entities_json?: Json | null
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

