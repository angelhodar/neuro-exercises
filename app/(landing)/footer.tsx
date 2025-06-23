import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-blue-50">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="NeuroGranada Logo"
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <p className="text-xs text-gray-600">© 2024 NeuroGranada. Desarrollado con ❤️ en Granada, Andalucía.</p>
      </div>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="/terminos" className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-blue-600">
          Términos de Servicio
        </Link>
        <Link
          href="/privacidad"
          className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-blue-600"
        >
          Privacidad
        </Link>
        <Link href="/contacto" className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-blue-600">
          Contacto
        </Link>
      </nav>
    </footer>
  )
}
