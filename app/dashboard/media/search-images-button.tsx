"use client";

import { useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Selectable } from "@/components/selectable";
import { MediaCard, MediaCardContainer, MediaCardTitle, MediaCardDescription } from "@/components/media/media-card";
import { MediaImage } from "@/components/media/media-image";
import { searchImages, transferImagesToLibrary } from "@/app/actions/media";
import { Search, Loader2, Download } from "lucide-react";
import type {
  ImageResult,
  SearchResponse,
  DownloadableImage,
} from "@/lib/media/serper";

const searchSchema = z.object({
  query: z.string().min(1, "Introduce un criterio de búsqueda"),
});

type SearchSchema = z.infer<typeof searchSchema>;

export default function SearchImagesButton() {
  const [open, setOpen] = useQueryState(
    "search-dialog",
    parseAsBoolean.withDefault(false),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());

  const form = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = async (values: SearchSchema) => {
    setIsSearching(true);
    try {
      const data: SearchResponse = await searchImages(values.query);
      setSearchResults(data.images || []);
      if (data.images && data.images.length > 0) {
        toast.success(`${data.images.length} imágenes encontradas`);
      } else {
        toast.info("No se encontraron imágenes para tu búsqueda");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error buscando imágenes");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageClick = (image: ImageResult) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(image.position)) {
        newSet.delete(image.position);
      } else {
        newSet.add(image.position);
      }
      return newSet;
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedImages.size === 0) return;

    setIsDownloading(true);

    try {
      const selectedImageResults = searchResults.filter((img) =>
        selectedImages.has(img.position),
      );

      const downloadableImages: DownloadableImage[] = selectedImageResults.map(
        (img) => ({
          title: img.title,
          imageUrl: img.imageUrl,
          imageWidth: img.imageWidth,
          imageHeight: img.imageHeight,
        }),
      );

      const results = await transferImagesToLibrary(downloadableImages);

      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.filter((r) => !r.success).length;

      if (errorCount > 0) {
        toast.warning(
          `${successCount} imágenes descargadas, ${errorCount} errores`,
        );
      } else {
        toast.success(
          `${successCount} imágenes transferidas exitosamente a tu biblioteca`,
        );
      }

      // Clear selection after successful download
      setSelectedImages(new Set());

      // Close dialog if all downloads were successful
      if (errorCount === 0) setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Error descargando las imágenes");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Search className="w-4 h-4" />
          Buscar en internet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Buscar imágenes</DialogTitle>
          <DialogDescription>
            Introduce un criterio de búsqueda para encontrar imágenes en Google.
            Luego puedes seleccionar varias imágenes y transferirlas a tu
            biblioteca en la plataforma
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Manzana roja, perro corriendo, etc."
                        {...field}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isSearching}>
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {searchResults.length > 0 && (
          <div className="mt-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedImages.size} de {searchResults.length} seleccionadas
              </span>
              {selectedImages.size > 0 && (
                <Button
                  onClick={handleDownloadSelected}
                  disabled={isDownloading}
                  size="sm"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Transferir a mi biblioteca
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-2">
              {searchResults.map((image) => (
                <Selectable
                  key={image.position}
                  selected={selectedImages.has(image.position)}
                  onClick={() => handleImageClick(image)}
                >
                  <MediaCard>
                    <MediaCardContainer>
                      <MediaImage
                        src={image.thumbnailUrl}
                        alt={image.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </MediaCardContainer>
                    <div className="p-2 space-y-1">
                      <MediaCardTitle className="text-sm line-clamp-2">
                        {image.title}
                      </MediaCardTitle>
                      <MediaCardDescription className="text-xs">
                        {image.source}
                      </MediaCardDescription>
                    </div>
                  </MediaCard>
                </Selectable>
              ))}
            </div>
          </div>
        )}

        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Buscando imágenes...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
