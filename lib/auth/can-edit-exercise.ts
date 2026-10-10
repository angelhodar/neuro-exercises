import type { Exercise, User } from "@/lib/db/schema";
import { hasRole } from "./roles";

type ExerciseUser = Pick<User, "id"> & { role?: string | null };

export function canEditExercise(exercise: Exercise, user: ExerciseUser) {
  return hasRole(user.role, "admin") || exercise.creatorId === user.id;
}

export function assertCanEditExercise(exercise: Exercise, user: ExerciseUser) {
  if (!canEditExercise(exercise, user)) {
    throw new Error("No tienes permisos para editar este ejercicio");
  }
}
