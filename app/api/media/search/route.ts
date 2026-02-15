import { type NextRequest, NextResponse } from "next/server";
import { getMedias } from "@/app/actions/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ media: [], success: true });
    }

    const media = await getMedias(query.trim(), undefined, limit);

    return NextResponse.json({
      media,
      success: true,
    });
  } catch (error) {
    console.error("Error searching media:", error);
    return NextResponse.json(
      { error: "Error al buscar medios" },
      { status: 500 }
    );
  }
}
