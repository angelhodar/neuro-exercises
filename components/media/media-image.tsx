import type { ImageProps } from "next/image";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaImageProps extends Omit<ImageProps, "src" | "alt"> {
  alt: string;
  src: string;
}

export function MediaImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
  placeholder = "empty",
  ...props
}: MediaImageProps) {
  const useFill = !(width || height);

  return (
    <Image
      alt={alt}
      src={src || "/placeholder.svg"}
      {...(useFill ? { fill: true, sizes } : { height, width })}
      className={cn("object-cover", className)}
      placeholder={placeholder}
      quality={quality}
      {...props}
    />
  );
}
