"use server"

import { auth } from "@/lib/auth/auth.server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { organization, member, invitation } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"

export async function getCurrentUserOrganizations() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) return []

    const userOrganizations = await db.query.member.findMany({
      where: eq(member.userId, session.user.id),
      with: {
        organization: true,
      },
      orderBy: desc(member.createdAt),
    })

    return userOrganizations.map(m => m.organization)
  } catch (error) {
    console.error("Error getting user organizations:", error)
    return []
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
    })

    return organizations
  } catch (error) {
    console.error("Error getting all organizations:", error)
    throw error
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
    })

    return org
  } catch (error) {
    console.error("Error getting organization by id:", error)
    throw error
  }
}

export async function createOrganization(data: {
  name: string
  slug?: string
  logo?: string
  metadata?: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("No autorizado")
    }

    const orgId = nanoid()
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const newOrg = await db.insert(organization).values({
      id: orgId,
      name: data.name,
      slug,
      logo: data.logo,
      metadata: data.metadata,
    }).returning()

    // Add the creator as admin member
    await db.insert(member).values({
      id: nanoid(),
      organizationId: orgId,
      userId: session.user.id,
      role: "admin",
    })

    revalidatePath("/dashboard/organizations")
    return newOrg[0]
  } catch (error) {
    console.error("Error creating organization:", error)
    throw error
  }
}

export async function updateOrganization(id: string, data: {
  name?: string
  slug?: string
  logo?: string
  metadata?: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("No autorizado")
    }

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, id),
        eq(member.userId, session.user.id)
      ),
    })

    if (!userMember || userMember.role !== "admin") {
      throw new Error("No tienes permisos para editar esta organización")
    }

    const updatedOrg = await db.update(organization)
      .set(data)
      .where(eq(organization.id, id))
      .returning()

    revalidatePath("/dashboard/organizations")
    return updatedOrg[0]
  } catch (error) {
    console.error("Error updating organization:", error)
    throw error
  }
}

export async function deleteOrganization(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("No autorizado")
    }

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, id),
        eq(member.userId, session.user.id)
      ),
    })

    if (!userMember || userMember.role !== "admin") {
      throw new Error("No tienes permisos para eliminar esta organización")
    }

    await db.delete(organization).where(eq(organization.id, id))

    revalidatePath("/dashboard/organizations")
  } catch (error) {
    console.error("Error deleting organization:", error)
    throw error
  }
}

export async function inviteUserToOrganization(organizationId: string, email: string, role: string = "member") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("No autorizado")
    }

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, session.user.id)
      ),
    })

    if (!userMember || userMember.role !== "admin") {
      throw new Error("No tienes permisos para invitar usuarios a esta organización")
    }

    const newInvitation = await db.insert(invitation).values({
      id: nanoid(),
      organizationId,
      email,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      inviterId: session.user.id,
    }).returning()

    revalidatePath("/dashboard/organizations")
    return newInvitation[0]
  } catch (error) {
    console.error("Error inviting user to organization:", error)
    throw error
  }
}

export async function removeMemberFromOrganization(organizationId: string, userId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      throw new Error("No autorizado")
    }

    // Check if user is admin of the organization
    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, session.user.id)
      ),
    })

    if (!userMember || userMember.role !== "admin") {
      throw new Error("No tienes permisos para remover miembros de esta organización")
    }

    await db.delete(member).where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, userId)
      )
    )

    revalidatePath("/dashboard/organizations")
  } catch (error) {
    console.error("Error removing member from organization:", error)
    throw error
  }
} 