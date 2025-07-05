"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface PreviewIframeProps {
  previewUrl: string;
  isGenerating: boolean;
}

export function PreviewIframe({
  previewUrl,
  isGenerating,
}: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = () => {
    if (!iframeRef.current) return;
    const currentSrc = iframeRef.current.src;
    iframeRef.current.src = "";
    iframeRef.current.src = currentSrc;
  };

  return (
    <>
      {/* Absolute Refresh Button */}
      <Button
        onClick={handleGenerate}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white rounded-xl"
        disabled={isGenerating}
      >
        <RefreshCw
          className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
        />
      </Button>

      {/* Preview Content */}
      <div className="flex-1 relative px-2">
        <Card className="h-full shadow-sm border border-gray-200/50 relative overflow-hidden">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  {/* Outer spinning ring */}
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin"></div>
                  {/* Inner pulsing dot */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generating Exercise
                  </h3>
                  <p className="text-sm text-gray-600">
                    Creating your personalized neurological training...
                  </p>
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full rounded-md border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </Card>
      </div>
    </>
  );
}
