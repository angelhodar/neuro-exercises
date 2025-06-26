import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
