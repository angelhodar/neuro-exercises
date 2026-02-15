import { Edit3, ImageIcon, Tags } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
];

export default function MultimediaFeaturesSection() {
  return (
    <motion.section
      className="bg-white px-6 py-20 lg:px-8"
      id="funcionalidades"
      initial={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-6 font-bold text-4xl text-blue-900 lg:text-5xl">
            Contenido Multimedia Inteligente
          </h2>
          <p className="mx-auto max-w-3xl text-blue-700 text-xl">
            Genera, clasifica y edita contenido multimedia personalizado para
            crear ejercicios únicos adaptados a cada paciente.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
          {features.map((item, index) => (
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 40 }}
              key={item.title}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card className="flex h-full flex-col border-blue-200 transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4 text-center">
                  <div
                    className={`mx-auto mb-4 p-4 ${item.bgColor} w-fit rounded-full`}
                  >
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-blue-900">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col justify-between">
                  <CardDescription className="text-center text-blue-700 text-lg">
                    {item.description}
                  </CardDescription>
                  <div className="flex-grow" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
