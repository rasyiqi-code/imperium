import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { getAdminSettings } from '@/lib/adminSettings';

/**
 * All payment methods we support, used as the master registry.
 */
const ALL_PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', sublabel: 'GoPay · OVO · Dana · ShopeePay', category: 'ewallet' },
  { id: 'gopay', label: 'GoPay', sublabel: 'GoPay & GoPay Later', category: 'ewallet' },
  { id: 'shopeepay', label: 'ShopeePay', sublabel: 'ShopeePay & ShopeePay Later', category: 'ewallet' },
  { id: 'bca', label: 'BCA', sublabel: 'Virtual Account', category: 'va' },
  { id: 'bni', label: 'BNI', sublabel: 'Virtual Account', category: 'va' },
  { id: 'bri', label: 'BRI', sublabel: 'Virtual Account', category: 'va' },
  { id: 'mandiri', label: 'Mandiri', sublabel: 'Bill Payment', category: 'va' },
  { id: 'permata', label: 'Permata', sublabel: 'Virtual Account', category: 'va' },
  { id: 'cimb', label: 'CIMB Niaga', sublabel: 'Virtual Account', category: 'va' },
  { id: 'alfamart', label: 'Alfamart', sublabel: 'Alfamart · Alfamidi · Dan+Dan', category: 'cstore' },
  { id: 'indomaret', label: 'Indomaret', sublabel: 'Indomaret · i.saku', category: 'cstore' },
  { id: 'akulaku', label: 'Akulaku', sublabel: 'PayLater', category: 'paylater' },
  { id: 'kredivo', label: 'Kredivo', sublabel: 'PayLater', category: 'paylater' },
];

/**
 * GET  — Returns available payment methods for the frontend.
 *        Filters the master list based on admin-configured enabled payments.
 */
export async function GET() {
  try {
    // Auth check — must be logged in
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil metode pembayaran aktif dari cache (menghindari query berulang)
    const settings = await getAdminSettings();

    // Jika mode Snap API diaktifkan, kembalikan seluruh daftar metode pembayaran bawaan (ALL_PAYMENT_METHODS)
    if (settings?.midtrans_use_snap === true) {
      return NextResponse.json({
        methods: ALL_PAYMENT_METHODS,
        needsSync: false
      });
    }

    const enabledIds = (settings?.midtrans_enabled_payments as string[]) || [];

    // If no configuration set yet, return empty (admin needs to sync first)
    if (!enabledIds.length) {
      return NextResponse.json({ methods: [], needsSync: true });
    }

    // Filter master list by enabled IDs, preserving the configured order
    const methods = enabledIds
      .map(id => ALL_PAYMENT_METHODS.find(m => m.id === id))
      .filter(Boolean);

    return NextResponse.json({ methods, needsSync: false });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Payment Methods Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
