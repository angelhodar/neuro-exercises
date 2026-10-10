"use server";

import { desc, eq, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth.server";
import {
  AuthError,
  type AuthUser,
  getAuthSession,
  requireAdmin,
  requireAuth,
} from "@/lib/auth/require-auth";
import { hasRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { member, users } from "@/lib/db/schema";
import { createUserSchema } from "@/lib/schemas/auth";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUsers() {
  try {
    await requireAdmin();
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
      with: {
        memberships: {
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return allUsers;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

export async function getAvailableUsers() {
  try {
    const user = await requireAuth();
    const organizationIds = db
      .select({ id: member.organizationId })
      .from(member)
      .where(eq(member.userId, user.id));
    const sharedUserIds = db
      .select({ id: member.userId })
      .from(member)
      .where(inArray(member.organizationId, organizationIds));
    const allUsers = await db.query.users.findMany({
      columns: { email: true, id: true, name: true },
      orderBy: desc(users.createdAt),
      where: hasRole(user.role, "admin")
        ? undefined
        : or(eq(users.id, user.id), inArray(users.id, sharedUserIds)),
    });

    return allUsers;
  } catch (error) {
    console.error("Error getting available users:", error);
    throw error;
  }
}

interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
}

export async function createUser(data: CreateUserData) {
  try {
    await requireAdmin();
    const input = createUserSchema.parse(data);
    const result = await auth.api.createUser({
      body: input,
      headers: await headers(),
    });

    // Revalidar la página de usuarios para mostrar el nuevo usuario
    revalidatePath("/dashboard/users");

    return { success: true, user: result.user };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error:
        error instanceof AuthError
          ? error.message
          : "No se pudo crear el usuario",
    };
  }
}
