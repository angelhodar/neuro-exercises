import AdmZip from 'adm-zip';

export interface ZipFileItem {
  path: string;
  content: string;
}

export async function createZipBuffer(files: ZipFileItem[]): Promise<Buffer> {
  const zip = new AdmZip();

  for (const file of files) {
    if (file.path && file.content) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    }
  }

  return zip.toBuffer();
}

export async function extractFiles(zipBuffer: Buffer): Promise<ZipFileItem[]> {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const extractedFiles: ZipFileItem[] = [];

  for (const entry of entries) {
    // Skip directories
    if (!entry.isDirectory) {
      const content = zip.readAsText(entry, 'utf8');
      extractedFiles.push({
        path: entry.entryName,
        content: content
      });
    }
  }

  return extractedFiles;
}