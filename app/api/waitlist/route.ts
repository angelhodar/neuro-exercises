import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistEmails } from "@/lib/db/schema";

const bodySchema = z.object({
  email: z.email("Introduce un email válido"),
});

export async function POST(request: Request) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = bodySchema.parse(body);

    await db
      .insert(waitlistEmails)
      .values({ email })
      .onConflictDoNothing({ target: waitlistEmails.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
