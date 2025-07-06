"use client";

import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

interface ScrollToElementButtonProps extends ButtonProps {
  children: React.ReactNode;
  elementId: string;
}

export function ScrollToElementButton({ children, elementId, ...props }: ScrollToElementButtonProps) {
  const scrollToElement = () => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <Button onClick={scrollToElement} {...props}>
      {children}
    </Button>
  );
} 