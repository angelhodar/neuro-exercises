"use server"

import { auth } from "@/lib/auth/auth.server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users, type User } from "@/lib/db/schema"

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

export async function getAvailableUsers() {
  try {
    const userData = await db.query.users.findMany({
      orderBy: users.name,
    })
    return userData
  } catch (error) {
    console.error("Error getting available users:", error)
    throw error
  }
}