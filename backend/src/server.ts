import app from './app';
import { config } from './config';
import { arduinoSimulator } from './services/arduino.service';

async function initDatabase() {
  const { execSync } = await import('child_process');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    if (process.env.RUN_SEED !== 'false') {
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    }
  } catch (err) {
    console.warn('[DB] Init warning:', err);
  }
}

async function bootstrap() {
  if (config.nodeEnv === 'production') {
    await initDatabase();
  }

  await arduinoSimulator.start();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n🅿️  Smart Parking API v2.0`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Arduino interval: ${config.arduino.intervalMs / 1000}s\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
