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

// Diff analysis types and functions
export interface DiffWord {
  text: string;
  type: "added" | "removed" | "unchanged";
}

export interface DiffResult {
  diffWords: DiffWord[];
  accuracy: number;
  matches: number;
  differences: number;
  totalOriginalWords: number;
}

// Function to normalize words by removing common punctuation
const normalizeWord = (word: string): string => {
  return word.toLowerCase().replace(/[.,;:!?()[\]{}"'`~@#$%^&*+=|\\/<>]/g, "");
};

export function getDiff(original: string, modified: string): DiffResult {
  const originalWords = original.trim().split(/\s+/);
  const modifiedWords = modified.trim().split(/\s+/);

  const diffWords: DiffWord[] = [];
  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < modifiedWords.length) {
    if (
      i < originalWords.length &&
      j < modifiedWords.length &&
      normalizeWord(originalWords[i]) === normalizeWord(modifiedWords[j])
    ) {
      // Words match (ignoring punctuation)
      diffWords.push({
        text: originalWords[i],
        type: "unchanged",
      });
      i++;
      j++;
    } else if (
      j < modifiedWords.length &&
      (i >= originalWords.length ||
        (i + 1 < originalWords.length &&
          normalizeWord(originalWords[i + 1]) ===
            normalizeWord(modifiedWords[j])))
    ) {
      // Word was added in modified
      diffWords.push({
        text: modifiedWords[j],
        type: "added",
      });
      j++;
    } else if (
      i < originalWords.length &&
      (j >= modifiedWords.length ||
        (j + 1 < modifiedWords.length &&
          normalizeWord(originalWords[i]) ===
            normalizeWord(modifiedWords[j + 1])))
    ) {
      // Word was removed from original
      diffWords.push({
        text: originalWords[i],
        type: "removed",
      });
      i++;
    } else {
      // Words are different, mark as removed and added
      if (i < originalWords.length) {
        diffWords.push({
          text: originalWords[i],
          type: "removed",
        });
        i++;
      }
      if (j < modifiedWords.length) {
        diffWords.push({
          text: modifiedWords[j],
          type: "added",
        });
        j++;
      }
    }
  }

  const matches = diffWords.filter((w) => w.type === "unchanged").length;
  const differences = Math.max(
    diffWords.filter((w) => w.type === "added").length,
    diffWords.filter((w) => w.type === "removed").length,
  );
  const totalOriginalWords = original.trim().split(/\s+/).length;
  const accuracy = totalOriginalWords > 0 ? (matches / totalOriginalWords) * 100 : 0;

  return {
    diffWords,
    accuracy,
    matches,
    differences,
    totalOriginalWords,
  };
}
