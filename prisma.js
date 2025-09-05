// prisma.js (ES Module)
import { PrismaClient } from '@prisma/client';

// avoid re-instantiating in dev hot-reload
const globalForPrisma = globalThis;
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;