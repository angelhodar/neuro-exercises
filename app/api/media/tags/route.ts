import { db } from "@/lib/db";
import { mediaTagsView } from "@/lib/db/schema";
import { asc, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase();

  const where = query ? ilike(mediaTagsView.tag, `%${query}%`) : undefined;

  try {
    const tagRows = await db
      .select({ tag: mediaTagsView.tag })
      .from(mediaTagsView)
      .where(where)
      .orderBy(asc(mediaTagsView.tag))
      .limit(20);

    const tags = tagRows.map((row) => row.tag);

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Failed to fetch media tags:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
