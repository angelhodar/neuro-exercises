import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    // The SDK resolves Blob credentials before onBeforeGenerateToken. Reject
    // anonymous token requests first, even when storage is not configured.
    // Completion callbacks remain authenticated by the SDK's signature check.
    const user =
      body.type === "blob.generate-client-token"
        ? await requireAuth(request.headers)
        : null;
    const jsonResponse = await handleUpload({
      body,
      onBeforeGenerateToken: async () => {
        const authenticatedUser = user ?? (await requireAuth(request.headers));
        return {
          addRandomSuffix: true,
          allowedContentTypes: ["image/*", "audio/*", "video/*"],
          tokenPayload: JSON.stringify({ userId: authenticatedUser.id }),
        };
      },
      request,
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof AuthError
            ? error.message
            : "No se pudo procesar la subida",
      },
      { status: error instanceof AuthError ? error.status : 400 }
    );
  }
}
