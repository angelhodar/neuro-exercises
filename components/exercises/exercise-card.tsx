import Link from "next/link"
import { Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Exercise } from "@/lib/db/schema"
import { createMediaUrl } from "@/lib/utils"

interface ExerciseCardProps {
  exercise: Exercise
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { slug, displayName, tags, thumbnailUrl } = exercise

  return (
    <Link href={`/dashboard/exercises/${slug}`} className="block group focus:outline-none h-full">
      <Card className="transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 border border-muted-foreground/10 rounded-2xl group-focus:ring-2 group-focus:ring-primary/40 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{displayName}</CardTitle>
              {tags && tags.length > 0 && (
                <Badge variant="outline" className="w-fit">
                  {tags[0]}
                </Badge>
              )}
            </div>
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

        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            Configurar
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
