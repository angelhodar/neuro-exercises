"use client"

import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Trash2, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { exerciseLinkInsertSchema, type Exercise } from "@/lib/db/schema"
import type { User } from "@/lib/db/schema"

// Esquema de validación para el formulario
const linkCreationSchema = exerciseLinkInsertSchema
  .extend({
    exercises: z
      .array(
        z.object({
          exerciseId: z.number(),
          config: z.record(z.any()).default({}),
        }),
      )
      .min(1, "Debe incluir al menos un ejercicio"),
  })
  .omit({
    id: true,
    publicId: true,
    createdAt: true,
    updatedAt: true
  })

type LinkCreationForm = z.infer<typeof linkCreationSchema>

interface CreateLinkFormProps {
  users: User[]
  exercises: Exercise[]
}

export function CreateLinkForm({ users, exercises }: CreateLinkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(linkCreationSchema),
    defaultValues: {
      targetUserId: "",
      title: "",
      description: "",
      exercises: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  })

  const addExercise = (exerciseId: number) => {
    // Verificar que el ejercicio no esté ya agregado
    const existingExercise = fields.find((field) => field.exerciseId === exerciseId)
    if (existingExercise) {
      toast.error("Este ejercicio ya está agregado")
      return
    }

    // Obtener valores por defecto específicos del ejercicio
    append({
      exerciseId,
      config: {
        timerDuration: 60,
        totalQuestions: 10,
      },
    })
  }

  const removeExercise = (index: number) => {
    remove(index)
  }

  const getExerciseById = (id: number) => {
    return exercises.find((ex) => ex.id === id)
  }

  const onSubmit = async (data: LinkCreationForm) => {
    try {
      setIsSubmitting(true)

      // Preparar los datos para enviar
      const linkData = {
        targetUserId: data.targetUserId,
        title: data.title,
        description: data.description || null,
        items: data.exercises.map((exercise, index: number) => ({
          exerciseId: exercise.exerciseId,
          config: exercise.config,
          position: index,
        })),
      }

      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(linkData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al crear el enlace")
      }

      toast.success("Enlace creado exitosamente!")
      router.push("/dashboard/links")
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al crear el enlace")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica del enlace */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Enlace</CardTitle>
              <CardDescription>Configura los detalles básicos del enlace compartido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="targetUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario destinatario</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No hay usuarios disponibles
                          </div>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                <span>{user.name || user.email}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ejercicios de rehabilitación - Semana 1" {...field} />
                    </FormControl>
                    <FormDescription>Un título descriptivo para el enlace</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descripción adicional sobre los ejercicios..."
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Información adicional sobre el propósito de estos ejercicios</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Selección de ejercicios */}
          <Card>
            <CardHeader>
              <CardTitle>Ejercicios Disponibles</CardTitle>
              <CardDescription>Selecciona los ejercicios que quieres incluir en el enlace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {exercises.map((exercise) => {
                  const isAdded = fields.some((field) => field.exerciseId === exercise.id)
                  return (
                    <div
                      key={exercise.id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        isAdded ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.displayName}</h4>
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground">{exercise.description}</p>
                          )}
                          <Badge variant="secondary" className="mt-2">
                            {exercise.category}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant={isAdded ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => addExercise(exercise.id)}
                          disabled={isAdded}
                        >
                          {isAdded ? "Agregado" : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ejercicios seleccionados */}
          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ejercicios Seleccionados ({fields.length})</CardTitle>
                <CardDescription>Configura cada ejercicio individualmente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => {
                  const exercise = getExerciseById(field.exerciseId)
                  if (!exercise) return null

                  return (
                    <div key={field.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{exercise.displayName}</h4>
                            <Badge variant="outline">{exercise.category}</Badge>
                          </div>

                          {/* Configuración básica del ejercicio */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`exercises.${index}.config.timerDuration`}
                              render={({ field: configField }) => (
                                <FormItem>
                                  <FormLabel>Duración (segundos)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="10"
                                      max="300"
                                      {...configField}
                                      onChange={(e) => configField.onChange(Number.parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`exercises.${index}.config.totalQuestions`}
                              render={({ field: configField }) => (
                                <FormItem>
                                  <FormLabel>Número de preguntas</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="50"
                                      {...configField}
                                      onChange={(e) => configField.onChange(Number.parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/links")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0}>
              {isSubmitting ? "Creando..." : "Crear Enlace"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}