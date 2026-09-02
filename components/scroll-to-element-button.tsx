"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

interface ScrollToElementButtonProps extends ComponentProps<typeof Button> {
  elementId: string;
}

export function ScrollToElementButton({
  children,
  elementId,
  ...props
}: ScrollToElementButtonProps) {
  const scrollToElement = () => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Button onClick={scrollToElement} {...props}>
      {children}
    </Button>
  );
}
