import Link from "next/link"
import { Play, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Exercise } from "@/lib/db/schema"

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { slug, displayName, category, description, thumbnailUrl } = exercise

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {description || "Ejercicio de entrenamiento cognitivo"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {thumbnailUrl ? (
          <div className="aspect-video overflow-hidden rounded-md bg-muted">
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={`Thumbnail de ${displayName}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
        <Link href={`/dashboard/exercises/${slug}`} className="w-full">
          <Button className="w-full group-hover:bg-primary/90">
            <Play className="mr-2 h-4 w-4" />
            Iniciar Ejercicio
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
