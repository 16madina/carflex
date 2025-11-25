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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          click_count: number | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url: string
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          listing_type: string
          participant1_id: string
          participant2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          listing_type: string
          participant1_id: string
          participant2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          listing_type?: string
          participant1_id?: string
          participant2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          listing_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          booking_enabled: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          message_enabled: boolean | null
          push_enabled: boolean | null
          test_drive_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          message_enabled?: boolean | null
          push_enabled?: boolean | null
          test_drive_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          message_enabled?: boolean | null
          push_enabled?: boolean | null
          test_drive_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_listings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean | null
          listing_id: string
          listing_type: string
          package_id: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean | null
          listing_id: string
          listing_type: string
          package_id: string
          start_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          listing_id?: string
          listing_type?: string
          package_id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_listings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "premium_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_listings_sale_listing_fk"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "sale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned: boolean | null
          banned_at: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          deletion_scheduled_at: string | null
          email: string | null
          email_verified: boolean | null
          facebook_url: string | null
          first_name: string | null
          id: string
          instagram_url: string | null
          last_name: string | null
          linkedin_url: string | null
          phone: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_token: string | null
          verification_token_expires: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          facebook_url?: string | null
          first_name?: string | null
          id: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_token?: string | null
          verification_token_expires?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          facebook_url?: string | null
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_token?: string | null
          verification_token_expires?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          last_used_at: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_used_at?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_used_at?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          cancellation_reason: string | null
          created_at: string
          daily_rate: number
          end_date: string
          id: string
          notes: string | null
          owner_id: string
          payment_id: string | null
          payment_status: string
          rental_listing_id: string
          renter_id: string
          start_date: string
          status: string
          total_days: number
          total_price: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string
          daily_rate: number
          end_date: string
          id?: string
          notes?: string | null
          owner_id: string
          payment_id?: string | null
          payment_status?: string
          rental_listing_id: string
          renter_id: string
          start_date: string
          status?: string
          total_days: number
          total_price: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string
          daily_rate?: number
          end_date?: string
          id?: string
          notes?: string | null
          owner_id?: string
          payment_id?: string | null
          payment_status?: string
          rental_listing_id?: string
          renter_id?: string
          start_date?: string
          status?: string
          total_days?: number
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_rental_listing_id_fkey"
            columns: ["rental_listing_id"]
            isOneToOne: false
            referencedRelation: "rental_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_listings: {
        Row: {
          available: boolean | null
          body_type: string | null
          brand: string
          city: string
          country: string
          created_at: string
          description: string | null
          features: Json | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          mileage: number
          model: string
          owner_id: string
          price_per_day: number
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
          year: number
        }
        Insert: {
          available?: boolean | null
          body_type?: string | null
          brand: string
          city: string
          country: string
          created_at?: string
          description?: string | null
          features?: Json | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          mileage: number
          model: string
          owner_id: string
          price_per_day: number
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year: number
        }
        Update: {
          available?: boolean | null
          body_type?: string | null
          brand?: string
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          mileage?: number
          model?: string
          owner_id?: string
          price_per_day?: number
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rental_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_content: {
        Row: {
          admin_notes: string | null
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_content_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "sale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_listings: {
        Row: {
          accidents: number | null
          body_type: string | null
          brand: string
          city: string
          clean_title: boolean | null
          condition: Database["public"]["Enums"]["vehicle_condition"]
          country: string
          created_at: string
          cylinders: number | null
          description: string | null
          doors: number | null
          engine: string | null
          exterior_color: string | null
          features: Json | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          horsepower: number | null
          id: string
          images: Json | null
          interior_color: string | null
          is_featured: boolean | null
          last_service: string | null
          latitude: number | null
          longitude: number | null
          mileage: number
          model: string
          previous_owners: number | null
          price: number
          seats: number | null
          seller_id: string | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
          year: number
        }
        Insert: {
          accidents?: number | null
          body_type?: string | null
          brand: string
          city: string
          clean_title?: boolean | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          country: string
          created_at?: string
          cylinders?: number | null
          description?: string | null
          doors?: number | null
          engine?: string | null
          exterior_color?: string | null
          features?: Json | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          horsepower?: number | null
          id?: string
          images?: Json | null
          interior_color?: string | null
          is_featured?: boolean | null
          last_service?: string | null
          latitude?: number | null
          longitude?: number | null
          mileage: number
          model: string
          previous_owners?: number | null
          price: number
          seats?: number | null
          seller_id?: string | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year: number
        }
        Update: {
          accidents?: number | null
          body_type?: string | null
          brand?: string
          city?: string
          clean_title?: boolean | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          country?: string
          created_at?: string
          cylinders?: number | null
          description?: string | null
          doors?: number | null
          engine?: string | null
          exterior_color?: string | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          horsepower?: number | null
          id?: string
          images?: Json | null
          interior_color?: string | null
          is_featured?: boolean | null
          last_service?: string | null
          latitude?: number | null
          longitude?: number | null
          mileage?: number
          model?: string
          previous_owners?: number | null
          price?: number
          seats?: number | null
          seller_id?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string
          stripe_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_drive_requests: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          listing_type: string
          message: string | null
          preferred_date: string
          preferred_time: string
          requester_id: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          listing_type: string
          message?: string | null
          preferred_date: string
          preferred_time: string
          requester_id: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          listing_type?: string
          message?: string | null
          preferred_date?: string
          preferred_time?: string
          requester_id?: string
          seller_id?: string
          status?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          product_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          user_id: string
          warning_message: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          user_id: string
          warning_message: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          user_id?: string
          warning_message?: string
        }
        Relationships: []
      }
    }
    Views: {
      premium_listings_public: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string | null
          is_active: boolean | null
          listing_id: string | null
          listing_type: string | null
          package_id: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          listing_id?: string | null
          listing_type?: string | null
          package_id?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          is_active?: boolean | null
          listing_id?: string | null
          listing_type?: string | null
          package_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_listings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "premium_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_listings_sale_listing_fk"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "sale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      public_seller_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      count_user_active_listings: {
        Args: { p_user_id: string }
        Returns: number
      }
      delete_expired_accounts: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_banner_clicks: {
        Args: { banner_id: string }
        Returns: undefined
      }
      is_user_blocked: {
        Args: { check_blocked_id: string; check_blocker_id: string }
        Returns: boolean
      }
      should_notify: {
        Args: { p_notification_type: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      fuel_type: "petrol" | "diesel" | "electric" | "hybrid"
      transmission_type: "automatic" | "manual"
      user_type: "buyer" | "seller" | "agent" | "dealer"
      vehicle_condition: "new" | "used" | "certified"
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
      app_role: ["admin", "user"],
      fuel_type: ["petrol", "diesel", "electric", "hybrid"],
      transmission_type: ["automatic", "manual"],
      user_type: ["buyer", "seller", "agent", "dealer"],
      vehicle_condition: ["new", "used", "certified"],
    },
  },
} as const
