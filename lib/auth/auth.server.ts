import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { db } from "../db/index";
// biome-ignore lint/performance/noNamespaceImport: drizzle requires namespace import for schema
import * as schema from "../db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      verification: schema.verifications,
      account: schema.accounts,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  plugins: [organization(), admin()],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
