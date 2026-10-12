import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

export const bootstrapAdminSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(1).max(255),
  password: z.string().min(12).max(128),
});

interface BootstrapClient {
  query: (
    text: string,
    values?: unknown[]
  ) => Promise<{ rows: { email: string; id: string; role: string | null }[] }>;
}

// The caller owns the connection. Serialize bootstrap attempts and insert the
// user and credential atomically; never promote or reset an existing account.
export async function bootstrapAdmin(client: BootstrapClient, input: unknown) {
  const { email, name, password } = bootstrapAdminSchema.parse(input);
  await client.query("BEGIN");
  try {
    await client.query("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
    const existing = await client.query(
      "SELECT id, email, role FROM users WHERE lower(email) = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      if (!existing.rows[0].role?.split(",").includes("admin")) {
        throw new Error(
          "Email already exists; refusing to change its role or password"
        );
      }
      await client.query("COMMIT");
      return { created: false, id: existing.rows[0].id };
    }

    const admins = await client.query(
      "SELECT id, email, role FROM users WHERE 'admin' = ANY(string_to_array(role, ',')) LIMIT 1"
    );
    if (admins.rows.length > 0) {
      throw new Error(
        "An administrator already exists; use the admin dashboard to create users"
      );
    }

    const id = randomUUID();
    const hashedPassword = await hashPassword(password);
    await client.query(
      "INSERT INTO users (id, email, name, role, email_verified) VALUES ($1, $2, $3, 'admin', false)",
      [id, email, name]
    );
    await client.query(
      "INSERT INTO accounts (id, account_id, provider_id, user_id, password) VALUES ($1, $2, 'credential', $2, $3)",
      [randomUUID(), id, hashedPassword]
    );
    await client.query("COMMIT");
    return { created: true, id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
