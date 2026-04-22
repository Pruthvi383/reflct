export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      charities: {
        Row: {
          created_at: string | null;
          description: string;
          event_blurb: string | null;
          featured: boolean | null;
          id: string;
          image_url: string | null;
          impact_blurb: string | null;
          location: string | null;
          name: string;
          slug: string;
          tags: string[] | null;
          updated_at: string | null;
          website_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          event_blurb?: string | null;
          featured?: boolean | null;
          id?: string;
          image_url?: string | null;
          impact_blurb?: string | null;
          location?: string | null;
          name: string;
          slug: string;
          tags?: string[] | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          event_blurb?: string | null;
          featured?: boolean | null;
          id?: string;
          image_url?: string | null;
          impact_blurb?: string | null;
          location?: string | null;
          name?: string;
          slug?: string;
          tags?: string[] | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          amount: number;
          charity_id: string;
          created_at: string | null;
          id: string;
          note: string | null;
          payment_reference: string | null;
          source: "independent" | "subscription";
          user_id: string | null;
        };
        Insert: {
          amount: number;
          charity_id: string;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          payment_reference?: string | null;
          source?: "independent" | "subscription";
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          charity_id?: string;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          payment_reference?: string | null;
          source?: "independent" | "subscription";
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "donations_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      draw_results: {
        Row: {
          created_at: string | null;
          draw_id: string;
          id: string;
          match_type: "match_5" | "match_4" | "match_3";
          pool_amount: number;
          rollover: boolean;
          rollover_amount: number | null;
          winner_count: number;
          winner_user_ids: string[] | null;
        };
        Insert: {
          created_at?: string | null;
          draw_id: string;
          id?: string;
          match_type: "match_5" | "match_4" | "match_3";
          pool_amount: number;
          rollover?: boolean;
          rollover_amount?: number | null;
          winner_count?: number;
          winner_user_ids?: string[] | null;
        };
        Update: {
          created_at?: string | null;
          draw_id?: string;
          id?: string;
          match_type?: "match_5" | "match_4" | "match_3";
          pool_amount?: number;
          rollover?: boolean;
          rollover_amount?: number | null;
          winner_count?: number;
          winner_user_ids?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "draw_results_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          }
        ];
      };
      draws: {
        Row: {
          active_subscriber_count: number;
          carryover_amount: number | null;
          created_at: string | null;
          draw_month: string;
          id: string;
          logic_type: "algorithmic" | "random";
          notes: string | null;
          pool_amount: number;
          published_at: string | null;
          status: "draft" | "published" | "simulated";
          updated_at: string | null;
          winning_numbers: number[] | null;
        };
        Insert: {
          active_subscriber_count?: number;
          carryover_amount?: number | null;
          created_at?: string | null;
          draw_month: string;
          id?: string;
          logic_type?: "algorithmic" | "random";
          notes?: string | null;
          pool_amount?: number;
          published_at?: string | null;
          status?: "draft" | "published" | "simulated";
          updated_at?: string | null;
          winning_numbers?: number[] | null;
        };
        Update: {
          active_subscriber_count?: number;
          carryover_amount?: number | null;
          created_at?: string | null;
          draw_month?: string;
          id?: string;
          logic_type?: "algorithmic" | "random";
          notes?: string | null;
          pool_amount?: number;
          published_at?: string | null;
          status?: "draft" | "published" | "simulated";
          updated_at?: string | null;
          winning_numbers?: number[] | null;
        };
        Relationships: [];
      };
      prize_pool_config: {
        Row: {
          created_at: string | null;
          id: string;
          match_type: "match_5" | "match_4" | "match_3";
          percentage: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          match_type: "match_5" | "match_4" | "match_3";
          percentage: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          match_type?: "match_5" | "match_4" | "match_3";
          percentage?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          created_at: string | null;
          id: string;
          played_at: string;
          score: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          played_at: string;
          score: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          played_at?: string;
          score?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          amount: number;
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          id: string;
          plan: "monthly" | "yearly";
          status:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount?: number;
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          id?: string;
          plan: "monthly" | "yearly";
          status:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          id?: string;
          plan?: "monthly" | "yearly";
          status?:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_charity: {
        Row: {
          charity_id: string;
          contribution_percentage: number;
          created_at: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          charity_id: string;
          contribution_percentage?: number;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          charity_id?: string;
          contribution_percentage?: number;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_charity_charity_id_fkey";
            columns: ["charity_id"];
            isOneToOne: false;
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_charity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          role: "admin" | "subscriber";
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          role?: "admin" | "subscriber";
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: "admin" | "subscriber";
          updated_at?: string | null;
        };
        Relationships: [];
      };
      winners: {
        Row: {
          amount: number;
          created_at: string | null;
          draw_id: string;
          id: string;
          match_type: "match_5" | "match_4" | "match_3";
          proof_url: string | null;
          reviewed_at: string | null;
          status: "approved" | "paid" | "pending_verification" | "rejected";
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          draw_id: string;
          id?: string;
          match_type: "match_5" | "match_4" | "match_3";
          proof_url?: string | null;
          reviewed_at?: string | null;
          status?: "approved" | "paid" | "pending_verification" | "rejected";
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          draw_id?: string;
          id?: string;
          match_type?: "match_5" | "match_4" | "match_3";
          proof_url?: string | null;
          reviewed_at?: string | null;
          status?: "approved" | "paid" | "pending_verification" | "rejected";
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "winners_draw_id_fkey";
            columns: ["draw_id"];
            isOneToOne: false;
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "winners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      draw_logic_type: "algorithmic" | "random";
      draw_status: "draft" | "published" | "simulated";
      match_type: "match_3" | "match_4" | "match_5";
      subscription_plan: "monthly" | "yearly";
      subscription_status:
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "paused"
        | "trialing"
        | "unpaid";
      user_role: "admin" | "subscriber";
      winner_status: "approved" | "paid" | "pending_verification" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
