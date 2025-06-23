"use client"

import { useQuery } from "@tanstack/react-query"
import { SelectableMediaSchema } from "@/lib/schemas/medias"

interface SearchResponse {
  media: SelectableMediaSchema[]
  success: boolean
}

const searchMedia = async (query: string): Promise<SelectableMediaSchema[]> => {
  const response = await fetch(`/api/media/search?q=${encodeURIComponent(query)}&limit=20`)

  if (!response.ok) {
    throw new Error("Error while searching for media")
  }

  const data: SearchResponse = await response.json()

  return data.media
}

export function useMediaSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: ["media", "search", searchTerm],
    queryFn: () => searchMedia(searchTerm),
    enabled: enabled && searchTerm.trim().length > 0
  })
}
