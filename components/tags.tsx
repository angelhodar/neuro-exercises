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
      {visibleTags.map((tag, index) => (
        <Badge key={index}>{tag}</Badge>
      ))}

      {hasHiddenTags && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              +{hiddenTags.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1">
              {hiddenTags.map((tag, index) => (
                <span key={index} className="text-sm">
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
