"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  token: string;
}

export function CopyLinkButton({ token }: CopyLinkButtonProps) {
  const handleCopy = () => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles");
  };

  return (
    <Button onClick={handleCopy} size="sm" variant="outline">
      <Copy className="mr-2 h-4 w-4" />
      Copiar enlace
    </Button>
  );
}
