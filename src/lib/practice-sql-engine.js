import { SQL_PRACTICE_SEED, runRolledBack, resultsMatch } from "../data/sql-practice-db.js";

let database;
let queue = Promise.resolve();
export function getPracticeDatabase() {
  if (!database) {
    database = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const db = new PGlite();
      try { await db.exec(SQL_PRACTICE_SEED); return db; }
      catch (error) { await db.close(); throw error; }
    })();
    database.catch(() => { database = null; });
  }
  return database;
}

export function runPracticeQuery(sql, modelAnswer, compare, onReady = () => {}) {
  // Serialize whole transactions: interleaved BEGIN/ROLLBACK would corrupt comparisons.
  const job = queue.then(async () => {
    const db = await getPracticeDatabase();
    onReady();
    const result = await runRolledBack(db, sql);
    const expected = compare ? await runRolledBack(db, modelAnswer) : null;
    return { sql, result, expected, comparison: compare ? (resultsMatch(result, expected) ? "match" : "mismatch") : null };
  });
  queue = job.catch(() => {});
  return job;
}
