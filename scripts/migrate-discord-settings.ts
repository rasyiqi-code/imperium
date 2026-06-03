import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables dari .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Menambahkan kolom Discord ke tabel admin_settings...");

  // 1. Tambahkan kolom baru menggunakan raw SQL jika belum ada
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.admin_settings 
    ADD COLUMN IF NOT EXISTS discord_application_id TEXT,
    ADD COLUMN IF NOT EXISTS discord_client_secret TEXT,
    ADD COLUMN IF NOT EXISTS discord_bot_token TEXT,
    ADD COLUMN IF NOT EXISTS discord_vip_server_id TEXT,
    ADD COLUMN IF NOT EXISTS discord_vip_role_id TEXT,
    ADD COLUMN IF NOT EXISTS discord_free_invite_link TEXT,
    ADD COLUMN IF NOT EXISTS discord_redirect_uri TEXT;
  `);

  console.log("✅ Kolom berhasil ditambahkan (atau sudah ada)!");

  // 2. Baca nilai dari .env saat ini
  const appId = process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const vipServerId = process.env.DISCORD_VIP_SERVER_ID || process.env.DISCORD_VIP_GUILD_ID;
  const vipRoleId = process.env.DISCORD_VIP_ROLE_ID;
  const freeInviteLink = process.env.DISCORD_FREE_INVITE_LINK;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  console.log("\nNilai yang dibaca dari .env:");
  console.log(`- Application ID: ${appId}`);
  console.log(`- Vip Server ID: ${vipServerId}`);
  console.log(`- Vip Role ID: ${vipRoleId}`);

  // 3. Update record admin_settings dengan ID 1
  console.log("\nMemperbarui data di database (ID: 1)...");
  
  // Pastikan record dengan ID 1 ada
  const existingSettings = await prisma.admin_settings.findUnique({
    where: { id: 1 }
  });

  if (!existingSettings) {
    console.log("Membuat record admin_settings default...");
    await prisma.admin_settings.create({
      data: {
        id: 1,
        discord_application_id: appId || null,
        discord_client_secret: clientSecret || null,
        discord_bot_token: botToken || null,
        discord_vip_server_id: vipServerId || null,
        discord_vip_role_id: vipRoleId || null,
        discord_free_invite_link: freeInviteLink || null,
        discord_redirect_uri: redirectUri || null
      }
    });
  } else {
    await prisma.admin_settings.update({
      where: { id: 1 },
      data: {
        discord_application_id: appId || existingSettings.discord_application_id,
        discord_client_secret: clientSecret || existingSettings.discord_client_secret,
        discord_bot_token: botToken || existingSettings.discord_bot_token,
        discord_vip_server_id: vipServerId || existingSettings.discord_vip_server_id,
        discord_vip_role_id: vipRoleId || existingSettings.discord_vip_role_id,
        discord_free_invite_link: freeInviteLink || existingSettings.discord_free_invite_link,
        discord_redirect_uri: redirectUri || existingSettings.discord_redirect_uri
      }
    });
  }

  console.log("✅ Data Discord berhasil dimigrasikan ke database!");
}

main()
  .catch((e) => {
    console.error("❌ Migrasi gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
