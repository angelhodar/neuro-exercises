"use client";

import * as TagsInput from "@diceui/tags-input";
import { X } from "lucide-react";
import * as React from "react";
import { forwardRef } from "react";

interface MediaTagsInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MediaTagsInput = forwardRef<
  HTMLDivElement,
  MediaTagsInputProps
>(({ 
  value = [], 
  onChange, 
  placeholder = "Agregar etiqueta...", 
  disabled = false,
  className 
}, ref) => {
  const handleValueChange = (newValue: string[]) => {
    onChange?.(newValue);
  };

  return (
    <TagsInput.Root
      ref={ref}
      value={value}
      onValueChange={handleValueChange}
      className={`flex w-full flex-col gap-2 ${className || ""}`}
      editable
      disabled={disabled}
    >
      <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-within:ring-zinc-400">
        {value.map((tag) => (
          <TagsInput.Item
            key={tag}
            value={tag}
            className="inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-hidden data-disabled:cursor-not-allowed data-editable:select-none data-editing:bg-transparent data-disabled:opacity-50 data-editing:ring-1 data-editing:ring-zinc-500 dark:data-editing:ring-zinc-400 [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-zinc-200 [&[data-highlighted]:not([data-editing])]:text-black dark:[&[data-highlighted]:not([data-editing])]:bg-zinc-800 dark:[&[data-highlighted]:not([data-editing])]:text-white"
          >
            <TagsInput.ItemText className="truncate" />
            <TagsInput.ItemDelete className="h-4 w-4 shrink-0 rounded-sm opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </TagsInput.ItemDelete>
          </TagsInput.Item>
        ))}
        <TagsInput.Input
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-hidden placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-400"
        />
      </div>
    </TagsInput.Root>
  );
});

MediaTagsInput.displayName = "MediaTagsInput";