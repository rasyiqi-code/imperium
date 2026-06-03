import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MEMULAI SKRIP PENGUJIAN AUTOKICK ===");

  // 1. Cari user info.rasyiqi@gmail.com
  const user = await prisma.profiles.findFirst({
    where: { email: "info.rasyiqi@gmail.com" },
  });

  if (!user) {
    console.error("User info.rasyiqi@gmail.com tidak ditemukan.");
    return;
  }

  console.log(`User ditemukan: ${user.full_name} (${user.email})`);

  // 2. Ubah plan profil ke 'vip' dan status aktif di data_member_vip menjadi 'aktif'
  // serta tanggal_berakhir dibuat kedaluwarsa (masa lalu).
  // Kita pasang dummy id_discord_user untuk mengetes API request ke Discord.
  console.log("Mengubah status member ke VIP kedaluwarsa...");
  
  await prisma.$transaction([
    prisma.profiles.update({
      where: { id: user.id },
      data: { plan: "vip", plan_status: "vip" },
    }),
    prisma.data_member_vip.upsert({
      where: { id_user_auth: user.id },
      update: {
        status_aktif: "aktif",
        tanggal_berakhir: new Date(Date.now() - 60000), // Kedaluwarsa 1 menit yang lalu
        id_discord_user: "1511566783566446683", // Menggunakan dummy Discord ID (ID bot/aplikasi atau random)
      },
      create: {
        id_user_auth: user.id,
        email_member: user.email || "",
        status_aktif: "aktif",
        tanggal_berakhir: new Date(Date.now() - 60000),
        id_discord_user: "1511566783566446683",
      },
    }),
  ]);

  console.log("Status berhasil diset menjadi VIP Kedaluwarsa.");

  // 3. Panggil API cron check-subscriptions
  console.log("Memanggil API cron /api/cron/check-subscriptions...");
  const res = await fetch("http://localhost:3000/api/cron/check-subscriptions", {
    headers: {
      "x-vercel-cron": "1",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gagal memanggil API cron: ${res.status} - ${errText}`);
    return;
  }

  const result = await res.json();
  console.log("Hasil API Cron:", JSON.stringify(result, null, 2));

  // 4. Verifikasi apakah status di database sudah ter-update kembali ke 'hangus' dan 'free'
  console.log("\nMemverifikasi status terbaru di database...");
  const updatedUser = await prisma.profiles.findUnique({
    where: { id: user.id },
  });
  const updatedVip = await prisma.data_member_vip.findUnique({
    where: { id_user_auth: user.id },
  });

  console.log("Status Profil Plan:", updatedUser?.plan);
  console.log("Status Profil Plan Status:", updatedUser?.plan_status);
  console.log("Status VIP Aktif:", updatedVip?.status_aktif);

  if (updatedUser?.plan === "free" && updatedVip?.status_aktif === "hangus") {
    console.log("\n✅ PENGUJIAN AUTOKICK BERHASIL! User dideaktivasi dan status diset ke 'hangus'.");
  } else {
    console.error("\n❌ PENGUJIAN AUTOKICK GAGAL! Status tidak diperbarui sesuai ekspektasi.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
