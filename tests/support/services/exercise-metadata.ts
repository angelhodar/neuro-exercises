import { assertTestEnvironment } from "../environment";

export function generateExerciseData() {
  assertTestEnvironment();
  return Promise.resolve({
    audioPrompt: "Instrucciones de prueba",
    description: "Ejercicio sintético para comprobar la creación",
    displayName: "Ejercicio generado de prueba",
    slug: `e2e-${crypto.randomUUID()}`,
    tags: ["prueba"],
    thumbnailPrompt: "Colores de prueba",
  });
}

export function generateThumbnail() {
  assertTestEnvironment();
  return Promise.resolve(null);
}

export function generateAudioInstructions() {
  assertTestEnvironment();
  return Promise.resolve(null);
}
