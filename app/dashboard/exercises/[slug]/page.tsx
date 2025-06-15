"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { ExerciseProvider } from "@/contexts/exercise-context"
import { getExerciseFromRegistry, exerciseRegistry } from "@/app/registry/exercises"

export default function DynamicExercisePage({
  params,
}: {
  params: { slug: string }
}) {
  // Use the new helper function to get the exercise details. It's much cleaner!
  const exerciseDetails = getExerciseFromRegistry(params.slug)

  if (!exerciseDetails) {
    notFound()
  }

  const { schema, defaultConfig, ConfigFormComponent, ExerciseComponent } =
    exerciseDetails

  // useState initializes state from the defaultConfig.
  // The `schema.parse` ensures the state is always a valid, fully-typed object.
  const [config, setConfig] = useState(() => {
    if (defaultConfig) {
      return schema.parse(defaultConfig)
    }
    // If there's no default config, we must show the form, so state starts as null.
    return null
  })

  function handleConfigSubmit(newConfigData: unknown) {
    try {
      const validatedConfig = schema.parse(newConfigData)
      setConfig(validatedConfig)
    } catch (error) {
      console.error("Form validation failed:", error)
      alert("La configuración no es válida. Por favor, revisa los campos.")
    }
  }

  function handleReset() {
    // Resetting to null will always bring back the config form.
    setConfig(null)
  }

  // If there is no config, render the configuration form.
  if (!config) {
    return (
      <ConfigFormComponent
        onSubmit={handleConfigSubmit}
        initialValues={defaultConfig}
      />
    )
  }

  // Once configured, render the exercise itself.
  return (
    <ExerciseProvider totalQuestions={config.totalQuestions}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Volver a la Configuración
          </button>
        </div>
        <ExerciseComponent config={config} />
      </div>
    </ExerciseProvider>
  )
}

// generateStaticParams still needs the raw registry to get all possible slugs.
export async function generateStaticParams() {
  return Object.keys(exerciseRegistry).map((slug) => ({
    slug,
  }))
}