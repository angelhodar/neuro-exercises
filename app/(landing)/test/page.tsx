import { DownloadIcon, Share2Icon, Trash2Icon } from "lucide-react";
import {
  type MediaType,
  MultimediaCard,
  MultimediaCardActions,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { Button } from "@/components/ui/button";

interface SampleMedia {
  type: MediaType;
  src: string;
  alt: string;
  title: string;
  thumbnailSrc?: string;
}

const SAMPLE_MEDIA: SampleMedia[] = [
  {
    type: "image",
    src: "https://picsum.photos/id/10/800/600",
    alt: "Mountain landscape with a lake",
    title: "Mountain Landscape",
  },
  {
    type: "image",
    src: "https://picsum.photos/id/22/800/600",
    alt: "Coastal sunrise over the ocean",
    title: "Coastal Sunrise",
  },
  {
    type: "image",
    src: "https://picsum.photos/id/237/600/900",
    alt: "Portrait of a black puppy",
    title: "Portrait Photo",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailSrc: "https://picsum.photos/id/180/800/450",
    alt: "Big Buck Bunny animated short",
    title: "Big Buck Bunny",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    alt: "Elephants Dream animated short",
    title: "Elephants Dream",
  },
  {
    type: "audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    alt: "SoundHelix Song 1 audio track",
    title: "SoundHelix Song 1",
  },
  {
    type: "audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    alt: "SoundHelix Song 6 audio track",
    title: "SoundHelix Song 6",
  },
];

export default function TestMultimediaPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-2 font-semibold text-2xl">Multimedia Card</h1>
      <p className="mb-10 text-muted-foreground text-sm">
        Click any thumbnail to preview the media.
      </p>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {SAMPLE_MEDIA.map((media, index) => (
          <MultimediaCard
            alt={media.alt}
            key={media.title}
            src={media.src}
            thumbnailSrc={media.thumbnailSrc}
            type={media.type}
          >
            <MultimediaCardThumbnail />
            <MultimediaCardTitle>{media.title}</MultimediaCardTitle>
            {index === 0 && (
              <MultimediaCardActions>
                <Button size="sm" variant="ghost">
                  <DownloadIcon />
                  Download
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2Icon />
                  Share
                </Button>
              </MultimediaCardActions>
            )}
            {index === 5 && (
              <MultimediaCardActions>
                <Button className="text-destructive" size="sm" variant="ghost">
                  <Trash2Icon />
                  Delete
                </Button>
              </MultimediaCardActions>
            )}
          </MultimediaCard>
        ))}
      </div>
    </main>
  );
}
