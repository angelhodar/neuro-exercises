import { getAvailableUsers } from "@/app/actions/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

export default async function UsersPage() {
  const users = await getAvailableUsers()

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
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
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
