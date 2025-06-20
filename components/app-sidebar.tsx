import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Users,
  FileImage,
  Plus,
  Eye,
  Grid3x3,
  BookOpen,
  Image as ImageIcon,
  Palette,
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
import { UserDropdown } from "@/components/user-dropdown";

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
  ],
  sharing: [
    {
      title: "Crear enlaces",
      url: "/dashboard/links/create",
      icon: Plus,
    },
    {
      title: "Mis enlaces",
      url: "/dashboard/links",
      icon: Eye,
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

        {/* Ejercicios Interactivos */}
        <SidebarGroup>
          <SidebarGroupLabel>Ejercicios Interactivos</SidebarGroupLabel>
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

        {/* Gestión */}
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

        {/* Enlaces Compartidos */}
        <SidebarGroup>
          <SidebarGroupLabel>Enlaces Compartidos</SidebarGroupLabel>
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
