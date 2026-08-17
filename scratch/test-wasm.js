const { PrismaClient: PrismaWasmClient } = require('@prisma/client/wasm');
const { PrismaD1 } = require('@prisma/adapter-d1');

console.log('PrismaWasmClient is:', typeof PrismaWasmClient);
console.log('PrismaD1 is:', typeof PrismaD1);
