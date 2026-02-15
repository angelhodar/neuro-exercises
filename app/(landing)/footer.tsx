import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t bg-blue-50 px-4 py-6 sm:flex-row md:px-6">
      <div className="flex items-center gap-2">
        <Image
          alt="NeuroGranada Logo"
          className="h-5 w-5"
          height={20}
          src="/logo.png"
          width={20}
        />
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} NeuroGranada. Desarrollado con ❤️ en
          Granada, Andalucía.
        </p>
      </div>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link
          className="text-gray-600 text-xs underline-offset-4 hover:text-blue-600 hover:underline"
          href="/terminos"
        >
          Términos de Servicio
        </Link>
        <Link
          className="text-gray-600 text-xs underline-offset-4 hover:text-blue-600 hover:underline"
          href="/privacidad"
        >
          Privacidad
        </Link>
        <Link
          className="text-gray-600 text-xs underline-offset-4 hover:text-blue-600 hover:underline"
          href="/contacto"
        >
          Contacto
        </Link>
      </nav>
    </footer>
  );
}
