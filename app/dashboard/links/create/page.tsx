import { CreateLinkForm } from "./create-link-form"
import { getAvailableUsers } from "@/app/actions/users"
import { getExercises } from "@/app/actions/exercises"
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
} from "@/components/dashboard-header"

export default async function CreateLinkPage() {
  const [users, exercises] = await Promise.all([getAvailableUsers(), getExercises()])

  return (
    <div className="container relative">
      <div className="lg:px-8 py-4 lg:py-8">
        <DashboardHeader>
          <div>
            <DashboardHeaderTitle>Crear enlace</DashboardHeaderTitle>
            <DashboardHeaderDescription>
              Crear un nuevo enlace para compartir ejercicios.
            </DashboardHeaderDescription>
          </div>
        </DashboardHeader>
      </div>
      <div className="flex w-full justify-center items-center container">
        <CreateLinkForm users={users} exercises={exercises} />
      </div>
    </div>
  )
}