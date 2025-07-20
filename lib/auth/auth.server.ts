import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, admin } from "better-auth/plugins"
import { db } from "../db/index"
import * as schema from "../db/schema"

export const auth = betterAuth({
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
    disableSignUp: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
})
