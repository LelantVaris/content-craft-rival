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
          content: string | null
          content_type: string | null
          created_at: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
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
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
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
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
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
      cms_connections: {
        Row: {
          cms_type: string
          connection_name: string
          created_at: string | null
          credentials: Json
          id: string
          is_active: boolean | null
          site_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cms_type: string
          connection_name: string
          created_at?: string | null
          credentials: Json
          id?: string
          is_active?: boolean | null
          site_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cms_type?: string
          connection_name?: string
          created_at?: string | null
          credentials?: Json
          id?: string
          is_active?: boolean | null
          site_id?: string | null
          updated_at?: string | null
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
          created_at: string | null
          credits: number | null
          full_name: string | null
          id: string
          is_lifetime: boolean | null
          plan_type: string | null
          stripe_customer_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          full_name?: string | null
          id: string
          is_lifetime?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          full_name?: string | null
          id?: string
          is_lifetime?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
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
