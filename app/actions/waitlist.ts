"use server";

import { checkBotId } from "botid/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistEmails } from "@/lib/db/schema";

const emailSchema = z.email("Introduce un email válido");

export async function joinWaitlist(email: string) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return { error: "Acceso denegado" };
    }

    emailSchema.parse(email);

    await db
      .insert(waitlistEmails)
      .values({ email })
      .onConflictDoNothing({ target: waitlistEmails.email });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Email no válido" };
    }

    console.error("Waitlist signup error:", error);
    return { error: "Algo salió mal, inténtalo de nuevo" };
  }
}
