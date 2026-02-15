"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, History } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ExerciseChatGeneration } from "@/lib/db/schema";

interface GenerationHistoryProps {
  generations: ExerciseChatGeneration[];
}

export function GenerationHistory({ generations }: GenerationHistoryProps) {
  const [gen, setGen] = useQueryState("gen", parseAsInteger);

  const completedGenerations = generations.filter(
    (g) => g.status === "COMPLETED"
  );

  if (completedGenerations.length <= 1) {
    return null;
  }

  // The active generation is either the one in the URL or the latest
  const activeId = gen ?? completedGenerations.at(-1)?.id;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="icon-sm" variant="ghost">
            <History className="h-4 w-4" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Versiones</PopoverTitle>
        </PopoverHeader>
        <div className="-mx-1 max-h-64 overflow-y-auto">
          {[...completedGenerations].reverse().map((generation, index) => {
            const versionNumber = completedGenerations.length - index;
            const isActive = generation.id === activeId;

            return (
              <button
                className={`flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                key={generation.id}
                onClick={() => {
                  // If clicking the latest generation, clear the param (default behavior)
                  if (generation.id === completedGenerations.at(-1)?.id) {
                    setGen(null);
                  } else {
                    setGen(generation.id);
                  }
                }}
                type="button"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">
                      v{versionNumber}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDistanceToNow(generation.createdAt, {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="truncate text-gray-500 text-xs">
                    {generation.prompt}
                  </p>
                </div>
                {isActive && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
