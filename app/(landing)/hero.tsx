import { Brain } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollToElementButton } from "../../components/scroll-to-element-button";

export default function HeroSection() {
  return (
    <section className="px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid min-h-[600px] items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Content Side */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.h1
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-3xl text-blue-900 leading-tight lg:text-6xl xl:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                <span className="md:whitespace-nowrap">
                  Ejercicios Cognitivos
                </span>
                <span className="mt-2 block text-blue-600">Personalizados</span>
              </motion.h1>

              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-blue-700 text-xl leading-relaxed lg:text-2xl"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Plataforma especializada en rehabilitación neurológica con
                ejercicios adaptativos y contenido multimedia generado por IA
                para maximizar la recuperación cognitiva.
              </motion.p>
            </div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start gap-4 pt-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                className="h-auto bg-blue-600 px-8 py-4 text-lg text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
                render={<Link href="/login" />}
                size="lg"
              >
                Comenzar
              </Button>
              <ScrollToElementButton
                className="h-auto border-2 border-blue-600 bg-transparent px-8 py-4 text-blue-600 text-lg transition-all duration-300 hover:border-blue-700 hover:bg-blue-50"
                elementId="landing-exercises"
                size="lg"
                variant="outline"
              >
                Probar
              </ScrollToElementButton>
            </motion.div>

            <Image
              alt="Alzheimer awareness"
              height={150}
              src="/alzheimer.webp"
              width={150}
            />
          </motion.div>

          {/* Brain Animation Side */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center lg:justify-center"
            initial={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                className="relative inline-block"
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {/* Main Brain */}
                <Brain className="h-72 w-72 text-blue-500 drop-shadow-2xl lg:h-96 lg:w-96" />

                {/* Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)",
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Neural Connection Lines */}
                <motion.div
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  className="absolute top-1/4 left-1/4 h-0.5 w-16 origin-left bg-gradient-to-r from-blue-400 to-transparent"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  className="absolute right-1/4 bottom-1/3 h-0.5 w-12 origin-right bg-gradient-to-l from-cyan-400 to-transparent"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1.2,
                  }}
                />

                {/* Pulse Dots */}
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                    ],
                  }}
                  className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-blue-400 shadow-lg"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0.4)",
                      "0 0 0 8px rgba(99, 102, 241, 0)",
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-indigo-400 shadow-lg"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 211, 238, 0.4)",
                      "0 0 0 12px rgba(34, 211, 238, 0)",
                      "0 0 0 0 rgba(34, 211, 238, 0)",
                    ],
                  }}
                  className="absolute bottom-1/3 left-1/3 h-5 w-5 rounded-full bg-cyan-400 shadow-lg"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(147, 197, 253, 0.4)",
                      "0 0 0 8px rgba(147, 197, 253, 0)",
                      "0 0 0 0 rgba(147, 197, 253, 0)",
                    ],
                  }}
                  className="absolute right-1/3 bottom-1/4 h-3 w-3 rounded-full bg-blue-300 shadow-lg"
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                />

                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                  }}
                  className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-blue-200 opacity-60"
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  animate={{
                    y: [10, -10, 10],
                    x: [5, -5, 5],
                  }}
                  className="absolute -bottom-6 -left-6 h-6 w-6 rounded-full bg-indigo-200 opacity-60"
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
