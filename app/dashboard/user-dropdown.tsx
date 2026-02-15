"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth/auth.client";

export function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton className="w-full" />}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={user?.image || "/placeholder-avatar.jpg"} />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{user.name || "Usuario"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--anchor-width)" side="top">
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
