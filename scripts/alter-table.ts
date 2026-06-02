import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:q2BJrboE7IjOUAVU8R3K@db.osotnaixawhojyhbyndj.supabase.co:6543/postgres'
    }
  }
});

async function run() {
  try {
    console.log('Altering admin_settings table on Supabase host db.osotnaixawhojyhbyndj.supabase.co:6543...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE admin_settings 
      ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
      ADD COLUMN IF NOT EXISTS resend_sender_email TEXT;
    `);

    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
