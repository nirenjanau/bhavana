import bcrypt from "bcryptjs";
import { queryOne } from "./client";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Ensures the admin account exists and its password matches ADMIN_PASSWORD.
 * Only rewrites the hash when verification fails, so manual DB edits are preserved
 * until the env password changes.
 */
export async function ensureAdminUser(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "admin@bhavanastudio.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  const existing = await queryOne<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (existing && (await bcrypt.compare(password, existing.password_hash))) {
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);

  if (existing) {
    await queryOne(
      "UPDATE users SET password_hash = $1, is_active = true WHERE email = $2 RETURNING id",
      [password_hash, email]
    );
    console.log(`✓ Admin password synced for ${email}`);
    return;
  }

  await queryOne(
    `INSERT INTO users (id, email, name, password_hash, role, is_active)
     VALUES ($1, $2, 'Bhavana Admin', $3, 'admin', true)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       is_active = true
     RETURNING id`,
    [ADMIN_ID, email, password_hash]
  );
  console.log(`✓ Admin account ready (${email})`);
}
