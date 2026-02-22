import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-slate-200 border-t bg-white px-6 py-10 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <Image
            alt="NeuroGranada"
            className="h-6 w-6"
            height={24}
            src="/logo.png"
            width={24}
          />
          <span className="font-(family-name:--font-display) font-semibold text-slate-700">
            NeuroGranada
          </span>
          <span className="text-slate-400">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            className="text-slate-500 transition-colors hover:text-slate-800"
            href="/terminos"
          >
            Términos
          </Link>
          <Link
            className="text-slate-500 transition-colors hover:text-slate-800"
            href="/privacidad"
          >
            Privacidad
          </Link>
          <Link
            className="text-slate-500 transition-colors hover:text-slate-800"
            href="/contacto"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}
