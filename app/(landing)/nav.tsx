import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <div className="fixed top-4 right-0 left-0 z-50 flex justify-center px-6">
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-8 py-3 shadow-lg shadow-slate-100 backdrop-blur-md">
        <Link className="flex items-center gap-2.5" href="/">
          <Image
            alt="NeuroGranada"
            className="h-7 w-7"
            height={28}
            src="/logo.png"
            width={28}
          />
          <span className="font-(family-name:--font-display) font-bold text-lg text-slate-900">
            NeuroGranada
          </span>
        </Link>

        <div className="hidden items-center gap-10 text-slate-500 md:flex">
          <Link
            className="flex items-center gap-1.5 text-base transition-colors hover:text-slate-900"
            href="#ejercicios"
          >
            Ejercicios
          </Link>
          <Link
            className="flex items-center gap-1.5 text-base transition-colors hover:text-slate-900"
            href="#multimedia"
          >
            Multimedia
          </Link>
          <Link
            className="flex items-center gap-1.5 text-base transition-colors hover:text-slate-900"
            href="#como-funciona"
          >
            Cómo funciona
          </Link>
        </div>

        <Button
          className="bg-blue-600 px-5 text-sm text-white hover:bg-blue-700"
          render={<Link href="/login" />}
        >
          Acceder →
        </Button>
      </nav>
    </div>
  );
}
