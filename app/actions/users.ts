"use server"

import { auth } from "@/lib/auth/auth.server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users, type User } from "@/lib/db/schema"

// Obtener el usuario actual completo desde Better Auth y la base de datos
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Obtener la sesión de Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return null
    }

    return session.user as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Obtener lista de usuarios para seleccionar como destinatarios
export async function getAvailableUsers(): Promise<User[]> {
  try {
    const userData = await db.select().from(users).orderBy(users.name)

    return userData
  } catch (error) {
    console.error("Error getting available users:", error)
    throw error
  }
}