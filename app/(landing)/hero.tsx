"use client"

import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { div as MotionDiv, h1 as MotionH1, p as MotionP} from "motion/react-m"

export default function HeroSection() {
  return (
    <section className="px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center min-h-[600px]">
          {/* Content Side */}
          <MotionDiv
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <MotionH1
                className="text-4xl lg:text-6xl xl:text-7xl font-bold text-blue-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                <span className="whitespace-nowrap">Ejercicios Cognitivos</span>
                <span className="block text-blue-600 mt-2">Personalizados</span>
              </MotionH1>

              <MotionP
                className="text-xl lg:text-2xl text-blue-700 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Plataforma especializada en rehabilitación neurológica con ejercicios adaptativos y contenido multimedia
                generado por IA para maximizar la recuperación cognitiva.
              </MotionP>
            </div>

            <MotionDiv
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Comenzar Ahora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto bg-transparent hover:border-blue-700 transition-all duration-300"
              >
                Ver Demo
              </Button>
            </MotionDiv>
          </MotionDiv>

          {/* Brain Animation Side */}
          <MotionDiv
            className="flex justify-center lg:justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              <MotionDiv
                className="relative inline-block"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {/* Main Brain */}
                <Brain className="h-72 w-72 lg:h-96 lg:w-96 text-blue-500 drop-shadow-2xl" />

                {/* Glow Effect */}
                <MotionDiv
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)",
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Neural Connection Lines */}
                <MotionDiv
                  className="absolute top-1/4 left-1/4 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent origin-left"
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <MotionDiv
                  className="absolute bottom-1/3 right-1/4 w-12 h-0.5 bg-gradient-to-l from-cyan-400 to-transparent origin-right"
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1.2,
                  }}
                />

                {/* Pulse Dots */}
                <MotionDiv
                  className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full shadow-lg"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0,
                  }}
                />
                <MotionDiv
                  className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400 rounded-full shadow-lg"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0.4)",
                      "0 0 0 8px rgba(99, 102, 241, 0)",
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <MotionDiv
                  className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-cyan-400 rounded-full shadow-lg"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 211, 238, 0.4)",
                      "0 0 0 12px rgba(34, 211, 238, 0)",
                      "0 0 0 0 rgba(34, 211, 238, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
                <MotionDiv
                  className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-blue-300 rounded-full shadow-lg"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.8, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(147, 197, 253, 0.4)",
                      "0 0 0 8px rgba(147, 197, 253, 0)",
                      "0 0 0 0 rgba(147, 197, 253, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                />

                {/* Floating Elements */}
                <MotionDiv
                  className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60"
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <MotionDiv
                  className="absolute -bottom-6 -left-6 w-6 h-6 bg-indigo-200 rounded-full opacity-60"
                  animate={{
                    y: [10, -10, 10],
                    x: [5, -5, 5],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </MotionDiv>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  )
}
