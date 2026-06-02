import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Inisialisasi Supabase Browser Client tanpa generic Database karena kueri tabel sudah menggunakan Prisma
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)