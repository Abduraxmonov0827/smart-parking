import '../src/config/db-url';
import '../src/config/seed-db';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import fs from 'fs';

let app: Express | undefined;
let initialized = false;

async function init() {
  if (initialized) return;

  const tmpDb = '/tmp/parking.db';
  if (process.env.VERCEL && !fs.existsSync(tmpDb)) {
    throw new Error(
      'Database not initialized: seed.db was not copied to /tmp. Ensure backend/prisma/seed.db is deployed.'
    );
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
