import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth.server";
import { hasRole } from "./roles";

export type AuthUser = typeof auth.$Infer.Session.user;

export class AuthError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function getAuthSession(requestHeaders?: Headers) {
  return auth.api.getSession({
    headers: requestHeaders ?? (await headers()),
    query: { disableCookieCache: true },
  });
}

export async function requireAuth(requestHeaders?: Headers): Promise<AuthUser> {
  const session = await getAuthSession(requestHeaders);

  if (!session?.user) {
    throw new AuthError("No autorizado. Debes iniciar sesión.", 401);
  }

  return session.user;
}

export async function requireAdmin(requestHeaders?: Headers) {
  const user = await requireAuth(requestHeaders);
  if (!hasRole(user.role, "admin")) {
    throw new AuthError("No tienes permisos de administrador.", 403);
  }
  return user;
}
