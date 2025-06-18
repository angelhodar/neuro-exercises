import { notFound } from "next/navigation";
import { getExerciseFromRegistry } from "@/app/registry/exercises";
import { ExerciseProvider } from "@/contexts/exercise-context";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { config: configString } = await searchParams;

    const exerciseDetails = getExerciseFromRegistry(slug);

    if (!exerciseDetails) notFound();

    const { schema, ConfigFormComponent, ExerciseComponent } = exerciseDetails

    const config = schema.safeParse(JSON.parse(configString as string || "{}"));

    if (!config.success) return <ConfigFormComponent />;

    const parsedConfig = config.data;

    return (<ExerciseProvider totalQuestions={parsedConfig.totalQuestions}>
        <ExerciseComponent config={config.data} />
    </ExerciseProvider>)
} 