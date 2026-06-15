import { databaseWasReseeded, ensureServerlessDatabase } from './db-url';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

ensureServerlessDatabase();

if (databaseWasReseeded && globalForPrisma.prisma) {
  void globalForPrisma.prisma.$disconnect();
  delete globalForPrisma.prisma;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
