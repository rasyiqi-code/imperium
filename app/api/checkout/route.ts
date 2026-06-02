import { NextResponse } from 'next/server';
import { paymentManager } from '@crediblemark/buayar';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { paketId } = await request.json();
    if (!paketId) {
      return NextResponse.json({ error: "Paket ID wajib diisi" }, { status: 400 });
    }

    // 1. Authenticate user server-side using client session cookies
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the package details from database using service role (bypassing RLS)
    const { data: paket, error: dbError } = await supabaseServer
      .from('data_paket_vip')
      .select('*')
      .eq('id', paketId)
      .single();

    if (dbError || !paket) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Fetch Midtrans settings from database
    const { data: settings } = await supabaseServer
      .from('admin_settings')
      .select('midtrans_client_key, midtrans_server_key, midtrans_is_production, midtrans_upgrade_mode')
      .eq('id', 1)
      .maybeSingle() as any;

    const isProduction = settings?.midtrans_is_production === true;
    const clientKey = settings?.midtrans_client_key || '';
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

    let finalAmount = paket.harga;

    if (upgradeMode === 'proration') {
      const { data: currentMember } = await supabaseServer
        .from('data_member_vip')
        .select('*')
        .eq('id_user_auth', user.id)
        .maybeSingle() as any;

      if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
        const today = new Date();
        const expiry = new Date(currentMember.tanggal_berakhir);
        
        if (expiry > today) {
          const created = currentMember.dibuat_pada 
            ? new Date(currentMember.dibuat_pada) 
            : (currentMember.created_at ? new Date(currentMember.created_at) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
          
          let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
          if (totalDays <= 0) totalDays = 30;

          let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
          if (remainingDays < 0) remainingDays = 0;

          const oldPaidAmount = Number(currentMember.harga_bayar) || 0;
          const remainingValue = oldPaidAmount * (remainingDays / totalDays);

          finalAmount = Math.max(10000, paket.harga - remainingValue);
        }
      }
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `IMP-${Date.now()}-${randomSuffix}`;

    // 3. Write a pending payment record into data_pembayaran
    // We store the unique orderId inside 'bukti_transfer' so the webhook can match it later
    const { error: insertError } = await supabaseServer
      .from('data_pembayaran')
      .insert({
        id_user_auth: user.id,
        email_member: user.email || '',
        nama_paket: paket.nama_paket,
        harga_bayar: finalAmount,
        bukti_transfer: orderId,
        status_pembayaran: 'pending'
      });

    if (insertError) {
      console.error("Gagal mencatat transaksi pending:", insertError.message);
      return NextResponse.json({ error: "Gagal memproses pendaftaran transaksi" }, { status: 500 });
    }

    // 4. Create invoice with Midtrans via Buayar SDK
    const response = await paymentManager.createInvoice(
      "midtrans",
      {
        orderId: orderId,
        amount: finalAmount,
        productDetails: paket.nama_paket,
        customer: {
          name: user.user_metadata?.full_name || 'Member Imperium',
          email: user.email || '',
        },
        returnUrl: "",
        callbackUrl: "",
        providerParams: {
          custom_field1: user.id,
        },
      },
      {
        merchantCode: clientKey,
        apiKey: serverKey,
        sandbox: !isProduction,
      }
    );


    if (!response.success) {
      throw new Error(response.error || "Gagal membuat invoice dengan Midtrans");
    }
    
    // Send token reference to frontend
    return NextResponse.json({ token: response.reference });
    
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat transaksi" }, { status: 500 });
  }
}