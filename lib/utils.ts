import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createBlobUrl(blobKey: string): string {
  if (blobKey.startsWith("https://")) {
    return blobKey;
  }
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

// Regex patterns for diff analysis
const WHITESPACE_REGEX = /\s+/;

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

// Checks if two words match when normalized
function wordsMatch(a: string, b: string): boolean {
  return normalizeWord(a) === normalizeWord(b);
}

// Checks if the next original word matches the current modified word (lookahead)
function isAddedWord(
  originalWords: string[],
  modifiedWords: string[],
  i: number,
  j: number
): boolean {
  if (j >= modifiedWords.length) {
    return false;
  }
  if (i >= originalWords.length) {
    return true;
  }
  return (
    i + 1 < originalWords.length &&
    wordsMatch(originalWords[i + 1], modifiedWords[j])
  );
}

// Checks if the current original word matches the next modified word (lookahead)
function isRemovedWord(
  originalWords: string[],
  modifiedWords: string[],
  i: number,
  j: number
): boolean {
  if (i >= originalWords.length) {
    return false;
  }
  if (j >= modifiedWords.length) {
    return true;
  }
  return (
    j + 1 < modifiedWords.length &&
    wordsMatch(originalWords[i], modifiedWords[j + 1])
  );
}

// Processes one step of the diff algorithm and returns the diff word(s) with updated indices
function processDiffStep(
  originalWords: string[],
  modifiedWords: string[],
  i: number,
  j: number
): { words: DiffWord[]; nextI: number; nextJ: number } {
  const hasOriginal = i < originalWords.length;
  const hasModified = j < modifiedWords.length;

  if (
    hasOriginal &&
    hasModified &&
    wordsMatch(originalWords[i], modifiedWords[j])
  ) {
    return {
      words: [{ text: originalWords[i], type: "unchanged" }],
      nextI: i + 1,
      nextJ: j + 1,
    };
  }

  if (isAddedWord(originalWords, modifiedWords, i, j)) {
    return {
      words: [{ text: modifiedWords[j], type: "added" }],
      nextI: i,
      nextJ: j + 1,
    };
  }

  if (isRemovedWord(originalWords, modifiedWords, i, j)) {
    return {
      words: [{ text: originalWords[i], type: "removed" }],
      nextI: i + 1,
      nextJ: j,
    };
  }

  // Words are different, mark as removed and added
  const words: DiffWord[] = [];
  let nextI = i;
  let nextJ = j;

  if (hasOriginal) {
    words.push({ text: originalWords[i], type: "removed" });
    nextI = i + 1;
  }
  if (hasModified) {
    words.push({ text: modifiedWords[j], type: "added" });
    nextJ = j + 1;
  }

  return { words, nextI, nextJ };
}

export function getDiff(original: string, modified: string): DiffResult {
  const originalWords = original.trim().split(WHITESPACE_REGEX);
  const modifiedWords = modified.trim().split(WHITESPACE_REGEX);

  const diffWords: DiffWord[] = [];
  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < modifiedWords.length) {
    const step = processDiffStep(originalWords, modifiedWords, i, j);
    diffWords.push(...step.words);
    i = step.nextI;
    j = step.nextJ;
  }

  const matches = diffWords.filter((w) => w.type === "unchanged").length;
  const differences = Math.max(
    diffWords.filter((w) => w.type === "added").length,
    diffWords.filter((w) => w.type === "removed").length
  );
  const totalOriginalWords = originalWords.length;
  const accuracy =
    totalOriginalWords > 0 ? (matches / totalOriginalWords) * 100 : 0;

  return {
    diffWords,
    accuracy,
    matches,
    differences,
    totalOriginalWords,
  };
}
