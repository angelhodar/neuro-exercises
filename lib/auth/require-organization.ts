import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { AuthError, requireAuth } from "./require-auth";
import { hasRole } from "./roles";

export async function requireOrganizationMember(organizationId: string) {
  const user = await requireAuth();
  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, user.id)
    ),
  });
  if (!membership) {
    throw new AuthError("No tienes acceso a esta organización.", 403);
  }
  return membership;
}

export async function requireOrganizationManager(organizationId: string) {
  const membership = await requireOrganizationMember(organizationId);
  if (
    !(hasRole(membership.role, "owner") || hasRole(membership.role, "admin"))
  ) {
    throw new AuthError(
      "No tienes permisos para gestionar la organización.",
      403
    );
  }
  return membership;
}
