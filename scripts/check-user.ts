import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== DATA MEMB VIP ===");
  const members = await prisma.data_member_vip.findMany();
  console.log(JSON.stringify(members, null, 2));

  console.log("\n=== DATA PROFILES ===");
  const profiles = await prisma.profiles.findMany();
  console.log(JSON.stringify(profiles, null, 2));

  console.log("\n=== ADMIN SETTINGS ===");
  const settings = await prisma.admin_settings.findMany();
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
