// Database types for the HeistMatch schema (supabase/migrations).
// Kept in the format of `supabase gen types typescript`; regenerate with
// `npm run db:types` once the project is linked, and keep the aliases at the bottom.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          platform: string;
          region: string;
          primary_language: string;
          languages: string[];
          preferred_roles: string[];
          bio: string | null;
          role: string;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          platform?: string;
          region?: string;
          primary_language?: string;
          languages?: string[];
          preferred_roles?: string[];
          bio?: string | null;
          role?: string;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      profile_private: {
        Row: {
          user_id: string;
          platform_handle: string | null;
          discord_handle: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          platform_handle?: string | null;
          discord_handle?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_private"]["Insert"]>;
        Relationships: [];
      };
      user_blocks: {
        Row: { blocker_user_id: string; blocked_user_id: string; created_at: string };
        Insert: { blocker_user_id: string; blocked_user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_blocks"]["Insert"]>;
        Relationships: [];
      };
      heist_types: {
        Row: {
          slug: string;
          name: string;
          game: string;
          description: string | null;
          max_crew: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          game?: string;
          description?: string | null;
          max_crew?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["heist_types"]["Insert"]>;
        Relationships: [];
      };
      heists: {
        Row: {
          id: string;
          host_user_id: string;
          title: string;
          heist_type: string;
          platform: string;
          region: string;
          language: string;
          players_needed: number;
          players_joined: number;
          open_slots: number;
          mic_required: boolean;
          min_rank: number | null;
          skill_level: string;
          playstyle: string;
          payout_split: string | null;
          start_at: string;
          description: string | null;
          status: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_user_id?: string;
          title: string;
          heist_type: string;
          platform: string;
          region: string;
          language: string;
          players_needed: number;
          players_joined?: number;
          open_slots?: never;
          mic_required?: boolean;
          min_rank?: number | null;
          skill_level?: string;
          playstyle?: string;
          payout_split?: string | null;
          start_at?: string;
          description?: string | null;
          status?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["heists"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "heists_host_user_id_fkey";
            columns: ["host_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heists_heist_type_fkey";
            columns: ["heist_type"];
            isOneToOne: false;
            referencedRelation: "heist_types";
            referencedColumns: ["slug"];
          },
        ];
      };
      heist_members: {
        Row: {
          id: string;
          heist_id: string;
          user_id: string;
          status: string;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          id?: string;
          heist_id: string;
          user_id: string;
          status?: string;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["heist_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "heist_members_heist_id_fkey";
            columns: ["heist_id"];
            isOneToOne: false;
            referencedRelation: "heists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heist_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          reviewer_user_id: string;
          reviewed_user_id: string;
          heist_id: string;
          rating: number | null;
          play_again: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_user_id?: string;
          reviewed_user_id: string;
          heist_id: string;
          rating?: number | null;
          play_again: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_user_id: string;
          target_type: string;
          heist_id: string | null;
          reported_user_id: string | null;
          reason: string;
          details: string | null;
          status: string;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_user_id?: string;
          target_type: string;
          heist_id?: string | null;
          reported_user_id?: string | null;
          reason: string;
          details?: string | null;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reports_reporter_user_id_fkey";
            columns: ["reporter_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey";
            columns: ["reported_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_heist_id_fkey";
            columns: ["heist_id"];
            isOneToOne: false;
            referencedRelation: "heists";
            referencedColumns: ["id"];
          },
        ];
      };
      marketing_consents: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          consent: boolean;
          status: string;
          consent_version: string;
          source: string;
          confirm_token: string;
          unsubscribe_token: string;
          created_at: string;
          confirmed_at: string | null;
          withdrawn_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          consent?: boolean;
          status?: string;
          consent_version: string;
          source: string;
          confirm_token?: string;
          unsubscribe_token?: string;
          created_at?: string;
          confirmed_at?: string | null;
          withdrawn_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketing_consents"]["Insert"]>;
        Relationships: [];
      };
      consent_events: {
        Row: {
          id: number;
          consent_id: string;
          event: string;
          consent_version: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          consent_id: string;
          event: string;
          consent_version: string;
          source: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["consent_events"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          category: string;
          tags: string[];
          seo_title: string | null;
          seo_description: string | null;
          featured_image: string | null;
          featured_image_alt: string | null;
          author_id: string | null;
          author_name: string;
          is_featured: boolean;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          category: string;
          tags?: string[];
          seo_title?: string | null;
          seo_description?: string | null;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          author_id?: string | null;
          author_name?: string;
          is_featured?: boolean;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: number;
          name: string;
          path: string | null;
          referrer_host: string | null;
          session_id: string | null;
          user_id: string | null;
          props: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          path?: string | null;
          referrer_host?: string | null;
          session_id?: string | null;
          user_id?: string | null;
          props?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
      rate_limits: {
        Row: { key: string; window_start: string; hits: number };
        Insert: { key: string; window_start: string; hits?: number };
        Update: Partial<Database["public"]["Tables"]["rate_limits"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      analytics_daily: {
        Row: { day: string; name: string; events: number; sessions: number };
        Relationships: [];
      };
      analytics_top_pages: {
        Row: { path: string | null; views: number; sessions: number; external_referrals: number };
        Relationships: [];
      };
      analytics_referrers: {
        Row: { referrer_host: string; visits: number };
        Relationships: [];
      };
      profile_stats: {
        Row: {
          user_id: string;
          completed_heists: number;
          hosted_heists: number;
          review_count: number;
          avg_rating: number | null;
          play_again_pct: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      join_heist: { Args: { p_heist_id: string }; Returns: string };
      leave_heist: { Args: { p_heist_id: string }; Returns: string };
      is_heist_participant: { Args: { p_heist_id: string; p_user_id: string }; Returns: boolean };
      get_heist_crew_contacts: {
        Args: { p_heist_id: string };
        Returns: {
          user_id: string;
          username: string;
          is_host: boolean;
          platform_handle: string | null;
          discord_handle: string | null;
        }[];
      };
      rate_limit_hit: { Args: { p_key: string; p_max: number; p_window_seconds: number }; Returns: boolean };
      expire_stale_heists: { Args: Record<PropertyKey, never>; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
