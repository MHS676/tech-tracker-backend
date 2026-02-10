const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
// Use standard Prisma Client import
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  max: 20, // Connection pooling limit
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;