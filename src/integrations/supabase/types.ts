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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string | null
          id: string
          message: string
          title: string
          urgent: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          title: string
          urgent?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          title?: string
          urgent?: boolean | null
        }
        Relationships: []
      }
      clan_members: {
        Row: {
          batch: string | null
          clan_id: string
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          name: string
          profile_image: string | null
          reg_num: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          batch?: string | null
          clan_id: string
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          profile_image?: string | null
          reg_num?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          batch?: string | null
          clan_id?: string
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          profile_image?: string | null
          reg_num?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          bg_image: string | null
          color: string
          created_at: string | null
          display_order: number | null
          id: string
          logo: string
          mascot: string
          name: string
          rank: number | null
          sub_color: string | null
          tagline: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          bg_image?: string | null
          color: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo: string
          mascot: string
          name: string
          rank?: number | null
          sub_color?: string | null
          tagline: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          bg_image?: string | null
          color?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo?: string
          mascot?: string
          name?: string
          rank?: number | null
          sub_color?: string | null
          tagline?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      highlights: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: string
          image_url: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: string
          image_url?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          image_url?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          clan1: string
          clan2: string
          created_at: string | null
          date: string
          id: string
          score1: number | null
          score2: number | null
          sport_id: string | null
          sport_name: string
          status: string
          time: string
          updated_at: string | null
          venue: string
          winner: string | null
        }
        Insert: {
          clan1: string
          clan2: string
          created_at?: string | null
          date: string
          id?: string
          score1?: number | null
          score2?: number | null
          sport_id?: string | null
          sport_name: string
          status: string
          time: string
          updated_at?: string | null
          venue: string
          winner?: string | null
        }
        Update: {
          clan1?: string
          clan2?: string
          created_at?: string | null
          date?: string
          id?: string
          score1?: number | null
          score2?: number | null
          sport_id?: string | null
          sport_name?: string
          status?: string
          time?: string
          updated_at?: string | null
          venue?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sport_team_members: {
        Row: {
          clan_id: string
          created_at: string | null
          id: string
          match_id: string
          member_id: string
        }
        Insert: {
          clan_id: string
          created_at?: string | null
          id?: string
          match_id: string
          member_id: string
        }
        Update: {
          clan_id?: string
          created_at?: string | null
          id?: string
          match_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_team_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_team_members_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "clan_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "clan_leader" | "student"
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
    Enums: {
      app_role: ["admin", "clan_leader", "student"],
    },
  },
} as const
