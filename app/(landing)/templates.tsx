import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Share2, Target } from "lucide-react"
import * as motion from "motion/react-client"

const features = [
  {
    icon: Brain,
    title: "Configuración Adaptativa",
    description: "Ajusta dificultad, duración y tipo de ejercicios según las necesidades específicas.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Share2,
    title: "Compartir Instantáneo",
    description: "Genera enlaces únicos que los pacientes pueden usar desde cualquier dispositivo.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Target,
    title: "Seguimiento de Progreso",
    description: "Monitorea el rendimiento y progreso de cada paciente en tiempo real.",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
]

export default function TemplatesSection() {
  return (
    <motion.section
      id="plantillas"
      className="px-6 lg:px-8 py-20 bg-white"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl lg:text-5xl font-bold text-blue-900">Plantillas Personalizadas</h2>
            <p className="mt-8 text-xl text-blue-700 leading-relaxed">
              Crea conjuntos de ejercicios con configuraciones específicas y compártelos fácilmente con tus pacientes
              mediante un enlace único.
            </p>
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            className="space-y-8 text-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start text-start space-x-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`p-2 ${feature.bgColor} rounded-full`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{feature.title}</h3>
                    <p className="text-lg text-blue-700">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto">
                Crear Primera Plantilla
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-blue-900">Plantilla: Rehabilitación Básica</h4>
                <Badge className="bg-green-100 text-green-700">Activa</Badge>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-blue-700">Ejercicios:</span>
                  <span className="font-semibold text-blue-900">8</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-blue-700">Duración:</span>
                  <span className="font-semibold text-blue-900">30 min</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-blue-700">Pacientes:</span>
                  <span className="font-semibold text-blue-900">12</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Ver Detalles</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
