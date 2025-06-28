"use client";

import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
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
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      )}
    </FloatingBarButton>
  );
}
