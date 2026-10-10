import { type NextRequest, NextResponse } from "next/server";
import { AuthError, type AuthUser, requireAuth } from "./require-auth";

interface AuthContext<T = unknown> {
  params: T;
  user: AuthUser;
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
      const user = await requireAuth(request.headers);

      const authContext: AuthContext<T> = {
        params: context.params,
        user,
      };

      return await handler(request, authContext);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      console.error("Error en withAuth middleware:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  };
}
