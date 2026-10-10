import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { db } from "../db/index";
// biome-ignore lint/performance/noNamespaceImport: drizzle requires namespace import for schema
import * as schema from "../db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      account: schema.accounts,
      invitation: schema.invitation,
      member: schema.member,
      organization: schema.organization,
      session: schema.sessions,
      user: schema.users,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    disableSignUp: true,
    enabled: true,
  },
  plugins: [
    organization({
      invitationExpiresIn: 7 * 24 * 60 * 60,
      requireEmailVerificationOnInvitation: true,
    }),
    admin(),
    nextCookies(),
  ],
  rateLimit: {
    storage: "database",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
