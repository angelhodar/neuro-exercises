"use client";

import Image from "next/image";
import { createMediaUrl } from "@/lib/utils";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Tags from "@/components/tags";

interface MediaCardProps {
  media: SelectableMediaSchema;
  variant?: "default" | "selectable" | "preview";
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  showTags?: boolean;
  className?: string;
}

export default function MediaCard({ 
  media, 
  variant = "default",
  isSelected = false,
  onSelect,
  onRemove,
  showTags = true,
  className = ""
}: MediaCardProps) {
  const baseClasses = "relative border rounded-lg shadow p-4 flex flex-col items-center bg-white";
  const selectableClasses = isSelected ? "ring-2 ring-primary bg-primary/5" : "";
  const finalClasses = `${baseClasses} ${selectableClasses} ${className}`;

  const handleClick = () => {
    if (variant === "selectable" && onSelect) {
      onSelect();
    }
  };

  return (
    <Card 
      className={`${finalClasses} ${variant === "selectable" ? "cursor-pointer hover:shadow-md transition-all" : ""}`}
      onClick={handleClick}
    >     
      {/* Botón de eliminar para preview */}
      {variant === "preview" && onRemove && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Imagen */}
      <Image 
        src={createMediaUrl(media.blobKey)} 
        alt={media.name} 
        width={variant === "preview" ? 200 : 300} 
        height={variant === "preview" ? 200 : 300} 
        className="object-cover rounded mb-2" 
      />
      
      {/* Nombre */}
      <h4 className="font-medium text-sm mb-2 text-center">{media.name}</h4>

      {/* Tags en la parte inferior para selectable y preview */}
      {showTags && media.tags && media.tags.length > 0 && variant === "default" && <Tags tags={media.tags} />}

      {/* Indicador de seleccionado */}
      {variant === "selectable" && isSelected && (
        <div className="mt-2 text-xs text-primary font-medium">✓ Seleccionada</div>
      )}
    </Card>
  );
} 