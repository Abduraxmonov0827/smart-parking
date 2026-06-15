/**
 * Ensures SQLite database exists on Vercel serverless (/tmp only).
 * Writes embedded seed database on cold start.
 */
import fs from 'fs';
import path from 'path';
import { SEED_DB_BASE64 } from './seed-db';

const TMP_DB = '/tmp/parking.db';

export function ensureServerlessDatabase(): void {
  if (!process.env.VERCEL) return;

  process.env.DATABASE_URL = `file:${TMP_DB}`;

  if (fs.existsSync(TMP_DB)) return;

  if (SEED_DB_BASE64) {
    fs.writeFileSync(TMP_DB, Buffer.from(SEED_DB_BASE64, 'base64'));
    console.log('[DB] Wrote embedded seed database to', TMP_DB);
    return;
  }

  const candidates = [
    path.join(process.cwd(), 'prisma', 'seed.db'),
    path.join(__dirname, '..', '..', 'prisma', 'seed.db'),
  ];

  for (const seedPath of candidates) {
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, TMP_DB);
      console.log('[DB] Copied seed database to', TMP_DB);
      return;
    }
  }

  throw new Error('[DB] No seed database available for Vercel serverless');
}

ensureServerlessDatabase();
