import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createMediaUrl(blobKey: string) {
  if (blobKey.startsWith("https://")) return blobKey;
  return new URL(blobKey, process.env.NEXT_PUBLIC_BLOB_URL).toString();
}
