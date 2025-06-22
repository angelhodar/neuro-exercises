"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia } from "@/app/actions/media";
import { Media } from "@/lib/db/schema";
import { Trash2 } from "lucide-react";
import MediaCard from "@/components/ui/templates/media-card";

interface MediaCardProps {
  media: Media
}

export default function DashboardMediaCard({ media }: MediaCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMedia(media.id, media.blobKey);
        router.refresh();
      } catch (e) {
        console.error(e)
        setError("Error eliminando la imagen");
      }
    });
  }

  return (
    <div className="relative">
      <MediaCard 
        media={media} 
        variant="default"
        className="relative"
      />
      
      {/* Botón de eliminar */}
      <button
        className="absolute right-3 top-3 bg-white rounded-full p-2 shadow z-10 hover:bg-red-50"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 className="w-6 h-6 text-red-600" />
      </button>
      
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
    </div>
  );
} 