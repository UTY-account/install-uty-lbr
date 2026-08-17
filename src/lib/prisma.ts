import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrismaClient(d1?: any): PrismaClient {
  const activeD1 = d1 || (globalThis as any).DB || (process.env as any).DB;
  if (activeD1) {
    try {
      const adapter = new PrismaD1(activeD1);
      return new PrismaClient({ adapter: adapter as any, log: ['error'] } as any);
    } catch (e) {
      console.warn('Fallback to standard PrismaClient:', e);
    }
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
