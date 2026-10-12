import { createHmac } from "node:crypto";
import { z } from "zod";

export const e2eRunSchema = z.object({ runId: z.uuid() }).strict();

const identitySchema = z.object({
  email: z.email(),
  id: z.string(),
  name: z.string(),
  password: z.string(),
});
export const e2eSetupSchema = z.object({
  exercises: z.array(z.object({ displayName: z.string(), slug: z.string() })),
  professional: identitySchema,
  runId: z.uuid(),
  stranger: identitySchema,
});

export const smokeExerciseSlugs = [
  "color-sequence",
  "odd-one-out",
  "reaction-time-grid",
  "stimulus-count",
  "stroop-color-interference",
  "syllables",
  "visual-recognition",
  "word-matching",
] as const;

export function e2eIdentities(runId: string, namespace: string, token: string) {
  const identity = (slot: "professional" | "stranger") => {
    const derive = (purpose: string) =>
      createHmac("sha256", token)
        .update(`${namespace}:${runId}:${slot}:${purpose}`)
        .digest("hex");
    const id = `e2e-${derive("identity")}`;
    return {
      email: `${id}@example.invalid`,
      id,
      name:
        slot === "professional"
          ? "Synthetic professional"
          : "Synthetic stranger",
      password: derive("password"),
    };
  };
  return {
    professional: identity("professional"),
    stranger: identity("stranger"),
  };
}
