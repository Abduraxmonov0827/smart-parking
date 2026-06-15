import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { arduinoSimulator } from '../src/services/arduino.service';

let initialized = false;

async function init() {
  if (initialized) return;
  const { execSync } = await import('child_process');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'pipe' });
    if (process.env.RUN_SEED !== 'false') {
      execSync('npx tsx prisma/seed.ts', { stdio: 'pipe' });
    }
    await arduinoSimulator.start();
  } catch (e) {
    console.warn('[Init]', e);
  }
  initialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await init();
  return app(req, res);
}
