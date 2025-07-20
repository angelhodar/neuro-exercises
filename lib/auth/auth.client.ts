import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins"

const getBaseURL = () => {
  if (!process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return "http://localhost:3000";
  }

  const url =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;

  return `https://${url}`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;