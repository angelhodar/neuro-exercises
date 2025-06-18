import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, Trophy, Play, CheckCircle, ArrowRight, MapPin } from "lucide-react"
import Image from "next/image"

export default function Component() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-400/5"></div>
        <div className="container px-4 md:px-6 relative mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <MapPin className="w-3 h-3 mr-1" />
                  Desde Granada, Andalucía
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-blue-900">
                  Mejora tu función cognitiva con ejercicios interactivos
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Nuestra plataforma ofrece ejercicios personalizados para ayudar en la recuperación y mejora de
                  habilidades cognitivas.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Play className="mr-2 h-4 w-4" />
                  Comenzar Ejercicios
                </Button>
                <Button variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Ver Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Más de 100 ejercicios</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Seguimiento personalizado</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <Image
                  src="/alzehimer.jpg"
                  width="600"
                  height="400"
                  alt="CEAFA Alzheimer - Ejercicios neurológicos para la salud cognitiva"
                  className="mx-auto w-full h-auto max-w-md overflow-hidden rounded-xl object-contain shadow-2xl bg-white p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ejercicios" className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge className="bg-blue-100 text-blue-800">Ejercicios Interactivos</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-900">
                Ejercicios neurológicos interactivos
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nuestra plataforma ofrece una amplia gama de ejercicios neurológicos diseñados por especialistas para
                estimular diferentes áreas cognitivas y mejorar tu bienestar mental.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="border-blue-100 hover:shadow-lg transition-shadow h-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center h-full">
                <div className="rounded-full bg-blue-100 p-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Entrenamiento de Memoria</h3>
                <p className="text-gray-600 flex-1 flex items-center">
                  Ejercicios diseñados para fortalecer la memoria a corto y largo plazo mediante secuencias y patrones
                  visuales.
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 hover:shadow-lg transition-shadow h-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center h-full">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Atención y Concentración</h3>
                <p className="text-gray-600 flex-1 flex items-center">
                  Actividades interactivas para mejorar la capacidad de atención sostenida y concentración selectiva.
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 hover:shadow-lg transition-shadow h-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center h-full">
                <div className="rounded-full bg-blue-100 p-3">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Funciones Ejecutivas</h3>
                <p className="text-gray-600 flex-1 flex items-center">
                  Ejercicios de planificación, resolución de problemas y flexibilidad cognitiva para el día a día.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
