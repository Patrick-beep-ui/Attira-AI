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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          body_type: string | null
          preferred_fit: string | null
          height_cm: number | null
          weight_kg: number | null
          country_code: string | null
          city: string | null
          latitude: number | null
          longitude: number | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          body_type?: string | null
          preferred_fit?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          country_code?: string | null
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          body_type?: string | null
          preferred_fit?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          country_code?: string | null
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category_id: number | null
          color: string | null
          fabric: string | null
          size: string | null
          brand: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category_id?: number | null
          color?: string | null
          fabric?: string | null
          size?: string | null
          brand?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category_id?: number | null
          color?: string | null
          fabric?: string | null
          size?: string | null
          brand?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          occasion: string | null
          formality: string | null
          confidence: number | null
          styling_notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          occasion?: string | null
          formality?: string | null
          confidence?: number | null
          styling_notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          occasion?: string | null
          formality?: string | null
          confidence?: number | null
          styling_notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          wardrobe_item_id: string
          layer_order: number | null
        }
        Insert: {
          id?: string
          outfit_id: string
          wardrobe_item_id: string
          layer_order?: number | null
        }
        Update: {
          id?: string
          outfit_id?: string
          wardrobe_item_id?: string
          layer_order?: number | null
        }
        Relationships: []
      }
      style_categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      profile_style_preferences: {
        Row: {
          profile_id: string
          style_category_id: number
        }
        Insert: {
          profile_id: string
          style_category_id: number
        }
        Update: {
          profile_id?: string
          style_category_id?: number
        }
        Relationships: []
      }
      clothing_categories: {
        Row: {
          id: number
          name: string
          parent_category_id: number | null
        }
        Insert: {
          id?: number
          name: string
          parent_category_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          parent_category_id?: number | null
        }
        Relationships: []
      }
      outfit_generations: {
        Row: {
          id: string
          user_id: string | null
          occasion: string | null
          formality: string | null
          weather_temperature: number | null
          weather_condition: string | null
          generated_items: Json | null
          confidence: number | null
          accepted: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          occasion?: string | null
          formality?: string | null
          weather_temperature?: number | null
          weather_condition?: string | null
          generated_items?: Json | null
          confidence?: number | null
          accepted?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          occasion?: string | null
          formality?: string | null
          weather_temperature?: number | null
          weather_condition?: string | null
          generated_items?: Json | null
          confidence?: number | null
          accepted?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      item_tags: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      item_tag_map: {
        Row: {
          item_id: string
          tag_id: number
        }
        Insert: {
          item_id: string
          tag_id: number
        }
        Update: {
          item_id?: string
          tag_id?: number
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
