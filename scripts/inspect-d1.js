const { execSync } = require('child_process');

function run(sql) {
  try {
    const res = execSync(`npx wrangler.cmd d1 execute pro-install-db --command "${sql.replace(/"/g, '\\"')}" --remote --json`, { encoding: 'utf-8' });
    const json = JSON.parse(res);
    return json[0]?.results || [];
  } catch (err) {
    return { error: err.message };
  }
}

const tables = ['Company', 'Item', 'Subcontractor', 'ItemRateHistory', 'SalesOrder', 'SalesOrderItem', 'SiteVisitPhase', 'StaffMember', 'DefectTicket', 'Job', 'SubContract', 'SubContractItem', 'SubPayment', 'WorkSchedule', 'SubQuotation', 'SubQuotationItem'];

for (const t of tables) {
  const cols = run(`PRAGMA table_info(${t});`);
  console.log(`=== ${t} ===`, cols.map(c => c.name).join(', '));
}
