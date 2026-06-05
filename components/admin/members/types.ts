export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp_number: string | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string;
  vip_activated_at?: string | null;
  vip_expired_at?: string | null;
  vip_plan_name?: string | null;
  id_discord_user?: string | null;
  vip_status_aktif?: string | null;
  discord_status?: string | null;
}
