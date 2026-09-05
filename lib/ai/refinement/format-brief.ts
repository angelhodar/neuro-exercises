import type { ExerciseBrief } from "@/lib/schemas/exercise-refinement";

function list(items: string[]) {
  return items.length > 0
    ? items.map((item) => `- ${item}`).join("\n")
    : "- Ninguna consideración adicional";
}

export function formatExerciseBrief(brief: ExerciseBrief) {
  return `# Especificación acordada del ejercicio

Resumen acordado: ${brief.summary}

## Configuración
### Parámetros configurables
${list(brief.configurableParameters)}

### Dificultad y progresión
${brief.difficultyAndProgression}

## Actividad
### Estímulos
${list(brief.stimuli)}

### Flujo de la tarea
${brief.taskFlow.map((step, index) => `${index + 1}. ${step}`).join("\n")}

### Criterio de finalización
${brief.completionCriteria}

### Feedback
${brief.feedback}

## Resultados
${list(brief.resultsToRecord)}

## Accesibilidad
${list(brief.accessibilityConsiderations)}`;
}
