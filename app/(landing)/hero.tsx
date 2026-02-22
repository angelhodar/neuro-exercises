"use client";

import { ArrowRight } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgentChatDemo } from "./agent-chat-demo";

export default function HeroSection() {
  return (
    <section className="pt-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center lg:px-10">
        {/* Headline */}
        <motion.h1
          animate={{ opacity: 1 }}
          className="font-(family-name:--font-display) mb-8 font-bold text-6xl leading-[0.92] tracking-tight xl:text-7xl"
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="text-slate-900">Rehabilitación </span>
          <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Neurológica
          </span>
          <br />
          <span className="text-slate-900">rediseñada</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-3xl text-slate-600 text-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Diseña ejercicios cognitivos en lenguaje natural, previsualízalos al
          instante y compártelos con tus pacientes. Todo en una plataforma
          clínica segura y adaptativa.
        </motion.p>

        {/* CTAs */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Button
            className="h-auto bg-blue-600 px-8 py-4 text-lg text-white shadow-blue-200 shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-200 hover:shadow-xl"
            render={<Link href="/login" />}
            size="lg"
          >
            Comenzar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            className="h-auto border border-slate-200 bg-white px-8 py-4 text-lg text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            render={<Link href="#ejercicios" />}
            size="lg"
          >
            Probar ejercicios
          </Button>
        </motion.div>

        {/* Chat demo */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-left"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <AgentChatDemo />
        </motion.div>
      </div>
    </section>
  );
}
