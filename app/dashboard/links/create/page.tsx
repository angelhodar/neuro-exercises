import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { CreateLinkForm } from "./create-link-form"
import { buttonVariants } from "@/components/ui/button"
import { getAvailableUsers } from "@/app/actions/users"
import { getAvailableExercises } from "@/app/actions/exercises"

export const metadata: Metadata = {
  title: "Crear Enlace",
  description: "Crear un nuevo enlace para compartir ejercicios.",
}

export default async function CreateLinkPage() {
  const [users, exercises] = await Promise.all([getAvailableUsers(), getAvailableExercises()])

  return (
    <div className="container relative">
      <div className="lg:px-8 py-4 lg:py-8">
        <div className="mb-4">
          <Link href="/dashboard/links" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">Crear Enlace</h1>
            <p className="text-sm text-muted-foreground">Crear un nuevo enlace para compartir ejercicios.</p>
          </div>
        </div>
      </div>
      <CreateLinkForm users={users} exercises={exercises} />
    </div>
  )
}