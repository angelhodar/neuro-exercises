"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMediaSearch } from "@/hooks/use-media-search"
import { useDebounce } from "@/hooks/use-debounce"
import { Search, Loader2 } from "lucide-react"
import MediaCard from "./media-card"
import { SelectableMediaSchema } from "@/lib/schemas/medias"
import FileMediaSelector from "../file-upload"

interface MediaSelectorProps {
  selectedMedias: SelectableMediaSchema[]
  onMediasChange: (medias: SelectableMediaSchema[]) => void
  selectionMode?: "single" | "multiple"
}

export default function MediaSelector(props: MediaSelectorProps) {
  const { selectedMedias, onMediasChange, selectionMode = "multiple" } = props

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: searchResults = [], isLoading, error, isFetching } = useMediaSearch(debouncedSearchTerm, isOpen)

  const addMedia = (media: SelectableMediaSchema) => {
    if (selectionMode === "single") {
      onMediasChange([media])
      setIsOpen(false)
    } else {
      if (!selectedMedias.find((selected) => selected.id === media.id)) {
        onMediasChange([...selectedMedias, media])
      }
    }
  }

  const removeMedia = (mediaId: number) => {
    onMediasChange(selectedMedias.filter((media) => media.id !== mediaId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <FileMediaSelector medias={selectedMedias} removeFile={removeMedia} onAddMediaClick={() => setIsOpen(true)} />
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buscar y seleccionar imágenes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o etiquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Estado de error */}
              {error && (
                <div className="text-center py-4 text-red-500">Error al buscar imágenes. Inténtalo de nuevo.</div>
              )}

              {/* Estado vacío */}
              {!searchTerm.trim() && (
                <div className="text-center py-8 text-muted-foreground">Escribe algo para buscar imágenes</div>
              )}

              {/* Estado de carga inicial */}
              {isLoading && searchTerm.trim() && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Buscando imágenes...</p>
                </div>
              )}

              {/* Resultados */}
              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((media) => {
                    const isSelected = selectedMedias.some((selected) => selected.id === media.id)
                    return (
                      <MediaCard
                        key={media.id}
                        media={media}
                        variant="selectable"
                        isSelected={isSelected}
                        onSelect={() => addMedia(media)}
                      />
                    )
                  })}
                </div>
              )}

              {/* Sin resultados */}
              {searchTerm.trim() && !isLoading && searchResults.length === 0 && !error && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron imágenes para "{searchTerm}"
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}