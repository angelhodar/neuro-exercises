"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";

export function ExerciseFullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggleFullscreen}
      className="bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    >
      {isFullscreen ? (
        <>
          <Minimize className="w-5 h-5 mr-2" />
          Salir de pantalla completa
        </>
      ) : (
        <>
          <Maximize className="w-5 h-5 mr-2" />
          Pantalla completa
        </>
      )}
    </Button>
  );
}
