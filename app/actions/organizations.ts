"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth.server";
import { AuthError, requireAdmin, requireAuth } from "@/lib/auth/require-auth";
import {
  requireOrganizationManager,
  requireOrganizationMember,
} from "@/lib/auth/require-organization";
import { hasRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import {
  invitation,
  member,
  organization,
  type UpdateOrganization,
  users,
} from "@/lib/db/schema";
import {
  addOrganizationMemberSchema,
  organizationInputSchema,
  organizationRoleSchema,
  organizationSlugSchema,
} from "@/lib/schemas/auth";

function parseMetadata(value: string | null | undefined) {
  if (!value) {
    return;
  }
  try {
    return z.record(z.string(), z.unknown()).parse(JSON.parse(value));
  } catch {
    // Preserve legacy free-text metadata when using Better Auth's object API.
    return { description: value };
  }
}

export async function getCurrentUserOrganizations() {
  try {
    const user = await requireAuth();
    const memberships = await db.query.member.findMany({
      orderBy: desc(member.createdAt),
      where: eq(member.userId, user.id),
      with: { organization: true },
    });
    return memberships.map((membership) => membership.organization);
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

export async function getAllOrganizations() {
  try {
    const user = await requireAuth();
    const organizationIds = db
      .select({ id: member.organizationId })
      .from(member)
      .where(eq(member.userId, user.id));
    return await db.query.organization.findMany({
      orderBy: desc(organization.createdAt),
      where: hasRole(user.role, "admin")
        ? undefined
        : inArray(organization.id, organizationIds),
      with: {
        invitations: { columns: { status: true } },
        members: { columns: { id: true, role: true, userId: true } },
      },
    });
  } catch (error) {
    console.error("Error getting organizations:", error);
    throw error;
  }
}

export async function getOrganizationById(id: string) {
  try {
    const user = await requireAuth();
    const membership = hasRole(user.role, "admin")
      ? null
      : await requireOrganizationMember(id);
    const canManage =
      hasRole(user.role, "admin") ||
      hasRole(membership?.role, "admin") ||
      hasRole(membership?.role, "owner");
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, id),
      with: {
        members: {
          with: { user: { columns: { email: true, id: true, name: true } } },
        },
      },
    });
    if (!org) {
      return;
    }
    const invitations = canManage
      ? await db.query.invitation.findMany({
          where: eq(invitation.organizationId, id),
        })
      : [];
    return { ...org, invitations };
  } catch (error) {
    console.error("Error getting organization:", error);
    throw error;
  }
}

export async function createOrganization(
  data: z.input<typeof organizationInputSchema>
) {
  try {
    await requireAuth();
    const input = organizationInputSchema.parse(data);
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const parsedSlug = organizationSlugSchema.parse(slug);
    const created = await auth.api.createOrganization({
      body: {
        keepCurrentActiveOrganization: true,
        logo: input.logo || undefined,
        metadata: parseMetadata(input.metadata),
        name: input.name,
        slug: parsedSlug,
      },
      headers: await headers(),
    });
    revalidatePath("/dashboard/organizations");
    return created;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
}

export async function updateOrganization(id: string, data: UpdateOrganization) {
  try {
    await requireOrganizationManager(id);
    const input = organizationInputSchema.partial().parse(data);
    const updated = await auth.api.updateOrganization({
      body: {
        data: {
          logo: input.logo,
          metadata: parseMetadata(input.metadata),
          name: input.name,
          slug: input.slug || undefined,
        },
        organizationId: id,
      },
      headers: await headers(),
    });
    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${id}`);
    return updated;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
}

export async function deleteOrganization(id: string) {
  try {
    const membership = await requireOrganizationManager(id);
    if (!hasRole(membership.role, "owner")) {
      throw new AuthError(
        "Solo un propietario puede eliminar la organización.",
        403
      );
    }
    await auth.api.deleteOrganization({
      body: { organizationId: id },
      headers: await headers(),
    });
    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${id}`);
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role = "member"
) {
  try {
    const membership = await requireOrganizationManager(organizationId);
    const parsedRole = organizationRoleSchema.parse(role);
    if (parsedRole === "owner" && !hasRole(membership.role, "owner")) {
      throw new AuthError(
        "Solo un propietario puede asignar el rol de propietario.",
        403
      );
    }
    const created = await auth.api.createInvitation({
      body: { email: z.email().parse(email), organizationId, role: parsedRole },
      headers: await headers(),
    });
    revalidatePath("/dashboard/organizations");
    return created;
  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
}

export async function removeMemberFromOrganization(
  organizationId: string,
  userId: string
) {
  try {
    await requireOrganizationManager(organizationId);
    const target = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, userId)
      ),
    });
    if (!target) {
      throw new Error("Miembro no encontrado.");
    }
    await auth.api.removeMember({
      body: { memberIdOrEmail: target.id, organizationId },
      headers: await headers(),
    });
    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${organizationId}`);
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
}

export async function getOrgMembers(organizationId?: string) {
  try {
    const user = await requireAuth();
    if (organizationId && !hasRole(user.role, "admin")) {
      await requireOrganizationMember(organizationId);
    } else if (!organizationId) {
      await requireAdmin();
    }
    return await db.query.member.findMany({
      orderBy: member.createdAt,
      where: organizationId
        ? eq(member.organizationId, organizationId)
        : undefined,
      with: {
        organization: { columns: { id: true, name: true, slug: true } },
        user: {
          columns: { createdAt: true, email: true, id: true, name: true },
        },
      },
    });
  } catch (error) {
    console.error("Error getting organization members:", error);
    throw error;
  }
}

export async function addMemberToOrganization(
  email: string,
  role: "member" | "admin" | "owner",
  organizationId: string
) {
  try {
    const membership = await requireOrganizationManager(organizationId);
    const input = addOrganizationMemberSchema.parse({
      email,
      organizationId,
      role,
    });
    if (input.role === "owner" && !hasRole(membership.role, "owner")) {
      throw new AuthError(
        "Solo un propietario puede asignar el rol de propietario.",
        403
      );
    }
    const target = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, input.email),
    });
    if (!target) {
      return { error: "No se encontró un usuario con ese email" };
    }
    await auth.api.addMember({
      body: {
        organizationId: input.organizationId,
        role: input.role,
        userId: target.id,
      },
    });
    revalidatePath(`/dashboard/organizations/${organizationId}`);
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    console.error("Error adding member:", error);
    return {
      error:
        error instanceof AuthError
          ? error.message
          : "No se pudo agregar el miembro",
    };
  }
}
