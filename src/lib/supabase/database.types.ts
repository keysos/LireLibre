// Application database contract; update alongside supabase/migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: number;
          title: string;
          author: string | null;
          isbn: string | null;
          cover_url: string | null;
          source: string;
          external_id: string | null;
          description: string | null;
          published_date: string | null;
          number_of_pages: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          author?: string | null;
          isbn?: string | null;
          cover_url?: string | null;
          source?: string;
          external_id?: string | null;
          description?: string | null;
          published_date?: string | null;
          number_of_pages?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          author?: string | null;
          isbn?: string | null;
          cover_url?: string | null;
          source?: string;
          external_id?: string | null;
          description?: string | null;
          published_date?: string | null;
          number_of_pages?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_books: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          status: string;
          current_page: number;
          finished_at: string | null;
          added_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book_id: number;
          status?: string;
          current_page?: number;
          finished_at?: string | null;
          added_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book_id?: number;
          status?: string;
          current_page?: number;
          finished_at?: string | null;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_books_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      ratings: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book_id: number;
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book_id?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ratings_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book_id: number;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book_id?: number;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      list_books: {
        Row: { id: number; list_id: number; book_id: number; added_at: string };
        Insert: {
          id?: number;
          list_id: number;
          book_id: number;
          added_at?: string;
        };
        Update: {
          id?: number;
          list_id?: number;
          book_id?: number;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_books_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      reading_goals: {
        Row: {
          id: number;
          user_id: string;
          year: number;
          target_books: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          year: number;
          target_books: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          year?: number;
          target_books?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      list_summaries: {
        Row: Database["public"]["Tables"]["lists"]["Row"] & {
          book_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      rating_summary: { Args: { p_book_id: number }; Returns: Json };
      profile_summary: { Args: { p_user_id: string }; Returns: Json };
      goal_progress: { Args: { p_year: number }; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
