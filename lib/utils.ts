import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createBlobUrl(blobKey: string): string {
  if (blobKey.startsWith("https://")) return blobKey;
  return new URL(blobKey, process.env.NEXT_PUBLIC_BLOB_URL).toString();
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export async function downloadFromUrl(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download from URL: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}
