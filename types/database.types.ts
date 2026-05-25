export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      my_eleven: {
        Row: {
          id:           string
          user_id:      string
          formation:    string
          slots:        Json
          note:         string | null
          is_published: boolean
          updated_at:   string
        }
        Insert: {
          id?:          string
          user_id:      string
          formation?:   string
          slots?:       Json
          note?:        string | null
          is_published?: boolean
          updated_at?:  string
        }
        Update: {
          id?:          string
          user_id?:     string
          formation?:   string
          slots?:       Json
          note?:        string | null
          is_published?: boolean
          updated_at?:  string
        }
        Relationships: [
          {
            foreignKeyName: "my_eleven_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      world_squad: {
        Row: {
          id:           string
          name:         string
          short_name:   string
          position:     string
          team_id:      string
          country_code: string
          dorsal:       number | null
          is_active:    boolean
        }
        Insert: {
          id?:          string
          name:         string
          short_name:   string
          position:     string
          team_id:      string
          country_code: string
          dorsal?:      number | null
          is_active?:   boolean
        }
        Update: {
          id?:          string
          name?:        string
          short_name?:  string
          position?:    string
          team_id?:     string
          country_code?: string
          dorsal?:      number | null
          is_active?:   boolean
        }
        Relationships: [
          {
            foreignKeyName: "world_squad_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fan_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "fan_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          image_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knockout_predictions: {
        Row: {
          created_at: string
          id: string
          match_id: string
          points_earned: number | null
          updated_at: string
          user_id: string
          winner_team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          points_earned?: number | null
          updated_at?: string
          user_id: string
          winner_team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          points_earned?: number | null
          updated_at?: string
          user_id?: string
          winner_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knockout_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knockout_predictions_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_score_et: number | null
          away_score_pens: number | null
          away_team_id: string | null
          city: string | null
          created_at: string
          external_fixture_id: number | null
          fulltime_checked_at: string | null
          group_letter: string | null
          halftime_checked_at: string | null
          home_score: number | null
          home_score_et: number | null
          home_score_pens: number | null
          home_team_id: string | null
          id: string
          last_external_sync_at: string | null
          match_number: number
          scheduled_at: string
          stage: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_score_et?: number | null
          away_score_pens?: number | null
          away_team_id?: string | null
          city?: string | null
          created_at?: string
          external_fixture_id?: number | null
          fulltime_checked_at?: string | null
          group_letter?: string | null
          halftime_checked_at?: string | null
          home_score?: number | null
          home_score_et?: number | null
          home_score_pens?: number | null
          home_team_id?: string | null
          id?: string
          last_external_sync_at?: string | null
          match_number: number
          scheduled_at: string
          stage: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_score_et?: number | null
          away_score_pens?: number | null
          away_team_id?: string | null
          city?: string | null
          created_at?: string
          external_fixture_id?: number | null
          fulltime_checked_at?: string | null
          group_letter?: string | null
          halftime_checked_at?: string | null
          home_score?: number | null
          home_score_et?: number | null
          home_score_pens?: number | null
          home_team_id?: string | null
          id?: string
          last_external_sync_at?: string | null
          match_number?: number
          scheduled_at?: string
          stage?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          match_id: string
          points_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          match_id: string
          points_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          match_id?: string
          points_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bonus_points: number
          country_code: string | null
          created_at: string
          display_name: string
          favorite_team: string | null
          id: string
          is_admin: boolean
          is_banned_fanzone: boolean
          pays_entry: boolean
          surprise_team_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bonus_points?: number
          country_code?: string | null
          created_at?: string
          display_name: string
          favorite_team?: string | null
          id: string
          is_admin?: boolean
          is_banned_fanzone?: boolean
          pays_entry?: boolean
          surprise_team_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bonus_points?: number
          country_code?: string | null
          created_at?: string
          display_name?: string
          favorite_team?: string | null
          id?: string
          is_admin?: boolean
          is_banned_fanzone?: boolean
          pays_entry?: boolean
          surprise_team_id?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_surprise_team_id_fkey"
            columns: ["surprise_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      spain_lineups: {
        Row: {
          created_at: string | null
          formation: string
          id: string
          is_published: boolean | null
          match_id: string | null
          note: string | null
          slots: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          formation?: string
          id?: string
          is_published?: boolean | null
          match_id?: string | null
          note?: string | null
          slots?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          formation?: string
          id?: string
          is_published?: boolean | null
          match_id?: string | null
          note?: string | null
          slots?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spain_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spain_lineups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spain_squad: {
        Row: {
          age: number | null
          caps: number | null
          club: string
          created_at: string | null
          dorsal: number
          id: string
          is_active: boolean | null
          name: string
          position: string
          short_name: string
        }
        Insert: {
          age?: number | null
          caps?: number | null
          club: string
          created_at?: string | null
          dorsal: number
          id?: string
          is_active?: boolean | null
          name: string
          position: string
          short_name: string
        }
        Update: {
          age?: number | null
          caps?: number | null
          club?: string
          created_at?: string | null
          dorsal?: number
          id?: string
          is_active?: boolean | null
          name?: string
          position?: string
          short_name?: string
        }
        Relationships: []
      }
      special_predictions: {
        Row: {
          best_goalkeeper: string | null
          best_young_player: string | null
          champion_team_id: string | null
          created_at: string
          id: string
          mvp: string | null
          points_earned: number | null
          runner_up_team_id: string | null
          top_assist_player: string | null
          top_scorer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_goalkeeper?: string | null
          best_young_player?: string | null
          champion_team_id?: string | null
          created_at?: string
          id?: string
          mvp?: string | null
          points_earned?: number | null
          runner_up_team_id?: string | null
          top_assist_player?: string | null
          top_scorer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_goalkeeper?: string | null
          best_young_player?: string | null
          champion_team_id?: string | null
          created_at?: string
          id?: string
          mvp?: string | null
          points_earned?: number | null
          runner_up_team_id?: string | null
          top_assist_player?: string | null
          top_scorer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_predictions_champion_team_id_fkey"
            columns: ["champion_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_predictions_runner_up_team_id_fkey"
            columns: ["runner_up_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_stats_cache: {
        Row: {
          key: string
          payload: Json
          updated_at: string
        }
        Insert: {
          key: string
          payload: Json
          updated_at?: string
        }
        Update: {
          key?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          confederation: string | null
          country_code: string | null
          flag_url: string | null
          group_letter: string | null
          id: string
          name: string
        }
        Insert: {
          confederation?: string | null
          country_code?: string | null
          flag_url?: string | null
          group_letter?: string | null
          id: string
          name: string
        }
        Update: {
          confederation?: string | null
          country_code?: string | null
          flag_url?: string | null
          group_letter?: string | null
          id?: string
          name?: string
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
  public: {
    Enums: {},
  },
} as const
