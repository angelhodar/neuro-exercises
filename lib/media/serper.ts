export interface DownloadableImage {
  imageHeight: number;
  imageUrl: string;
  imageWidth: number;
  title: string;
}

export interface ImageResult extends DownloadableImage {
  creator?: string;
  credit?: string;
  domain: string;
  googleUrl: string;
  link: string;
  position: number;
  source: string;
  thumbnailHeight: number;
  thumbnailUrl: string;
  thumbnailWidth: number;
}

export interface SearchResponse {
  credits: number;
  images: ImageResult[];
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    type: string;
    engine: string;
    num: number;
  };
}

export async function searchImages(
  query: string,
  numResults = 10
): Promise<SearchResponse> {
  try {
    const response = await fetch("https://google.serper.dev/images", {
      body: JSON.stringify({
        gl: "es",
        hl: "es",
        num: numResults,
        q: query,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.SERPER_API_KEY ?? "",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to search images");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching images:", error);
    throw new Error("Error searching images", { cause: error });
  }
}
