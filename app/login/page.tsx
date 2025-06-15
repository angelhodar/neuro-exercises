"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain, ArrowLeft } from "lucide-react"
import { signIn, signUp } from "@/lib/auth/auth.client"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSignIn(formData: FormData) {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || "Error al iniciar sesión")
      } else {
        setSuccess("¡Sesión iniciada correctamente!")
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Error inesperado al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUp(formData: FormData) {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const name = formData.get("name") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setIsLoading(false)
        return
      }

      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || "Error al crear la cuenta")
      } else {
        setSuccess("¡Cuenta creada correctamente! Iniciando sesión...")
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Error inesperado al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-primary rounded-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ejercicios Cognitivos</CardTitle>
              <CardDescription>Inicia sesión o crea una cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
                </TabsList>

                {/* Error/Success Messages */}
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form action={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Correo Electrónico</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Contraseña</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form action={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre Completo</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo Electrónico</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar Contraseña</Label>
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear Cuenta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
