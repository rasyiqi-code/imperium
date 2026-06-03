// lib/types.ts

// Tambahkan 'vip' dan 'free' agar sinkron dengan database & logic dashboard
export type StatusAktif = 'menunggu' | 'aktif' | 'hangus' | 'vip' | 'free';

export type LevelAkses = 'superadmin' | 'staff';

export interface MemberVIP {
  id?: string; // Buat opsional karena saat register free 'id' tabel belum ada
  id_user_auth: string;
  email_member: string;
  nama_member: string | null;
  nomor_wa: string | null;
  nama_paket: string | null;
  harga_bayar: number;
  status_aktif: StatusAktif;
  bukti_transfer?: string | null; // Tambahkan '?' agar tidak error saat data belum ada
  kode_invite_unik?: string | null;
  id_discord_user?: string | null;
  tanggal_berakhir?: string | null;
  dibuat_pada?: string;
  created_at?: string | null;
}

export interface AdminInternal {
  id: string;
  email_admin: string;
  nama_admin: string | null;
  level_akses: LevelAkses;
  dibuat_pada: string;
}

// Untuk keperluan statistik di Admin Panel
export interface StatistikAdmin {
  total_member_aktif: number;
  total_pemasukan: number;
  total_member_hangus: number;
}
export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'signal' | 'success' | 'alert' | 'info';
  is_read: boolean;
  created_at: string;
}

export interface PaketVIP {
  id: string;
  nama_paket: string;
  harga: number;
  durasi_hari: number;
  fitur: string[];
  recommended?: boolean;
}

export interface Payment {
  id: string;
  id_user_auth: string;
  email_member: string;
  nama_paket: string;
  harga_bayar: number;
  bukti_transfer: string;
  status_pembayaran: 'pending' | 'success' | 'failed';
  created_at: string;
}