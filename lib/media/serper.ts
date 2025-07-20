export interface DownloadableImage {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface ImageResult extends DownloadableImage {
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  source: string;
  domain: string;
  link: string;
  googleUrl: string;
  position: number;
  creator?: string;
  credit?: string;
}

export interface SearchResponse {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    type: string;
    engine: string;
    num: number;
  };
  images: ImageResult[];
  credits: number;
}

export async function searchImages(query: string, numResults: number = 10): Promise<SearchResponse> {
  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: "es",
        hl: "es",
        num: numResults
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search images');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching images:', error);
    throw new Error('Error searching images');
  }
} 