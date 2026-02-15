import {
  BookOpen,
  Building2,
  Circle,
  Clipboard,
  FileImage,
  Grid3x3,
  Home,
  Image as ImageIcon,
  ImagePlus,
  Link as LinkIcon,
  Mic,
  Palette,
  Plus,
  ScanSearch,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
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
      url: "/exercises/reaction-time-grid",
      icon: Grid3x3,
    },
    {
      title: "Sílabas",
      url: "/exercises/syllables",
      icon: BookOpen,
    },
    {
      title: "Reconocimiento visual",
      url: "/exercises/visual-recognition",
      icon: ImageIcon,
    },
    {
      title: "Secuencia de colores",
      url: "/exercises/color-sequence",
      icon: Palette,
    },
    {
      title: "Conteo de estímulos",
      url: "/exercises/stimulus-count",
      icon: Circle,
    },
    {
      title: "¿Cual te has dejado?",
      url: "/exercises/odd-one-out",
      icon: ScanSearch,
    },
  ],
  management: [
    {
      title: "Organizaciones",
      url: "/dashboard/organizations",
      icon: Building2,
    },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
    },
  ],
  library: [
    {
      title: "Biblioteca multimedia",
      url: "/dashboard/media",
      icon: FileImage,
    },
    {
      title: "Generar imágenes con IA",
      url: "/dashboard/media?create-media-ai=true",
      icon: ImagePlus,
    },
    {
      title: "Subir contenido manualmente",
      url: "/dashboard/media?create-media-manual=true",
      icon: Upload,
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
  tools: [
    {
      title: "Textos",
      url: "/dashboard/speech/texts",
      icon: BookOpen,
    },
    {
      title: "Transcripciones",
      url: "/dashboard/speech/transcriptions",
      icon: Mic,
    },
    {
      title: "Crear transcripción",
      url: "/dashboard/speech/transcript",
      icon: Plus,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link className="flex items-center gap-2 px-2 py-1" href="/dashboard">
          <Image
            alt="NeuroGranada Logo"
            className="h-8 w-8"
            height={32}
            src="/logo.png"
            width={32}
          />
          <span className="font-bold text-blue-900 text-lg">NeuroGranada</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
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
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
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
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Contenidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.library.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
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
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Voz</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
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
