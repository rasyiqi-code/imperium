import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ambil pengaturan admin untuk mendapatkan bot token dan server ID
  const settings = await prisma.admin_settings.findUnique({
    where: { id: 1 },
  });

  const botToken = settings?.discord_bot_token || process.env.DISCORD_BOT_TOKEN;
  const vipGuildId = settings?.discord_vip_server_id || process.env.DISCORD_VIP_SERVER_ID;

  if (!botToken || !vipGuildId) {
    console.error("Token bot atau ID server VIP tidak ditemukan.");
    return;
  }

  console.log(`Mengambil daftar role untuk Server ID: ${vipGuildId}...`);

  const response = await fetch(`https://discord.com/api/guilds/${vipGuildId}/roles`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gagal mengambil role: ${response.status} - ${errorText}`);
    return;
  }

  const roles = await response.json();
  console.log("=== DAFTAR ROLE DISCORD ===");
  console.log(JSON.stringify(roles, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
