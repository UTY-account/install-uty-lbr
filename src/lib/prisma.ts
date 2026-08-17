import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

let cloudflarePrismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  let dbBinding: any = (globalThis as any).DB || (process.env as any).DB;

  if (!dbBinding) {
    try {
      const ctx = getCloudflareContext();
      if (ctx?.env?.DB) {
        dbBinding = ctx.env.DB;
      }
    } catch (_) {}
  }

  if (dbBinding) {
    if (!cloudflarePrismaInstance) {
      const adapter = new PrismaD1(dbBinding);
      cloudflarePrismaInstance = new PrismaClient({ adapter: adapter as any, log: ['error'] } as any);
    }
    return cloudflarePrismaInstance;
  }

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
