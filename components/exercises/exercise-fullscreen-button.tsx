"use client";

import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingBarButton } from "./exercise-floating-bar";

export function ExerciseFullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = async () => {
    try {
      const enteringFullscreen = !document.fullscreenElement;

      if (enteringFullscreen) {
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

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((error) => {
          console.error("Error exiting fullscreen on unmount:", error);
        });
      }
    };
  }, []);

  return (
    <FloatingBarButton onClick={handleToggleFullscreen}>
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </FloatingBarButton>
  );
}
