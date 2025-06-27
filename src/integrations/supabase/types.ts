export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          calendar_generated: boolean | null
          content: string | null
          content_type: string | null
          created_at: string | null
          generation_batch_id: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          scheduled_date: string | null
          seo_score: number | null
          status: string | null
          target_audience: string | null
          title: string
          tone: string | null
          updated_at: string | null
          user_id: string
          word_count: number | null
          workflow_id: string | null
        }
        Insert: {
          calendar_generated?: boolean | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          generation_batch_id?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          seo_score?: number | null
          status?: string | null
          target_audience?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
          word_count?: number | null
          workflow_id?: string | null
        }
        Update: {
          calendar_generated?: boolean | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          generation_batch_id?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          seo_score?: number | null
          status?: string | null
          target_audience?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "blog_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_workflows: {
        Row: {
          created_at: string | null
          current_step: number | null
          draft_content: string | null
          id: string
          keyword_data: Json | null
          meta_info: Json | null
          outline_data: Json | null
          publish_config: Json | null
          seo_polish: Json | null
          status: string | null
          topic: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          draft_content?: string | null
          id?: string
          keyword_data?: Json | null
          meta_info?: Json | null
          outline_data?: Json | null
          publish_config?: Json | null
          seo_polish?: Json | null
          status?: string | null
          topic: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          draft_content?: string | null
          id?: string
          keyword_data?: Json | null
          meta_info?: Json | null
          outline_data?: Json | null
          publish_config?: Json | null
          seo_polish?: Json | null
          status?: string | null
          topic?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cms_collections_cache: {
        Row: {
          collection_data: Json
          collection_id: string
          collection_name: string
          connection_id: string
          id: string
          last_synced: string | null
        }
        Insert: {
          collection_data: Json
          collection_id: string
          collection_name: string
          connection_id: string
          id?: string
          last_synced?: string | null
        }
        Update: {
          collection_data?: Json
          collection_id?: string
          collection_name?: string
          connection_id?: string
          id?: string
          last_synced?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_collections_cache_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "cms_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_connections: {
        Row: {
          cms_type: string
          company_name_override: string | null
          connection_name: string
          content_goals_override: string[] | null
          created_at: string | null
          credentials: Json
          id: string
          industry_override: string | null
          is_active: boolean | null
          language_preference: string | null
          preferred_tone_override: string | null
          site_id: string | null
          target_audience_override: string | null
          updated_at: string | null
          user_id: string
          website_url_override: string | null
        }
        Insert: {
          cms_type: string
          company_name_override?: string | null
          connection_name: string
          content_goals_override?: string[] | null
          created_at?: string | null
          credentials: Json
          id?: string
          industry_override?: string | null
          is_active?: boolean | null
          language_preference?: string | null
          preferred_tone_override?: string | null
          site_id?: string | null
          target_audience_override?: string | null
          updated_at?: string | null
          user_id: string
          website_url_override?: string | null
        }
        Update: {
          cms_type?: string
          company_name_override?: string | null
          connection_name?: string
          content_goals_override?: string[] | null
          created_at?: string | null
          credentials?: Json
          id?: string
          industry_override?: string | null
          is_active?: boolean | null
          language_preference?: string | null
          preferred_tone_override?: string | null
          site_id?: string | null
          target_audience_override?: string | null
          updated_at?: string | null
          user_id?: string
          website_url_override?: string | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          company_name: string
          content_goals: string[] | null
          created_at: string
          id: string
          industry: string | null
          preferred_tone: string | null
          target_audience: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          content_goals?: string[] | null
          created_at?: string
          id?: string
          industry?: string | null
          preferred_tone?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          content_goals?: string[] | null
          created_at?: string
          id?: string
          industry?: string | null
          preferred_tone?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      content_generation_batches: {
        Row: {
          completed_articles: number | null
          completed_at: string | null
          created_at: string | null
          end_date: string
          failed_articles: number | null
          generation_options: Json | null
          id: string
          start_date: string
          status: string | null
          total_articles: number
          user_id: string
        }
        Insert: {
          completed_articles?: number | null
          completed_at?: string | null
          created_at?: string | null
          end_date: string
          failed_articles?: number | null
          generation_options?: Json | null
          id?: string
          start_date: string
          status?: string | null
          total_articles: number
          user_id: string
        }
        Update: {
          completed_articles?: number | null
          completed_at?: string | null
          created_at?: string | null
          end_date?: string
          failed_articles?: number | null
          generation_options?: Json | null
          id?: string
          start_date?: string
          status?: string | null
          total_articles?: number
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          tool_used: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          tool_used?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          tool_used?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_profile_id: string | null
          created_at: string | null
          credits: number | null
          full_name: string | null
          id: string
          is_lifetime: boolean | null
          language_preference: string | null
          onboarding_completed: boolean | null
          plan_type: string | null
          stripe_customer_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          credits?: number | null
          full_name?: string | null
          id: string
          is_lifetime?: boolean | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_profile_id?: string | null
          created_at?: string | null
          credits?: number | null
          full_name?: string | null
          id?: string
          is_lifetime?: boolean | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publish_logs: {
        Row: {
          article_id: string
          cms_connection_id: string
          error_message: string | null
          external_id: string | null
          external_url: string | null
          id: string
          published_at: string | null
          status: string | null
        }
        Insert: {
          article_id: string
          cms_connection_id: string
          error_message?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
        }
        Update: {
          article_id?: string
          cms_connection_id?: string
          error_message?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publish_logs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publish_logs_cms_connection_id_fkey"
            columns: ["cms_connection_id"]
            isOneToOne: false
            referencedRelation: "cms_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      publishing_jobs: {
        Row: {
          article_id: string
          cms_connection_id: string | null
          created_at: string | null
          id: string
          last_error: string | null
          published_at: string | null
          retry_count: number | null
          scheduled_time: string
          status: string | null
        }
        Insert: {
          article_id: string
          cms_connection_id?: string | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_time: string
          status?: string | null
        }
        Update: {
          article_id?: string
          cms_connection_id?: string | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publishing_jobs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publishing_jobs_cms_connection_id_fkey"
            columns: ["cms_connection_id"]
            isOneToOne: false
            referencedRelation: "cms_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_seo_preferences: {
        Row: {
          created_at: string | null
          default_audience: string | null
          default_keywords: string[] | null
          default_tone: string | null
          id: string
          preferred_article_length: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_audience?: string | null
          default_keywords?: string[] | null
          default_tone?: string | null
          id?: string
          preferred_article_length?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_audience?: string | null
          default_keywords?: string[] | null
          default_tone?: string | null
          id?: string
          preferred_article_length?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_tool_used: string
          p_description?: string
        }
        Returns: boolean
      }
      upsert_seo_preferences: {
        Args: {
          p_tone?: string
          p_article_length?: number
          p_keywords?: string[]
          p_audience?: string
        }
        Returns: {
          created_at: string | null
          default_audience: string | null
          default_keywords: string[] | null
          default_tone: string | null
          id: string
          preferred_article_length: number | null
          updated_at: string | null
          user_id: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
