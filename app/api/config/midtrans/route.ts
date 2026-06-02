import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function GET() {
  try {
    // 1. Authenticate user server-side using client session cookies
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch public Midtrans settings using service role client
    const { data: settings, error } = await supabaseServer
      .from('admin_settings')
      .select('midtrans_client_key, midtrans_is_production, midtrans_upgrade_mode')
      .eq('id', 1)
      .maybeSingle() as any;

    if (error) {
      console.error('Failed to load Midtrans config settings:', error);
      return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 });
    }

    return NextResponse.json({
      clientKey: settings?.midtrans_client_key || '',
      isProduction: settings?.midtrans_is_production || false,
      upgradeMode: settings?.midtrans_upgrade_mode || 'stacking'
    });
  } catch (err: any) {
    console.error('Error in config/midtrans GET:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
