"use server";

import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth.server";
import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return session.user as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUsers() {
  try {
    const allUsers = await db.query.users.findMany({
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
      orderBy: desc(users.createdAt),
    });

    return allUsers;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

export async function getAvailableUsers() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
    });

    return allUsers;
  } catch (error) {
    console.error("Error getting available users:", error);
    throw error;
  }
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export async function createUser(data: CreateUserData) {
  try {
    const result = await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      },
    });

    // Revalidar la página de usuarios para mostrar el nuevo usuario
    revalidatePath("/dashboard/users");

    return { success: true, user: result.user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error interno del servidor" };
  }
}
