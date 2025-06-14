"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Grid3X3, Brain, Eye, Zap } from "lucide-react"
import { UserMenu } from "@/components/user-menu"

interface Exercise {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  difficulty: "Fácil" | "Medio" | "Difícil"
  color: string
}

const exercises: Exercise[] = [
  {
    id: "reaction-grid",
    title: "Cuadrícula de Tiempo de Reacción",
    description: "Prueba tu velocidad de reacción visual haciendo clic en las celdas resaltadas en una cuadrícula",
    icon: <Grid3X3 className="h-8 w-8" />,
    href: "/reaction-grid",
    difficulty: "Medio",
    color: "bg-blue-500",
  },
  {
    id: "syllables",
    title: "Ensamblaje de Sílabas",
    description: "Construye palabras en español organizando las sílabas en el orden correcto",
    icon: <Brain className="h-8 w-8" />,
    href: "/syllables",
    difficulty: "Fácil",
    color: "bg-green-500",
  },
  {
    id: "visual-recognition",
    title: "Reconocimiento Visual",
    description: "Identifica y selecciona todas las imágenes que pertenecen a una categoría específica",
    icon: <Eye className="h-8 w-8" />,
    href: "/visual-recognition",
    difficulty: "Medio",
    color: "bg-purple-500",
  },
]

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const difficultyColors = {
    Fácil: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Difícil: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${exercise.color} text-white mb-4`}>{exercise.icon}</div>
          <Badge className={difficultyColors[exercise.difficulty]}>{exercise.difficulty}</Badge>
        </div>
        <CardTitle className="text-xl">{exercise.title}</CardTitle>
        <CardDescription className="text-base">{exercise.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={exercise.href} className="block w-full">
          <Button className="w-full" size="lg">
            Comenzar Ejercicio
            <Zap className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header with User Menu */}
        <div className="flex justify-end mb-8">
          <UserMenu />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Ejercicios Cognitivos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Entrena tu mente con ejercicios diseñados científicamente que mejoran el tiempo de reacción, la memoria, la
            atención y la flexibilidad cognitiva.
          </p>
        </div>

        {/* Exercises Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Elige tu Ejercicio</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
