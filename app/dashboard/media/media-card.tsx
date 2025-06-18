"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createMediaUrl } from "@/lib/utils";
import { deleteMedia } from "@/app/actions/media";
import { Media } from "@/lib/db/schema";
import { categoryDisplayNames } from "@/lib/medias/generate";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MediaCardProps {
  media: Media
}

export default function MediaCard({ media }: MediaCardProps) {
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
    <div className="relative border rounded-lg shadow p-4 flex flex-col items-center bg-white">
      <Badge
        className="absolute left-2 top-2 text-xs px-2 py-1 sm:px-3 sm:py-2 rounded-lg z-10 shadow-lg select-none bg-blue-600 text-white"
        style={{ fontSize: '0.95rem' }}
      >
        {categoryDisplayNames[media.category] || media.category}
      </Badge>
      <button
        className="absolute right-3 top-3 bg-white rounded-full p-2 shadow z-10 hover:bg-red-50"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 className="w-6 h-6 text-red-600" />
      </button>
      <Image src={createMediaUrl(media.blobKey)} alt={media.name} width={300} height={300} className="object-cover rounded mb-2" />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
    </div>
  );
} 