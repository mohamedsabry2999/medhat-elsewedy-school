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
      articles: {
        Row: {
          author: string
          body: string
          category: string
          created_at: string
          excerpt: string
          featured: boolean
          focal_x: number
          focal_y: number
          id: string
          image: string
          image_alt: string
          og_image: string
          published_at: string
          seo_description: string
          seo_title: string
          slug: string
          status: string
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          body?: string
          category?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          focal_x?: number
          focal_y?: number
          id?: string
          image?: string
          image_alt?: string
          og_image?: string
          published_at?: string
          seo_description?: string
          seo_title?: string
          slug: string
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body?: string
          category?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          focal_x?: number
          focal_y?: number
          id?: string
          image?: string
          image_alt?: string
          og_image?: string
          published_at?: string
          seo_description?: string
          seo_title?: string
          slug?: string
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          usage: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          usage?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          usage?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_alt: string
          image_url: string
          position: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_url: string
          position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_alt?: string
          image_url?: string
          position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          attendees: number
          created_at: string
          edu_dept: string
          governorate: string
          guardian_phone: string
          id: string
          national_id: string
          notes: string
          registration_code: string
          score: string
          source: string
          status: string
          student_name: string
          sync_error: string | null
          sync_status: string
          synced_at: string | null
          time_slot: string
          updated_at: string
          visit_date: string
          visit_day: string
          visit_location: string
          whatsapp: string
        }
        Insert: {
          attendees?: number
          created_at?: string
          edu_dept: string
          governorate: string
          guardian_phone: string
          id?: string
          national_id: string
          notes?: string
          registration_code?: string
          score: string
          source?: string
          status?: string
          student_name: string
          sync_error?: string | null
          sync_status?: string
          synced_at?: string | null
          time_slot: string
          updated_at?: string
          visit_date: string
          visit_day: string
          visit_location?: string
          whatsapp: string
        }
        Update: {
          attendees?: number
          created_at?: string
          edu_dept?: string
          governorate?: string
          guardian_phone?: string
          id?: string
          national_id?: string
          notes?: string
          registration_code?: string
          score?: string
          source?: string
          status?: string
          student_name?: string
          sync_error?: string | null
          sync_status?: string
          synced_at?: string | null
          time_slot?: string
          updated_at?: string
          visit_date?: string
          visit_day?: string
          visit_location?: string
          whatsapp?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          email: string
          facebook_url: string
          footer_description: string
          id: number
          instagram_url: string
          main_cta: string
          phone: string
          updated_at: string
          whatsapp_url: string
          youtube_url: string
        }
        Insert: {
          email?: string
          facebook_url?: string
          footer_description?: string
          id?: number
          instagram_url?: string
          main_cta?: string
          phone?: string
          updated_at?: string
          whatsapp_url?: string
          youtube_url?: string
        }
        Update: {
          email?: string
          facebook_url?: string
          footer_description?: string
          id?: number
          instagram_url?: string
          main_cta?: string
          phone?: string
          updated_at?: string
          whatsapp_url?: string
          youtube_url?: string
        }
        Relationships: []
      }
      sync_settings: {
        Row: {
          id: number
          sheet_id: string
          tab_name: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          id?: number
          sheet_id?: string
          tab_name?: string
          updated_at?: string
          webhook_url?: string
        }
        Update: {
          id?: number
          sheet_id?: string
          tab_name?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_registration_code: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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
