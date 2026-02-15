import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Hash passwords
  const hashedTechPassword = await bcrypt.hash('demo123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Create technician
  await prisma.technician.upsert({
    where: { email: 'demo@tech.com' },
    update: {},
    create: {
      id: 'tech_demo',
      name: 'Demo Tech',
      email: 'demo@tech.com',
      password: hashedTechPassword,
      status: 'OFFLINE',
    },
  });
  console.log('✅ Technician created: demo@tech.com / demo123');

  // Create admin
  await prisma.admin.upsert({
    where: { email: 'superadmin@test.com' },
    update: {},
    create: {
      id: 'admin_super',
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: hashedAdminPassword,
    },
  });
  console.log('✅ Admin created: superadmin@test.com / admin123');
}

main()
  .catch(e => console.error('❌ Seed error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });