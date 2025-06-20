import Link from "next/link"
import { Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Exercise } from "@/lib/db/schema"
import { createMediaUrl, cn } from "@/lib/utils"
import { getExerciseFromRegistry } from "@/app/registry/exercises"

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { slug, displayName, category, description, thumbnailUrl } = exercise

  const isRegistered = !!getExerciseFromRegistry(slug)
  const href = isRegistered ? `/dashboard/exercises/${slug}` : `/dashboard/exercises/pending/${slug}`

  return (
    <Link
      href={href}
      className={cn(
        "block group focus:outline-none h-full",
        !isRegistered && "opacity-50"
      )}
    >
      <Card className={`transition-all border border-muted-foreground/10 rounded-2xl group-focus:ring-2 group-focus:ring-primary/40 h-full ${isRegistered ? "cursor-pointer hover:shadow-2xl hover:-translate-y-1" : "pointer-events-auto"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {displayName}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2 capitalize">
              {category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {thumbnailUrl ? (
            <div className="aspect-video overflow-hidden rounded-md bg-white flex items-center justify-center">
              <img
                src={createMediaUrl(thumbnailUrl) || "/placeholder.svg"}
                alt={`Thumbnail de ${displayName}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-center">
                <Play className="mx-auto h-8 w-8 text-primary/60" />
                <p className="mt-2 text-sm text-muted-foreground">Ejercicio interactivo</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}