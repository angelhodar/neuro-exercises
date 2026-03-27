"use client";

import { ExternalLink, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { publishExercise } from "@/app/actions/publish";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/lib/db/schema";

interface PublishButtonProps {
  exercise: Exercise;
  hasCompletedGeneration: boolean;
}

export function PublishButton({
  exercise,
  hasCompletedGeneration,
}: PublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (exercise.publishStatus === "PUBLISHED") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Publicado
      </Badge>
    );
  }

  if (exercise.publishStatus === "PENDING_REVIEW") {
    const prUrl = `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "angelhodar"}/${process.env.NEXT_PUBLIC_GITHUB_REPO ?? "neuro-exercises"}/pull/${exercise.prNumber}`;
    return (
      <a href={prUrl} rel="noopener noreferrer" target="_blank">
        <Badge className="cursor-pointer gap-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
          <ExternalLink className="h-3 w-3" />
          Revisión pendiente
        </Badge>
      </a>
    );
  }

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const result = await publishExercise(exercise.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Ejercicio enviado para revisión", {
          description: `PR #${result.prNumber} creado correctamente`,
          action: {
            label: "Ver PR",
            onClick: () => window.open(result.prUrl, "_blank"),
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={!hasCompletedGeneration || isLoading}
      onClick={handlePublish}
      size="sm"
      variant="outline"
    >
      <Upload className="h-4 w-4" />
      {isLoading ? "Publicando..." : "Publicar"}
    </Button>
  );
}
