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
  UserRound,
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
  exercises: [
    {
      icon: Grid3x3,
      title: "Cuadrícula",
      url: "/exercises/reaction-time-grid",
    },
    {
      icon: BookOpen,
      title: "Sílabas",
      url: "/exercises/syllables",
    },
    {
      icon: ImageIcon,
      title: "Reconocimiento visual",
      url: "/exercises/visual-recognition",
    },
    {
      icon: Palette,
      title: "Secuencia de colores",
      url: "/exercises/color-sequence",
    },
    {
      icon: Circle,
      title: "Conteo de estímulos",
      url: "/exercises/stimulus-count",
    },
    {
      icon: ScanSearch,
      title: "¿Cual te has dejado?",
      url: "/exercises/odd-one-out",
    },
  ],
  library: [
    {
      icon: FileImage,
      title: "Biblioteca multimedia",
      url: "/dashboard/media",
    },
    {
      icon: ImagePlus,
      title: "Generar imágenes con IA",
      url: "/dashboard/media?create-media-ai=true",
    },
    {
      icon: Upload,
      title: "Subir contenido manualmente",
      url: "/dashboard/media?create-media-manual=true",
    },
  ],
  management: [
    {
      icon: Building2,
      title: "Organizaciones",
      url: "/dashboard/organizations",
    },
    {
      icon: Users,
      title: "Usuarios",
      url: "/dashboard/users",
    },
    {
      icon: UserRound,
      title: "Pacientes",
      url: "/dashboard/patients",
    },
  ],
  navMain: [
    {
      icon: Home,
      title: "Inicio",
      url: "/dashboard",
    },
  ],
  sharing: [
    {
      icon: Clipboard,
      title: "Plantillas",
      url: "/dashboard/templates",
    },
    {
      icon: LinkIcon,
      title: "Mis enlaces",
      url: "/dashboard/links",
    },
    {
      icon: Plus,
      title: "Crear enlace",
      url: "/dashboard/links?create-link=true",
    },
  ],
  tools: [
    {
      icon: BookOpen,
      title: "Textos",
      url: "/dashboard/speech/texts",
    },
    {
      icon: Mic,
      title: "Transcripciones",
      url: "/dashboard/speech/transcriptions",
    },
    {
      icon: Plus,
      title: "Crear transcripción",
      url: "/dashboard/speech/transcript",
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
