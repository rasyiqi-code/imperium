/**
 * Menghasilkan template HTML untuk email aktivasi manual VIP.
 */
export function getVipActivationEmailHtml(targetName: string, expiryDateFormatted: string): string {
  const currentYear = new Date().getFullYear();
  return `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">VIP Membership Activation</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetName}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Akun Anda telah berhasil di-upgrade secara manual oleh Admin ke status <strong>VIP Membership</strong>. Sekarang Anda dapat mengakses seluruh fitur premium, sinyal eksklusif, dan grup komunitas VIP.
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #fbbf24;">Paket 1 Tahun (Manual Upgrade)</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Masa Aktif:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">365 Hari</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Tanggal Berakhir:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">${expiryDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status:</td>
          <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">Aktif</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard" style="background-color: #fbbf24; color: #000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Masuk ke Dashboard</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
    <p style="margin: 0;">&copy; ${currentYear} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`;
}

/**
 * Menghasilkan template HTML untuk email konfirmasi pembayaran VIP sukses.
 */
export function getPaymentConfirmedEmailHtml(
  targetName: string,
  packageName: string,
  paidAmount: number,
  expiryDateFormatted: string
): string {
  const currentYear = new Date().getFullYear();
  return `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Payment Confirmed</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetName}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Pembayaran Anda untuk keanggotaan VIP Imperium telah berhasil dikonfirmasi oleh Admin. Akun VIP Anda kini telah aktif sepenuhnya!
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #fbbf24;">${packageName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">Rp ${paidAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Tanggal Berakhir:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">${expiryDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status Pembayaran:</td>
          <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">SUCCESS/BERHASIL</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard" style="background-color: #fbbf24; color: #000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Masuk ke Dashboard VIP</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
    <p style="margin: 0;">&copy; ${currentYear} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`;
}

/**
 * Menghasilkan template HTML untuk email penolakan pembayaran VIP.
 */
export function getPaymentRejectedEmailHtml(
  targetName: string,
  packageName: string,
  paidAmount: number
): string {
  const currentYear = new Date().getFullYear();
  return `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #type-red; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Payment Rejected</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetName}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Mohon maaf, konfirmasi pembayaran Anda untuk paket <strong>${packageName}</strong> telah ditolak oleh Admin karena bukti transfer tidak valid atau dana belum masuk.
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #ef4444;">${packageName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">Rp ${paidAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status Pembayaran:</td>
          <td style="padding: 4px 0; text-align: right; color: #ef4444; font-weight: bold; text-transform: uppercase;">DITOLAK / GAGAL</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px;">
      Silakan periksa kembali bukti transfer Anda atau lakukan konfirmasi pembayaran baru melalui halaman upgrade. Jika Anda merasa ini adalah kesalahan, silakan hubungi tim Support kami di menu Bantuan.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard/upgrade" style="background-color: #ef4444; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Coba Lagi / Upgrade</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Surat ini dikirim secara otomatis. Silakan hubungi support jika perlu bantuan.</p>
    <p style="margin: 0;">&copy; ${currentYear} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`;
}
