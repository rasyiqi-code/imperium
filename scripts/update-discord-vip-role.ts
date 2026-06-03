import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Update discord_vip_role_id di admin_settings untuk ID 1
  console.log("Memperbarui role VIP Discord di admin_settings...");
  
  const updated = await prisma.admin_settings.update({
    where: { id: 1 },
    data: {
      discord_vip_role_id: "1511636275164090449",
    },
  });

  console.log("Berhasil memperbarui settings:", JSON.stringify(updated, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
