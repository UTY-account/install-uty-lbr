import { PrismaClient as PrismaWasmClient } from '@prisma/client/wasm';
import { PrismaClient as PrismaNodeClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

let cachedPrismaWithD1: any = null;
let cachedD1Ref: any = null;

function resolveD1Database(): any {
  const g = globalThis as any;
  const cfSymbol = Symbol.for('__cloudflare-context__');
  const cfContext = g[cfSymbol];

  if (cfContext?.env?.DB) return cfContext.env.DB;
  if (g.DB) return g.DB;
  if (process.env.DB && typeof (process.env.DB as any).prepare === 'function') return process.env.DB;
  return null;
}

export function getPrisma(): any {
  const d1 = resolveD1Database();

  if (d1) {
    if (!cachedPrismaWithD1 || cachedD1Ref !== d1) {
      cachedD1Ref = d1;
      const adapter = new PrismaD1(d1);
      cachedPrismaWithD1 = new PrismaWasmClient({
        adapter: adapter as any,
        log: ['error'],
      } as any);
    }
    return cachedPrismaWithD1;
  }

  // Check if we are running in Cloudflare workerd environment
  const isCloudflare = typeof (globalThis as any).WebSocketPair !== 'undefined' || typeof (globalThis as any).EdgeRuntime !== 'undefined';

  if (isCloudflare) {
    throw new Error('Cloudflare D1 Database (DB) binding is not accessible in the current request context.');
  }

  // Fallback for Local Development (SQLite dev.db)
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaNodeClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
