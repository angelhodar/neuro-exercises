"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CopyLinkButtonProps {
  token: string
}

export function CopyLinkButton({ token }: CopyLinkButtonProps) {
  const handleCopy = () => {
    const url = `${window.location.origin}/s/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Enlace copiado al portapapeles")
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      <Copy className="h-4 w-4 mr-2" />
      Copiar enlace
    </Button>
  )
}
