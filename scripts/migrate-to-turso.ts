/**
 * migrate-to-turso.ts
 * Seeds the remote Turso database with all data from the local SQLite database.
 * Respects foreign-key dependency order and skips tables that already have data in Turso.
 */

import { createClient, type Client } from "@libsql/client";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LOCAL_URL = "file:db/custom.db";
const TURSO_URL = "libsql://fractalx-ingalaco.aws-us-west-2.turso.io";
const TURSO_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcxNDA0ODQsImlkIjoiMDE5ZGM1ZDItZjMwMS03ZDdlLWI0NzAtOGVmZDQ5YTdlMWM1IiwicmlkIjoiNzI1OTVkZGEtOGQzOC00MWVjLWI0NGYtZGY0NDc3NGUyYmIyIn0.hXw6H1p8IhtCm9wglipKDBfo85VZflvPPSVhuw5ClfKKknpVQ3BoOufOGR6kI918Rtr-X_zHaTpK-zPIVdGiCg";

// ---------------------------------------------------------------------------
// Table names in FK-safe dependency order
// "Transaction" is a SQLite reserved word — always quote it.
// ---------------------------------------------------------------------------

const TABLE_ORDER: string[] = [
  // 1. No FK dependencies (reference tables / CMS)
  "AssetType",
  "Currency",
  "SiteSetting",
  "Translation",
  "FAQ",
  "TeamMember",
  "LegalDocument",
  "EmailTemplate",
  "Testimonial",
  "Promotion",
  "Newsletter",
  "CmsPage",
  "AuditLog",
  "LiquidityPool",
  "InvestmentAnalysis",

  // 2. User (no FK deps)
  "User",

  // 3. Asset (no FK deps)
  "Asset",

  // 4. Depends on Asset
  "AssetImage",
  "AssetDocument",
  "CashFlowProjection",

  // 5. Depends on User
  "KYCDocument",
  "Notification",
  "ReferralCode",
  "BlogPost",          // optional authorId → User
  "PageVisit",         // optional userId
  "EmailLog",          // no FK

  // 6. Depends on User + Asset
  "Investment",

  // 7. Depends on Investment (+ User, Asset)
  "Transaction",       // userId → User, investmentId? → Investment  (reserved word!)
  "DividendPayment",
  "SecondaryMarketListing",

  // 8. Depends on LiquidityPool + User + Investment
  "LiquidityRequest",

  // 9. Depends on User + ReferralCode
  "Referral",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Common SQL reserved words that appear as table/column names in our schema
const RESERVED = new Set([
  "transaction", "user", "group", "order", "key", "value",
  "status", "type", "limit", "offset", "check", "default",
]);

/** Always quote identifiers to be safe (Turso is strict about reserved words) */
function q(name: string): string {
  return `"${name}"`;
}

async function countRows(client: Client, table: string): Promise<number> {
  const res = await client.execute({ sql: `SELECT COUNT(*) as c FROM ${q(table)}`, args: [] });
  return Number(res.rows[0].c);
}

async function readAllRows(client: Client, table: string) {
  const res = await client.execute({ sql: `SELECT * FROM ${q(table)}`, args: [] });
  return { columns: res.columns, rows: res.rows };
}

function buildInsertSql(table: string, columns: string[]): string {
  const quotedCols = columns.map(c => q(c)).join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  return `INSERT INTO ${q(table)} (${quotedCols}) VALUES (${placeholders})`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Turso Migration Script ===\n");

  // Connect
  const local = createClient({ url: LOCAL_URL });
  const remote = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Verify connectivity
  try {
    await remote.execute("SELECT 1");
    console.log("✅ Connected to Turso successfully.\n");
  } catch (err) {
    console.error("❌ Failed to connect to Turso:", err);
    process.exit(1);
  }

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const errors: string[] = [];

  for (const table of TABLE_ORDER) {
    try {
      // Count local rows
      const localCount = await countRows(local, table);
      if (localCount === 0) {
        console.log(`⏭️  ${table.padEnd(30)} — 0 local rows, skipping`);
        continue;
      }

      // Count remote rows
      const remoteCount = await countRows(remote, table);
      if (remoteCount > 0) {
        console.log(`⏭️  ${table.padEnd(30)} — already has ${remoteCount} rows in Turso, skipping`);
        totalSkipped += localCount;
        continue;
      }

      // Read all rows from local
      const { columns, rows } = await readAllRows(local, table);
      const insertSql = buildInsertSql(table, columns);

      // Batch insert into remote (one-by-one for safety)
      let inserted = 0;
      for (const row of rows) {
        const values = columns.map(col => row[col as string] as unknown);
        await remote.execute({ sql: insertSql, args: values });
        inserted++;
      }

      console.log(`✅ ${table.padEnd(30)} — inserted ${inserted} rows`);
      totalMigrated += inserted;
    } catch (err: any) {
      console.error(`❌ ${table.padEnd(30)} — ERROR: ${err.message}`);
      errors.push(`${table}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`  Total rows migrated:  ${totalMigrated}`);
  console.log(`  Total rows skipped:   ${totalSkipped} (already existed in Turso)`);
  console.log(`  Tables with errors:   ${totalErrors}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    for (const e of errors) {
      console.log(`  - ${e}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
