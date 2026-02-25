"use client";

import { MessageSquare, Play, Send } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import type { ElementType, PropsWithChildren } from "react";

type WorkflowStepProps = PropsWithChildren<{
  step: number;
  icon: ElementType;
}>;

function WorkflowStep({ step, icon: Icon, children }: WorkflowStepProps) {
  return (
    <motion.div
      className="group relative flex flex-col items-center px-4 text-center sm:px-8"
      initial={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: step * 0.15, ease: "easeOut" }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-blue-100 blur-xl transition-all group-hover:bg-blue-200" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-white shadow-sm">
          <Icon className="h-7 w-7 text-blue-600" />
        </div>
      </div>

      <div className="mb-4 font-bold font-mono text-2xl text-blue-400">
        {step}
      </div>

      {children}
    </motion.div>
  );
}

function WorkflowStepTitle({ children }: PropsWithChildren) {
  return (
    <h3 className="mb-4 font-semibold text-slate-900 text-xl">{children}</h3>
  );
}

function WorkflowStepDescription({ children }: PropsWithChildren) {
  return (
    <p className="mb-6 text-base text-slate-500 leading-relaxed">{children}</p>
  );
}

export default function WorkflowSection() {
  return (
    <section className="px-6 py-16 md:py-28 lg:px-10" id="como-funciona">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-blue-500 text-xs uppercase tracking-widest">
            Cómo funciona
          </div>
          <h2 className="font-(family-name:--font-display) mb-4 font-bold text-3xl text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
            De idea a terapia
            <br />
            <span className="text-blue-500">en tres pasos</span>
          </h2>
        </motion.div>

        <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-0">
          <div className="pointer-events-none absolute top-8 left-1/2 hidden h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-blue-200 to-transparent lg:block" />

          <WorkflowStep icon={MessageSquare} step={1}>
            <WorkflowStepTitle>Describe el ejercicio</WorkflowStepTitle>
            <WorkflowStepDescription>
              Escribe en lenguaje natural qué quieres: &quot;Un ejercicio de
              memoria donde el paciente identifique objetos en una imagen
              durante 5 segundos&quot;. Sin formularios complejos.
            </WorkflowStepDescription>
          </WorkflowStep>

          <WorkflowStep icon={Play} step={2}>
            <WorkflowStepTitle>IA genera y previsualiza</WorkflowStepTitle>
            <WorkflowStepDescription>
              El agente configura los parámetros, genera las imágenes necesarias
              y lanza una vista previa al instante.
            </WorkflowStepDescription>
          </WorkflowStep>

          <WorkflowStep icon={Send} step={3}>
            <WorkflowStepTitle>Comparte con el paciente</WorkflowStepTitle>
            <WorkflowStepDescription>
              Genera un enlace único que el paciente abre desde cualquier
              dispositivo. Los resultados llegan a tu panel en tiempo real. Sin
              instalaciones, sin fricciones.
            </WorkflowStepDescription>
          </WorkflowStep>
        </div>
      </div>
    </section>
  );
}
