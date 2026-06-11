import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from './handlers/dashboard'
import { upgradeManual, deactivateVip, getMembers } from './handlers/membership'
import { confirmPayment, rejectPayment, getPayments } from './handlers/payments'
import { updatePricingPlan, createPricingPlan, getPricingPlans } from './handlers/pricing'
import {
  toggleSetting,
  updateResendSettings,
  updateMidtransSettings,
  syncMidtransPaymentMethods,
  updateEnabledPayments,
  getAdminSettingsHandler,
  updateDiscordSettings,
  updateMarketApiSettings,
  updateManualPaymentSettings
} from './handlers/settings'
import { updateSupportConfig, addFaq, deleteFaq, getSupportData } from './handlers/support'
import { deleteUser, updateUserPassword, createAdminUser, updateAdminEmail } from './handlers/users'
import {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus
} from './handlers/testimonial'


/**
 * Route Handler utama untuk seluruh aksi admin (POST).
 * Memverifikasi sesi otentikasi admin, memeriksa role, dan mendelegasikan aksi ke handler yang tepat.
 */
export async function POST(request: Request) {
  try {
    // 1. Otentikasi pengguna menggunakan cookie sesi client
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verifikasi role admin di sisi server menggunakan Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { plan: true }
    })

    if (!profile || profile.plan !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Proses tindakan admin
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'upgradeManual':
        return await upgradeManual(body)
      case 'deactivateVip':
        return await deactivateVip(body)
      case 'deleteUser':
        return await deleteUser(body, user.id)
      case 'updateUserPassword':
        return await updateUserPassword(body)
      case 'createAdminUser':
        return await createAdminUser(body)
      case 'updateAdminEmail':
        return await updateAdminEmail(body, user.id)
      case 'confirmPayment':
        return await confirmPayment(body)
      case 'rejectPayment':
        return await rejectPayment(body)
      case 'updatePricingPlan':
        return await updatePricingPlan(body)
      case 'createPricingPlan':
        return await createPricingPlan(body)
      case 'updateSupportConfig':
        return await updateSupportConfig(body)
      case 'addFaq':
        return await addFaq(body)
      case 'deleteFaq':
        return await deleteFaq(body)
      case 'toggleSetting':
        return await toggleSetting(body)
      case 'updateResendSettings':
        return await updateResendSettings(body)
      case 'updateMidtransSettings':
        return await updateMidtransSettings(body)
      case 'updateDiscordSettings':
        return await updateDiscordSettings(body)
      case 'updateMarketApiSettings':
        return await updateMarketApiSettings(body)
      case 'updateManualPaymentSettings':
        return await updateManualPaymentSettings(body)
      case 'syncMidtransPaymentMethods':
        return await syncMidtransPaymentMethods()
      case 'updateEnabledPayments':
        return await updateEnabledPayments(body)
      case 'getMembers':
        return await getMembers(body)
      case 'getDashboardStats':
        return await getDashboardStats()
      case 'getPayments':
        return await getPayments()
      case 'getPricingPlans':
        return await getPricingPlans()
      case 'getAdminSettings':
        return await getAdminSettingsHandler(user.id)
      case 'getSupportData':
        return await getSupportData()
      case 'getTestimonials':
        return await getTestimonials()
      case 'addTestimonial':
        return await addTestimonial(body)
      case 'updateTestimonial':
        return await updateTestimonial(body)
      case 'deleteTestimonial':
        return await deleteTestimonial(body)
      case 'toggleTestimonialStatus':
        return await toggleTestimonialStatus(body)
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('Admin Action Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
