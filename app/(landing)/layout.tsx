import type { PropsWithChildren } from "react";

export const metadata = {
  title: "NeuroGranada — Rehabilitación Neurológica con IA",
  description:
    "Plataforma clínica avanzada para profesionales de neurología. Genera ejercicios cognitivos personalizados con IA, monitoriza el progreso y adapta la terapia en tiempo real.",
};

export default function LandingLayout({ children }: PropsWithChildren) {
  return (
    <div className="font-(family-name:--font-body) relative min-h-screen text-slate-900 antialiased selection:bg-blue-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-size-[60px_60px]" />
      {children}
    </div>
  );
}
