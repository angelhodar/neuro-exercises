import { DownloadIcon, Share2Icon, Trash2Icon } from "lucide-react";
import {
  MultimediaCard,
  MultimediaCardActions,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { Button } from "@/components/ui/button";

const SAMPLE_MEDIA = [
  {
    type: "image" as const,
    src: "https://picsum.photos/id/10/800/600",
    title: "Mountain Landscape",
  },
  {
    type: "image" as const,
    src: "https://picsum.photos/id/22/800/600",
    title: "Coastal Sunrise",
  },
  {
    type: "image" as const,
    src: "https://picsum.photos/id/237/600/900",
    title: "Portrait Photo",
  },
  {
    type: "video" as const,
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailSrc: "https://picsum.photos/id/180/800/450",
    title: "Big Buck Bunny",
  },
  {
    type: "video" as const,
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Elephants Dream",
  },
  {
    type: "audio" as const,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "SoundHelix Song 1",
  },
  {
    type: "audio" as const,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
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
            key={media.title}
            src={media.src}
            thumbnailSrc={"thumbnailSrc" in media ? media.thumbnailSrc : undefined}
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
                <Button size="sm" variant="ghost" className="text-destructive">
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
