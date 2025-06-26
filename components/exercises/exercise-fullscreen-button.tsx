"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function ExerciseFullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevSidebarOpen, setPrevSidebarOpen] = useState<boolean | null>(null);

  const {
    isMobile,
    open: sidebarOpen,
    setOpen: setSidebarOpen,
    openMobile,
    setOpenMobile,
  } = useSidebar();

  const handleToggleFullscreen = async () => {
    try {
      const enteringFullscreen = !document.fullscreenElement;

      if (enteringFullscreen) {
        const wasOpen = isMobile ? openMobile : sidebarOpen;
        setPrevSidebarOpen(wasOpen);
        if (wasOpen) {
          isMobile ? setOpenMobile(false) : setSidebarOpen(false);
        }

        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);

        if (prevSidebarOpen) {
          isMobile ? setOpenMobile(true) : setSidebarOpen(true);
        }
        setPrevSidebarOpen(null);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);

      if (!fullscreen) {
        if (prevSidebarOpen) {
          isMobile ? setOpenMobile(true) : setSidebarOpen(true);
        }
        setPrevSidebarOpen(null);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [prevSidebarOpen, isMobile, openMobile, sidebarOpen, setOpenMobile, setSidebarOpen]);

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
