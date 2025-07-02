
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Zap, Target, Puzzle } from "lucide-react"
import * as motion from "motion/react-m"

const exercises = [
  {
    icon: Zap,
    title: "Atención Sostenida",
    description: "Ejercicios diseñados para mejorar la capacidad de mantener la atención durante períodos prolongados.",
    badges: ["Concentración", "Atención", "Foco"],
    bgGradient: "from-blue-200 to-blue-300",
    iconColor: "text-blue-600",
  },
  {
    icon: Target,
    title: "Memoria de Trabajo",
    description: "Fortalece la capacidad de retener y manipular información temporalmente en la mente.",
    badges: ["Memoria", "Retención", "Procesamiento"],
    bgGradient: "from-indigo-200 to-indigo-300",
    iconColor: "text-indigo-600",
  },
  {
    icon: Puzzle,
    title: "Función Ejecutiva",
    description: "Desarrolla habilidades de planificación, toma de decisiones y control inhibitorio.",
    badges: ["Planificación", "Flexibilidad", "Control"],
    bgGradient: "from-cyan-200 to-cyan-300",
    iconColor: "text-cyan-600",
  },
]

export default function ExercisesSection() {
  return (
    <motion.section
      id="ejercicios"
      className="px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">Ejercicios Especializados</h2>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto">
            Prueba nuestros ejercicios neurológicos diseñados por especialistas para diferentes áreas cognitivas.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
          {exercises.map((exercise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <div
                    className={`w-full h-48 bg-gradient-to-br ${exercise.bgGradient} rounded-lg mb-4 flex items-center justify-center`}
                  >
                    <exercise.icon className={`h-16 w-16 ${exercise.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-blue-900">{exercise.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {exercise.badges.map((badge, badgeIndex) => (
                      <Badge key={badgeIndex} variant="secondary" className="bg-blue-100 text-blue-700">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <CardDescription className="text-lg text-blue-700 mt-4">{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3">
                    <Play className="mr-2 h-5 w-5" />
                    Probar Ejercicio
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
