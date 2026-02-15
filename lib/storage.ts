import { del, put } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { extension as mimeExtension } from "mime-types";

interface UploadBlobOptions {
  access?: "public";
  addRandomSuffix?: boolean;
}

interface UploadBlobResult {
  pathname: string;
  url: string;
}

export async function uploadBlob(
  fileName: string,
  data: Buffer | File | ArrayBuffer,
  options: UploadBlobOptions = {}
): Promise<UploadBlobResult> {
  const { access = "public", addRandomSuffix = true } = options;

  try {
    const blob = await put(fileName, data, {
      access,
      addRandomSuffix,
    });

    return {
      pathname: blob.pathname,
      url: blob.url,
    };
  } catch (error) {
    console.error("Error uploading blob:", error);
    throw new Error(`Failed to upload ${fileName}`);
  }
}

export async function uploadBlobPathname(
  fileName: string,
  data: Buffer | File | ArrayBuffer,
  options: UploadBlobOptions = {}
): Promise<string> {
  const result = await uploadBlob(fileName, data, options);
  return result.pathname;
}

export async function uploadBlobFromFile(file: File, folder = "library") {
  const ext = mimeExtension(file.type);
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  return await upload(fileName, file, {
    access: "public",
    handleUploadUrl: "/api/media/upload",
    multipart: true,
  });
}

export async function deleteBlobs(pathnames: string | string[]): Promise<void> {
  try {
    const pathsToDelete = Array.isArray(pathnames) ? pathnames : [pathnames];

    const validPaths = pathsToDelete.filter(
      (path) => path && typeof path === "string"
    );

    if (validPaths.length === 0) {
      console.warn("No valid pathnames provided for deletion");
      return;
    }

    await del(validPaths);
  } catch (error) {
    console.error("Error deleting blobs:", error);
    throw new Error(
      `Failed to delete blobs: ${Array.isArray(pathnames) ? pathnames.join(", ") : pathnames}`
    );
  }
}
