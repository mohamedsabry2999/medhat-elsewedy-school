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
      content_blocks: {
        Row: {
          content_key: string
          created_at: string
          current_value: string
          default_value: string
          draft_value: string | null
          id: string
          label: string
          page_slug: string
          section_key: string
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          content_key: string
          created_at?: string
          current_value?: string
          default_value?: string
          draft_value?: string | null
          id?: string
          label?: string
          page_slug?: string
          section_key?: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          created_at?: string
          current_value?: string
          default_value?: string
          draft_value?: string | null
          id?: string
          label?: string
          page_slug?: string
          section_key?: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          content_key: string
          created_at: string
          id: string
          new_value: string
          old_value: string
          status: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          created_at?: string
          id?: string
          new_value?: string
          old_value?: string
          status?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          created_at?: string
          id?: string
          new_value?: string
          old_value?: string
          status?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          crop_mode: string
          description: string
          focal_x: number
          focal_y: number
          id: string
          image_alt: string
          image_type: string
          image_url: string
          mobile_focal_x: number | null
          mobile_focal_y: number | null
          position: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          crop_mode?: string
          description?: string
          focal_x?: number
          focal_y?: number
          id?: string
          image_alt?: string
          image_type?: string
          image_url: string
          mobile_focal_x?: number | null
          mobile_focal_y?: number | null
          position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          crop_mode?: string
          description?: string
          focal_x?: number
          focal_y?: number
          id?: string
          image_alt?: string
          image_type?: string
          image_url?: string
          mobile_focal_x?: number | null
          mobile_focal_y?: number | null
          position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      graduate_batch_media: {
        Row: {
          alt_text: string | null
          batch_id: string
          category: string | null
          created_at: string
          description: string | null
          embed_url: string | null
          focal_x: number | null
          focal_y: number | null
          id: string
          image_url: string | null
          media_type: string
          sort_order: number
          status: string
          title: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          batch_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          focal_x?: number | null
          focal_y?: number | null
          id?: string
          image_url?: string | null
          media_type?: string
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          batch_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          focal_x?: number | null
          focal_y?: number | null
          id?: string
          image_url?: string | null
          media_type?: string
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graduate_batch_media_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "graduate_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      graduate_batches: {
        Row: {
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          excerpt: string | null
          featured_on_home: boolean
          graduates_count: number | null
          graduation_year: number | null
          id: string
          published_at: string | null
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          featured_on_home?: boolean
          graduates_count?: number | null
          graduation_year?: number | null
          id?: string
          published_at?: string | null
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          featured_on_home?: boolean
          graduates_count?: number | null
          graduation_year?: number | null
          id?: string
          published_at?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string
          aspect_ratio: string
          caption: string
          category: string
          created_at: string
          crop_mode: string
          crop_settings: Json
          description: string
          display_position: string
          file_size: number
          focal_x: number
          focal_y: number
          height: number
          id: string
          image_type: string
          image_url: string
          mime_type: string
          mobile_focal_x: number | null
          mobile_focal_y: number | null
          sort_order: number
          status: string
          storage_path: string
          thumbnail_url: string
          title: string
          updated_at: string
          usage_locations: string[]
          width: number
        }
        Insert: {
          alt_text?: string
          aspect_ratio?: string
          caption?: string
          category?: string
          created_at?: string
          crop_mode?: string
          crop_settings?: Json
          description?: string
          display_position?: string
          file_size?: number
          focal_x?: number
          focal_y?: number
          height?: number
          id?: string
          image_type?: string
          image_url?: string
          mime_type?: string
          mobile_focal_x?: number | null
          mobile_focal_y?: number | null
          sort_order?: number
          status?: string
          storage_path: string
          thumbnail_url?: string
          title?: string
          updated_at?: string
          usage_locations?: string[]
          width?: number
        }
        Update: {
          alt_text?: string
          aspect_ratio?: string
          caption?: string
          category?: string
          created_at?: string
          crop_mode?: string
          crop_settings?: Json
          description?: string
          display_position?: string
          file_size?: number
          focal_x?: number
          focal_y?: number
          height?: number
          id?: string
          image_type?: string
          image_url?: string
          mime_type?: string
          mobile_focal_x?: number | null
          mobile_focal_y?: number | null
          sort_order?: number
          status?: string
          storage_path?: string
          thumbnail_url?: string
          title?: string
          updated_at?: string
          usage_locations?: string[]
          width?: number
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: string
          created_at: string
          cta_text: string
          cta_text_2: string
          cta_url: string
          cta_url_2: string
          data_json: Json
          id: string
          image_url: string
          is_visible: boolean
          page_slug: string
          section_key: string
          section_type: string
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          content?: string
          created_at?: string
          cta_text?: string
          cta_text_2?: string
          cta_url?: string
          cta_url_2?: string
          data_json?: Json
          id?: string
          image_url?: string
          is_visible?: boolean
          page_slug: string
          section_key: string
          section_type?: string
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          content?: string
          created_at?: string
          cta_text?: string
          cta_text_2?: string
          cta_url?: string
          cta_url_2?: string
          data_json?: Json
          id?: string
          image_url?: string
          is_visible?: boolean
          page_slug?: string
          section_key?: string
          section_type?: string
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          keywords: string
          meta_description: string
          meta_title: string
          og_description: string
          og_image: string
          og_title: string
          robots: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          keywords?: string
          meta_description?: string
          meta_title?: string
          og_description?: string
          og_image?: string
          og_title?: string
          robots?: string
          slug: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          keywords?: string
          meta_description?: string
          meta_title?: string
          og_description?: string
          og_image?: string
          og_title?: string
          robots?: string
          slug?: string
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
          youtube_intro_description: string
          youtube_intro_enabled: boolean
          youtube_intro_title: string
          youtube_intro_url: string
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
          youtube_intro_description?: string
          youtube_intro_enabled?: boolean
          youtube_intro_title?: string
          youtube_intro_url?: string
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
          youtube_intro_description?: string
          youtube_intro_enabled?: boolean
          youtube_intro_title?: string
          youtube_intro_url?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_registration_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
