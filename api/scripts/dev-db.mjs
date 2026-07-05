import EmbeddedPostgres from 'embedded-postgres';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDemoData } from './lib/demo-seed.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, '..');
const projectRoot = join(apiRoot, '..');
const pgDataDir = 'C:\\akilli-garson-pgdata';

const RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001';
const TABLE_TOKEN = 'qr-masa-1';
const DATABASE_URL =
  'postgresql://postgres:postgres@127.0.0.1:5432/akilli_garson?schema=public';

function updateEnvFile(path, key, value) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  const entry = `${key}=${value}`;
  if (index >= 0) {
    lines[index] = entry;
  } else {
    lines.push(entry);
  }
  writeFileSync(path, lines.filter(Boolean).join('\n') + '\n', 'utf8');
}

async function seed(prisma) {
  const summary = await seedDemoData(prisma);
  console.log('Seed complete.');
  console.log(`Restaurant ID: ${summary.restaurantId}`);
  console.log(`Table token:   ${summary.tableToken}`);
}

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: pgDataDir,
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    persistent: true,
    initdbFlags: ['--locale=C', '--encoding=SQL_ASCII'],
  });

  console.log('Starting embedded PostgreSQL...');
  await pg.initialise();
  await pg.start();

  try {
    await pg.createDatabase('akilli_garson');
  } catch {
    // database may already exist
  }

  updateEnvFile(join(apiRoot, '.env'), 'DATABASE_URL', DATABASE_URL);
  updateEnvFile(join(projectRoot, '.env'), 'VITE_API_URL', 'http://localhost:3001/api/v1');
  updateEnvFile(join(projectRoot, '.env'), 'VITE_RESTAURANT_ID', RESTAURANT_ID);

  console.log('Running migrations...');
  execSync('npx prisma migrate deploy', {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL },
    stdio: 'inherit',
  });

  const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  await seed(prisma);
  await prisma.$disconnect();

  console.log('PostgreSQL ready on port 5432. Press Ctrl+C to stop.');
  process.on('SIGINT', async () => {
    await pg.stop();
    process.exit(0);
  });
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
