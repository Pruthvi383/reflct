export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WrappedSummary = {
  themes: string[];
  focusTrend: "improving" | "declining" | "consistent";
  insight: string;
  bestWeek: string;
  goalsHit: number;
  totalGoals: number;
};

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          blocker: string | null;
          created_at: string | null;
          focus_rating: number | null;
          id: string;
          is_locked: boolean | null;
          learnings: string;
          next_goal: string | null;
          prev_goal_met: boolean | null;
          updated_at: string | null;
          user_id: string;
          week_start: string;
        };
        Insert: {
          blocker?: string | null;
          created_at?: string | null;
          focus_rating?: number | null;
          id?: string;
          is_locked?: boolean | null;
          learnings: string;
          next_goal?: string | null;
          prev_goal_met?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          week_start: string;
        };
        Update: {
          blocker?: string | null;
          created_at?: string | null;
          focus_rating?: number | null;
          id?: string;
          is_locked?: boolean | null;
          learnings?: string;
          next_goal?: string | null;
          prev_goal_met?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      focus_sessions: {
        Row: {
          created_at: string | null;
          duration: number;
          ended_at: string;
          id: string;
          label: string;
          quality: "PRODUCTIVE" | "OKAY" | "DISTRACTED";
          started_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          duration: number;
          ended_at: string;
          id?: string;
          label: string;
          quality: "PRODUCTIVE" | "OKAY" | "DISTRACTED";
          started_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          duration?: number;
          ended_at?: string;
          id?: string;
          label?: string;
          quality?: "PRODUCTIVE" | "OKAY" | "DISTRACTED";
          started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "focus_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          id: string;
          image: string | null;
          is_public: boolean | null;
          last_entry_date: string | null;
          learning_goal: string | null;
          longest_streak: number | null;
          name: string | null;
          reminder_time: string | null;
          streak_count: number | null;
          streak_freezes: number | null;
          username: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          image?: string | null;
          is_public?: boolean | null;
          last_entry_date?: string | null;
          learning_goal?: string | null;
          longest_streak?: number | null;
          name?: string | null;
          reminder_time?: string | null;
          streak_count?: number | null;
          streak_freezes?: number | null;
          username: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          image?: string | null;
          is_public?: boolean | null;
          last_entry_date?: string | null;
          learning_goal?: string | null;
          longest_streak?: number | null;
          name?: string | null;
          reminder_time?: string | null;
          streak_count?: number | null;
          streak_freezes?: number | null;
          username?: string;
        };
        Relationships: [];
      };
      wrapped: {
        Row: {
          created_at: string | null;
          id: string;
          is_public: boolean | null;
          month: number;
          summary: WrappedSummary;
          user_id: string;
          year: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_public?: boolean | null;
          month: number;
          summary: WrappedSummary;
          user_id: string;
          year: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_public?: boolean | null;
          month?: number;
          summary?: WrappedSummary;
          user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "wrapped_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type FocusSession = Database["public"]["Tables"]["focus_sessions"]["Row"];
export type Wrapped = Database["public"]["Tables"]["wrapped"]["Row"];
