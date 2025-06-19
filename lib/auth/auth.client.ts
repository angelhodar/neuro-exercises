import { createAuthClient } from "better-auth/react";

// NEXT_PUBLIC_VERCEL_URL
// NEXT_PUBLIC_VERCEL_BRANCH_URL

// TODO: Add a check for the environment to select the proper env var in case of preview deployments. For now, we're using the production URL.

const baseURL = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
