"use server";

import { db } from "@/lib/db";
import {
  organization,
  member,
  invitation,
  NewOrganization,
  UpdateOrganization,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { getCurrentUser } from "./users";
import { auth } from "@/lib/auth/auth.server";

export async function getCurrentUserOrganizations() {
  try {
    const user = await getCurrentUser();

    if (!user) return [];

    const userOrganizations = await db.query.member.findMany({
      where: eq(member.userId, user.id),
      with: {
        organization: true,
      },
      orderBy: desc(member.createdAt),
    });

    return userOrganizations.map((m) => m.organization);
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

export async function getAllOrganizations() {
  try {
    const organizations = await db.query.organization.findMany({
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invitations: true,
      },
      orderBy: desc(organization.createdAt),
    });

    return organizations;
  } catch (error) {
    console.error("Error getting all organizations:", error);
    throw error;
  }
}

export async function getOrganizationById(id: string) {
  try {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, id),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invitations: true,
      },
    });

    return org;
  } catch (error) {
    console.error("Error getting organization by id:", error);
    throw error;
  }
}

export async function createOrganization(data: NewOrganization) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    const orgId = nanoid();
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const [newOrg] = await db
      .insert(organization)
      .values({
        id: orgId,
        name: data.name,
        slug,
        logo: data.logo,
        metadata: data.metadata,
      })
      .returning();

    // Add the creator as admin member
    await db.insert(member).values({
      id: nanoid(),
      organizationId: orgId,
      userId: user.id,
      role: "admin",
    });

    // Revalidate the main organizations page to show the new organization
    revalidatePath("/dashboard/organizations");
    return newOrg;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganization,
) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(eq(member.organizationId, id), eq(member.userId, user.id)),
    });

    if (!userMember || userMember.role !== "admin") {
      throw new Error("You don't have permission to edit this organization");
    }

    const updatedOrg = await db
      .update(organization)
      .set(data)
      .where(eq(organization.id, id))
      .returning();

    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${id}`);
    return updatedOrg[0];
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
}

export async function deleteOrganization(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, id),
        eq(member.userId, user.id),
      ),
    });

    if (!userMember || userMember.role !== "admin") {
      throw new Error("You don't have permission to delete this organization");
    }

    await db.delete(organization).where(eq(organization.id, id));

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
  role: string = "member",
) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, user.id),
      ),
    });

    if (!userMember || userMember.role !== "admin") {
      throw new Error(
        "You don't have permission to invite users to this organization",
      );
    }

    const newInvitation = await db
      .insert(invitation)
      .values({
        id: nanoid(),
        organizationId,
        email,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        inviterId: user.id,
      })
      .returning();

    revalidatePath("/dashboard/organizations");
    return newInvitation[0];
  } catch (error) {
    console.error("Error inviting user to organization:", error);
    throw error;
  }
}

export async function removeMemberFromOrganization(
  organizationId: string,
  userId: string,
) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, user.id),
      ),
    });

    if (!userMember || userMember.role !== "admin") {
      throw new Error(
        "You don't have permission to remove members from this organization",
      );
    }

    await db
      .delete(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      );

    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${organizationId}`);
  } catch (error) {
    console.error("Error removing member from organization:", error);
    throw error;
  }
}

export async function getOrgMembers(organizationId?: string) {
  try {
    const whereClause = organizationId
      ? eq(member.organizationId, organizationId)
      : undefined;

    const members = await db.query.member.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: member.createdAt,
    });

    return members;
  } catch (error) {
    console.error("Error getting organization members:", error);
    throw error;
  }
}

export async function addMemberToOrganization(
  userId: string,
  role: "member" | "admin" | "owner",
  organizationId: string
) {
  try {
    if (!userId || !role || !organizationId) {
      return { error: "Faltan campos requeridos" };
    }

    // Add the member to the organization using Better Auth API
    const result = await auth.api.addMember({
      body: {
        userId: userId,
        role: role,
        organizationId: organizationId,
      },
    });

    if (!result) {
      return { error: "Error al agregar miembro" };
    }

    revalidatePath(`/dashboard/organizations/${organizationId}`);
    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    console.error("Error adding member:", error);
    return { error: "Error interno del servidor" };
  }
}
