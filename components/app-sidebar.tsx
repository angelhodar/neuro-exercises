"use client"

import { usePathname } from "next/navigation"
import { Activity, Brain, Home, Users, BarChart3, Share2, Link2 } from "lucide-react"
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
} from "@/components/ui/sidebar"

// Datos de navegación
const navigationItems = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    title: "Ejercicios",
    items: [
      {
        title: "Reflejos Visuales",
        url: "/dashboard/exercises/grid",
        icon: Activity,
      },
      {
        title: "Unir Sílabas",
        url: "/dashboard/exercises/syllables",
        icon: Activity,
      },
      {
        title: "Reconocimiento Visual",
        url: "/dashboard/exercises/visual-recognition",
        icon: Activity,
      }      
    ],
  },
  {
    title: "Compartir",
    items: [
      {
        title: "Crear Enlace",
        url: "/dashboard/share",
        icon: Share2,
      },
      {
        title: "Mis Enlaces",
        url: "/dashboard/shared-links",
        icon: Link2,
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        title: "Usuarios",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Estadísticas",
        url: "/dashboard/statistics",
        icon: BarChart3,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold">NeuroExercise</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/profile">
                <Settings className="h-4 w-4" />
                <span>{userName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" onClick={signOut} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
