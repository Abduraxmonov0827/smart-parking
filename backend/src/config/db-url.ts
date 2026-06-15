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

function isServerlessRuntime(): boolean {
  return (
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    process.env.DATABASE_URL?.includes('/tmp/parking.db') === true
  );
}

function writeEmbeddedSeed(): void {
  if (!SEED_DB_BASE64) {
    throw new Error('[DB] Embedded seed database is empty');
  }

  fs.writeFileSync(TMP_DB, Buffer.from(SEED_DB_BASE64, 'base64'));
  databaseWasReseeded = true;
  console.log('[DB] Wrote embedded seed database to', TMP_DB, `(${fs.statSync(TMP_DB).size} bytes)`);
}

export function ensureServerlessDatabase(): void {
  if (!isServerlessRuntime()) return;

  process.env.DATABASE_URL = `file:${TMP_DB}`;

  const needsSeed =
    !fs.existsSync(TMP_DB) ||
    fs.statSync(TMP_DB).size < MIN_VALID_DB_BYTES;

  if (!needsSeed) return;

  if (fs.existsSync(TMP_DB)) {
    fs.unlinkSync(TMP_DB);
    console.log('[DB] Removed invalid database file from', TMP_DB);
  }

  writeEmbeddedSeed();
}

export function getServerlessDbStatus() {
  const exists = fs.existsSync(TMP_DB);
  return {
    runtime: isServerlessRuntime(),
    databaseUrl: process.env.DATABASE_URL,
    tmpDbExists: exists,
    tmpDbBytes: exists ? fs.statSync(TMP_DB).size : 0,
    embeddedSeedBytes: SEED_DB_BASE64 ? Buffer.from(SEED_DB_BASE64, 'base64').length : 0,
    reseeded: databaseWasReseeded,
  };
}

ensureServerlessDatabase();
