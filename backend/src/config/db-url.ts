/**
 * Vercel serverless: only /tmp is writable.
 * Must run before PrismaClient is instantiated.
 */
export function resolveDatabaseUrl(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    return 'file:/tmp/parking.db';
  }
  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

// Set env before any Prisma import elsewhere
process.env.DATABASE_URL = resolveDatabaseUrl();
