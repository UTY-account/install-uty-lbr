const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Step 1: Generating Prisma Client ===');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('=== Step 2: Ensuring esbuild is resolvable by opennextjs ===');
const targetDir = path.resolve(__dirname, '../node_modules/@opennextjs/cloudflare/node_modules/esbuild');
const sourceDir = path.resolve(__dirname, '../node_modules/esbuild');

try {
  if (fs.existsSync(sourceDir) && !fs.existsSync(targetDir)) {
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log('Successfully linked esbuild into @opennextjs/cloudflare/node_modules');
  }
} catch (err) {
  console.warn('Could not copy esbuild folder, continuing...', err.message);
}

console.log('=== Step 3: Running OpenNext Cloudflare Build ===');
execSync('npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion', { stdio: 'inherit' });
