"use client";

import {
  Edit3,
  Globe,
  ImageIcon,
  ImagePlus,
  MessageSquare,
  Music,
  Search,
  Video,
} from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import type { ElementType, PropsWithChildren } from "react";

type MultimediaFeatureProps = PropsWithChildren<{
  index: number;
  accent: string;
  icon: ElementType;
}>;

function MultimediaFeature({
  index,
  accent,
  icon: Icon,
  children,
}: MultimediaFeatureProps) {
  return (
    <motion.div
      className="flex items-start gap-4"
      initial={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.08,
        ease: "easeOut",
      }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      <div className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

function MultimediaFeatureTitle({ children }: PropsWithChildren) {
  return <h3 className="mb-0.5 font-semibold text-slate-900">{children}</h3>;
}

function MultimediaFeatureDescription({ children }: PropsWithChildren) {
  return <p className="text-base text-slate-500 leading-relaxed">{children}</p>;
}

interface MockupThumbnailProps {
  gradient: string;
  icon: ElementType;
  iconColor: string;
}

function MockupThumbnail({
  gradient,
  icon: Icon,
  iconColor,
}: MockupThumbnailProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-xl bg-linear-to-br ${gradient}`}
    >
      <div className="flex h-full items-center justify-center">
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </div>
  );
}

function MockupPanel({ children }: PropsWithChildren) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-slate-100/80 shadow-xl">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="flex-1 text-slate-400 text-sm">
          Buscar: &quot;animales domésticos con fondo blanco&quot;
        </span>
        <span className="rounded-full bg-blue-500 px-2 py-0.5 font-mono text-[10px] text-white">
          IA
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">{children}</div>

      <div className="absolute -right-4 -bottom-4 w-52 rounded-xl border border-indigo-100 bg-white p-3 shadow-lg">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
          <span className="font-mono text-[10px] text-indigo-500 uppercase tracking-widest">
            Editando
          </span>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">
          &quot;Cambia el fondo a un jardín y añade un perro&quot;
        </p>
        <div className="mt-2 h-1 rounded-full bg-slate-100">
          <div className="h-1 w-2/3 rounded-full bg-indigo-400" />
        </div>
      </div>
    </div>
  );
}

export default function MultimediaSection() {
  return (
    <section className="overflow-hidden px-6 py-28 lg:px-10" id="multimedia">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="mb-4 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-blue-500 text-xs uppercase tracking-widest">
              Multimedia
            </div>
            <h2 className="font-(family-name:--font-display) mb-4 font-bold text-5xl text-slate-900 leading-tight lg:text-6xl">
              Todo el contenido
              <br />
              <span className="text-blue-500">que necesitas</span>
            </h2>
            <p className="mb-10 text-slate-600 text-xl leading-relaxed">
              Una biblioteca multimedia integrada donde generas, buscas y editas
              el contenido visual de tus ejercicios sin salir de la plataforma.
            </p>

            <div className="space-y-6">
              <MultimediaFeature
                accent="bg-blue-50 text-blue-600"
                icon={ImagePlus}
                index={0}
              >
                <MultimediaFeatureTitle>
                  Generación por IA
                </MultimediaFeatureTitle>
                <MultimediaFeatureDescription>
                  Crea imágenes a partir de un prompt de texto. Genera contenido
                  visual personalizado para cada ejercicio en segundos.
                </MultimediaFeatureDescription>
              </MultimediaFeature>

              <MultimediaFeature
                accent="bg-cyan-50 text-cyan-600"
                icon={Globe}
                index={1}
              >
                <MultimediaFeatureTitle>
                  Búsqueda en Google
                </MultimediaFeatureTitle>
                <MultimediaFeatureDescription>
                  Accede al motor de búsqueda de Google para enriquecer tus
                  ejercicios con imágenes reales y relevantes.
                </MultimediaFeatureDescription>
              </MultimediaFeature>

              <MultimediaFeature
                accent="bg-indigo-50 text-indigo-600"
                icon={Edit3}
                index={2}
              >
                <MultimediaFeatureTitle>
                  Edición Inteligente
                </MultimediaFeatureTitle>
                <MultimediaFeatureDescription>
                  Modifica cualquier imagen ya generada usando comandos de
                  texto. Sin herramientas externas, sin fricción.
                </MultimediaFeatureDescription>
              </MultimediaFeature>

              <MultimediaFeature
                accent="bg-violet-50 text-violet-600"
                icon={MessageSquare}
                index={3}
              >
                <MultimediaFeatureTitle>
                  Búsqueda Contextual
                </MultimediaFeatureTitle>
                <MultimediaFeatureDescription>
                  Describe en lenguaje natural lo que necesitas y la IA
                  encuentra el medio más adecuado de tu biblioteca.
                </MultimediaFeatureDescription>
              </MultimediaFeature>
            </div>
          </motion.div>

          <motion.div
            className="relative pr-4 pb-8"
            initial={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <MockupPanel>
              <MockupThumbnail
                gradient="from-blue-100 to-blue-200"
                icon={ImageIcon}
                iconColor="text-blue-300"
              />
              <MockupThumbnail
                gradient="from-slate-100 to-slate-200"
                icon={Music}
                iconColor="text-slate-300"
              />
              <MockupThumbnail
                gradient="from-violet-100 to-violet-200"
                icon={ImageIcon}
                iconColor="text-violet-300"
              />
              <MockupThumbnail
                gradient="from-amber-100 to-amber-200"
                icon={Video}
                iconColor="text-amber-300"
              />
              <MockupThumbnail
                gradient="from-sky-100 to-sky-200"
                icon={ImageIcon}
                iconColor="text-sky-300"
              />
              <MockupThumbnail
                gradient="from-emerald-100 to-emerald-200"
                icon={Music}
                iconColor="text-emerald-300"
              />
            </MockupPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
