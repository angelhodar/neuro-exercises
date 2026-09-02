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
  alt: string;
  src: string;
  thumbnailSrc?: string;
  title: string;
  type: MediaType;
}

const SAMPLE_MEDIA: SampleMedia[] = [
  {
    alt: "Mountain landscape with a lake",
    src: "https://picsum.photos/id/10/800/600",
    title: "Mountain Landscape",
    type: "image",
  },
  {
    alt: "Coastal sunrise over the ocean",
    src: "https://picsum.photos/id/22/800/600",
    title: "Coastal Sunrise",
    type: "image",
  },
  {
    alt: "Portrait of a black puppy",
    src: "https://picsum.photos/id/237/600/900",
    title: "Portrait Photo",
    type: "image",
  },
  {
    alt: "Big Buck Bunny animated short",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailSrc: "https://picsum.photos/id/180/800/450",
    title: "Big Buck Bunny",
    type: "video",
  },
  {
    alt: "Elephants Dream animated short",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Elephants Dream",
    type: "video",
  },
  {
    alt: "SoundHelix Song 1 audio track",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "SoundHelix Song 1",
    type: "audio",
  },
  {
    alt: "SoundHelix Song 6 audio track",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    title: "SoundHelix Song 6",
    type: "audio",
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
