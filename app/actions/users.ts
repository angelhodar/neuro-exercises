"use server"

import { auth } from "@/lib/auth/auth.server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users, member, type User } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) return null

    return session.user as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getAvailableUsers(organizationId?: string) {
  try {
    if (organizationId) {
      // Get users that are members of the specific organization
      const members = await db.query.member.findMany({
        where: eq(member.organizationId, organizationId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: member.createdAt,
      })
      return members.map(m => m.user)
    } else {
      // Get all users
      const userData = await db.query.users.findMany({
        orderBy: users.name,
      })
      return userData
    }
  } catch (error) {
    console.error("Error getting available users:", error)
    throw error
  }
}