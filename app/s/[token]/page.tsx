import { notFound } from "next/navigation";
import { getExerciseLinkByToken } from "@/app/actions/links";
import { LinkExerciseCard } from "./link-exercise-card";

export default async function SharedLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const linkData = await getExerciseLinkByToken(token);

  if (!linkData) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl text-blue-900">
          {linkData.template.title}
        </h1>
        <p className="mb-4 text-gray-600">{linkData.template.description}</p>
        <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
          <span>Creado por: {linkData.creator.name}</span>
          <span>•</span>
          <span>
            Tiempo estimado: {linkData.template.exerciseTemplateItems.length}{" "}
            minutos
          </span>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {linkData.template.exerciseTemplateItems.map((item) => {
          return (
            <LinkExerciseCard
              completed={!!item.exerciseResults[0]}
              exercise={item.exercise}
              itemId={item.id}
              key={item.id}
              linkId={linkData.id}
            />
          );
        })}
      </div>
    </div>
  );
}
