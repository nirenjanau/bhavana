import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import pool from "./client";

async function migrate() {
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  console.log("Running database migrations...");

  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log("✓ Database schema applied");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }

  await pool.end();
}

migrate();
