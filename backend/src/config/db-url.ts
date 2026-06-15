/**
 * Ensures SQLite database exists on Vercel serverless (/tmp only).
 * Writes embedded seed database on cold start.
 */
import fs from 'fs';
import path from 'path';
import { SEED_DB_BASE64 } from './seed-db';

const TMP_DB = '/tmp/parking.db';
const MIN_VALID_DB_BYTES = 50_000;

export let databaseWasReseeded = false;

function writeEmbeddedSeed(): void {
  if (!SEED_DB_BASE64) {
    throw new Error('[DB] Embedded seed database is empty');
  }

  fs.writeFileSync(TMP_DB, Buffer.from(SEED_DB_BASE64, 'base64'));
  databaseWasReseeded = true;
  console.log('[DB] Wrote embedded seed database to', TMP_DB, `(${fs.statSync(TMP_DB).size} bytes)`);
}

export function ensureServerlessDatabase(): void {
  if (!process.env.VERCEL) return;

  process.env.DATABASE_URL = `file:${TMP_DB}`;

  const needsSeed =
    !fs.existsSync(TMP_DB) ||
    fs.statSync(TMP_DB).size < MIN_VALID_DB_BYTES;

  if (!needsSeed) return;

  if (fs.existsSync(TMP_DB)) {
    fs.unlinkSync(TMP_DB);
    console.log('[DB] Removed invalid database file from', TMP_DB);
  }

  if (SEED_DB_BASE64) {
    writeEmbeddedSeed();
    return;
  }

  const candidates = [
    path.join(process.cwd(), 'prisma', 'seed.db'),
    path.join(__dirname, '..', '..', 'prisma', 'seed.db'),
  ];

  for (const seedPath of candidates) {
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, TMP_DB);
      databaseWasReseeded = true;
      console.log('[DB] Copied seed database to', TMP_DB);
      return;
    }
  }

  throw new Error('[DB] No seed database available for Vercel serverless');
}

ensureServerlessDatabase();
