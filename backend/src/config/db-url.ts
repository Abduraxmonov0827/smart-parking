/**
 * Ensures SQLite database exists on Vercel serverless (/tmp only).
 * Copies pre-seeded database template on cold start.
 */
import fs from 'fs';
import path from 'path';

const TMP_DB = '/tmp/parking.db';

export function ensureServerlessDatabase(): void {
  if (!process.env.VERCEL) return;

  process.env.DATABASE_URL = `file:${TMP_DB}`;

  if (fs.existsSync(TMP_DB)) return;

  const candidates = [
    path.join(process.cwd(), 'prisma', 'seed.db'),
    path.join(process.cwd(), 'prisma', 'prisma', 'seed.db'),
    path.join(__dirname, '..', '..', 'prisma', 'seed.db'),
    path.join(__dirname, '..', '..', '..', 'prisma', 'seed.db'),
  ];

  for (const seedPath of candidates) {
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, TMP_DB);
      console.log('[DB] Copied seed database to', TMP_DB);
      return;
    }
  }

  console.warn('[DB] seed.db not found, will try prisma db push');
}

// Run immediately on import
ensureServerlessDatabase();
