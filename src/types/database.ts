export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProductStatus = "draft" | "active" | "archived";
export type ProductGender = "fille" | "garcon" | "mixte";
export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type InventoryMovementType = "sale" | "manual_adjustment" | "restock" | "cancel";

export interface Database {
  public: {
    Tables: {
      shop_settings: {
        Row: {
          id: string;
          shop_name: string;
          legal_name: string | null;
          legal_status: string | null;
          siret: string | null;
          address: string | null;
          email: string | null;
          phone: string | null;
          vat_enabled: boolean;
          vat_rate: number;
          vat_notice: string | null;
          currency: string;
          mediation_url: string | null;
          rep_idu: string | null;
          host_name: string | null;
          host_address: string | null;
          host_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_name?: string;
          legal_name?: string | null;
          legal_status?: string | null;
          siret?: string | null;
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          vat_enabled?: boolean;
          vat_rate?: number;
          vat_notice?: string | null;
          currency?: string;
          mediation_url?: string | null;
          rep_idu?: string | null;
          host_name?: string | null;
          host_address?: string | null;
          host_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_name?: string;
          legal_name?: string | null;
          legal_status?: string | null;
          siret?: string | null;
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          vat_enabled?: boolean;
          vat_rate?: number;
          vat_notice?: string | null;
          currency?: string;
          mediation_url?: string | null;
          rep_idu?: string | null;
          host_name?: string | null;
          host_address?: string | null;
          host_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_rates: {
        Row: {
          id: string;
          provider: string;
          label: string;
          min_weight_grams: number;
          max_weight_grams: number;
          price_cents: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider?: string;
          label: string;
          min_weight_grams?: number;
          max_weight_grams: number;
          price_cents: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          label?: string;
          min_weight_grams?: number;
          max_weight_grams?: number;
          price_cents?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          material: string | null;
          season: string | null;
          brand_label: string;
          made_in: string | null;
          care_instructions: string | null;
          gender: ProductGender;
          status: ProductStatus;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          material?: string | null;
          season?: string | null;
          brand_label?: string;
          made_in?: string | null;
          care_instructions?: string | null;
          gender?: ProductGender;
          status?: ProductStatus;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          material?: string | null;
          season?: string | null;
          brand_label?: string;
          made_in?: string | null;
          care_instructions?: string | null;
          gender?: ProductGender;
          status?: ProductStatus;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size_label: string | null;
          age_label: string | null;
          color: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          cost_cents: number | null;
          stock_quantity: number;
          weight_grams: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          size_label?: string | null;
          age_label?: string | null;
          color?: string | null;
          price_cents: number;
          compare_at_price_cents?: number | null;
          cost_cents?: number | null;
          stock_quantity?: number;
          weight_grams?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          size_label?: string | null;
          age_label?: string | null;
          color?: string | null;
          price_cents?: number;
          compare_at_price_cents?: number | null;
          cost_cents?: number | null;
          stock_quantity?: number;
          weight_grams?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_phone: string | null;
          status: OrderStatus;
          payment_status: PaymentStatus;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          subtotal_cents: number;
          shipping_cents: number;
          discount_cents: number;
          total_cents: number;
          currency: string;
          relay_point_id: string | null;
          relay_point_name: string | null;
          relay_point_address: string | null;
          relay_point_zip: string | null;
          relay_point_city: string | null;
          relay_point_country: string | null;
          tracking_number: string | null;
          invoice_number: string | null;
          tracking_token: string;
          internal_notes: string | null;
          pending_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_phone?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          subtotal_cents?: number;
          shipping_cents?: number;
          discount_cents?: number;
          total_cents?: number;
          currency?: string;
          relay_point_id?: string | null;
          relay_point_name?: string | null;
          relay_point_address?: string | null;
          relay_point_zip?: string | null;
          relay_point_city?: string | null;
          relay_point_country?: string | null;
          tracking_number?: string | null;
          invoice_number?: string | null;
          tracking_token?: string;
          internal_notes?: string | null;
          pending_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_email?: string;
          customer_first_name?: string;
          customer_last_name?: string;
          customer_phone?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          subtotal_cents?: number;
          shipping_cents?: number;
          discount_cents?: number;
          total_cents?: number;
          currency?: string;
          relay_point_id?: string | null;
          relay_point_name?: string | null;
          relay_point_address?: string | null;
          relay_point_zip?: string | null;
          relay_point_city?: string | null;
          relay_point_country?: string | null;
          tracking_number?: string | null;
          invoice_number?: string | null;
          tracking_token?: string;
          internal_notes?: string | null;
          pending_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          note: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          from_status?: OrderStatus | null;
          to_status: OrderStatus;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          from_status?: OrderStatus | null;
          to_status?: OrderStatus;
          note?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          sku: string;
          size_label: string | null;
          age_label: string | null;
          quantity: number;
          unit_price_cents: number;
          total_price_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          sku: string;
          size_label?: string | null;
          age_label?: string | null;
          quantity: number;
          unit_price_cents: number;
          total_price_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          sku?: string;
          size_label?: string | null;
          age_label?: string | null;
          quantity?: number;
          unit_price_cents?: number;
          total_price_cents?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          variant_id: string;
          type: InventoryMovementType;
          quantity: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          type: InventoryMovementType;
          quantity: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          type?: InventoryMovementType;
          quantity?: number;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      catalog_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size_label: string | null;
          age_label: string | null;
          color: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          stock_quantity: number;
          weight_grams: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      catalog_products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          material: string | null;
          season: string | null;
          brand_label: string;
          gender: ProductGender;
          seo_title: string | null;
          seo_description: string | null;
          category_name: string | null;
          category_slug: string | null;
          min_price_cents: number | null;
          total_stock: number | null;
          primary_image_url: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      record_sale_movement: {
        Args: {
          p_variant_id: string;
          p_quantity: number;
          p_note?: string | null;
        };
        Returns: string;
      };
      get_order_by_tracking_token: {
        Args: {
          p_token: string;
        };
        Returns: {
          order_number: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          total_cents: number;
          currency: string;
          created_at: string;
          tracking_number: string | null;
          relay_point_name: string | null;
          relay_point_city: string | null;
          relay_point_zip: string | null;
        }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      product_status: ProductStatus;
      product_gender: ProductGender;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      inventory_movement_type: InventoryMovementType;
    };
  };
}
