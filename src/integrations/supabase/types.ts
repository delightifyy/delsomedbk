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
      adverts: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link_url: string | null
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_role: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          publish_date: string
          published: boolean
          read_time: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          publish_date?: string
          published?: boolean
          read_time?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          publish_date?: string
          published?: boolean
          read_time?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_clinician_types: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          price_cents: number
          sort_order: number
          title: string
          treats: string | null
          updated_at: string
          wait_time_minutes: number
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          price_cents?: number
          sort_order?: number
          title: string
          treats?: string | null
          updated_at?: string
          wait_time_minutes?: number
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          price_cents?: number
          sort_order?: number
          title?: string
          treats?: string | null
          updated_at?: string
          wait_time_minutes?: number
        }
        Relationships: []
      }
      booking_concern_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_concern_clinician_map: {
        Row: {
          clinician_type_id: string
          concern_id: string
          created_at: string
          id: string
          priority: number
          recommended: boolean
        }
        Insert: {
          clinician_type_id: string
          concern_id: string
          created_at?: string
          id?: string
          priority?: number
          recommended?: boolean
        }
        Update: {
          clinician_type_id?: string
          concern_id?: string
          created_at?: string
          id?: string
          priority?: number
          recommended?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "booking_concern_clinician_map_clinician_type_id_fkey"
            columns: ["clinician_type_id"]
            isOneToOne: false
            referencedRelation: "booking_clinician_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_concern_clinician_map_concern_id_fkey"
            columns: ["concern_id"]
            isOneToOne: false
            referencedRelation: "booking_concerns"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_concerns: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          severity: string | null
          sort_order: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          severity?: string | null
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          severity?: string | null
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_concerns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "booking_concern_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_hmo_providers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_intake_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          id: string
          label: string
          options: Json | null
          placeholder: string | null
          required: boolean
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          id?: string
          label: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          id?: string
          label?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      booking_legal_agreements: {
        Row: {
          active: boolean
          agreement_type: string
          body: string
          created_at: string
          id: string
          key: string
          required: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          agreement_type?: string
          body: string
          created_at?: string
          id?: string
          key: string
          required?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          agreement_type?: string
          body?: string
          created_at?: string
          id?: string
          key?: string
          required?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_payment_methods: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          icon: string | null
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_settings: {
        Row: {
          booking_notice: string
          confirmation_message: string
          created_at: string
          currency: string
          currency_symbol: string
          emergency_warning: string
          id: string
          singleton: boolean
          tax_percent: number
          updated_at: string
        }
        Insert: {
          booking_notice?: string
          confirmation_message?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          emergency_warning?: string
          id?: string
          singleton?: boolean
          tax_percent?: number
          updated_at?: string
        }
        Update: {
          booking_notice?: string
          confirmation_message?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          emergency_warning?: string
          id?: string
          singleton?: boolean
          tax_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_subscription_plans: {
        Row: {
          active: boolean
          billing_period: string
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          perks: Json
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          perks?: Json
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          perks?: Json
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      booking_time_slots: {
        Row: {
          booked_count: number
          capacity: number
          clinician_type_id: string | null
          created_at: string
          id: string
          slot_date: string
          slot_time: string
          status: string
          updated_at: string
        }
        Insert: {
          booked_count?: number
          capacity?: number
          clinician_type_id?: string | null
          created_at?: string
          id?: string
          slot_date: string
          slot_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          booked_count?: number
          capacity?: number
          clinician_type_id?: string | null
          created_at?: string
          id?: string
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_time_slots_clinician_type_id_fkey"
            columns: ["clinician_type_id"]
            isOneToOne: false
            referencedRelation: "booking_clinician_types"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agreements: Json
          amount_cents: number
          category_name: string | null
          clinician_type_id: string | null
          clinician_type_name: string | null
          concern_id: string | null
          concern_name: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          patient_data: Json
          payment_meta: Json
          payment_method: string | null
          reference: string
          slot_date: string | null
          slot_id: string | null
          slot_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agreements?: Json
          amount_cents?: number
          category_name?: string | null
          clinician_type_id?: string | null
          clinician_type_name?: string | null
          concern_id?: string | null
          concern_name?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          patient_data?: Json
          payment_meta?: Json
          payment_method?: string | null
          reference?: string
          slot_date?: string | null
          slot_id?: string | null
          slot_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agreements?: Json
          amount_cents?: number
          category_name?: string | null
          clinician_type_id?: string | null
          clinician_type_name?: string | null
          concern_id?: string | null
          concern_name?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          patient_data?: Json
          payment_meta?: Json
          payment_method?: string | null
          reference?: string
          slot_date?: string | null
          slot_id?: string | null
          slot_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_clinician_type_id_fkey"
            columns: ["clinician_type_id"]
            isOneToOne: false
            referencedRelation: "booking_clinician_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_concern_id_fkey"
            columns: ["concern_id"]
            isOneToOne: false
            referencedRelation: "booking_concerns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "booking_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
          subject?: string
        }
        Relationships: []
      }
      medicare_service_categories: {
        Row: {
          banner_image: string | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          search_keywords: string | null
          slug: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          banner_image?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          search_keywords?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          banner_image?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          search_keywords?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      medicare_service_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          service_id: string | null
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "medicare_service_faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "medicare_services"
            referencedColumns: ["id"]
          },
        ]
      }
      medicare_services: {
        Row: {
          category_id: string | null
          created_at: string
          cta_href: string | null
          cta_label: string | null
          description: string | null
          duration_minutes: number | null
          featured: boolean
          gallery_images: Json
          hero_image: string | null
          icon: string | null
          id: string
          preparation: string | null
          price_amount: number | null
          price_currency: string | null
          price_label: string | null
          recommended_clinicians: Json
          search_keywords: string | null
          slug: string
          sort_order: number
          summary: string | null
          tags: Json
          title: string
          updated_at: string
          visible: boolean
          whats_included: Json
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean
          gallery_images?: Json
          hero_image?: string | null
          icon?: string | null
          id?: string
          preparation?: string | null
          price_amount?: number | null
          price_currency?: string | null
          price_label?: string | null
          recommended_clinicians?: Json
          search_keywords?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          tags?: Json
          title: string
          updated_at?: string
          visible?: boolean
          whats_included?: Json
        }
        Update: {
          category_id?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean
          gallery_images?: Json
          hero_image?: string | null
          icon?: string | null
          id?: string
          preparation?: string | null
          price_amount?: number | null
          price_currency?: string | null
          price_label?: string | null
          recommended_clinicians?: Json
          search_keywords?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          tags?: Json
          title?: string
          updated_at?: string
          visible?: boolean
          whats_included?: Json
        }
        Relationships: [
          {
            foreignKeyName: "medicare_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "medicare_service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      medicare_services_page: {
        Row: {
          created_at: string
          cta_badge: string | null
          cta_description: string | null
          cta_image: string | null
          cta_primary_href: string | null
          cta_primary_label: string | null
          cta_secondary_href: string | null
          cta_secondary_label: string | null
          cta_title: string | null
          hero_description: string | null
          hero_eyebrow: string | null
          hero_image: string | null
          hero_title: string | null
          id: string
          intro_stats: Json
          seo_description: string | null
          seo_title: string | null
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_badge?: string | null
          cta_description?: string | null
          cta_image?: string | null
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          cta_title?: string | null
          hero_description?: string | null
          hero_eyebrow?: string | null
          hero_image?: string | null
          hero_title?: string | null
          id?: string
          intro_stats?: Json
          seo_description?: string | null
          seo_title?: string | null
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_badge?: string | null
          cta_description?: string | null
          cta_image?: string | null
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          cta_title?: string | null
          hero_description?: string | null
          hero_eyebrow?: string | null
          hero_image?: string | null
          hero_title?: string | null
          id?: string
          intro_stats?: Json
          seo_description?: string | null
          seo_title?: string | null
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          publish_date: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          publish_date?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          publish_date?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization_name: string | null
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          applicant_type: Database["public"]["Enums"]["user_type"]
          city: string | null
          created_at: string
          details: Json
          documents: Json
          email: string
          full_name: string | null
          id: string
          organization_name: string | null
          phone: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          specialty: string | null
          state: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          zone: string | null
        }
        Insert: {
          applicant_type: Database["public"]["Enums"]["user_type"]
          city?: string | null
          created_at?: string
          details?: Json
          documents?: Json
          email: string
          full_name?: string | null
          id?: string
          organization_name?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          specialty?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          zone?: string | null
        }
        Update: {
          applicant_type?: Database["public"]["Enums"]["user_type"]
          city?: string | null
          created_at?: string
          details?: Json
          documents?: Json
          email?: string
          full_name?: string | null
          id?: string
          organization_name?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          specialty?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          show_adverts: boolean
          show_news: boolean
          show_testimonials: boolean
          singleton: boolean
          site_name: string
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          show_adverts?: boolean
          show_news?: boolean
          show_testimonials?: boolean
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          show_adverts?: boolean
          show_news?: boolean
          show_testimonials?: boolean
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      specialty_subcategories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          specialty_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          specialty_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_subcategories_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          message: string
          name: string
          rating: number | null
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          name: string
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          name?: string
          rating?: number | null
          role?: string | null
          sort_order?: number
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      registration_status: "pending" | "approved" | "rejected"
      user_type:
        | "patient"
        | "doctor"
        | "organization"
        | "pharmacy"
        | "diagnostics"
        | "laboratory"
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
      registration_status: ["pending", "approved", "rejected"],
      user_type: [
        "patient",
        "doctor",
        "organization",
        "pharmacy",
        "diagnostics",
        "laboratory",
      ],
    },
  },
} as const
