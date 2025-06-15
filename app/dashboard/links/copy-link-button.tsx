"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CopyLinkButtonProps {
  publicId: string
}

export function CopyLinkButton({ publicId }: CopyLinkButtonProps) {
  const copyToClipboard = async () => {
    const url = `${window.location.origin}/s/${publicId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Enlace copiado al portapapeles")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error("Error al copiar el enlace")
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
      <Copy className="h-4 w-4" />
      <span className="sr-only">Copiar enlace</span>
    </Button>
  )
}
