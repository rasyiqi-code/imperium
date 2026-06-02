import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding missing columns to admin_settings...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.admin_settings 
    ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
    ADD COLUMN IF NOT EXISTS resend_sender_email TEXT,
    ADD COLUMN IF NOT EXISTS midtrans_client_key TEXT,
    ADD COLUMN IF NOT EXISTS midtrans_server_key TEXT,
    ADD COLUMN IF NOT EXISTS midtrans_public_key TEXT,
    ADD COLUMN IF NOT EXISTS midtrans_is_production BOOLEAN DEFAULT false;
  `);

  console.log("✅ Columns added successfully!");

  // Verify the columns exist
  const result = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'admin_settings'
    ORDER BY ordinal_position;
  `);

  console.log("\nCurrent admin_settings columns:");
  console.table(result);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
