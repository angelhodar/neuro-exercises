import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LinkNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="font-bold text-2xl text-red-600">
            Enlace no encontrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600 text-lg">
              No se pudo encontrar el enlace compartido que estás buscando.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                Posibles causas:
              </h3>
              <ul className="space-y-1 text-left text-blue-800 text-sm">
                <li>• El enlace no existe</li>
                <li>• El enlace ha sido eliminado</li>
              </ul>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">
                ¿Qué puedes hacer?
              </h3>
              <ul className="space-y-1 text-left text-sm text-yellow-800">
                <li>• Verifica que la URL esté completa y correcta</li>
                <li>• Contacta a la persona que te compartió el enlace</li>
                <li>• Solicita un nuevo enlace si el anterior expiró</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button render={<Link href="/" />} size="lg" variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          </div>

          <div className="border-gray-200 border-t pt-4">
            <p className="text-gray-500 text-xs">
              Si crees que esto es un error, por favor{" "}
              <Link
                className="text-blue-600 underline hover:text-blue-700"
                href="/contacto"
              >
                contáctanos
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
