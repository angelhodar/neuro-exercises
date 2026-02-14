import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function LinkNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Posibles causas:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• El enlace no existe</li>
                <li>• El enlace ha sido eliminado</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ¿Qué puedes hacer?
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1 text-left">
                <li>• Verifica que la URL esté completa y correcta</li>
                <li>• Contacta a la persona que te compartió el enlace</li>
                <li>• Solicita un nuevo enlace si el anterior expiró</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button render={<Link href="/" />} variant="outline" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error, por favor{" "}
              <Link
                href="/contacto"
                className="text-blue-600 hover:text-blue-700 underline"
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
