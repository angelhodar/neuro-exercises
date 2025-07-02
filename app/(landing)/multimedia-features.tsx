import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Tags, Edit3 } from "lucide-react"
import * as motion from "motion/react-client"

const features = [
  {
    icon: ImageIcon,
    title: "Generación por IA",
    description:
      "Crea imágenes personalizadas usando prompts de texto. Genera contenido visual específico para cada tipo de ejercicio neurológico.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Tags,
    title: "Clasificación Automática",
    description:
      "El sistema etiqueta automáticamente el contenido generado, organizando tu biblioteca multimedia de forma inteligente.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Edit3,
    title: "Edición Intuitiva",
    description:
      "Modifica el contenido usando comandos de texto simples. Ajusta colores, formas y elementos sin conocimientos técnicos.",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
]

export default function MultimediaFeaturesSection() {
  return (
    <motion.section
      id="funcionalidades"
      className="px-6 lg:px-8 py-20 bg-white"
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
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">Contenido Multimedia Inteligente</h2>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto">
            Genera, clasifica y edita contenido multimedia personalizado para crear ejercicios únicos adaptados a cada
            paciente.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="border-blue-200 hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 ${item.bgColor} rounded-full w-fit`}>
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-blue-900">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <CardDescription className="text-lg text-blue-700 text-center">{item.description}</CardDescription>
                  <div className="flex-grow"></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
