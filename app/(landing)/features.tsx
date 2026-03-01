import { Play } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { getExercises } from "@/app/actions/exercises";
import {
  ExerciseCard,
  ExerciseCardThumbnail,
} from "@/components/exercises/exercise-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createBlobUrl } from "@/lib/utils";

type Exercise = NonNullable<Awaited<ReturnType<typeof getExercises>>[number]>;

const TARGET_SLUGS = [
  "reaction-time-grid",
  "syllables",
  "color-sequence",
  "visual-recognition",
  "word-matching",
  "stimulus-count",
];

const getCachedExercises = unstable_cache(async () => {
  const exercises = await getExercises(TARGET_SLUGS);
  return exercises;
}, ["landing-exercises"]);

function LandingExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -4 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <ExerciseCard
        className="h-full gap-0 rounded-2xl border border-slate-200 bg-white py-0 shadow-sm ring-0 transition-shadow hover:shadow-md"
        exercise={exercise}
      >
        <ExerciseCardThumbnail className="relative h-[300px]">
          <Image
            alt={exercise.displayName}
            className="rounded-lg object-cover"
            fill
            src={createBlobUrl(exercise.thumbnailUrl ?? "")}
          />
          {exercise.tags[0] && (
            <Badge
              className="absolute top-3 right-3 border-blue-300 bg-blue-50 p-3 text-blue-700 text-sm capitalize"
              variant="outline"
            >
              {exercise.tags[0]}
            </Badge>
          )}
        </ExerciseCardThumbnail>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-(family-name:--font-display) mb-3 font-bold text-slate-900 text-xl">
            {exercise.displayName}
          </h3>

          <Button
            className="w-full bg-blue-600 py-4 text-base text-white hover:bg-blue-700"
            render={<Link href={`/exercises/${exercise.slug}`} />}
          >
            <Play className="mr-2 h-4 w-4" />
            Probar ejercicio
          </Button>
        </div>
      </ExerciseCard>
    </motion.div>
  );
}

export default async function FeaturesSection() {
  const exercises = await getCachedExercises();

  return (
    <section className="px-6 py-16 md:py-28 lg:px-10" id="ejercicios">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-blue-500 text-xs uppercase tracking-widest">
            Ejercicios
          </div>
          <h2 className="font-(family-name:--font-display) mb-4 font-bold text-3xl text-slate-900 leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Pruébalos ahora{" "}
            <span className="text-blue-500">sin registrarte</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {exercises.map((exercise) => (
            <LandingExerciseCard exercise={exercise} key={exercise.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
