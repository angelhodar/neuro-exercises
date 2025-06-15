"use client"

import { User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de ejemplo
const mockUsers = [
  { id: 1, name: "María García", progress: 75, lastActive: "Hoy" },
  { id: 2, name: "Juan Pérez", progress: 45, lastActive: "Ayer" },
  { id: 3, name: "Ana Rodríguez", progress: 90, lastActive: "Hace 3 días" },
]

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona y visualiza el progreso de los usuarios.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Activos</CardTitle>
          <CardDescription>Lista de usuarios y su progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">Activo: {user.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{user.progress}%</div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${user.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
