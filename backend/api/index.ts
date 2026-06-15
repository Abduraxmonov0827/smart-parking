import '../src/config/db-url';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import fs from 'fs';

let app: Express | undefined;
let initialized = false;

async function init() {
  if (initialized) return;

  const dbUrl = process.env.DATABASE_URL || 'file:/tmp/parking.db';
  const tmpDb = '/tmp/parking.db';

  if (process.env.VERCEL && !fs.existsSync(tmpDb)) {
    const { execSync } = await import('child_process');
    try {
      execSync('npx prisma db push --skip-generate', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
      execSync('npx tsx prisma/seed.ts', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
      console.log('[DB] Created and seeded via prisma');
    } catch (e) {
      console.error('[DB Init Error]', e);
    }
  }

  if (!app) {
    const mod = await import('../src/app');
    app = mod.default;
  }

  initialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await init();
    return app!(req, res);
  } catch (err) {
    console.error('[Handler Error]', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
