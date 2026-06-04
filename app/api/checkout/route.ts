import { NextResponse } from 'next/server';
import { paymentManager } from '@crediblemark/buayar';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { prisma } from '@/lib/prisma';
import { calculateProratedPrice } from '@/lib/payment';
import { getAdminSettings } from '@/lib/adminSettings';

export async function POST(request: Request) {
  try {
    const { paketId } = await request.json();
    if (!paketId) {
      return NextResponse.json({ error: "Paket ID wajib diisi" }, { status: 400 });
    }

    // 1. Otentikasi user di sisi server menggunakan cookie sesi client
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil detail paket dari database menggunakan Prisma
    const paket = await prisma.data_paket_vip.findUnique({
      where: { id: paketId }
    });

    if (!paket) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    if (Number(paket.harga) <= 0) {
      return NextResponse.json({ error: "Paket gratis tidak dapat dibeli" }, { status: 400 });
    }

    // Ambil pengaturan Midtrans dari cache (menghindari query berulang)
    const settings = await getAdminSettings();

    const isProduction = settings?.midtrans_is_production === true;
    const clientKey = settings?.midtrans_client_key || '';
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

    const paketHargaNum = Number(paket.harga);
    const currentMember = upgradeMode === 'proration'
      ? await prisma.data_member_vip.findUnique({ where: { id_user_auth: user.id } })
      : null;

    const finalAmount = calculateProratedPrice(currentMember, paketHargaNum, upgradeMode);

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `IMP-${Date.now()}-${randomSuffix}`;

    // 3. Catat entri pembayaran pending baru di database menggunakan Prisma
    // Kita menyimpan ID pesanan unik di kolom 'bukti_transfer' untuk dicocokkan webhook nantinya
    try {
      await prisma.data_pembayaran.create({
        data: {
          id_user_auth: user.id,
          email_member: user.email || '',
          nama_paket: paket.nama_paket,
          harga_bayar: finalAmount,
          bukti_transfer: orderId,
          status_pembayaran: 'pending'
        }
      });
    } catch (insertError: unknown) {
      const err = insertError as Error;
      console.error("Gagal mencatat transaksi pending:", err.message || err);
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
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat transaksi" }, { status: 500 });
  }
}