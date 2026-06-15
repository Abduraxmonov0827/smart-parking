import '../src/config/db-url';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let app: Express | undefined;
let initialized = false;

async function init() {
  if (initialized) return;

  const { execSync } = await import('child_process');
  const dbUrl = process.env.DATABASE_URL || 'file:/tmp/parking.db';

  try {
    execSync('npx prisma db push --skip-generate', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });

    if (process.env.RUN_SEED !== 'false') {
      execSync('npx tsx prisma/seed.ts', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
    }
  } catch (e) {
    console.error('[DB Init Error]', e);
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
