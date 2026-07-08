#!/usr/bin/env node
// Verifies the SQL practice database: seeds PGlite (real Postgres in WASM),
// then executes every runnable question's model answer and asserts it returns
// rows. Run whenever seed data or SQL questions change:
//   node scripts/verify-sql-practice.mjs

import { PGlite } from "@electric-sql/pglite";
import { SQL_PRACTICE_SEED, runRolledBack, resultsMatch } from "../src/data/sql-practice-db.js";
import { SQL_QUESTIONS } from "../src/data/questions-sql.js";

const db = new PGlite();
await db.exec(SQL_PRACTICE_SEED);
console.log("✓ seed executed");

const counts = await db.exec(`
  SELECT 'customers' t, count(*) n FROM customers
  UNION ALL SELECT 'orders', count(*) FROM orders
  UNION ALL SELECT 'sessions', count(*) FROM sessions
  UNION ALL SELECT 'funnel_events', count(*) FROM funnel_events
  UNION ALL SELECT 'employees', count(*) FROM employees
  UNION ALL SELECT 'users', count(*) FROM users
  UNION ALL SELECT 'listings', count(*) FROM listings
  UNION ALL SELECT 'order_items', count(*) FROM order_items
  UNION ALL SELECT 'events', count(*) FROM events
`);
for (const r of counts[0].rows) console.log(`  ${r.t}: ${r.n} rows`);

const runnable = SQL_QUESTIONS.filter((q) => q.runnable);
console.log(`\nrunnable questions: ${runnable.length}`);
let fail = 0;

for (const q of runnable) {
  await db.exec("BEGIN");
  try {
    const results = await db.exec(q.modelAnswer);
    const withRows = [...results].reverse().find((r) => r.fields?.length > 0);
    const n = withRows?.rows?.length ?? 0;
    if (n > 0) {
      console.log(`PASS ${q.id} ${q.title} — ${n} rows`);
    } else {
      fail++;
      console.log(`FAIL ${q.id} ${q.title} — executed but returned 0 rows`);
    }
  } catch (err) {
    fail++;
    console.log(`FAIL ${q.id} ${q.title} — ${err.message}`);
  } finally {
    await db.exec("ROLLBACK");
  }
}

// ── Grading comparator: equivalent query (different aliases, row order,
// formatting) must match; a wrong query must not.
const sqq1 = SQL_QUESTIONS.find((q) => q.id === "sqq1");
const model = await runRolledBack(db, sqq1.modelAnswer);
const equivalent = await runRolledBack(db, `
  SELECT c.segment AS seg,
         COUNT(DISTINCT o.customer_id) AS buyers,
         SUM(o.amount) AS rev,
         ROUND(SUM(o.amount) / COUNT(DISTINCT o.customer_id), 2) AS aov
  FROM orders o JOIN customers c ON o.customer_id = c.id
  WHERE o.status = 'completed'
  GROUP BY c.segment
  HAVING SUM(o.amount) > 10000
  ORDER BY seg`); // different aliases + different ORDER BY than the model
const wrong = await runRolledBack(db, `
  SELECT c.segment, COUNT(*) AS buyers, SUM(o.amount) AS rev,
         ROUND(SUM(o.amount) / COUNT(*), 2) AS aov
  FROM orders o JOIN customers c ON o.customer_id = c.id
  GROUP BY c.segment`); // missing status filter, COUNT(*) instead of DISTINCT

if (!resultsMatch(model, equivalent)) { fail++; console.log("FAIL comparator: equivalent query did not match"); }
else console.log("PASS comparator: equivalent query matches");
if (resultsMatch(model, wrong)) { fail++; console.log("FAIL comparator: wrong query matched"); }
else console.log("PASS comparator: wrong query rejected");

console.log(fail ? `\n${fail} failure(s)` : "\nall model answers verified");
process.exit(fail ? 1 : 0);
