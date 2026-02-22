"use client";

import { Bot, Eye, ImageIcon, Send, User } from "lucide-react";
import { createContext, type ReactNode, use, useEffect, useState } from "react";

interface AgentChatDemoCtx {
  visibleCount: number;
  isTyping: boolean;
  showPreview: boolean;
}

const AgentChatDemoContext = createContext<AgentChatDemoCtx>({
  visibleCount: 0,
  isTyping: false,
  showPreview: false,
});

function AgentUserMessage({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const { visibleCount } = use(AgentChatDemoContext);
  if (visibleCount <= index) {
    return null;
  }
  return (
    <div className="fade-in slide-in-from-bottom-2 flex animate-in gap-3 duration-500">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <User className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div>
        <p className="mb-1 font-medium text-slate-400 text-xs">Usuario</p>
        <p className="text-slate-700 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function AgentAssistantMessage({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const { visibleCount } = use(AgentChatDemoContext);
  if (visibleCount <= index) {
    return null;
  }
  return (
    <div className="fade-in slide-in-from-bottom-2 flex animate-in gap-3 duration-500">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
        <Bot className="h-3.5 w-3.5 text-blue-600" />
      </div>
      <div>
        <p className="mb-1 font-medium text-slate-400 text-xs">Agente</p>
        <p className="text-slate-700 text-sm leading-relaxed">{children}</p>
        <div className="mt-3 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-blue-600 text-xs">
            <ImageIcon className="h-3 w-3" />
            Generar imagenes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-500 text-xs">
            <Eye className="h-3 w-3" />
            Previsualizar
          </span>
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  const { isTyping } = use(AgentChatDemoContext);
  if (!isTyping) {
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

function ExercisePreview() {
  const { showPreview } = use(AgentChatDemoContext);
  return (
    <div className="flex flex-col bg-slate-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-4 w-4 text-blue-500" />
        <span className="font-medium font-mono text-slate-400 text-xs">
          Vista previa en tiempo real
        </span>
      </div>

      {showPreview ? (
        <div className="fade-in zoom-in-95 flex-1 animate-in duration-700">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h4 className="mb-1 font-semibold text-base text-slate-900">
              Secuenciacion Visual
            </h4>
            <p className="mb-6 text-slate-500 text-sm">
              Nivel 1 - Memoriza la secuencia
            </p>
            <div className="flex items-center justify-center gap-6 py-10">
              <div className="zoom-in h-16 w-16 animate-in rounded-full border-2 border-blue-400 bg-blue-100 duration-300 [animation-delay:200ms]" />
              <div className="zoom-in h-16 w-16 rotate-45 animate-in border-2 border-blue-300 bg-blue-50 duration-300 [animation-delay:400ms]" />
              <div
                className="zoom-in animate-in duration-300 [animation-delay:600ms]"
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
      ) : (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="text-slate-400 text-sm">
            La vista previa aparecera aqui...
          </p>
        </div>
      )}
    </div>
  );
}

export function AgentChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => setVisibleCount(1), 400);
          setTimeout(() => setIsTyping(true), 1500);
          setTimeout(() => {
            setIsTyping(false);
            setVisibleCount(2);
          }, 3000);
          setTimeout(() => setShowPreview(true), 3800);
        }
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById("agent-chat-demo");

    if (el) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <AgentChatDemoContext.Provider
      value={{ visibleCount, isTyping, showPreview }}
    >
      <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
        id="agent-chat-demo"
      >
        <div className="flex items-center gap-2 border-slate-100 border-b bg-slate-50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="flex min-h-[420px] flex-col border-slate-100 border-r bg-white p-5">
            <div className="flex flex-1 flex-col gap-4">
              <AgentUserMessage index={0}>
                Necesito un ejercicio de secuenciacion visual para pacientes con
                deficit de atencion. Que muestre formas geometricas en orden y
                el paciente deba repetirlo.
              </AgentUserMessage>
              <AgentAssistantMessage index={1}>
                He creado un ejercicio de secuenciacion visual con 3 niveles de
                dificultad. El paciente vera una secuencia de figuras
                geometricas que debera memorizar y reproducir en el orden
                correcto. He incluido retroalimentacion visual y auditiva.
              </AgentAssistantMessage>
              <TypingBubble />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="flex-1 text-slate-400 text-sm">
                Describe tu ejercicio...
              </span>
              <Send className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <ExercisePreview />
        </div>
      </div>
    </AgentChatDemoContext.Provider>
  );
}
