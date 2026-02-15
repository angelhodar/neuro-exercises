import { Brain, Share2, Target } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "Configuración Adaptativa",
    description:
      "Ajusta dificultad, duración y tipo de ejercicios según las necesidades específicas.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Share2,
    title: "Compartir Instantáneo",
    description:
      "Genera enlaces únicos que los pacientes pueden usar desde cualquier dispositivo.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Target,
    title: "Seguimiento de Progreso",
    description:
      "Monitorea el rendimiento y progreso de cada paciente en tiempo real.",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
];

export default function TemplatesSection() {
  return (
    <motion.section
      className="bg-white px-6 py-20 lg:px-8"
      id="plantillas"
      initial={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="font-bold text-4xl text-blue-900 lg:text-5xl">
          Plantillas Personalizadas
        </h2>
        <p className="mt-8 text-blue-700 text-xl leading-relaxed">
          Crea conjuntos de ejercicios con configuraciones específicas y
          compártelos fácilmente con tus pacientes mediante un enlace único.
        </p>
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="space-y-8 text-center"
            initial={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  className="flex items-start space-x-4 text-start"
                  initial={{ opacity: 0, x: -30 }}
                  key={feature.title}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className={`p-2 ${feature.bgColor} rounded-full`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-900 text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-blue-700 text-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Button
                className="h-auto bg-blue-600 px-8 py-4 text-lg text-white hover:bg-blue-700"
                size="lg"
              >
                Crear Primera Plantilla
              </Button>
            </motion.div>
          </motion.div>

          <div className="mx-auto w-full max-w-md px-4 lg:max-w-xl">
            <motion.div
              className="w-full rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-6 md:p-8"
              initial={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="w-full rounded-xl bg-white p-4 shadow-lg sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <h4 className="min-w-0 flex-1 font-semibold text-blue-900 text-lg leading-tight sm:text-xl">
                    Plantilla: Rehabilitación Básica
                  </h4>
                  <Badge className="shrink-0 bg-green-100 text-green-700 text-xs sm:text-sm">
                    Activa
                  </Badge>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-blue-700">Ejercicios:</span>
                    <span className="font-semibold text-blue-900">8</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-blue-700">Duración:</span>
                    <span className="font-semibold text-blue-900">30 min</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="text-blue-700">Pacientes:</span>
                    <span className="font-semibold text-blue-900">12</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:space-x-0">
                  <Button
                    className="flex-1 border-blue-600 bg-transparent text-blue-600 text-sm hover:bg-blue-50 sm:text-base"
                    variant="outline"
                  >
                    <Share2 className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">Compartir</span>
                  </Button>
                  <Button className="flex-1 bg-blue-600 text-sm text-white hover:bg-blue-700 sm:text-base">
                    <span className="truncate">Ver Detalles</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
