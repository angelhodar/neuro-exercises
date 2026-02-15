import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-sm lg:px-6">
      <Link className="flex items-center justify-center" href="/">
        <Image
          alt="NeuroGranada Logo"
          className="h-8 w-8"
          height={32}
          src="/logo.png"
          width={32}
        />
        <span className="ml-2 font-bold text-blue-900 text-xl">
          NeuroGranada
        </span>
      </Link>
      <Button className="hover:bg-blue-600" render={<Link href="/login" />}>
        Acceder
      </Button>
    </header>
  );
}
