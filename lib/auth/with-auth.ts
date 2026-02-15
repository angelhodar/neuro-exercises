import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.server";
import type { User } from "@/lib/db/schema";

interface AuthContext<T = unknown> {
  params: T;
  user: User;
}

type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: AuthContext<T>
) => Promise<NextResponse> | NextResponse;

type OriginalHandler<T = unknown> = (
  request: NextRequest,
  context: { params: T }
) => Promise<NextResponse> | NextResponse;

export function withAuth<T = unknown>(
  handler: AuthenticatedHandler<T>
): OriginalHandler<T> {
  return async (request: NextRequest, context: { params: T }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.json(
          { error: "No autorizado. Debes iniciar sesión." },
          { status: 401 }
        );
      }

      const authContext: AuthContext<T> = {
        params: context.params,
        user: session.user as User,
      };

      return await handler(request, authContext);
    } catch (error) {
      console.error("Error en withAuth middleware:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  };
}
