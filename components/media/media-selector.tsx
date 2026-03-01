"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import {
  MultimediaCard,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { Selectable } from "@/components/selectable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileMediaSelector from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaSearch } from "@/hooks/use-media-search";
import type { SelectableMediaSchema } from "@/lib/schemas/medias";
import { createBlobUrl } from "@/lib/utils";

interface MediaSelectorProps {
  selectedMedias: SelectableMediaSchema[];
  onMediasChange: (medias: SelectableMediaSchema[]) => void;
  selectionMode?: "single" | "multiple";
  compact?: boolean;
  className?: string;
}

export default function MediaSelector(props: MediaSelectorProps) {
  const {
    selectedMedias,
    onMediasChange,
    selectionMode = "multiple",
    compact,
    className,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: searchResults = [],
    isLoading,
    error,
    isFetching,
  } = useMediaSearch(debouncedSearchTerm, isOpen);

  const addMedia = (media: SelectableMediaSchema) => {
    if (selectionMode === "single") {
      onMediasChange([media]);
      setIsOpen(false);
    } else if (!selectedMedias.find((selected) => selected.id === media.id)) {
      onMediasChange([...selectedMedias, media]);
    }
  };

  const removeMedia = (mediaId: number) => {
    onMediasChange(selectedMedias.filter((media) => media.id !== mediaId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
          <DialogTrigger
            render={
              <FileMediaSelector
                className={className}
                compact={compact}
                medias={selectedMedias}
                onAddMediaClick={() => setIsOpen(true)}
                removeFile={removeMedia}
              />
            }
          />
          <DialogContent className="min-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Buscar y seleccionar imágenes</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  className="pl-10"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o etiquetas..."
                  value={searchTerm}
                />
                {isFetching && (
                  <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin text-muted-foreground" />
                )}
              </div>

              {error && (
                <div className="py-4 text-center text-red-500">
                  Error al buscar imágenes. Inténtalo de nuevo.
                </div>
              )}

              {!searchTerm.trim() && (
                <div className="py-8 text-center text-muted-foreground">
                  Escribe algo para buscar imágenes
                </div>
              )}

              {isLoading && searchTerm.trim() && (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground">Buscando imágenes...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((media) => {
                    const isSelected = selectedMedias.some(
                      (selected) => selected.id === media.id
                    );

                    return (
                      <Selectable
                        key={media.id}
                        onClick={() => addMedia(media)}
                        selected={isSelected}
                      >
                        <MultimediaCard
                          alt={media.name}
                          className="h-full max-w-sm"
                          preview={false}
                          src={createBlobUrl(media.blobKey)}
                          type="image"
                        >
                          <MultimediaCardThumbnail />
                          <MultimediaCardTitle className="whitespace-normal text-center text-lg">
                            {media.name}
                          </MultimediaCardTitle>
                        </MultimediaCard>
                      </Selectable>
                    );
                  })}
                </div>
              )}

              {searchTerm.trim() &&
                !isLoading &&
                searchResults.length === 0 &&
                !error && (
                  <div className="py-8 text-center text-muted-foreground">
                    No se encontraron imágenes para "{searchTerm}"
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
