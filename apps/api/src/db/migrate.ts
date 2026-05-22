import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import pool from "./client";

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running database migrations...");

    // Track applied migrations so each file runs at most once.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: tables } = await client.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') AS exists"
    );

    const schemaPath = join(__dirname, "schema.sql");
    if (!tables[0].exists && existsSync(schemaPath)) {
      await client.query(readFileSync(schemaPath, "utf-8"));
      console.log("✓ Base schema applied");
    } else {
      console.log("• Base schema already present, skipping schema.sql");
    }

    const migrationsDir = join(__dirname, "migrations");
    if (existsSync(migrationsDir)) {
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      const { rows: applied } = await client.query<{ id: string }>(
        "SELECT id FROM schema_migrations"
      );
      const appliedSet = new Set(applied.map((r) => r.id));

      for (const file of files) {
        if (appliedSet.has(file)) {
          console.log(`• Skipping ${file} (already applied)`);
          continue;
        }
        const sql = readFileSync(join(migrationsDir, file), "utf-8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query(
            "INSERT INTO schema_migrations (id) VALUES ($1)",
            [file]
          );
          await client.query("COMMIT");
          console.log(`✓ Migration applied: ${file}`);
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        }
      }
    }
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }

  await pool.end();
}

migrate();
