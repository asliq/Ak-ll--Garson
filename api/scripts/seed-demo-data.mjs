import { PrismaClient } from '@prisma/client';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { seedDemoData } from './lib/demo-seed.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, '..');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = join(apiRoot, '.env');
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, 'utf8').match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      return match[1].trim();
    }
  }

  throw new Error('DATABASE_URL is not set. Configure api/.env or export DATABASE_URL.');
}

async function main() {
  const databaseUrl = loadDatabaseUrl();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const summary = await seedDemoData(prisma);
    console.log('Demo seed complete.');
    console.log(`Restaurant ID: ${summary.restaurantId}`);
    console.log(`Table token:   ${summary.tableToken}`);
    console.log(
      `Dataset: ${summary.tables} tables, ${summary.categories} categories, ${summary.menuItems} menu items, ${summary.orders} orders`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
