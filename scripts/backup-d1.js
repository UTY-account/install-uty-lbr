const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupDir = path.resolve(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-d1-${dateStr}.sql`);

console.log(`\n📦 Starting Cloudflare D1 Database Backup...`);
console.log(`Target file: ${backupFile}`);

try {
  execSync(`npx wrangler d1 export pro-install-db --remote --output="${backupFile}"`, {
    stdio: 'inherit',
  });
  console.log(`\n✅ Backup successfully saved to: ${backupFile}`);
} catch (err) {
  console.error(`\n❌ Failed to export D1 database:`, err.message);
}
