import { createBrowserClient } from '@supabase/ssr'
import { MemberVIP, AdminInternal, Notification, PaketVIP, Payment } from './types'

export interface Database {
  public: {
    Tables: {
      data_member_vip: {
        Row: MemberVIP;
        Insert: MemberVIP;
        Update: Partial<MemberVIP>;
      };
      admin_internal: {
        Row: AdminInternal;
        Insert: AdminInternal;
        Update: Partial<AdminInternal>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'>;
        Update: Partial<Notification>;
      };
      profiles: {
        Row: { 
          id: string; 
          email: string;
          full_name: string | null; 
          whatsapp_number: string | null;
          plan: string | null; 
          plan_status: string | null;
          discord_joined: boolean;
          created_at: string;
        };
        Insert: { 
          id: string; 
          email: string;
          full_name?: string | null; 
          whatsapp_number?: string | null;
          plan?: string | null; 
          plan_status?: string | null;
          discord_joined?: boolean;
          created_at?: string;
        };
        Update: Partial<{ 
          email: string;
          full_name: string | null; 
          whatsapp_number: string | null;
          plan: string | null; 
          plan_status: string | null;
          discord_joined: boolean;
        }>;
      };
      support_config: {
        Row: { 
          id: number; 
          whatsapp_number: string; 
          telegram_link: string; 
          support_email: string; 
          operational_hours: string;
          updated_at?: string;
        };
        Insert: { 
          id?: number; 
          whatsapp_number: string; 
          telegram_link: string; 
          support_email: string; 
          operational_hours: string;
          updated_at?: string;
        };
        Update: Partial<{ 
          whatsapp_number: string; 
          telegram_link: string; 
          support_email: string; 
          operational_hours: string;
        }>;
      };
      support_faqs: {
        Row: { 
          id: string; 
          question: string; 
          answer: string; 
          sort_order: number;
          created_at: string;
        };
        Insert: { 
          id?: string; 
          question: string; 
          answer: string; 
          sort_order?: number;
        };
        Update: Partial<{ 
          question: string; 
          answer: string;
          sort_order: number;
        }>;
      };
      data_pembayaran: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Payment>;
      };
      data_paket_vip: {
        Row: PaketVIP;
        Insert: Omit<PaketVIP, 'id'> & { id?: string };
        Update: Partial<PaketVIP>;
      };
      admin_settings: {
        Row: { 
          id: number; 
          email_notif_active: boolean; 
          maintenance_mode: boolean; 
          resend_api_key: string | null;
          resend_sender_email: string | null;
          midtrans_client_key: string | null;
          midtrans_server_key: string | null;
          midtrans_public_key: string | null;
          midtrans_is_production: boolean;
          updated_at?: string;
        };
        Insert: { 
          id?: number; 
          email_notif_active: boolean; 
          maintenance_mode: boolean; 
          resend_api_key?: string | null;
          resend_sender_email?: string | null;
          midtrans_client_key?: string | null;
          midtrans_server_key?: string | null;
          midtrans_public_key?: string | null;
          midtrans_is_production?: boolean;
          updated_at?: string;
        };
        Update: Partial<{ 
          email_notif_active: boolean; 
          maintenance_mode: boolean; 
          resend_api_key: string | null;
          resend_sender_email: string | null;
          midtrans_client_key: string | null;
          midtrans_server_key: string | null;
          midtrans_public_key: string | null;
          midtrans_is_production: boolean;
        }>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)