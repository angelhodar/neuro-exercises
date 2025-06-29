import { getExerciseLinkByPublicId } from "@/app/actions/links";
import { LinkExerciseCard } from "./link-exercise-card";
import { notFound } from "next/navigation";

export default async function SharedLinkPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;

  const linkData = await getExerciseLinkByPublicId(linkId);

  if (!linkData) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {linkData.template.title}
        </h1>
        <p className="text-gray-600 mb-4">{linkData.template.description}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>Creado por: {linkData.creator.name}</span>
          <span>•</span>
          <span>
            Tiempo estimado: {linkData.template.exerciseTemplateItems.length} minutos
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {linkData.template.exerciseTemplateItems.map((item, i) => {
          return (
            <LinkExerciseCard
              key={i}
              exercise={item.exercise}
              index={i}
              linkId={linkId}
              itemId={item.id}
              completed={!!item.exerciseResults[0]}
            />
          );
        })}
      </div>
    </div>
  );
}
