import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth.server";
import type { User } from "@/lib/db/schema";

export async function requireAuth(): Promise<User> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No autorizado. Debes iniciar sesión.");
  }

  return session.user as User;
}
