import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/adminSettings';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function GET() {
  try {
    // 1. Otentikasi user di sisi server menggunakan cookie sesi client
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil pengaturan publik Midtrans dari cache (menghindari query berulang)
    const settings = await getAdminSettings();

    if (!settings) {
      console.error('Pengaturan Midtrans tidak ditemukan di database.');
      return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
    }

    return NextResponse.json({
      clientKey: settings?.midtrans_client_key || '',
      isProduction: settings?.midtrans_is_production || false,
      upgradeMode: settings?.midtrans_upgrade_mode || 'stacking'
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in config/midtrans GET:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
