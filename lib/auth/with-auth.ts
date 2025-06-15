import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth.server"
import type { User } from "@/lib/db/schema"

// Tipo para el contexto que incluye params y user
type AuthContext<T = any> = {
  params: T
  user: User
}

// Tipo para el handler autenticado
type AuthenticatedHandler<T = any> = (
  request: NextRequest,
  context: AuthContext<T>,
) => Promise<NextResponse> | NextResponse

// Tipo para el handler original de Next.js
type OriginalHandler<T = any> = (request: NextRequest, context: { params: T }) => Promise<NextResponse> | NextResponse

/**
 * Middleware que autentica al usuario usando Better Auth antes de ejecutar el handler
 * @param handler - El route handler que se ejecutará si el usuario está autenticado
 * @returns El handler envuelto con autenticación
 */
export function withAuth<T = any>(handler: AuthenticatedHandler<T>): OriginalHandler<T> {
  return async (request: NextRequest, context: { params: T }) => {
    try {
      // Obtener la sesión de Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      // Verificar si hay sesión y usuario
      if (!session || !session.user) {
        return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 })
      }

      // Crear el contexto con el usuario autenticado
      const authContext: AuthContext<T> = {
        params: context.params,
        user: session.user as User,
      }

      // Ejecutar el handler original con el contexto autenticado
      return await handler(request, authContext)
    } catch (error) {
      console.error("Error en withAuth middleware:", error)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
  }
}
