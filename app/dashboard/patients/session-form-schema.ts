import { z } from "zod";

export const sessionFormSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  discipline: z.string().min(1, "La disciplina es obligatoria"),
  observations: z.string().optional(),
  type: z.string().min(1, "El tipo de sesión es obligatorio"),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export function sessionFormInput(data: SessionFormValues) {
  return {
    date: new Date(data.date),
    discipline: data.discipline,
    observations: data.observations || null,
    type: data.type,
  };
}
