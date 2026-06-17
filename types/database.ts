export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      houses: {
        Row: {
          id: string;
          slug: Database["public"]["Enums"]["house_slug"];
          name: string;
          color: string;
          banner_url: string | null;
          captain_name: string | null;
          vice_captain_name: string | null;
          motto: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: Database["public"]["Enums"]["house_slug"];
          name: string;
          color: string;
          banner_url?: string | null;
          captain_name?: string | null;
          vice_captain_name?: string | null;
          motto?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["houses"]["Insert"]>;
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          house_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order: number;
          house_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocks"]["Insert"]>;
        Relationships: Relationship[];
      };
      participants: {
        Row: {
          id: string;
          full_name: string;
          age: number;
          gender: string;
          mobile: string;
          email: string | null;
          block_id: string;
          house_id: string;
          flat_number: string;
          avatar_url: string | null;
          emergency_contact: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          age: number;
          gender: string;
          mobile: string;
          email?: string | null;
          block_id: string;
          house_id: string;
          flat_number: string;
          avatar_url?: string | null;
          emergency_contact?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: Relationship[];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          description: string | null;
          rules: string | null;
          rulebook_url: string | null;
          poster_url: string | null;
          registration_link: string | null;
          winner_details: string | null;
          venue: string;
          starts_at: string;
          ends_at: string | null;
          max_participants: number | null;
          status: Database["public"]["Enums"]["event_status"];
          registration_status: Database["public"]["Enums"]["registration_window_status"];
          registration_opens_at: string | null;
          registration_closes_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: string;
          description?: string | null;
          rules?: string | null;
          rulebook_url?: string | null;
          poster_url?: string | null;
          registration_link?: string | null;
          winner_details?: string | null;
          venue: string;
          starts_at: string;
          ends_at?: string | null;
          max_participants?: number | null;
          status?: Database["public"]["Enums"]["event_status"];
          registration_status?: Database["public"]["Enums"]["registration_window_status"];
          registration_opens_at?: string | null;
          registration_closes_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      event_registrations: {
        Row: {
          id: string;
          participant_id: string;
          event_id: string;
          status: Database["public"]["Enums"]["registration_status"];
          waitlist_position: number | null;
          submitter_note: string | null;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          event_id: string;
          status?: Database["public"]["Enums"]["registration_status"];
          waitlist_position?: number | null;
          submitter_note?: string | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["event_registrations"]["Insert"]
        >;
        Relationships: Relationship[];
      };
      event_registration_settings: {
        Row: {
          event_id: string;
          registration_type: Database["public"]["Enums"]["event_registration_type"];
          minimum_team_size: number;
          maximum_team_size: number;
          maximum_teams: number | null;
          approval_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          registration_type?: Database["public"]["Enums"]["event_registration_type"];
          minimum_team_size?: number;
          maximum_team_size?: number;
          maximum_teams?: number | null;
          approval_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["event_registration_settings"]["Insert"]
        >;
        Relationships: Relationship[];
      };
      event_position_points: {
        Row: {
          id: string;
          event_id: string;
          position: number;
          label: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          position: number;
          label: string;
          points: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_position_points"]["Insert"]>;
        Relationships: Relationship[];
      };
      event_teams: {
        Row: {
          id: string;
          event_id: string;
          team_name: string;
          status: Database["public"]["Enums"]["registration_status"];
          waitlist_position: number | null;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          team_name: string;
          status?: Database["public"]["Enums"]["registration_status"];
          waitlist_position?: number | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_teams"]["Insert"]>;
        Relationships: Relationship[];
      };
      event_team_members: {
        Row: {
          id: string;
          team_id: string;
          full_name: string;
          gender: string;
          age: number;
          block_id: string;
          house_id: string;
          flat_number: string;
          is_captain: boolean;
          mobile: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          full_name: string;
          gender: string;
          age: number;
          block_id: string;
          house_id: string;
          flat_number: string;
          is_captain?: boolean;
          mobile?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_team_members"]["Insert"]>;
        Relationships: Relationship[];
      };
      event_team_results: {
        Row: {
          id: string;
          event_id: string;
          team_id: string;
          position: number;
          total_points: number;
          result_label: string | null;
          notes: string | null;
          status: Database["public"]["Enums"]["team_result_status"];
          confirmed_by: string | null;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          team_id: string;
          position: number;
          total_points: number;
          result_label?: string | null;
          notes?: string | null;
          status?: Database["public"]["Enums"]["team_result_status"];
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_team_results"]["Insert"]>;
        Relationships: Relationship[];
      };
      team_point_allocations: {
        Row: {
          id: string;
          team_result_id: string;
          event_id: string;
          team_id: string;
          house_id: string;
          member_count: number;
          team_size: number;
          allocation_ratio: number;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_result_id: string;
          event_id: string;
          team_id: string;
          house_id: string;
          member_count: number;
          team_size: number;
          allocation_ratio: number;
          points: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_point_allocations"]["Insert"]>;
        Relationships: Relationship[];
      };
      event_scores: {
        Row: {
          id: string;
          event_id: string;
          house_id: string;
          points: number;
          position: number | null;
          result_label: string | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          house_id: string;
          points?: number;
          position?: number | null;
          result_label?: string | null;
          notes?: string | null;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_scores"]["Insert"]>;
        Relationships: Relationship[];
      };
      medals: {
        Row: {
          id: string;
          event_id: string;
          participant_id: string | null;
          house_id: string;
          medal: Database["public"]["Enums"]["medal_type"];
          points_awarded: number;
          awarded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          participant_id?: string | null;
          house_id: string;
          medal: Database["public"]["Enums"]["medal_type"];
          points_awarded?: number;
          awarded_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["medals"]["Insert"]>;
        Relationships: Relationship[];
      };
      matches: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      brackets: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      announcements: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      gallery_images: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      gallery_sections: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      activity_logs: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
      admin_profiles: {
        Row: Record<string, Json>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: Relationship[];
      };
    };
    Views: {
      house_standings: {
        Row: {
          rank: number;
          house_id: string;
          slug: Database["public"]["Enums"]["house_slug"];
          name: string;
          color: string;
          total_points: number;
          gold_medals: number;
          silver_medals: number;
          bronze_medals: number;
          events_participated: number;
          participant_count: number;
        };
        Relationships: [];
      };
      house_leaderboard: {
        Row: Database["public"]["Views"]["house_standings"]["Row"];
        Relationships: [];
      };
      medal_table: {
        Row: Record<string, Json>;
        Relationships: [];
      };
      event_results: {
        Row: Record<string, Json>;
        Relationships: [];
      };
      house_summaries: {
        Row: Record<string, Json>;
        Relationships: [];
      };
      public_participants: {
        Row: {
          id: string;
          full_name: string;
          age: number;
          gender: string;
          avatar_url: string | null;
          block_id: string;
          block_name: string;
          house_id: string;
          house_slug: Database["public"]["Enums"]["house_slug"];
          house_name: string;
          house_color: string;
          event_registrations: Json;
        };
        Relationships: [];
      };
      registration_details: {
        Row: Record<string, Json>;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      submit_event_team: {
        Args: {
          p_event_id: string;
          p_team_name: string;
          p_members: Json;
          p_submitter_note?: string | null;
        };
        Returns: Json;
      };
      confirm_team_result: {
        Args: { p_team_result_id: string };
        Returns: Json;
      };
    };
    Enums: {
      house_slug: "red" | "green" | "yellow" | "blue";
      event_status: "upcoming" | "ongoing" | "completed" | "archived";
      registration_status: "pending" | "approved" | "rejected" | "waitlisted";
      registration_window_status: "open" | "closed" | "waitlist";
      medal_type: "gold" | "silver" | "bronze";
      match_status: "scheduled" | "live" | "completed" | "cancelled";
      admin_role: "admin" | "super_admin";
      event_registration_type: "individual" | "team";
      team_result_status: "draft" | "confirmed";
    };
    CompositeTypes: Record<string, never>;
  };
};
