import type { Exercise, User } from "@/lib/db/schema";

export function canEditExercise(exercise: Exercise, user: User) {
  return user.role === "admin" || exercise.creatorId === user.id;
}

export function assertCanEditExercise(exercise: Exercise, user: User) {
  if (!canEditExercise(exercise, user)) {
    throw new Error("No tienes permisos para editar este ejercicio");
  }
}
