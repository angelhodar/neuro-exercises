import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="NeuroGranada Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="ml-2 text-xl font-bold text-blue-900">NeuroGranada</span>
      </Link>
      <Button render={<Link href="/login" />} className="hover:bg-blue-600">
        Acceder
      </Button>
    </header>
  )
}
