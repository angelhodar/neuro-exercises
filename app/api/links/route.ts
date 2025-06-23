import { type NextRequest, NextResponse } from "next/server";
import { getUserExerciseLinks, createExerciseLink } from "@/app/actions/links";

export async function GET() {
  try {
    const links = await getUserExerciseLinks();
    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, ...link } = body;

    const newLink = await createExerciseLink(link, items);

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
