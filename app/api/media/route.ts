import { type NextRequest, NextResponse } from "next/server";
import { getMedias } from "@/app/actions/media";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || undefined;
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
    const limit = PAGE_SIZE;

    const media = await getMedias(query, limit, offset);

    return NextResponse.json({
      media,
      nextOffset: media.length < limit ? null : offset + limit,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Error al obtener medios" },
      { status: 500 }
    );
  }
}
