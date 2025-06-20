import Link from "next/link";
import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getPRComments, addPRComment } from "@/app/actions/github";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PendingExercisePage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) return notFound();

  const comments = await getPRComments(slug);

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-semibold mb-4">{exercise.displayName}</h1>
      <p className="text-muted-foreground mb-6">
        Este ejercicio aún está en proceso de generación. Sigue el progreso y
        conversa en la Pull Request asociada.
      </p>
      <Link
        href={`https://github.com/${process.env.GITHUB_REPOSITORY}/pulls`}
        className="text-primary underline"
      >
        Ver Pull Requests
      </Link>
      <div className="border rounded-md p-4 space-y-4 mb-6 max-h-[60vh] overflow-y-auto bg-background/50">
        {comments.map((c: any) => (
          <div key={c.id} className="text-sm">
            <p className="font-semibold">{c.user.login} <span className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleString()}</span></p>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-muted-foreground text-sm">Sin comentarios aún.</p>}
      </div>
      <form action={async (formData: FormData) => {
        "use server";
        const body = formData.get("comment") as string;
        if (body?.trim()) {
          await addPRComment(slug, body);
          revalidatePath(`/dashboard/exercises/pending/${slug}`);
        }
      }} className="space-y-2">
        <textarea name="comment" className="w-full border rounded-md p-2 h-24" placeholder="Escribe un comentario..." />
        <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Enviar comentario</button>
      </form>
    </div>
  );
}
