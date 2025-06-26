import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Users,
  FileImage,
  Clipboard,
  Link as LinkIcon,
  Plus,
  ImagePlus,
  Grid3x3,
  BookOpen,
  Image as ImageIcon,
  Palette,
  Circle,
  ScanSearch,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/dashboard",
      icon: Home,
    },
  ],
  exercises: [
    {
      title: "Cuadrícula",
      url: "/dashboard/exercises/reaction-grid",
      icon: Grid3x3,
    },
    {
      title: "Sílabas",
      url: "/dashboard/exercises/syllables",
      icon: BookOpen,
    },
    {
      title: "Reconocimiento visual",
      url: "/dashboard/exercises/visual-recognition",
      icon: ImageIcon,
    },
    {
      title: "Secuencia de colores",
      url: "/dashboard/exercises/color-sequence",
      icon: Palette,
    },
    {
      title: "Conteo de estímulos",
      url: "/dashboard/exercises/stimulus-count",
      icon: Circle,
    },
    {
      title: "¿Cual te has dejado?",
      url: "/dashboard/exercises/odd-one-out",
      icon: ScanSearch,
    },
  ],
  management: [
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Biblioteca multimedia",
      url: "/dashboard/media",
      icon: FileImage,
    },
    {
      title: "Generar imágenes con IA",
      url: "/dashboard/media?create-dialog=true",
      icon: ImagePlus,
    },
  ],
  sharing: [
    {
      title: "Plantillas",
      url: "/dashboard/templates",
      icon: Clipboard,
    },
    {
      title: "Mis enlaces",
      url: "/dashboard/links",
      icon: LinkIcon,
    },
    {
      title: "Crear enlace",
      url: "/dashboard/links?create-link=true",
      icon: Plus,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <Image
            src="/logo.png"
            alt="NeuroGranada Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-blue-900">NeuroGranada</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ejercicios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.exercises.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.management.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Enlaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.sharing.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
