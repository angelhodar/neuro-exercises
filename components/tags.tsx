"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagsProps {
  tags: string[];
  maxVisible?: number;
}

export default function HorizontalTags({ tags, maxVisible = 2 }: TagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const hasHiddenTags = hiddenTags.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {visibleTags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}

      {hasHiddenTags && (
        <Tooltip>
          <TooltipTrigger
            render={<Badge className="cursor-help" variant="outline" />}
          >
            +{hiddenTags.length}
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1">
              {hiddenTags.map((tag) => (
                <span className="text-sm" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
