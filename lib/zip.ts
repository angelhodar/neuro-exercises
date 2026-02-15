import AdmZip from "adm-zip";

export interface ZipFileItem {
  path: string;
  content: string;
}

export function createZipBuffer(files: ZipFileItem[]): Buffer {
  const zip = new AdmZip();

  for (const file of files) {
    if (file.path && file.content) {
      zip.addFile(file.path, Buffer.from(file.content, "utf8"));
    }
  }

  return zip.toBuffer();
}

export function extractFiles(zipBuffer: Buffer): ZipFileItem[] {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const extractedFiles: ZipFileItem[] = [];

  for (const entry of entries) {
    // Skip directories
    if (!entry.isDirectory) {
      const content = zip.readAsText(entry, "utf8");
      extractedFiles.push({
        path: entry.entryName,
        content,
      });
    }
  }

  return extractedFiles;
}
