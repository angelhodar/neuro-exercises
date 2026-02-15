import sharp from "sharp";

interface OptimizeImageOptions {
  maxWidth?: number;
  quality?: number;
}

export async function optimizeImage(
  imageBuffer: Buffer,
  options: OptimizeImageOptions = {}
) {
  try {
    const processedBuffer = await sharp(imageBuffer)
      .resize(options.maxWidth ?? 1024, null, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      })
      .webp({ quality: options.quality ?? 80 })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error}`);
  }
}
