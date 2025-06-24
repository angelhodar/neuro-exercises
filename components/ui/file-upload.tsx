"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { createMediaUrl } from "@/lib/utils";

const MediaFile = ({
  media,
  removeFile,
}: {
  media: SelectableMediaSchema;
  removeFile: (id: number) => void;
}) => {
  return (
    <div key={media.id} className="bg-accent relative aspect-square rounded-md">
      <img
        src={createMediaUrl(media.blobKey)}
        alt={media.name}
        className="size-full rounded-[inherit] object-cover"
      />
      <Button
      type="button"
        onClick={() => removeFile(media.id)}
        size="icon"
        className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
        aria-label="Remove image"
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
};

const AddMediaButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="flex items-center justify-center bg-transparent relative aspect-square rounded-md border-2 border-dashed border-muted-foreground/25">
      <Button type="button" variant="outline"onClick={onClick}>
        <PlusIcon />
      </Button>
    </div>
  );
};

interface FileMediaSelectorProps {
  medias: SelectableMediaSchema[];
  removeFile: (id: number) => void;
  onAddMediaClick: () => void;
}

export default function FileMediaSelector({
  medias,
  removeFile,
  onAddMediaClick,
}: FileMediaSelectorProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]">
        <div className="flex w-full flex-col gap-3">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {(medias || []).map((file) => (
              <MediaFile key={file.id} media={file} removeFile={removeFile} />
            ))}
            <AddMediaButton onClick={onAddMediaClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
