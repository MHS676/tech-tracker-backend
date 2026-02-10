import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.technician.upsert({
    where: { email: 'tech1@example.com' },
    update: {},
    create: {
      id: 'tech_01',
      name: 'Yusuf',
      email: 'tech1@example.com',
      status: 'ONLINE',
    },
  });
  console.log('✅ Seed successful: Technician tech_01 created.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });