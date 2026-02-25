"use client";

import { Bot, Eye, Send, User } from "lucide-react";
import { useInView } from "motion/react";
import type { ComponentProps, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

interface MessageProps extends PropsWithChildren {
  visible: boolean;
}

function Message({ children, visible }: MessageProps) {
  if (!visible) {
    return null;
  }
  return (
    <div className="fade-in slide-in-from-bottom-2 flex animate-in gap-3 duration-500">
      {children}
    </div>
  );
}

function MessageIcon({ className, children }: ComponentProps<"div">) {
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}

function MessageLabel({ children }: PropsWithChildren) {
  return <p className="mb-1 font-medium text-slate-400 text-xs">{children}</p>;
}

function MessageText({ children }: PropsWithChildren) {
  return <p className="break-words text-slate-700 text-sm leading-relaxed">{children}</p>;
}

function TypingBubble({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }
  return (
    <div className="fade-in flex animate-in gap-3 duration-300">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <Bot className="h-3.5 w-3.5 text-blue-600" />
      </div>
      <div className="flex items-center gap-1 pt-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function ExercisePreview({ visible }: { visible: boolean }) {
  return (
    <div className="flex flex-col bg-slate-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-4 w-4 text-blue-500" />
        <span className="font-medium font-mono text-slate-400 text-xs">
          Vista previa en tiempo real
        </span>
      </div>

      <div className="relative flex-1">
        <div
          className={
            visible ? "fade-in zoom-in-95 animate-in duration-700" : "invisible"
          }
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
            <h4 className="mb-1 font-semibold text-base text-slate-900">
              Secuenciacion Visual
            </h4>
            <p className="mb-6 text-slate-500 text-sm">
              Nivel 1 - Memoriza la secuencia
            </p>
            <div className="flex items-center justify-center gap-4 py-6 sm:gap-6 sm:py-10">
              <div className="zoom-in h-12 w-12 animate-in rounded-full border-2 border-blue-400 bg-blue-100 duration-300 sm:h-16 sm:w-16 [animation-delay:200ms]" />
              <div className="zoom-in h-12 w-12 rotate-45 animate-in border-2 border-blue-300 bg-blue-50 duration-300 sm:h-16 sm:w-16 [animation-delay:400ms]" />
              <div
                className="zoom-in scale-75 animate-in duration-300 sm:scale-100 [animation-delay:600ms]"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "32px solid transparent",
                  borderRight: "32px solid transparent",
                  borderBottom: "56px solid oklch(0.65 0.2 175 / 0.3)",
                }}
              />
            </div>
            <div className="mt-6 flex gap-2">
              <div className="h-2.5 flex-1 rounded-full bg-blue-100">
                <div className="h-2.5 w-1/3 rounded-full bg-blue-500" />
              </div>
            </div>
            <p className="mt-3 text-center text-slate-400 text-sm">
              Paso 1 de 3
            </p>
          </div>
        </div>
        {!visible && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 text-sm">
              La vista previa aparecera aqui...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    setTimeout(() => setStep(1), 400);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => setStep(4), 3800);
  }, [isInView]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
      ref={ref}
    >
      <div className="flex items-center gap-2 border-slate-100 border-b bg-slate-50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-3 w-3 rounded-full bg-slate-300" />
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="flex min-h-[320px] flex-col overflow-hidden border-slate-100 border-r bg-white p-5 md:min-h-[420px]">
          <div className="flex flex-1 flex-col gap-4">
            <Message visible={step >= 1}>
              <MessageIcon className="bg-slate-100 text-slate-500">
                <User className="h-3.5 w-3.5" />
              </MessageIcon>
              <div>
                <MessageLabel>Usuario</MessageLabel>
                <MessageText>
                  Necesito un ejercicio de secuenciacion visual para pacientes
                  con deficit de atencion. Que muestre formas geometricas en
                  orden y el paciente deba repetirlo.
                </MessageText>
              </div>
            </Message>
            <TypingBubble visible={step === 2} />
            <Message visible={step >= 3}>
              <MessageIcon className="bg-blue-100 text-blue-600">
                <Bot className="h-3.5 w-3.5" />
              </MessageIcon>
              <div>
                <MessageLabel>Agente</MessageLabel>
                <MessageText>
                  He creado un ejercicio de secuenciacion visual con 3 niveles
                  de dificultad. El paciente vera una secuencia de figuras
                  geometricas que debera memorizar y reproducir en el orden
                  correcto. He incluido retroalimentacion visual y auditiva.
                </MessageText>
              </div>
            </Message>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="flex-1 text-slate-400 text-sm">
              Describe tu ejercicio...
            </span>
            <Send className="h-4 w-4 text-slate-300" />
          </div>
        </div>

        <ExercisePreview visible={step >= 4} />
      </div>
    </div>
  );
}
