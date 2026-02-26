"use client";

import { Copy, RefreshCw } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSandbox } from "@/hooks/use-sandbox";

export function PreviewIframe({ slug }: { slug: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { sandboxUrl, isLoading, error, initializePreview } = useSandbox();

  const handleRefresh = () => {
    if (!(iframeRef.current && sandboxUrl)) {
      return;
    }
    const currentSrc = iframeRef.current.src;
    iframeRef.current.src = "";
    iframeRef.current.src = currentSrc;
  };

  const handleCopyUrl = () => {
    if (!sandboxUrl) return;
    navigator.clipboard.writeText(`${sandboxUrl}/exercises/${slug}`);
    toast.success("URL copiada al portapapeles");
  };

  const handleRetry = () => {
    initializePreview();
  };

  // Show message if no sandbox URL available
  if (!(sandboxUrl || isLoading || error)) {
    return (
      <div className="relative flex-1 px-2 pb-2">
        <Card className="relative h-full overflow-hidden border border-gray-200/50 shadow-sm">
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <RefreshCw className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                No hay previsualización disponible
              </h3>
              <p className="max-w-sm text-gray-600 text-sm">
                Todavía no hay ninguna previsualización del ejercicio
                disponible. Cuando termine, aparecerá aquí.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Absolute Action Buttons */}
      {sandboxUrl && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            className="rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            onClick={handleCopyUrl}
            size="sm"
            variant="outline"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            className="rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            disabled={isLoading}
            onClick={handleRefresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      )}

      {/* Preview Content */}
      <div className="relative flex-1 px-2">
        <Card className="relative h-full overflow-hidden border border-gray-200/50 shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  {/* Outer spinning ring */}
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-400" />
                  {/* Inner pulsing dot */}
                  <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Iniciando ejercicio
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preparando el entorno de ejecución...
                  </p>
                  <div className="mt-4 flex justify-center space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <RefreshCw className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="mb-2 font-semibold text-lg text-red-900">
                  Error en el entorno de ejecución
                </h3>
                <p className="mb-4 max-w-sm text-red-600 text-sm">{error}</p>
                <Button
                  disabled={isLoading}
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {sandboxUrl && (
            <iframe
              allowFullScreen
              className="h-full w-full rounded-md border-0"
              ref={iframeRef}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              src={`${sandboxUrl}/exercises/${slug}`}
              title="Preview"
            />
          )}
        </Card>
      </div>
    </>
  );
}
