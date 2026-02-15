import { Grid3x3, Palette, Play, Volume2 } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { getExercises } from "@/app/actions/exercises";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Exercise } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

const specificExercisesMapping = {
  "reaction-time-grid": {
    icon: Grid3x3,
    bgGradient: "from-green-200 to-green-300",
    iconColor: "text-green-600",
  },
  syllables: {
    icon: Volume2,
    bgGradient: "from-purple-200 to-purple-300",
    iconColor: "text-purple-600",
  },
  "color-sequence": {
    icon: Palette,
    bgGradient: "from-pink-200 to-pink-300",
    iconColor: "text-pink-600",
  },
} as const;

// Función para obtener el tema específico de un ejercicio
function getExerciseTheme(exercise: Exercise) {
  return specificExercisesMapping[
    exercise.slug as keyof typeof specificExercisesMapping
  ];
}

const getCachedExercises = unstable_cache(async () => {
  const targetSlugs = ["reaction-time-grid", "syllables", "color-sequence"];
  const exercises = await getExercises(targetSlugs);
  return exercises.filter((exercise) => exercise?.id);
}, ["landing-exercises"]);

export default async function ExercisesSection() {
  const exercises = await getCachedExercises();

  return (
    <motion.section
      className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-20 lg:px-8"
      id="landing-exercises"
      initial={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-6 font-bold text-4xl text-blue-900 lg:text-5xl">
            Ejercicios Especializados
          </h2>
          <p className="mx-auto max-w-3xl text-blue-700 text-xl">
            Prueba nuestros ejercicios neurológicos diseñados por especialistas
            para diferentes áreas cognitivas.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
          {exercises.map((exercise, index) => {
            const _theme = getExerciseTheme(exercise);

            return (
              <motion.div
                className="h-full"
                initial={{ opacity: 0, y: 40 }}
                key={exercise.id}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="flex h-full flex-col border-blue-200 transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="flex-grow gap-2">
                    <div className="relative h-[300px] w-full">
                      <Image
                        alt={exercise.displayName}
                        className="rounded-lg object-cover"
                        fill
                        src={createBlobUrl(exercise.thumbnailUrl || "")}
                      />
                    </div>
                    <CardTitle className="text-2xl text-blue-900">
                      {exercise.displayName}
                    </CardTitle>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exercise.tags.slice(0, 2).map((tag) => (
                        <Badge
                          className="border-blue-200 text-blue-600 capitalize"
                          key={tag}
                          variant="outline"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardDescription className="mt-4 text-blue-700 text-lg">
                      {exercise.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <Button
                      className="w-full bg-blue-600 py-3 text-lg text-white hover:bg-blue-700"
                      render={<Link href={`/exercises/${exercise.slug}`} />}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Probar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
