import Link from "next/link"
import { Brain, ChevronRight, User, Clock, Target, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getExerciseLinkByPublicId } from "@/app/actions/links"

export const dynamic = "force-dynamic"

export default async function SharedExercisePage({ params }: { params: { publicId: string } }) {
    console.log("Hola")

    const link = await getExerciseLinkByPublicId(params.publicId)

    if (!link) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center gap-2">
                            <Brain className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">NeuroExercise</span>
                        </div>
                        <CardTitle className="mt-4 text-center">Enlace no disponible</CardTitle>
                        <CardDescription className="text-center">Enlace no encontrado o expirado</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">
                            El enlace que intentas acceder no existe, ha expirado o ha sido desactivado.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/">
                                Volver al inicio
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const sortedExercises = link.exerciseLinkItems.sort((a, b) => a.position - b.position)
    const totalExercises = sortedExercises.length

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                        <Brain className="h-6 w-6 text-primary" />
                        <span>NeuroExercise</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6">
                <div className="container max-w-4xl justify-center items-center mx-auto">
                    {/* Información del enlace */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Brain className="h-8 w-8 text-primary" />
                                <span className="text-2xl font-bold">NeuroExercise</span>
                            </div>
                            <CardTitle className="text-center text-2xl">{link.title}</CardTitle>
                            {link.description && (
                                <CardDescription className="text-center text-lg">{link.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Información del usuario destinatario */}
                            {link.targetUser && (
                                <div className="flex items-center justify-center gap-3 rounded-lg border p-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">Ejercicios para:</p>
                                    <p className="text-lg font-semibold">{link.targetUser.name || link.targetUser.email}</p>
                                </div>
                            )}

                            {/* Estadísticas del enlace */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border p-4 text-center">
                                    <Target className="mx-auto h-8 w-8 text-primary mb-2" />
                                    <div className="text-2xl font-bold">{totalExercises}</div>
                                    <p className="text-sm text-muted-foreground">Ejercicios</p>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <Clock className="mx-auto h-8 w-8 text-primary mb-2" />
                                    <div className="text-2xl font-bold">
                                        {Math.round(
                                            sortedExercises.reduce((total, item) => total + (item.config?.timeLimitPerQuestion || 60), 0) / 60,
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Minutos aprox.</p>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <Play className="mx-auto h-8 w-8 text-primary mb-2" />
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-sm text-muted-foreground">Completados</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de ejercicios */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Ejercicios incluidos</CardTitle>
                            <CardDescription>
                                Completa todos los ejercicios en orden para obtener los mejores resultados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sortedExercises.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{item.exercise.displayName}</h3>
                                                <Badge variant="secondary">{item.exercise.category}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{item.exercise.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>⏱️ {item.config?.timeLimitPerQuestion || 60}s</span>
                                                <span>🎯 {item.config?.totalQuestions || 10} preguntas</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progreso */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Tu progreso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Ejercicios completados</span>
                                    <span>0 de {totalExercises}</span>
                                </div>
                                <Progress value={0} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <h3 className="text-lg font-semibold">¿Listo para comenzar?</h3>
                                <p className="text-muted-foreground">
                                    Los ejercicios están diseñados para completarse en orden. Puedes pausar en cualquier momento.
                                </p>
                                <Button size="lg" className="w-full md:w-auto" asChild>
                                    <Link href={`/s/${params.publicId}/exercise/0`}>
                                        <Play className="mr-2 h-5 w-5" />
                                        Comenzar ejercicios
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}