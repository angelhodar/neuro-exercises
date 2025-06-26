import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (!process.env.VERCEL) {
    return "http://localhost:3000";
  }

  const url =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;

  return `https://${url}`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
