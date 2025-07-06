import * as motion from "motion/react-client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Grid3x3, Volume2, Palette } from "lucide-react"
import { unstable_cache } from "next/cache"
import { getExercises } from "@/app/actions/exercises"
import type { Exercise } from "@/lib/db/schema"
import { createBlobUrl } from "@/lib/utils"

const specificExercisesMapping = {
  "reaction-time-grid": {
    icon: Grid3x3,
    bgGradient: "from-green-200 to-green-300",
    iconColor: "text-green-600",
  },
  "syllables": {
    icon: Volume2,
    bgGradient: "from-purple-200 to-purple-300",
    iconColor: "text-purple-600",
  },
  "color-sequence": {
    icon: Palette,
    bgGradient: "from-pink-200 to-pink-300",
    iconColor: "text-pink-600",
  },
} as const

// Función para obtener el tema específico de un ejercicio
function getExerciseTheme(exercise: Exercise) {
  return specificExercisesMapping[exercise.slug as keyof typeof specificExercisesMapping]
}

const getCachedExercises = unstable_cache(
  async () => {
    const targetSlugs = ["reaction-time-grid", "syllables", "color-sequence"]
    const exercises = await getExercises(targetSlugs)
    return exercises.filter(exercise => exercise && exercise.id)
  },
  ['landing-exercises']
)

export default async function ExercisesSection() {
  const exercises = await getCachedExercises()

  return (
    <motion.section
      id="landing-exercises"
      className="px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">Ejercicios Especializados</h2>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto">
            Prueba nuestros ejercicios neurológicos diseñados por especialistas para diferentes áreas cognitivas.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
          {exercises.map((exercise, index) => {
            const theme = getExerciseTheme(exercise)

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="flex-grow gap-2">
                    <div className="relative w-full h-[300px]">
                      <Image src={createBlobUrl(exercise.thumbnailUrl || "")} fill className="object-cover rounded-lg" alt={exercise.displayName} />
                    </div>
                    <CardTitle className="text-2xl text-blue-900">{exercise.displayName}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {exercise.tags.slice(0, 2).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="border-blue-200 text-blue-600 capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardDescription className="text-lg text-blue-700 mt-4">
                      {exercise.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3" asChild>
                      <Link href={`/exercises/${exercise.slug}`}>
                        <Play className="mr-2 h-5 w-5" />
                        Probar
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
