import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("=== SETUP USER VIP EXPIRY UNTUK PENGUJIAN CRON ===");

  // 1. Cari user info.rasyiqi@gmail.com
  const user = await prisma.profiles.findFirst({
    where: { email: "info.rasyiqi@gmail.com" },
  });

  if (!user) {
    console.error("User info.rasyiqi@gmail.com tidak ditemukan di database.");
    rl.close();
    return;
  }

  console.log(`User ditemukan: ${user.full_name} (${user.email})`);

  // 2. Minta input ID Discord Akun Uji
  rl.question("Masukkan ID Discord akun uji Anda (pastikan akun ini sudah join server VIP dan bukan Owner/Admin): ", async (discordIdInput) => {
    const discordId = discordIdInput.trim();

    if (!discordId) {
      console.error("ID Discord tidak boleh kosong.");
      rl.close();
      return;
    }

    try {
      console.log(`\nMengubah plan user ke VIP dan status di database menjadi kedaluwarsa...`);

      await prisma.$transaction([
        prisma.profiles.update({
          where: { id: user.id },
          data: { plan: "vip", plan_status: "vip" },
        }),
        prisma.data_member_vip.upsert({
          where: { id_user_auth: user.id },
          update: {
            status_aktif: "aktif",
            tanggal_berakhir: new Date(Date.now() - 300000), // Kedaluwarsa 5 menit yang lalu
            id_discord_user: discordId,
          },
          create: {
            id_user_auth: user.id,
            email_member: user.email || "",
            status_aktif: "aktif",
            tanggal_berakhir: new Date(Date.now() - 300000),
            id_discord_user: discordId,
          },
        }),
      ]);

      console.log("\n✅ PENYIAPAN DATA BERHASIL!");
      console.log(`- Email         : ${user.email}`);
      console.log(`- ID Discord    : ${discordId}`);
      console.log(`- Status        : VIP Kedaluwarsa (aktif, berakhir 5 menit yang lalu)`);
      console.log("\nLangkah selanjutnya:");
      console.log("1. Jalankan/Trigger Cron Job Anda di Vercel Dashboard.");
      console.log("2. Periksa apakah akun Discord tersebut berhasil di-kick.");
      console.log("3. Periksa status database Anda kembali (seharusnya kembali ke 'free' dan 'hangus').");

    } catch (error) {
      console.error("Gagal memperbarui database:", error);
    } finally {
      rl.close();
      await prisma.$disconnect();
    }
  });
}

main().catch((err) => {
  console.error(err);
  rl.close();
  prisma.$disconnect();
});
