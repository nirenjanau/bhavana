import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import pool from "./client";

async function seed() {
  const seedSQL = readFileSync(join(__dirname, "seed.sql"), "utf-8");
  console.log("Running database seed...");

  const client = await pool.connect();
  try {
    await client.query(seedSQL);
    console.log("✓ Seed data inserted");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }

  await pool.end();
}

seed();
